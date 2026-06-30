"""
Fieldwork QC — Phase 2 import.

Parses an uploaded CSV/XLSX of fielding data into Interview rows. Pure and
deterministic: no detector logic here (that is Phase 3), no external services.

Column mapping (the rest of the columns are treated as survey answers):
    external_id, interviewer_id, respondent_ref,
    started_at, ended_at (ISO 8601), duration_sec (int),
    gps_lat, gps_lng (float), audio_ref (filename pointer)

Everything not in that meta set (e.g. q1_age .. q10_nps) goes into `answers`.
`audio_ref` is preserved as `answers["_audio_ref"]` so Phase 5 (audio-vs-answers)
can resolve the recording later; no MediaAsset is created at import time, so
`media_id` is always null in Phase 2.
"""

import csv
import io
from datetime import datetime
from typing import Any, Optional

from .models_fieldwork import Interview

# Meta columns consumed into dedicated Interview fields (not survey answers).
META_COLUMNS = {
    "external_id", "interviewer_id", "respondent_ref",
    "started_at", "ended_at", "duration_sec",
    "gps_lat", "gps_lng", "audio_ref",
}


def _clean(value: Any) -> Optional[str]:
    """Normalise a cell to a stripped string, or None when blank."""
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def _parse_dt(value: Any) -> Optional[datetime]:
    if isinstance(value, datetime):
        return value
    s = _clean(value)
    if not s:
        return None
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def _parse_int(value: Any) -> Optional[int]:
    s = _clean(value)
    if s is None:
        return None
    try:
        return int(float(s))
    except ValueError:
        return None


def _parse_float(value: Any) -> Optional[float]:
    s = _clean(value)
    if s is None:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _rows_from_bytes(content: bytes, filename: str) -> list[dict]:
    """Read CSV or XLSX bytes into a list of header->value dicts."""
    name = (filename or "").lower()
    if name.endswith((".xlsx", ".xlsm", ".xls")):
        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        ws = wb.active
        rows_iter = ws.iter_rows(values_only=True)
        try:
            header = [str(h).strip() if h is not None else "" for h in next(rows_iter)]
        except StopIteration:
            return []
        out = []
        for raw in rows_iter:
            if raw is None or all(c is None for c in raw):
                continue
            out.append({header[i]: raw[i] if i < len(raw) else None
                        for i in range(len(header))})
        wb.close()
        return out
    # default: CSV
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    return [dict(r) for r in reader]


def parse_fieldwork_rows(content: bytes, filename: str) -> tuple[list[dict], list[dict]]:
    """
    Parse raw upload bytes into (normalised_rows, skipped).

    Each normalised row is a dict of Interview kwargs (minus org/project/batch
    ids). `skipped` is a list of {row, external_id, reason} for rows we could
    not import (currently: missing external_id).
    """
    raw_rows = _rows_from_bytes(content, filename)
    parsed: list[dict] = []
    skipped: list[dict] = []

    for i, raw in enumerate(raw_rows, start=1):
        external_id = _clean(raw.get("external_id"))
        if not external_id:
            skipped.append({"row": i, "external_id": None, "reason": "missing external_id"})
            continue

        audio_ref = _clean(raw.get("audio_ref"))
        answers = {k: v for k, v in raw.items() if k not in META_COLUMNS and k}
        answers["_audio_ref"] = audio_ref

        parsed.append({
            "external_id": external_id,
            "interviewer_id": _clean(raw.get("interviewer_id")),
            "respondent_ref": _clean(raw.get("respondent_ref")),
            "started_at": _parse_dt(raw.get("started_at")),
            "ended_at": _parse_dt(raw.get("ended_at")),
            "duration_sec": _parse_int(raw.get("duration_sec")),
            "gps_lat": _parse_float(raw.get("gps_lat")),
            "gps_lng": _parse_float(raw.get("gps_lng")),
            "answers": answers,
        })

    return parsed, skipped


def import_into_batch(db, batch, content: bytes, filename: str) -> dict:
    """
    Parse `content` and create Interview rows under `batch`. Operates on the
    given db session (commits). Returns a result_summary dict.
    """
    parsed, skipped = parse_fieldwork_rows(content, filename)

    for row in parsed:
        db.add(Interview(
            org_id=batch.org_id,
            project_id=batch.project_id,
            batch_id=batch.id,
            qc_status="pending",
            **row,
        ))
    db.commit()

    name = (filename or "").lower()
    fmt = "xlsx" if name.endswith((".xlsx", ".xlsm", ".xls")) else "csv"
    return {
        "imported": len(parsed),
        "skipped": len(skipped),
        "skipped_reasons": skipped,
        "source_format": fmt,
    }
