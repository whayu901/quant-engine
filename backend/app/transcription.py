"""Pluggable speech-to-text with diarization. Returns a normalized result:

    {
      "language": "id",
      "text": "full transcript text",
      "segments": [ {"speaker": "Speaker 0", "start": 0.0, "end": 4.2, "text": "..."} ],
      "duration": 312.5
    }

Real providers (Deepgram / AssemblyAI / whisper_local) require their own keys and
outbound network; the "mock" provider lets the rest of the pipeline run offline.
"""
from .config import settings


def _format_text(segments) -> str:
    return "\n".join(f"{s['speaker']}: {s['text']}".strip(": ") for s in segments)


# ---- mock (dev/test) -------------------------------------------------------
def _mock(path, language=None):
    segs = [
        {"speaker": "Moderator", "start": 0.0, "end": 5.0,
         "text": "Terima kasih sudah hadir. Apa yang pertama kali kalian lihat dari kemasan ini?"},
        {"speaker": "Responden 1", "start": 5.0, "end": 11.0,
         "text": "Warnanya menarik, tapi harganya kelihatan premium banget."},
        {"speaker": "Responden 2", "start": 11.0, "end": 17.0,
         "text": "Buat saya rasa nomor satu. Selisih lima ratus aja udah kerasa di kantong."},
    ]
    return {"language": language or "id", "text": _format_text(segs),
            "segments": segs, "duration": 17.0}


# ---- Deepgram --------------------------------------------------------------
def _deepgram(path, language=None):
    import httpx
    params = {"diarize": "true", "punctuate": "true", "smart_format": "true"}
    if language:
        params["language"] = language
    else:
        params["detect_language"] = "true"
    if settings.translate_to_english:
        params["translate"] = "true"
    with open(path, "rb") as f:
        r = httpx.post(
            "https://api.deepgram.com/v1/listen",
            params=params,
            headers={"Authorization": f"Token {settings.deepgram_api_key}"},
            content=f.read(), timeout=600,
        )
    r.raise_for_status()
    data = r.json()
    alt = data["results"]["channels"][0]["alternatives"][0]
    words = alt.get("words", [])
    segments, cur = [], None
    for w in words:
        spk = f"Speaker {w.get('speaker', 0)}"
        if cur is None or cur["speaker"] != spk:
            if cur:
                segments.append(cur)
            cur = {"speaker": spk, "start": w["start"], "end": w["end"],
                   "text": w.get("punctuated_word", w["word"])}
        else:
            cur["end"] = w["end"]
            cur["text"] += " " + w.get("punctuated_word", w["word"])
    if cur:
        segments.append(cur)
    lang = data["results"]["channels"][0].get("detected_language", language or "")
    dur = data.get("metadata", {}).get("duration")
    return {"language": lang, "text": alt.get("transcript", _format_text(segments)),
            "segments": segments, "duration": dur}


# ---- AssemblyAI ------------------------------------------------------------
def _assemblyai(path, language=None):
    import httpx, time
    h = {"authorization": settings.assemblyai_api_key}
    with open(path, "rb") as f:
        up = httpx.post("https://api.assemblyai.com/v2/upload", headers=h,
                        content=f.read(), timeout=600)
    up.raise_for_status()
    body = {"audio_url": up.json()["upload_url"], "speaker_labels": True}
    if language:
        body["language_code"] = language
    else:
        body["language_detection"] = True
    job = httpx.post("https://api.assemblyai.com/v2/transcript", headers=h, json=body).json()
    tid = job["id"]
    while True:
        cur = httpx.get(f"https://api.assemblyai.com/v2/transcript/{tid}", headers=h).json()
        if cur["status"] == "completed":
            break
        if cur["status"] == "error":
            raise RuntimeError(cur.get("error", "transcription failed"))
        time.sleep(3)
    segments = [{"speaker": f"Speaker {u.get('speaker', '?')}",
                 "start": u["start"] / 1000, "end": u["end"] / 1000, "text": u["text"]}
                for u in cur.get("utterances", [])]
    return {"language": cur.get("language_code", language or ""),
            "text": cur.get("text", _format_text(segments)),
            "segments": segments, "duration": (cur.get("audio_duration") or 0)}


# ---- local Whisper (faster-whisper) ---------------------------------------
def _whisper_local(path, language=None):
    from faster_whisper import WhisperModel  # optional dependency
    model = WhisperModel("base", compute_type="int8")
    segs, info = model.transcribe(path, language=language or None,
                                  task="translate" if settings.translate_to_english else "transcribe")
    segments = [{"speaker": "Speaker", "start": s.start, "end": s.end, "text": s.text.strip()}
                for s in segs]
    return {"language": info.language, "text": _format_text(segments),
            "segments": segments, "duration": info.duration}


_PROVIDERS = {
    "mock": _mock,
    "deepgram": _deepgram,
    "assemblyai": _assemblyai,
    "whisper_local": _whisper_local,
}


def transcribe(path: str, language: str = None) -> dict:
    provider = _PROVIDERS.get(settings.transcription_provider, _mock)
    lang = language or settings.default_language or None
    return provider(path, lang)
