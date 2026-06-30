"""
Fieldwork QC — Phase 3 detectors + scoring.

Pure, deterministic, explainable. No LLM, no audio-vs-answers (Phase 5), no
interviewer-anomaly / report (Phase 4). Functions here have NO DB side effects:
they read attributes off Interview-like objects and return flag dicts. The
DB-writing orchestration lives in `tasks.run_fieldwork_qc`.

Each flag is `{"check": <str>, "severity": <str>, "detail": <evidence dict>}`.
The `check` strings are a stable contract (compared directly in tests):

    speeder, too_long, straightlining, gps_out_of_area, gps_identical,
    duplicate_openend, audio_presence, cadence_impossible, eligibility

Thresholds come from `batch.rules`, falling back to DEFAULT_RULES (which mirror
the reference dataset). Severities feed scoring: a single `critical` flag (or a
failed eligibility) rejects an interview; only `warn` flags downgrade it to
`flag`; no flags means `pass`.
"""

from collections import defaultdict

# --- check names (stable contract) -----------------------------------------
SPEEDER = "speeder"
TOO_LONG = "too_long"
STRAIGHTLINING = "straightlining"
GPS_OUT_OF_AREA = "gps_out_of_area"
GPS_IDENTICAL = "gps_identical"
DUPLICATE_OPENEND = "duplicate_openend"
AUDIO_PRESENCE = "audio_presence"
CADENCE_IMPOSSIBLE = "cadence_impossible"
ELIGIBILITY = "eligibility"

# --- severity by check ------------------------------------------------------
WARN = "warn"
CRITICAL = "critical"
SEVERITY = {
    SPEEDER: WARN,
    TOO_LONG: WARN,
    STRAIGHTLINING: WARN,
    GPS_OUT_OF_AREA: WARN,
    AUDIO_PRESENCE: WARN,
    GPS_IDENTICAL: CRITICAL,
    DUPLICATE_OPENEND: CRITICAL,
    CADENCE_IMPOSSIBLE: CRITICAL,
    ELIGIBILITY: CRITICAL,
}

# Score penalty per severity (documented; clean interviews always score 1.0/pass).
_PENALTY = {WARN: 0.2, CRITICAL: 0.5}

# Fabrication / curbstoning checks — these are what reject as fraud (as opposed
# to `eligibility`, which is a screen-out, not fabrication).
FABRICATION_CHECKS = frozenset({GPS_IDENTICAL, DUPLICATE_OPENEND, CADENCE_IMPOSSIBLE})

# Interviewer anomaly weights (each input ratio is 0..1, so the score is 0..1).
#   anomaly = 0.5 * critical-fabrication ratio
#           + 0.2 * speeder ratio
#           + 0.3 * overall flag rate
# Fabrication is weighted highest (it is deliberate cheating); speeding and the
# overall flag rate are softer signals.
_ANOMALY_W_FABRICATION = 0.5
_ANOMALY_W_SPEEDER = 0.2
_ANOMALY_W_FLAG_RATE = 0.3

# --- defaults (mirror the reference dataset) --------------------------------
DEFAULT_RULES = {
    "speeder_below": 240,
    "too_long_above": 2400,
    "gps_bbox": {"lat_min": -6.40, "lat_max": -6.05,
                 "lng_min": 106.65, "lng_max": 106.95},
    "straightlining_block": ["q3_brand_quality", "q4_value", "q5_trust",
                             "q6_innovation", "q7_service", "q8_recommend"],
    # duplicate uses the full answer vector incl. the open-end (q9), so that
    # straightlined-but-distinct rows are NOT treated as duplicates.
    "duplicate_block": ["q3_brand_quality", "q4_value", "q5_trust",
                        "q6_innovation", "q7_service", "q8_recommend",
                        "q9_brand_word"],
    "eligibility": {"q1_age_in": ["18-24", "25-34", "35-44"]},
    "cadence_min_gap_sec": 60,
}


def resolve_rules(batch_rules) -> dict:
    """Shallow-merge a batch's rules over the defaults (nested dicts merged)."""
    rules = dict(DEFAULT_RULES)
    for k, v in (batch_rules or {}).items():
        if isinstance(v, dict) and isinstance(rules.get(k), dict):
            merged = dict(rules[k]); merged.update(v); rules[k] = merged
        else:
            rules[k] = v
    return rules


def _ans(iv, key):
    a = getattr(iv, "answers", None) or {}
    return a.get(key)


def _coord_key(iv):
    if iv.gps_lat is None or iv.gps_lng is None:
        return None
    return (round(iv.gps_lat, 6), round(iv.gps_lng, 6))


# --- single-row detectors ---------------------------------------------------

def detect_speeder(interviews, rules):
    out = []
    lo = rules["speeder_below"]
    for iv in interviews:
        if iv.duration_sec is not None and iv.duration_sec < lo:
            out.append((iv, {"check": SPEEDER, "severity": SEVERITY[SPEEDER],
                             "detail": {"duration_sec": iv.duration_sec, "threshold": lo}}))
    return out


