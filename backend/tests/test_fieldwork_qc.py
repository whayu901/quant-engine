"""Tests for the Fieldwork QC / Verifier module.

Phase 1 — batch CRUD + tenancy.
Phase 2 — CSV/XLSX import → Interview rows.
Phase 3 — heuristic detectors + scoring + run task.
"""

import csv
import pytest
from collections import Counter, defaultdict
from pathlib import Path

FIXTURES = Path(__file__).parent / "fixtures"
SAMPLE_CSV = FIXTURES / "fieldwork_qc_sample.csv"
EXPECTED_CSV = FIXTURES / "fieldwork_qc_expected.csv"


def _load_expected() -> dict:
    """external_id -> set(check) parsed from the expected fixture ('(clean)' -> set())."""
    out = {}
    with open(EXPECTED_CSV, newline="") as f:
        for row in csv.DictReader(f):
            raw = row["expected_checks"].strip()
            out[row["external_id"]] = set() if raw == "(clean)" else set(raw.split("|"))
    return out


def _make_batch(db, project, **kwargs):
    from app.models_fieldwork import FieldworkBatch
    batch = FieldworkBatch(org_id=project.org_id, project_id=project.id,
                           name="QC Batch", source="excel", **kwargs)
    db.add(batch); db.commit(); db.refresh(batch)
    return batch


def _make_interview(db, batch, **kwargs):
    from app.models_fieldwork import Interview
    iv = Interview(org_id=batch.org_id, project_id=batch.project_id, batch_id=batch.id,
                   external_id="X1", interviewer_id="INT-X", qc_status="flag", **kwargs)
    db.add(iv); db.commit(); db.refresh(iv)
    return iv


class _SharedSession:
    """Proxy that delegates to the test session but never closes it.

    The Celery task opens its own SessionLocal and closes it in `finally`;
    pointing it at the request-scoped test session (instead of a new engine
    connection) keeps the eager task on the same in-memory DB across threads.
    """
    def __init__(self, real):
        self._real = real

    def __getattr__(self, name):
        return getattr(self._real, name)

    def close(self):
        pass


@pytest.fixture
def eager_import(db):
    from app import tasks
    from app.celery_app import celery_app
    prev_eager = celery_app.conf.task_always_eager
    prev_session = tasks.SessionLocal
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    tasks.SessionLocal = lambda: _SharedSession(db)
    yield
    tasks.SessionLocal = prev_session
    celery_app.conf.task_always_eager = prev_eager


