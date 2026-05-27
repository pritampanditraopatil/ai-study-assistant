"""
config.py
---------
Application settings loaded from environment variables / .env file.
Uses Pydantic BaseSettings for validation and a cached singleton accessor.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration object for the AI Study Assistant backend.

    All fields are populated from environment variables (or the .env file).
    """

    # ------------------------------------------------------------------ #
    # MongoDB
    # ------------------------------------------------------------------ #
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "ai_study_assistant"

    # ------------------------------------------------------------------ #
    # LLM API
    # ------------------------------------------------------------------ #
    LLM_API_URL: str = "http://localhost:8080/v1/chat/completions"
    LLM_API_KEY: str = "your-key-here"

    # ------------------------------------------------------------------ #
    # CORS
    # ------------------------------------------------------------------ #
    CORS_ORIGINS: str = "http://localhost:3000"

    # Parsed list – populated by validator below
    cors_origins_list: List[str] = []

    @field_validator("cors_origins_list", mode="before")
    @classmethod
    def _parse_cors_origins(cls, v: object, info: object) -> List[str]:  # noqa: ARG003
        """Return CORS_ORIGINS split on commas and stripped of whitespace."""
        # v is the raw value for this field (default []); we read from `info`
        return []  # real parsing happens in model_post_init

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    def model_post_init(self, __context: object) -> None:  # noqa: ANN001
        """Parse CORS_ORIGINS into a list after model initialisation."""
        object.__setattr__(
            self,
            "cors_origins_list",
            [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()],
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return the cached application settings singleton.

    Using ``lru_cache`` ensures the .env file is read only once across the
    entire application lifetime.

    Returns
    -------
    Settings
        The populated settings instance.
    """
    return Settings()
