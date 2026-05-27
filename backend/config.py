"""Application configuration loaded from environment variables via Pydantic Settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the AI Study Assistant backend.

    Values are loaded from a `.env` file (if present) and can be overridden
    by real environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── MongoDB ──────────────────────────────────────────────────────────
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "ai_study_assistant"

    # ── LLM / AI ────────────────────────────────────────────────────────
    LLM_API_URL: str = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-3.5-flash:generateContent"
    )
    LLM_API_KEY: str = ""

    # ── CORS ─────────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse the comma-separated CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton of the application settings."""
    return Settings()
