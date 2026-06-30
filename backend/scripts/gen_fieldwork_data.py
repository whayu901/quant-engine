#!/usr/bin/env python3
"""
Synthetic fieldwork dataset for testing the Fieldwork QC / Verifier module.
Deterministic (seeded). Produces:
  - fieldwork_qc_sample.csv     : the interviews to verify (import this in Phase 2)
  - fieldwork_qc_expected.csv   : answer key (external_id -> checks that SHOULD fire)
Detectors are exercised: duration/speeder, straightlining, gps (out-of-area / identical),
cadence (impossible back-to-back), duplicate open-ends, audio_presence, eligibility,
and interviewer-level anomaly (INT-007 = full curbstoner).
"""
import csv, random, json
from datetime import datetime, timedelta

random.seed(42)

# ---- study config (mirror these into FieldworkBatch.rules when you build it) ----
RULES = {
    "duration_sec": {"speeder_below": 240, "too_long_above": 2400, "legit": [300, 1200]},
    "gps_sampling_bbox": {"lat": [-6.40, -6.05], "lng": [106.65, 106.95]},  # Jakarta
    "straightlining_block": ["q3_brand_quality","q4_value","q5_trust","q6_innovation","q7_service","q8_recommend"],
    "eligibility": {"q1_age_in": ["18-24","25-34","35-44"]},  # target 18-45
    "cadence_min_gap_sec": 60,
}
AGE_OK = ["18-24","25-34","35-44"]
AGE_BAD = ["<18","45-54","55+"]
GENDERS = ["M","F"]
OPENENDS = ["terjangkau","kualitas bagus","kemasan menarik","mudah didapat","rasanya enak",
            "iklannya lucu","kurang promo","biasa aja","cukup memuaskan","direkomendasi teman"]

def jkt():  # in-area
    return round(random.uniform(-6.38,-6.08),6), round(random.uniform(106.67,106.93),6)
def out_of_area():  # Surabaya-ish
    return round(random.uniform(-7.35,-7.20),6), round(random.uniform(112.65,112.80),6)
def iso(dt): return dt.strftime("%Y-%m-%dT%H:%M:%S")

rows, key = [], []
ext = 1000

def add(interviewer, start, dur, lat, lng, audio, ans, checks):
    global ext
    ext += 1
    eid = f"R{ext}"
    end = start + timedelta(seconds=dur)
    rows.append({
        "external_id": eid, "interviewer_id": interviewer, "respondent_ref": f"resp-{ext}",
        "started_at": iso(start), "ended_at": iso(end), "duration_sec": dur,
        "gps_lat": lat, "gps_lng": lng, "audio_ref": audio,
        **ans,
    })
    key.append({"external_id": eid, "interviewer_id": interviewer,
                "expected_checks": "|".join(checks) if checks else "(clean)"})
    return end

def legit_ans():
    return {"q1_age": random.choice(AGE_OK), "q2_gender": random.choice(GENDERS),
            "q3_brand_quality": random.randint(1,5), "q4_value": random.randint(1,5),
            "q5_trust": random.randint(1,5), "q6_innovation": random.randint(1,5),
            "q7_service": random.randint(1,5), "q8_recommend": random.randint(1,5),
            "q9_brand_word": random.choice(OPENENDS), "q10_nps": random.randint(0,10)}

def straight_ans(v=4, openend=None, age=None):
    a = legit_ans()
    for q in RULES["straightlining_block"]: a[q] = v
    if openend: a["q9_brand_word"] = openend
    if age: a["q1_age"] = age
    return a

day = datetime(2026, 6, 24, 9, 0, 0)

# ---- INT-001..003: legit interviewers (clean) ----
for inv in ["INT-001","INT-002","INT-003"]:
    t = day + timedelta(minutes=random.randint(0,30))
    for _ in range(8):
        dur = random.randint(*RULES["duration_sec"]["legit"])
        lat,lng = jkt()
        t = add(inv, t, dur, lat, lng, f"aud/{inv}-{ext+1}.wav", legit_ans(), [])
        t += timedelta(seconds=random.randint(300, 1800))  # travel/break to next