def test_create_and_get_batch(client, researcher_headers, test_project):
    # Create
    resp = client.post(
        "/api/v1/fieldwork-qc/batches",
        json={
            "project_id": test_project.id,
            "name": "MyPertamina Wave 1",
            "source": "excel",
            "rules": {"min_duration_sec": 180, "eligibility": {"age_in": ["18-24", "25-34", "35-44"]}},
        },
        headers=researcher_headers,
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["name"] == "MyPertamina Wave 1"
    assert data["status"] == "pending"
    assert data["source"] == "excel"
    assert data["rules"]["min_duration_sec"] == 180
    batch_id = data["id"]

    # Get
    resp = client.get(f"/api/v1/fieldwork-qc/batches/{batch_id}", headers=researcher_headers)
    assert resp.status_code == 200, resp.text
    assert resp.json()["id"] == batch_id


def test_list_batches(client, researcher_headers, test_project):
    for i in range(3):
        client.post(
            "/api/v1/fieldwork-qc/batches",
            json={"project_id": test_project.id, "name": f"Batch {i}"},
            headers=researcher_headers,
        )
    resp = client.get("/api/v1/fieldwork-qc/batches", headers=researcher_headers)
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["total"] >= 3
    assert len(body["items"]) >= 3


def test_create_batch_rejects_foreign_project(client, researcher_headers, db, org_factory, project_factory):
    # A project that belongs to a different org must not be usable.
    other_org = org_factory.create(db, name="Other Org")
    other_project = project_factory.create(db, org=other_org)
    resp = client.post(
        "/api/v1/fieldwork-qc/batches",
        json={"project_id": other_project.id, "name": "Sneaky"},
        headers=researcher_headers,
    )
    assert resp.status_code == 404, resp.text


def test_get_batch_tenant_scoped(client, researcher_headers, db, org_factory, project_factory):
    from app.models_fieldwork import FieldworkBatch
    # A batch in another org should be invisible (404).
    other_org = org_factory.create(db, name="Other Org 2")
    other_project = project_factory.create(db, org=other_org)
    batch = FieldworkBatch(org_id=other_org.id, project_id=other_project.id, name="Foreign batch")
    db.add(batch); db.commit(); db.refresh(batch)

    resp = client.get(f"/api/v1/fieldwork-qc/batches/{batch.id}", headers=researcher_headers)
    assert resp.status_code == 404, resp.text


def test_create_batch_requires_role(client, viewer_headers, test_project):
    resp = client.post(
        "/api/v1/fieldwork-qc/batches",
        json={"project_id": test_project.id, "name": "No perms"},
        headers=viewer_headers,
    )
    assert resp.status_code == 403, resp.text


# ---------------------------------------------------------------------------
# Phase 2 — import
# ---------------------------------------------------------------------------

def test_import_into_batch_core(db, test_project):
    """The pure import path: sample.csv → 52 Interview rows, mapped correctly."""
    from app.models_fieldwork import Interview
    from app.fieldwork_import import import_into_batch

    batch = _make_batch(db, test_project)
    content = SAMPLE_CSV.read_bytes()

    summary = import_into_batch(db, batch, content, "fieldwork_qc_sample.csv")
    assert summary["imported"] == 52
    assert summary["skipped"] == 0
    assert summary["skipped_reasons"] == []
    assert summary["source_format"] == "csv"

    rows = db.query(Interview).filter(Interview.batch_id == batch.id).all()
    assert len(rows) == 52

    # All tenant-scoped to the caller's org.
    assert all(r.org_id == test_project.org_id for r in rows)
    assert all(r.project_id == test_project.id for r in rows)
    assert all(r.qc_status == "pending" for r in rows)

    by_ext = {r.external_id: r for r in rows}

    # Known clean row → answers JSON formed correctly + meta fields mapped.
    r1 = by_ext["R1001"]
    assert r1.interviewer_id == "INT-001"
    assert r1.respondent_ref == "resp-1001"
    assert r1.duration_sec == 414
    assert abs(r1.gps_lat - (-6.372497)) < 1e-6
    assert abs(r1.gps_lng - 106.741508) < 1e-6
    assert r1.started_at.isoformat() == "2026-06-24T09:20:00"
    assert r1.answers["q1_age"] == "18-24"
    assert r1.answers["q2_gender"] == "M"
    assert r1.answers["q3_brand_quality"] == "1"
    assert r1.answers["q9_brand_word"] == "terjangkau"
    assert r1.answers["q10_nps"] == "1"

    # answers is EXACTLY q1..q10 — no audio ref, no meta keys leaked in.
    assert set(r1.answers) == {
        "q1_age", "q2_gender", "q3_brand_quality", "q4_value", "q5_trust",
        "q6_innovation", "q7_service", "q8_recommend", "q9_brand_word", "q10_nps",
    }
    assert "_audio_ref" not in r1.answers

    # audio_ref lives on its own column now.
    assert r1.audio_ref == "aud/INT-001-1001.wav"

    # media_id is null for everyone in Phase 2 (no MediaAsset created yet)...
    assert all(r.media_id is None for r in rows)
    # ...and the empty-audio rows have a null audio_ref.
    assert by_ext["R1042"].audio_ref is None


def test_import_skips_rows_without_external_id(db, test_project):
    from app.fieldwork_import import import_into_batch
    from app.models_fieldwork import Interview

    batch = _make_batch(db, test_project)
    content = (
        b"external_id,interviewer_id,duration_sec,q1_age\n"
        b"R1,INT-1,300,18-24\n"
        b",INT-1,300,25-34\n"          # missing external_id -> skipped
        b"R3,INT-2,250,35-44\n"
    )
    summary = import_into_batch(db, batch, content, "tiny.csv")
    assert summary["imported"] == 2
    assert summary["skipped"] == 1
    assert summary["skipped_reasons"][0]["reason"] == "missing external_id"
    assert db.query(Interview).filter(Interview.batch_id == batch.id).count() == 2


def test_import_xlsx(db, test_project):
    """XLSX path parses through openpyxl with the same mapping as CSV."""
    import io
    import openpyxl
    from app.fieldwork_import import import_into_batch
    from app.models_fieldwork import Interview

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["external_id", "interviewer_id", "duration_sec", "gps_lat", "audio_ref", "q1_age"])
    ws.append(["R1", "INT-1", 300, -6.2, "aud/a.wav", "18-24"])
    ws.append(["R2", "INT-1", 250, -6.3, "", "25-34"])
    buf = io.BytesIO(); wb.save(buf)

    batch = _make_batch(db, test_project)
    summary = import_into_batch(db, batch, buf.getvalue(), "data.xlsx")
    assert summary["imported"] == 2
    assert summary["source_format"] == "xlsx"

    rows = {r.external_id: r for r in db.query(Interview).filter(Interview.batch_id == batch.id)}
    assert rows["R1"].duration_sec == 300
    assert abs(rows["R1"].gps_lat - (-6.2)) < 1e-6
    assert rows["R1"].answers == {"q1_age": "18-24"}
    assert rows["R1"].audio_ref == "aud/a.wav"
    assert rows["R2"].audio_ref is None


