import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "AI Recruiter"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "insecure-secret-key-for-development-mode-only-replace-in-prod"
    ENCRYPTION_KEY: str = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    ALLOWED_HOSTS: List[str] = ["*"]

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "ai_recruiter"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_recruiter"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB

    # AI Configuration (Built-in Local AI is default)
    AI_PROVIDER_DEFAULT: str = "builtin"  # 'builtin' (local open-weights), 'gemini', 'anthropic', 'openai'
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    BUILTIN_MODEL_NAME: str = "llama3.2:3b"
    BUILTIN_EMBEDDING_MODEL: str = "nomic-embed-text"

    # Optional Cloud AI Keys (BYOK / BYOA - completely optional)
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Google OAuth & Gmail API
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"
    GOOGLE_REFRESH_TOKEN: Optional[str] = None

    # Security Configuration
    SECURITY_HEADERS_ENABLED: bool = True
    MAX_REQUEST_BODY_BYTES: int = 5 * 1024 * 1024  # 5 MB
    STRICT_TRANSPORT_SECURITY: bool = False  # Enabled in HTTPS / production

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        env = os.getenv("APP_ENV", "development").lower()
        if env == "production":
            if "insecure" in v.lower() or len(v) < 32:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: "
                    "SECRET_KEY must be a cryptographically secure secret (>= 32 chars) in production."
                )
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            origins = [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            origins = v
        else:
            origins = ["http://localhost:5173", "http://localhost:3000"]

        env = os.getenv("APP_ENV", "development").lower()
        if env == "production" and "*" in origins:
            raise ValueError(
                "CRITICAL SECURITY VIOLATION: Wildcard '*' CORS origin is strictly forbidden in production."
            )
        return origins


settings = Settings()
