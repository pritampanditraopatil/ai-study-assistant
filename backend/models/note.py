"""Note document model – raw + cleaned text attached to a topic."""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class NoteModel(BaseModel):
    """MongoDB document shape for a note.

    Attributes:
        id: MongoDB ``_id`` as a string.
        topic_id: Foreign key referencing the parent topic.
        raw_text: Original user-supplied text.
        cleaned_text: Normalised / cleaned version of raw_text.
        version: Incremental version counter.
        created_at: UTC timestamp of creation.
    """

    id: Optional[str] = Field(default=None, alias="_id")
    topic_id: str
    raw_text: str
    cleaned_text: Optional[str] = None
    version: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "topic_id": "665f1a2b3c4d5e6f7a8b9c0d",
                "raw_text": "Process scheduling determines which process runs next …",
                "cleaned_text": "Process scheduling determines which process runs next …",
                "version": 1,
            }
        },
    }