def test_import_endpoint_e2e(client, researcher_headers, test_project, eager_import):
    """Full HTTP path: upload CSV → ImportJob completes → 52 interviews listed."""
    # Create batch.
    resp = client.post(
        "/api/v1/fieldwork-qc/batches",
        json={"project_id": test_project.id, "name": "Import Batch"},
        headers=researcher_headers,
    )
    assert resp.status_code == 200, resp.text
    batch_id = resp.json()["id"]

    # Upload.
    with open(SAMPLE_CSV, "rb") as f:
        resp = client.post(
            f"/api/v1/fieldwork-qc/batches/{batch_id}/import",
            files={"file": ("fieldwork_qc_sample.csv", f, "text/csv")},
            headers=researcher_headers,
        )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "completed"
    assert body["result_summary"]["imported"] == 52
    assert body["result_summary"]["skipped"] == 0

    # Verify via the interviews listing.
    resp = client.get(
        f"/api/v1/fieldwork-qc/batches/{batch_id}/interviews?limit=100",
        headers=researcher_headers,
    )
    assert resp.status_code == 200, resp.text
    listing = resp.json()
    assert listing["total"] == 52
    assert len(listing["items"]) == 52
    assert all(i["org_id"] == test_project.org_id for i in listing["items"])
    assert all(i["batch_id"] == batch_id for i in listing["items"])


def test_import_is_idempotent(db, test_project):
    """Re-importing the same file does not duplicate rows; dups are skipped."""
    from app.models_fieldwork import Interview
    from app.fieldwork_import import import_into_batch

    batch = _make_batch(db, test_project)
    content = SAMPLE_CSV.read_bytes()

    first = import_into_batch(db, batch, content, "fieldwork_qc_sample.csv")
    assert first["imported"] == 52
    assert first["skipped"] == 0

    second = import_into_batch(db, batch, content, "fieldwork_qc_sample.csv")
    assert second["imported"] == 0
    assert second["skipped"] == 52
    assert all(r["reason"] == "duplicate external_id in batch"
               for r in second["skipped_reasons"])

    # Total stays 52, not 104.
    assert db.query(Interview).filter(Interview.batch_id == batch.id).count() == 52


def test_import_job_linked_by_column(client, researcher_headers, test_project, eager_import, db):
    """ImportJob.batch_id is set via column; result_summary is stats-only."""
    from app.models_phase1 import ImportJob

    resp = client.post(
        "/api/v1/fieldwork-qc/batches",
        json={"project_id": test_project.id, "name": "Linked Batch"},
        headers=researcher_headers,
    )
    batch_id = resp.json()["id"]

    with open(SAMPLE_CSV, "rb") as f:
        resp = client.post(
            f"/api/v1/fieldwork-qc/batches/{batch_id}/import",
            files={"file": ("fieldwork_qc_sample.csv", f, "text/csv")},
            headers=researcher_headers,
        )
    assert resp.status_code == 200, resp.text
    job_id = resp.json()["import_job_id"]

    job = db.get(ImportJob, job_id)
    db.refresh(job)
    assert job.batch_id == batch_id
    # result_summary carries only import stats — no batch_id / filename plumbing.
    assert set(job.result_summary) == {"imported", "skipped", "skipped_reasons", "source_format"}
    assert job.result_summary["imported"] == 52


def test_import_endpoint_requires_role(client, viewer_headers, test_project, db):
    batch = _make_batch(db, test_project)
    resp = client.post(
        f"/api/v1/fieldwork-qc/batches/{batch.id}/import",
        files={"file": ("x.csv", b"external_id\nR1\n", "text/csv")},
        headers=viewer_headers,
    )
    assert resp.status_code == 403, resp.text


