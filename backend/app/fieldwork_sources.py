"""Pluggable fieldwork import source providers.

Returns raw row dicts in the same shape as ``_rows_from_bytes`` produces:
csv.DictReader-style, keys = CSV column names, values = strings (or the native
cell value for XLSX — the normalisation step in ``parse_rows`` handles both).

Interface::

    def fetch_interviews(integration, batch) -> list[dict]

Dispatches on ``integration.kind`` via the ``_SOURCES`` registry, mirroring
the transcription provider pattern in ``transcription.py``.
"""

from __future__ import annotations

import pathlib


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fixture_path() -> pathlib.Path:
    """Resolve the sample CSV fixture relative to this source file.

    Layout:
        backend/app/fieldwork_sources.py   <- __file__
        backend/tests/fixtures/            <- target directory
    """
    return (
        pathlib.Path(__file__).parent.parent
        / "tests"
        / "fixtures"
        / "fieldwork_qc_sample.csv"
    )


# Synthetic fallback used when the fixture file is absent (e.g. prod deploys
# that exclude the tests/ tree).  Rows use the canonical CSV column names so
# ``parse_rows`` normalises them identically to a real CSV.
_SYNTHETIC_FALLBACK: list[dict] = [
    {
        "external_id": "SYNTH-001",
        "interviewer_id": "INT-MOCK-1",
        "respondent_ref": "resp-synth-1",
        "started_at": "2026-06-24T09:00:00",
        "ended_at": "2026-06-24T09:08:00",
        "duration_sec": "480",
        "gps_lat": "-6.2",
        "gps_lng": "106.8",
        "audio_ref": "",
        "q1_age": "25-34",
        "q2_gender": "M",
        "q3_brand_quality": "4",
        "q4_value": "3",
        "q5_trust": "4",
        "q6_innovation": "3",
        "q7_service": "4",
        "q8_recommend": "4",
        "q9_brand_word": "bagus",
        "q10_nps": "8",
    },
    {
        "external_id": "SYNTH-002",
        "interviewer_id": "INT-MOCK-1",
        "respondent_ref": "resp-synth-2",
        "started_at": "2026-06-24T09:15:00",
        "ended_at": "2026-06-24T09:22:00",
        "duration_sec": "420",
        "gps_lat": "-6.21",
        "gps_lng": "106.81",
        "audio_ref": "aud/mock-002.wav",
        "q1_age": "18-24",
        "q2_gender": "F",
        "q3_brand_quality": "3",
        "q4_value": "4",
        "q5_trust": "3",
        "q6_innovation": "4",
        "q7_service": "3",
        "q8_recommend": "3",
        "q9_brand_word": "terjangkau",
        "q10_nps": "7",
    },
    {
        "external_id": "SYNTH-003",
        "interviewer_id": "INT-MOCK-2",
        "respondent_ref": "resp-synth-3",
        "started_at": "2026-06-24T10:00:00",
        "ended_at": "2026-06-24T10:09:00",
        "duration_sec": "540",
        "gps_lat": "-6.3",
        "gps_lng": "106.9",
        "audio_ref": "aud/mock-003.wav",
        "q1_age": "35-44",
        "q2_gender": "M",
        "q3_brand_quality": "5",
        "q4_value": "5",
        "q5_trust": "5",
        "q6_innovation": "5",
        "q7_service": "5",
        "q8_recommend": "5",
        "q9_brand_word": "terpercaya",
        "q10_nps": "9",
    },
]


# ---------------------------------------------------------------------------
# Providers
# ---------------------------------------------------------------------------

def _mock(integration, batch) -> list[dict]:
    """Offline dev/test provider.

    Reads the canonical 52-row sample CSV from tests/fixtures/ and returns its
    raw rows via ``fieldwork_import._rows_from_bytes``.  Falls back to a small
    hardcoded synthetic list when the fixture file is absent so this provider
    never crashes in a prod deploy without the tests/ tree.
    """
    from . import fieldwork_import

    fixture = _fixture_path()
    if fixture.is_file():
        content = fixture.read_bytes()
        return fieldwork_import._rows_from_bytes(content, "fieldwork_qc_sample.csv")
    # Fixture absent — return the synthetic fallback (copy, not the module-level list).
    return list(_SYNTHETIC_FALLBACK)


def _surveytogo(integration, batch) -> list[dict]:
    """SurveyToGo / Dooblo live-fetch stub.

    Validates that the required credentials are present in ``integration.config``
    before attempting any network call.  Raises ``ValueError`` with a clear,
    actionable message when credentials are missing.  After the credentials
    check the live API call is left as a TODO pending vendor access.
    """
    config: dict = integration.config or {}
    api_token = (config.get("api_token") or "").strip()
    project_id = (config.get("project_id") or "").strip()

    if not api_token or not project_id:
        raise ValueError(
            "configure SurveyToGo credentials (api_token, project_id)"
            " in the integration config"
        )

    # TODO: implement the SurveyToGo / Dooblo live fetch once vendor access is confirmed.
    #
    # Intended call shape (Dooblo REST API v3):
    #   GET https://api.dooblo.net/CAPI/v3/projects/{project_id}/surveys
    #       ?format=json&pageSize=500&pageIndex={page}
    #   Headers: Authorization: Bearer {api_token}
    #            Accept: application/json
    #
    # Pagination: iterate while response["HasMore"] is True, incrementing pageIndex.
    #
    # Each survey item must be mapped to a raw row dict whose keys match the
    # canonical fieldwork CSV columns:
    #   external_id, interviewer_id, respondent_ref, started_at, ended_at,
    #   duration_sec, gps_lat, gps_lng, audio_ref, q1_age .. q10_nps
    # (and any additional answer columns present in the project questionnaire).
    #
    # Error handling: surface HTTP 4xx/5xx as RuntimeError with the response
    # status code so the Celery task records a legible job.error.

    raise NotImplementedError(
        "SurveyToGo live fetch not implemented yet"
        " — credentials present but the API call is pending vendor access"
    )


# ---------------------------------------------------------------------------
# Registry + public dispatcher
# ---------------------------------------------------------------------------

_SOURCES: dict = {
    "mock": _mock,
    "surveytogo": _surveytogo,
    "dooblo": _surveytogo,  # Dooblo is the underlying platform SurveyToGo runs on
}


def fetch_interviews(integration, batch) -> list[dict]:
    """Dispatch to the registered source provider for ``integration.kind``.

    Returns a list of raw row dicts in csv.DictReader shape (string keys, string
    or native cell values) — exactly what ``fieldwork_import._rows_from_bytes``
    returns for a CSV file.

    Raises:
        ValueError: if no provider is registered for ``integration.kind``.
        ValueError: if a provider finds its credentials missing or invalid.
        NotImplementedError: if the provider is a pending stub.
    """
    kind = (integration.kind or "").lower()
    provider = _SOURCES.get(kind)
    if provider is None:
        raise ValueError(
            f"No fieldwork import source for integration kind '{integration.kind}'"
        )
    return provider(integration, batch)
