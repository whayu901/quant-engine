"""Server-side Claude pipeline: transcript -> themes -> verbatims -> topline.

Each stage returns (parsed_dict, (input_tokens, output_tokens)).
"""
import json
import re
from .config import settings

# Check if API key is available, otherwise use mock
if not settings.anthropic_api_key:
    print("⚠️  No Anthropic API key found. Using mock analysis service for development.")
    from . import llm_mock
    code_themes = llm_mock.code_themes
    extract_verbatims = llm_mock.extract_verbatims
    generate_topline = llm_mock.generate_topline

    # Also alias write_topline to generate_topline for compatibility
    write_topline = llm_mock.generate_topline

else:
    # Use real Anthropic API
    from anthropic import Anthropic
    _client = None

    def _get_client() -> Anthropic:
        global _client
        if _client is None:
            _client = Anthropic(api_key=settings.anthropic_api_key)
        return _client

    def _parse_json(text: str) -> dict:
        t = text.strip()
        t = re.sub(r"^```(?:json)?", "", t).strip()
        t = re.sub(r"```$", "", t).strip()
        s, e = t.find("{"), t.rfind("}")
        if s >= 0 and e >= 0:
            t = t[s:e + 1]
        return json.loads(t)

    def _call(prompt: str, max_tokens: int = None):
        resp = _get_client().messages.create(
            model=settings.model_name,
            max_tokens=max_tokens or settings.stage_max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(b.text for b in resp.content if b.type == "text")
        usage = (resp.usage.input_tokens, resp.usage.output_tokens)
        return text, usage

    def code_themes(transcript: str):
        prompt = (
            "Kamu analis riset kualitatif senior di agensi market research. Analisis transkrip "
            "FGD/IDI berikut. Identifikasi 3-5 tema kunci yang paling penting untuk keputusan "
            "brand/marketing. Jawab HANYA JSON valid tanpa markdown, tanpa kalimat pembuka. "
            'Skema persis:\n'
            '{"respondentCount": <angka>, "themes":[{"id":1,"name":"<nama tema singkat>",'
            '"description":"<1 kalimat>","prevalence":"Tinggi|Sedang|Rendah",'
            '"sentiment":"Positif|Netral|Negatif|Campuran"}]}\n\nTRANSKRIP:\n' + transcript
        )
        text, usage = _call(prompt)
        return _parse_json(text), usage

    def extract_verbatims(transcript: str, themes: list):
        theme_list = "\n".join(f'{t["id"]}. {t["name"]}' for t in themes)
        prompt = (
            "Kamu analis riset kualitatif. Untuk tiap tema di bawah, tarik 1-2 kutipan VERBATIM "
            "(persis apa adanya) dari transkrip yang paling mewakili tema tersebut. Jangan "
            "mengarang; salin teks persis dari transkrip. Jawab HANYA JSON valid:\n"
            '{"verbatims":[{"themeId":<id tema>,"quote":"<kutipan persis>",'
            '"speaker":"<label pembicara>"}]}\n\nTEMA:\n' + theme_list +
            "\n\nTRANSKRIP:\n" + transcript
        )
        text, usage = _call(prompt)
        return _parse_json(text), usage

    def write_topline(transcript: str, themes: list):
        theme_list = "\n".join(f'{t["id"]}. {t["name"]}' for t in themes)
        prompt = (
            "Kamu analis riset kualitatif senior yang menulis untuk pengambil keputusan "
            "brand/marketing (konteks FMCG Indonesia). Berdasarkan transkrip & tema, tulis topline "
            "eksekutif (3-4 kalimat) dan 3 implikasi/rekomendasi bisnis yang actionable. "
            "Jawab HANYA JSON valid:\n"
            '{"topline":"<3-4 kalimat>","implications":["<rek 1>","<rek 2>","<rek 3>"]}\n\n'
            "TEMA:\n" + theme_list + "\n\nTRANSKRIP:\n" + transcript
        )
        text, usage = _call(prompt)
        return _parse_json(text), usage

    # Alias for compatibility
    generate_topline = write_topline