def test_import_endpoint_rejects_bad_extension(client, researcher_headers, test_project, db):
    batch = _make_batch(db, test_project)
    resp = client.post(
        f"/api/v1/fieldwork-qc/batches/{batch.id}/import",
        files={"file": ("notes.txt", b"hello", "text/plain")},
        headers=researcher_headers,
    )
    assert resp.status_code == 400, resp.text


def test_list_interviews_tenant_scoped(client, researcher_headers, db, org_factory, project_factory):
    # A batch in another org must not expose its interviews.
    other_org = org_factory.create(db, name="Other Org 3")
    other_project = project_factory.create(db, org=other_org)
    batch = _make_batch(db, other_project)
    resp = client.get(
        f"/api/v1/fieldwork-qc/batches/{batch.id}/interviews",
        headers=researcher_headers,
    )
    assert resp.status_code == 404, resp.text


# ---------------------------------------------------------------------------
# Phase 3 — detectors + scoring
# ---------------------------------------------------------------------------

EXPECTED_TOTALS = {
    "speeder": 14, "straightlining": 13, "gps_identical": 12, "audio_presence": 9,
    "duplicate_openend": 8, "cadence_impossible": 8, "eligibility": 3,
    "gps_out_of_area": 2, "too_long": 1,
}


def _import_sample(db, project, **batch_kwargs):
    from app.fieldwork_import import import_into_batch
    from app.models_fieldwork import Interview
    batch = _make_batch(db, project, **batch_kwargs)
    import_into_batch(db, batch, SAMPLE_CSV.read_bytes(), "fieldwork_qc_sample.csv")
    interviews = db.query(Interview).filter(Interview.batch_id == batch.id).all()
    return batch, interviews


def test_detectors_match_expected_per_row(db, test_project):
    """THE measurement: per external_id, detected check-set == expected fixture."""
    from app import fieldwork_qc

    batch, interviews = _import_sample(db, test_project)
    rules = fieldwork_qc.resolve_rules(batch.rules)

    got = {iv.external_id: set() for iv in interviews}
    for iv, flag in fieldwork_qc.run_all_detectors(interviews, rules):
        got[iv.external_id].add(flag["check"])

    assert got == _load_expected()


def test_detector_totals_per_check(db, test_project):
    from app import fieldwork_qc

    batch, interviews = _import_sample(db, test_project)
    rules = fieldwork_qc.resolve_rules(batch.rules)
    counts = Counter(flag["check"] for _, flag in fieldwork_qc.run_all_detectors(interviews, rules))
    assert dict(counts) == EXPECTED_TOTALS


def test_clean_rows_have_no_flags_and_pass(db, test_project):
    from app import fieldwork_qc

    batch, interviews = _import_sample(db, test_project)
    rules = fieldwork_qc.resolve_rules(batch.rules)
    expected = _load_expected()
    clean_ids = {ext for ext, checks in expected.items() if not checks}
    assert len(clean_ids) == 24

    flags_by_ext = defaultdict(list)
    for iv, flag in fieldwork_qc.run_all_detectors(interviews, rules):
        flags_by_ext[iv.external_id].append(flag)

    for iv in interviews:
        if iv.external_id in clean_ids:
            assert flags_by_ext[iv.external_id] == []
            status, qc_score = fieldwork_qc.score([])
            assert status == "pass"
            assert qc_score == 1.0


def test_int007_scores_reject(db, test_project):
    from app import fieldwork_qc

    batch, interviews = _import_sample(db, test_project)
    rules = fieldwork_qc.resolve_rules(batch.rules)
    flags_by_ext = defaultdict(list)
    for iv, flag in fieldwork_qc.run_all_detectors(interviews, rules):
        flags_by_ext[iv.external_id].append(flag)

    for iv in interviews:
        if iv.interviewer_id == "INT-007":
            status, _ = fieldwork_qc.score(flags_by_ext[iv.external_id])
            assert status == "reject", iv.external_id