def detect_too_long(interviews, rules):
    out = []
    hi = rules["too_long_above"]
    for iv in interviews:
        if iv.duration_sec is not None and iv.duration_sec > hi:
            out.append((iv, {"check": TOO_LONG, "severity": SEVERITY[TOO_LONG],
                             "detail": {"duration_sec": iv.duration_sec, "threshold": hi}}))
    return out


def detect_straightlining(interviews, rules):
    out = []
    block = rules["straightlining_block"]
    for iv in interviews:
        vals = [_ans(iv, k) for k in block]
        if all(v is not None for v in vals) and len(set(vals)) == 1:
            out.append((iv, {"check": STRAIGHTLINING, "severity": SEVERITY[STRAIGHTLINING],
                             "detail": {"block": block, "value": vals[0]}}))
    return out


def detect_gps_out_of_area(interviews, rules):
    out = []
    bb = rules["gps_bbox"]
    for iv in interviews:
        if iv.gps_lat is None or iv.gps_lng is None:
            continue
        if not (bb["lat_min"] <= iv.gps_lat <= bb["lat_max"]
                and bb["lng_min"] <= iv.gps_lng <= bb["lng_max"]):
            out.append((iv, {"check": GPS_OUT_OF_AREA, "severity": SEVERITY[GPS_OUT_OF_AREA],
                             "detail": {"lat": iv.gps_lat, "lng": iv.gps_lng, "bbox": bb}}))
    return out


def detect_audio_presence(interviews, rules):
    out = []
    for iv in interviews:
        if not (getattr(iv, "audio_ref", None) or "").strip():
            out.append((iv, {"check": AUDIO_PRESENCE, "severity": SEVERITY[AUDIO_PRESENCE],
                             "detail": {"reason": "missing audio recording"}}))
    return out


def detect_eligibility(interviews, rules):
    out = []
    allowed = rules["eligibility"]["q1_age_in"]
    for iv in interviews:
        age = _ans(iv, "q1_age")
        if age is not None and age not in allowed:
            out.append((iv, {"check": ELIGIBILITY, "severity": SEVERITY[ELIGIBILITY],
                             "detail": {"q1_age": age, "allowed": allowed}}))
    return out


# --- cross-row detectors (grouped per interviewer) --------------------------

def _by_interviewer(interviews):
    groups = defaultdict(list)
    for iv in interviews:
        groups[iv.interviewer_id].append(iv)
    return groups


def detect_gps_identical(interviews, rules):
    """Coordinates reused by >=2 interviews of the SAME interviewer."""
    out = []
    for interviewer, group in _by_interviewer(interviews).items():
        coords = defaultdict(list)
        for iv in group:
            ck = _coord_key(iv)
            if ck is not None:
                coords[ck].append(iv)
        for ck, members in coords.items():
            if len(members) >= 2:
                ids = [m.external_id for m in members]
                for iv in members:
                    out.append((iv, {"check": GPS_IDENTICAL, "severity": SEVERITY[GPS_IDENTICAL],
                                     "detail": {"lat": ck[0], "lng": ck[1], "count": len(members),
                                                "interviewer_id": interviewer, "shared_with": ids}}))
    return out


def detect_duplicate_openend(interviews, rules):
    """Full answer vector (q3..q9) repeated by >=2 interviews of one interviewer."""
    out = []
    block = rules["duplicate_block"]
    for interviewer, group in _by_interviewer(interviews).items():
        vectors = defaultdict(list)
        for iv in group:
            vals = tuple(_ans(iv, k) for k in block)
            if all(v is not None for v in vals):
                vectors[vals].append(iv)
        for vec, members in vectors.items():
            if len(members) >= 2:
                ids = [m.external_id for m in members]
                for iv in members:
                    out.append((iv, {"check": DUPLICATE_OPENEND, "severity": SEVERITY[DUPLICATE_OPENEND],
                                     "detail": {"block": block, "vector": list(vec),
                                                "count": len(members), "interviewer_id": interviewer,
                                                "shared_with": ids}}))
    return out


def detect_cadence(interviews, rules):
    """Impossible back-to-back interviews by one interviewer.

    Sorting each interviewer's interviews by start time, a transition is
    impossible when the next starts before the previous ended, or the gap is
    below `cadence_min_gap_sec`. BOTH interviews of the transition are flagged.
    """
    out = []
    min_gap = rules["cadence_min_gap_sec"]
    for interviewer, group in _by_interviewer(interviews).items():
        timed = [iv for iv in group if iv.started_at and iv.ended_at]
        timed.sort(key=lambda iv: iv.started_at)
        for prev, cur in zip(timed, timed[1:]):
            gap = (cur.started_at - prev.ended_at).total_seconds()
            overlap = cur.started_at < prev.ended_at
            if overlap or gap < min_gap:
                reason = "overlap" if overlap else "gap_too_short"
                out.append((prev, {"check": CADENCE_IMPOSSIBLE, "severity": SEVERITY[CADENCE_IMPOSSIBLE],
                                   "detail": {"reason": reason, "gap_sec": gap, "min_gap_sec": min_gap,
                                              "with": cur.external_id, "role": "earlier"}}))
                out.append((cur, {"check": CADENCE_IMPOSSIBLE, "severity": SEVERITY[CADENCE_IMPOSSIBLE],
                                  "detail": {"reason": reason, "gap_sec": gap, "min_gap_sec": min_gap,
                                             "with": prev.external_id, "role": "later"}}))
    return out


