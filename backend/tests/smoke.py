"""End-to-end smoke test: register -> login -> project -> transcript -> analysis -> results.
Runs with SQLite + Celery eager + a mocked LLM (no API key needed)."""
import os
import pathlib

os.environ["DATABASE_URL"] = "sqlite:///./smoketest.db"
os.environ["CELERY_TASK_ALWAYS_EAGER"] = "true"
os.environ["SECRET_KEY"] = "test-secret"
os.environ["STORAGE_BACKEND"] = "local"
os.environ["MEDIA_DIR"] = "./smoke_media"
os.environ["TRANSCRIPTION_PROVIDER"] = "mock"

# fresh db
db_file = pathlib.Path("smoketest.db")
if db_file.exists():
    db_file.unlink()

# Mock the LLM pipeline BEFORE the task runs (attribute lookup is at call-time)
from app import llm

llm.code_themes = lambda transcript: (
    {"respondentCount": 4, "themes": [
        {"id": 1, "name": "Sensitivitas harga", "description": "Responden sensitif selisih harga.",
         "prevalence": "Tinggi", "sentiment": "Campuran"},
        {"id": 2, "name": "Loyalitas rasa", "description": "Rasa jadi penentu pindah merek.",
         "prevalence": "Sedang", "sentiment": "Positif"},
    ]},
    (1200, 300),
)
llm.extract_verbatims = lambda transcript, themes: (
    {"verbatims": [
        {"themeId": 1, "quote": "Selisih lima ratus aja udah kerasa", "speaker": "Responden 2"},
        {"themeId": 2, "quote": "Rasa nomor satu sih buat saya", "speaker": "Responden 1"},
    ]},
    (1300, 200),
)
llm.write_topline = lambda transcript, themes: (
    {"topline": "Konsumen sangat sensitif harga namun rasa tetap penentu utama loyalitas.",
     "implications": ["Jaga konsistensi rasa", "Hati-hati menaikkan harga", "Gunakan sampling gratis"]},
    (1300, 250),
)

from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)
ok = lambda r: (r.status_code, r.json())

# health
assert c.get("/health").json()["status"] == "ok"

# register -> token
r = c.post("/auth/register", json={"email": "wahyu@kadence.example.com", "password": "secret123", "org_name": "Kadence ID"})
assert r.status_code == 200, ok(r)
token = r.json()["access_token"]
H = {"Authorization": f"Bearer {token}"}

# me
me = c.get("/auth/me", headers=H).json()
assert me["role"] == "admin", me

# multi-tenant isolation: a second org must NOT see first org's project
r2 = c.post("/auth/register", json={"email": "other@rival.example.com", "password": "secret123", "org_name": "Rival Co"})
H2 = {"Authorization": f"Bearer {r2.json()['access_token']}"}

# create project
p = c.post("/projects", json={"name": "Studi Kopi 2026", "description": "FGD kopi sachet"}, headers=H).json()
proj_id = p["id"]

# rival cannot read it
assert c.get(f"/projects/{proj_id}", headers=H2).status_code == 404, "TENANT LEAK!"

# create transcript
t = c.post(f"/projects/{proj_id}/transcripts",
           json={"title": "FGD Sesi 1", "method": "FGD", "content": "MODERATOR: ... RESPONDEN 1: ..."},
           headers=H).json()
tid = t["id"]

# start analysis (eager -> runs inline with mocked LLM)
a = c.post(f"/transcripts/{tid}/analyses", headers=H)
assert a.status_code == 200, ok(a)
aid = a.json()["id"]

# fetch results
res = c.get(f"/analyses/{aid}", headers=H).json()
assert res["status"] == "done", res
assert len(res["themes"]) == 2, res
assert res["themes"][0]["verbatims"][0]["quote"], res
assert len(res["implications"]) == 3, res
assert res["input_tokens"] > 0, res

# usage metering
u = c.get("/usage", headers=H).json()
assert u["month_count"] == 1 and u["plan"] == "free", u

# --- Phase 1: media upload -> transcription (mock) -> segments ---
m = c.post(f"/projects/{proj_id}/media", headers=H,
           files={"file": ("interview.mp3", b"FAKE-AUDIO-BYTES", "audio/mpeg")})
assert m.status_code == 200, ok(m)
mtid = m.json()["id"]
# eager mode: transcription already ran inline
td = c.get(f"/transcripts/{mtid}", headers=H).json()
assert td["transcription_status"] == "done", td
assert td["content"].strip(), td
assert len(td["segments"]) == 3, td
assert td["segments"][0]["start_sec"] is not None, td
assert td["language"] == "id", td

# analysis works on the transcribed transcript too
ma = c.post(f"/transcripts/{mtid}/analyses", headers=H)
assert ma.status_code == 200, ok(ma)
assert c.get(f"/analyses/{ma.json()['id']}", headers=H).json()["status"] == "done"

print("SMOKE OK")
print("  topline:", res["topline"])
print("  themes:", [th["name"] for th in res["themes"]])
print("  tokens:", res["input_tokens"], "in /", res["output_tokens"], "out")
print("  usage:", u)
print("  tenant isolation: enforced (rival got 404)")
print("  media->transcript:", td["transcription_status"], "|", len(td["segments"]), "segments |", "lang", td["language"])
import shutil
shutil.rmtree("./smoke_media", ignore_errors=True)
db_file.unlink(missing_ok=True)