def test_run_task_writes_flags_and_status(client, researcher_headers, test_project, eager_import, db):
    """Full run via the task: QCFlags persisted, statuses set, summary rolled up."""
    from app.models_fieldwork import QCFlag, Interview

    batch, _ = _import_sample(db, test_project)

    resp = client.post(f"/api/v1/fieldwork-qc/batches/{batch.id}/run", headers=researcher_headers)
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "completed"

    # Flags persisted with the right per-check totals.
    flags = db.query(QCFlag).filter(QCFlag.batch_id == batch.id).all()
    assert dict(Counter(f.check for f in flags)) == EXPECTED_TOTALS

    # Statuses set per interview.
    interviews = db.query(Interview).filter(Interview.batch_id == batch.id).all()
    by_ext = {iv.external_id: iv for iv in interviews}
    expected = _load_expected()
    for ext, checks in expected.items():
        if not checks:
            assert by_ext[ext].qc_status == "pass"
    assert all(by_ext[f"R10{n}"].qc_status == "reject" for n in range(42, 50))  # INT-007

    # result_summary rolled up.
    resp = client.get(f"/api/v1/fieldwork-qc/batches/{batch.id}", headers=researcher_headers)
    summary = resp.json()["result_summary"]
    assert summary["by_check"] == EXPECTED_TOTALS
    assert summary["by_status"]["pass"] == 24
    assert summary["interviews"] == 52


def test_run_is_idempotent(client, researcher_headers, test_project, eager_import, db):
    from app.models_fieldwork import QCFlag

    batch, _ = _import_sample(db, test_project)

    client.post(f"/api/v1/fieldwork-qc/batches/{batch.id}/run", headers=researcher_headers)
    first = db.query(QCFlag).filter(QCFlag.batch_id == batch.id).count()

    client.post(f"/api/v1/fieldwork-qc/batches/{batch.id}/run", headers=researcher_headers)
    second = db.query(QCFlag).filter(QCFlag.batch_id == batch.id).count()

    assert first == second == sum(EXPECTED_TOTALS.values())


def test_get_interview_detail_includes_flags(client, researcher_headers, test_project, eager_import, db):
    from app.models_fieldwork import Interview

    batch, _ = _import_sample(db, test_project)
    client.post(f"/api/v1/fieldwork-qc/batches/{batch.id}/run", headers=researcher_headers)

    iv = (db.query(Interview)
          .filter(Interview.batch_id == batch.id, Interview.external_id == "R1042")
          .one())
    resp = client.get(f"/api/v1/fieldwork-qc/interviews/{iv.id}", headers=researcher_headers)
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["qc_status"] == "reject"
    checks = {fl["check"] for fl in body["flags"]}
    assert checks == {"speeder", "straightlining", "gps_identical",
                      "duplicate_openend", "audio_presence", "cadence_impossible"}


def test_run_requires_role(client, viewer_headers, test_project, db):
    batch = _make_batch(db, test_project)
    resp = client.post(f"/api/v1/fieldwork-qc/batches/{batch.id}/run", headers=viewer_headers)
    assert resp.status_code == 403, resp.text


# ---------------------------------------------------------------------------
# Phase 4 — interviewer anomaly, report, reviewer console
# ---------------------------------------------------------------------------

def _run_batch(client, headers, db, project):
    batch, _ = _import_sample(db, project)
    resp = client.post(f"/api/v1/fieldwork-qc/batches/{batch.id}/run", headers=headers)
    assert resp.status_code == 200, resp.text
    return batch


def test_interviewer_scores(client, researcher_headers, test_project, eager_import, db):
    from app.models_fieldwork import InterviewerScore
    batch = _run_batch(client, researcher_headers, db, test_project)

    scores = db.query(InterviewerScore).filter(InterviewerScore.batch_id == batch.id).all()
    assert len(scores) == 7
    assert sum(s.n_interviews for s in scores) == 52

    ranked = sorted(scores, key=lambda s: s.anomaly_score, reverse=True)
    assert ranked[0].interviewer_id == "INT-007"
    # The three clean interviewers sit at the bottom.
    bottom3 = {s.interviewer_id for s in ranked[-3:]}
    assert bottom3 == {"INT-001", "INT-002", "INT-003"}

    # Endpoint returns the same ranking, most-anomalous first.
    resp = client.get(f"/api/v1/fieldwork-qc/batches/{batch.id}/interviewers", headers=researcher_headers)
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert [r["interviewer_id"] for r in body][0] == "INT-007"
    assert [r["anomaly_score"] for r in body] == sorted(
        [r["anomaly_score"] for r in body], reverse=True)