# one legit-looking interview but audio missing (isolated audio_presence case)
add("INT-002", day+timedelta(hours=5), 640, *jkt(), "", legit_ans(), ["audio_presence"])

# ---- INT-004: speeders ----
t = day + timedelta(minutes=10)
for _ in range(5):
    dur = random.randint(80, 210)  # below 240
    t = add("INT-004", t, dur, *jkt(), f"aud/INT-004-{ext+1}.wav", legit_ans(), ["speeder"])
    t += timedelta(seconds=random.randint(400, 1200))

# ---- INT-005: straightliners (+ one too-long) ----
t = day + timedelta(minutes=20)
for i in range(5):
    if i == 4:
        dur = 3200  # too long
        t = add("INT-005", t, dur, *jkt(), f"aud/INT-005-{ext+1}.wav",
                straight_ans(v=3), ["straightlining","too_long"])
    else:
        dur = random.randint(300, 900)
        t = add("INT-005", t, dur, *jkt(), f"aud/INT-005-{ext+1}.wav",
                straight_ans(v=5), ["straightlining"])
    t += timedelta(seconds=random.randint(400, 1500))

# ---- INT-006: GPS problems (out-of-area + identical coords) ----
t = day + timedelta(minutes=15)
fixed_lat, fixed_lng = -6.21, 106.84  # interviewer's repeated point
for i in range(6):
    if i < 2:
        lat,lng = out_of_area(); checks = ["gps_out_of_area"]
    else:
        lat,lng = fixed_lat, fixed_lng; checks = ["gps_identical"]
    dur = random.randint(300, 1000)
    t = add("INT-006", t, dur, lat, lng, f"aud/INT-006-{ext+1}.wav", legit_ans(), checks)
    t += timedelta(seconds=random.randint(500, 1500))

# ---- INT-007: full curbstoner (everything) ----
# back-to-back impossible cadence + speeder + straightline + identical gps + duplicate openend + no audio
t = day + timedelta(minutes=5)
cb_lat, cb_lng = -6.3000, 106.7000
for _ in range(8):
    dur = random.randint(60, 160)  # speeder
    # impossible cadence: next starts only ~30s after previous start (overlapping interviews)
    t = add("INT-007", t, dur, cb_lat, cb_lng, "",
            straight_ans(v=5, openend="bagus"),
            ["speeder","straightlining","gps_identical","duplicate_openend","audio_presence","cadence_impossible"])
    t += timedelta(seconds=30)

# ---- eligibility failures sprinkled (real demographic mismatches) ----
add("INT-001", day+timedelta(hours=6), 720, *jkt(), "aud/INT-001-elig1.wav",
    straight_ans(v=None, age="55+") if False else {**legit_ans(), "q1_age":"55+"}, ["eligibility"])
add("INT-003", day+timedelta(hours=6, minutes=20), 540, *jkt(), "aud/INT-003-elig2.wav",
    {**legit_ans(), "q1_age":"<18"}, ["eligibility"])
add("INT-004", day+timedelta(hours=6, minutes=40), 95, *jkt(), "aud/INT-004-elig3.wav",
    {**legit_ans(), "q1_age":"45-54"}, ["speeder","eligibility"])

# ---- write files ----
cols = ["external_id","interviewer_id","respondent_ref","started_at","ended_at","duration_sec",
        "gps_lat","gps_lng","audio_ref",
        "q1_age","q2_gender","q3_brand_quality","q4_value","q5_trust","q6_innovation",
        "q7_service","q8_recommend","q9_brand_word","q10_nps"]

with open("/mnt/user-data/outputs/fieldwork_qc_sample.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(rows)

with open("/mnt/user-data/outputs/fieldwork_qc_expected.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=["external_id","interviewer_id","expected_checks"])
    w.writeheader(); w.writerows(key)

# summary
from collections import Counter
flagged = [k for k in key if k["expected_checks"] != "(clean)"]
chk = Counter(c for k in flagged for c in k["expected_checks"].split("|"))
print(f"rows: {len(rows)} | clean: {len(rows)-len(flagged)} | flagged: {len(flagged)}")
print("interviewers:", sorted(set(r['interviewer_id'] for r in rows)))
print("checks fired:", dict(chk))
print("RULES:", json.dumps(RULES))
