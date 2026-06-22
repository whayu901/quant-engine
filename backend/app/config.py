from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Dict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Infra
    database_url: str = "sqlite:///./qualengine.db"
    redis_url: str = "redis://localhost:6379/0"
    cors_origins: str = "http://localhost:5173"

    # Auth
    secret_key: str = "dev-secret-change-me"
    access_token_expire_minutes: int = 60 * 24

    # LLM
    anthropic_api_key: str = ""
    model_name: str = "claude-sonnet-4-6"
    stage_max_tokens: int = 1800

    # SaaS plans / usage
    free_plan_monthly_limit: int = 20

    # Media storage: "local" (dev) or "s3" (prod)
    storage_backend: str = "local"
    media_dir: str = "./media"
    s3_bucket: str = ""
    s3_region: str = "ap-southeast-1"  # SEA default: Singapore
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_endpoint_url: str = ""  # set for MinIO / non-AWS

    # Transcription: "mock" (dev/test), "deepgram", "assemblyai", "whisper_local"
    transcription_provider: str = "mock"
    deepgram_api_key: str = ""
    assemblyai_api_key: str = ""
    default_language: str = ""        # "" = auto-detect
    translate_to_english: bool = False

    # Dev/test: run Celery tasks inline (no broker needed)
    celery_task_always_eager: bool = False

    # Southeast Asia defaults
    default_data_region: str = "ap-southeast-1"  # Singapore
    supported_data_regions: List[str] = [
        "ap-southeast-1",  # Singapore
        "ap-southeast-3",  # Jakarta
    ]

    # SEA Languages with code-mixing support
    supported_languages: Dict[str, str] = {
        "id": "Bahasa Indonesia",
        "ms": "Bahasa Melayu",
        "th": "ไทย (Thai)",
        "vi": "Tiếng Việt",
        "fil": "Filipino/Tagalog",
        "en": "English",
        "id-en": "Bahasa Indonesia + English (code-mixed)",
        "fil-en": "Taglish (Filipino + English)",
        "en-sg": "Singlish",
        "ms-en": "Manglish (Malay + English)",
    }

    # Regional/local languages detection
    regional_languages: List[str] = ["jv", "su", "min"]  # Javanese, Sundanese, Minangkabau

    # Currency defaults
    supported_currencies: Dict[str, str] = {
        "IDR": "Indonesian Rupiah",
        "SGD": "Singapore Dollar",
        "MYR": "Malaysian Ringgit",
        "THB": "Thai Baht",
        "VND": "Vietnamese Dong",
        "PHP": "Philippine Peso",
        "USD": "US Dollar",
    }
    default_currency: str = "USD"

    # ASR provider selection per language
    asr_language_routing: Dict[str, str] = {
        "id": "deepgram",  # Best for Bahasa Indonesia
        "ms": "assemblyai",
        "th": "deepgram",
        "vi": "assemblyai",
        "fil": "deepgram",
        "en": "deepgram",
        "default": "whisper_local",  # Fallback for unsupported languages
    }


settings = Settings()