def test_report_axes(client, researcher_headers, test_project, eager_import, db):
    batch = _run_batch(client, researcher_headers, db, test_project)
    resp = client.get(f"/api/v1/fieldwork-qc/batches/{batch.id}/report", headers=researcher_headers)
    assert resp.status_code == 200, resp.text
    r = resp.json()
    assert r["approved"] == 24
    assert r["fraud_rejected"] == 12
    assert r["ineligible"] == 3
    assert r["needs_review"] == 13
    assert r["approved"] + r["fraud_rejected"] + r["ineligible"] + r["needs_review"] == 52
    # Per-check breakdown + per-interviewer summary + trend present.
    assert r["by_check"] == EXPECTED_TOTALS
    assert len(r["interviewers"]) == 7
    assert r["interviewers"][0]["interviewer_id"] == "INT-007"
    assert len(r["trend"]) >= 1
    assert all({"time", "approved", "rejected"} <= set(p) for p in r["trend"])


def test_resolve_flag_dismiss_all_makes_pass(client, researcher_headers, test_project, eager_import, db):
    from app.models_fieldwork import Interview, QCFlag
    batch = _run_batch(client, researcher_headers, db, test_project)

    # R1025 has exactly one flag (audio_presence) -> qc_status flag.
    iv = (db.query(Interview)
          .filter(Interview.batch_id == batch.id, Interview.external_id == "R1025").one())
    assert iv.qc_status == "flag"
    flag = db.query(QCFlag).filter(QCFlag.interview_id == iv.id).one()

    resp = client.post(f"/api/v1/fieldwork-qc/flags/{flag.id}/resolve",
                       json={"status": "dismissed", "note": "verified by phone"},
                       headers=researcher_headers)
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "dismissed"
    assert body["reviewer_id"] is not None
    assert body["detail"]["reviewer_note"] == "verified by phone"

    db.refresh(iv)
    assert iv.qc_status == "pass"  # all flags dismissed -> pass


def test_resolve_flag_partial_keeps_reject(client, researcher_headers, test_project, eager_import, db):
    from app.models_fieldwork import Interview, QCFlag
    batch = _run_batch(client, researcher_headers, db, test_project)

    iv = (db.query(Interview)
          .filter(Interview.batch_id == batch.id, Interview.external_id == "R1042").one())
    flags = db.query(QCFlag).filter(QCFlag.interview_id == iv.id).all()
    assert len(flags) == 6

    # Dismiss one (audio_presence) — fabrication flags remain -> still reject.
    audio_flag = next(f for f in flags if f.check == "audio_presence")
    resp = client.post(f"/api/v1/fieldwork-qc/flags/{audio_flag.id}/resolve",
                       json={"status": "dismissed"}, headers=researcher_headers)
    assert resp.status_code == 200, resp.text
    db.refresh(iv)
    assert iv.qc_status == "reject"


def test_rerun_idempotent_interviewer_scores(client, researcher_headers, test_project, eager_import, db):
    from app.models_fieldwork import InterviewerScore
    batch = _run_batch(client, researcher_headers, db, test_project)
    client.post(f"/api/v1/fieldwork-qc/batches/{batch.id}/run", headers=researcher_headers)
    n = db.query(InterviewerScore).filter(InterviewerScore.batch_id == batch.id).count()
    assert n == 7  # not 14


def test_resolve_flag_tenant_scoped(client, researcher_headers, db, org_factory, project_factory):
    from app.models_fieldwork import QCFlag
    other_org = org_factory.create(db, name="Other Org R")
    other_project = project_factory.create(db, org=other_org)
    batch = _make_batch(db, other_project)
    iv = _make_interview(db, batch)
    flag = QCFlag(org_id=other_org.id, interview_id=iv.id, batch_id=batch.id,
                  check="speeder", severity="warn", status="open")
    db.add(flag); db.commit(); db.refresh(flag)

    resp = client.post(f"/api/v1/fieldwork-qc/flags/{flag.id}/resolve",
                       json={"status": "dismissed"}, headers=researcher_headers)
    assert resp.status_code == 404, resp.text


def test_resolve_flag_requires_role(client, viewer_headers, test_project, db):
    from app.models_fieldwork import QCFlag
    batch = _make_batch(db, test_project)
    iv = _make_interview(db, batch)
    flag = QCFlag(org_id=test_project.org_id, interview_id=iv.id, batch_id=batch.id,
                  check="speeder", severity="warn", status="open")
    db.add(flag); db.commit(); db.refresh(flag)
    resp = client.post(f"/api/v1/fieldwork-qc/flags/{flag.id}/resolve",
                       json={"status": "dismissed"}, headers=viewer_headers)
    assert resp.status_code == 403, resp.text