DETECTORS = (
    detect_speeder, detect_too_long, detect_straightlining, detect_gps_out_of_area,
    detect_audio_presence, detect_eligibility, detect_gps_identical,
    detect_duplicate_openend, detect_cadence,
)


def run_all_detectors(interviews, rules):
    """Run every detector. Returns list[(interview, flag)] deduped per
    (interview, check) — so an interview hit by two cadence transitions still
    yields a single cadence flag."""
    result = []
    seen = set()
    for detector in DETECTORS:
        for iv, flag in detector(interviews, rules):
            key = (id(iv), flag["check"])
            if key in seen:
                continue
            seen.add(key)
            result.append((iv, flag))
    return result


def score(flags) -> tuple[str, float]:
    """Map an interview's flags to (qc_status, qc_score in 0..1).

    No flags -> pass (1.0). Any critical flag -> reject. Otherwise (warn only)
    -> flag. qc_score = max(0, 1 - sum of severity penalties).
    """
    if not flags:
        return "pass", 1.0
    penalty = sum(_PENALTY.get(f["severity"], 0.0) for f in flags)
    qc_score = max(0.0, round(1.0 - penalty, 3))
    if any(f["severity"] == CRITICAL for f in flags):
        return "reject", qc_score
    return "flag", qc_score


def compute_interviewer_scores(interviews, checks_by_iv_id) -> list[dict]:
    """Per-interviewer aggregates for anomaly ranking (pure, no DB).

    `checks_by_iv_id` maps interview.id -> set of active check names. Returns a
    list of dicts (one per interviewer) with n_interviews, avg_duration_sec,
    flag_rate and anomaly_score. See the weights above for the formula.
    """
    groups = defaultdict(list)
    for iv in interviews:
        groups[iv.interviewer_id].append(iv)

    out = []
    for interviewer, group in groups.items():
        n = len(group)
        durations = [iv.duration_sec for iv in group if iv.duration_sec is not None]
        avg_duration = round(sum(durations) / len(durations), 1) if durations else None

        n_flagged = n_fab = n_speeder = 0
        for iv in group:
            checks = checks_by_iv_id.get(iv.id, set())
            if checks:
                n_flagged += 1
            if checks & FABRICATION_CHECKS:
                n_fab += 1
            if SPEEDER in checks:
                n_speeder += 1

        flag_rate = n_flagged / n if n else 0.0
        fab_ratio = n_fab / n if n else 0.0
        speeder_ratio = n_speeder / n if n else 0.0
        anomaly = (_ANOMALY_W_FABRICATION * fab_ratio
                   + _ANOMALY_W_SPEEDER * speeder_ratio
                   + _ANOMALY_W_FLAG_RATE * flag_rate)

        out.append({
            "interviewer_id": interviewer,
            "n_interviews": n,
            "avg_duration_sec": avg_duration,
            "flag_rate": round(flag_rate, 4),
            "anomaly_score": round(min(1.0, anomaly), 4),
        })
    return out


def build_report(interviews, checks_by_iv_id) -> dict:
    """Read-only QC report computed from stored statuses + active flags.

    Separates fraud (fabrication flags) from eligibility (a screen-out). Axes:
      approved       = qc_status == pass
      fraud_rejected = has any fabrication flag
      ineligible     = has any eligibility flag
      needs_review   = qc_status == flag (warn-only)
    Plus per-check breakdown, per-interviewer summary, and an approved/rejected
    trend bucketed by the hour the interview started.
    """
    approved = fraud_rejected = ineligible = needs_review = 0
    by_check = {}
    trend = {}  # hour -> {"approved": n, "rejected": n}

    for iv in interviews:
        checks = checks_by_iv_id.get(iv.id, set())
        for c in checks:
            by_check[c] = by_check.get(c, 0) + 1

        if iv.qc_status == "pass":
            approved += 1
        elif iv.qc_status == "flag":
            needs_review += 1
        if checks & FABRICATION_CHECKS:
            fraud_rejected += 1
        if ELIGIBILITY in checks:
            ineligible += 1

        if iv.started_at is not None:
            bucket = iv.started_at.strftime("%Y-%m-%dT%H:00")
            row = trend.setdefault(bucket, {"approved": 0, "rejected": 0})
            if iv.qc_status == "pass":
                row["approved"] += 1
            elif iv.qc_status == "reject":
                row["rejected"] += 1

    interviewers = compute_interviewer_scores(interviews, checks_by_iv_id)
    interviewers.sort(key=lambda s: s["anomaly_score"], reverse=True)

    return {
        "interviews_total": len(interviews),
        "approved": approved,
        "fraud_rejected": fraud_rejected,
        "ineligible": ineligible,
        "needs_review": needs_review,
        "by_check": by_check,
        "interviewers": interviewers,
        "trend": [{"time": k, **v} for k, v in sorted(trend.items())],
    }
