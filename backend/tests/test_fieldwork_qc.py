"""Tests for the Fieldwork QC / Verifier module.

Phase 1 — batch CRUD + tenancy.
Phase 2 — CSV/XLSX import → Interview rows.
"""

import pytest
from pathlib import Path

FIXTURES = Path(__file__).parent / "fixtures"
SAMPLE_CSV = FIXTURES / "fieldwork_qc_sample.csv"


def _make_batch(db, project, **kwargs):
    from app.models_fieldwork import FieldworkBatch
    batch = FieldworkBatch(org_id=project.org_id, project_id=project.id,
                           name="QC Batch", source="excel", **kwargs)
    db.add(batch); db.commit(); db.refresh(batch)
    return batch


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
