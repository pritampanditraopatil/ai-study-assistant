"""Note request / response schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NoteIngest(BaseModel):
    """Payload for ingesting a new note.

    Attributes:
        topic_id: The parent topic's ID (hex string).
        raw_text: Unprocessed note content submitted by the user.
    """

    topic_id: str = Field(..., min_length=1)
    raw_text: str = Field(..., min_length=1, max_length=50_000)


class NoteResponse(BaseModel):
    """Serialised note returned to the client.

    Attributes:
        id: String representation of the MongoDB ObjectId.
        topic_id: Parent topic ID.
        raw_text: Original text.
        cleaned_text: Normalised text (may equal raw_text after cleaning).
        version: Document version counter.
        created_at: UTC creation timestamp.
    """

    id: str
    topic_id: str
    raw_text: str
    cleaned_text: Optional[str] = None
    version: int
    created_at: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "665f1a2b3c4d5e6f7a8b9c0d",
                "topic_id": "665f1a2b3c4d5e6f7a8b9c0e",
                "raw_text": "Process scheduling determines …",
                "cleaned_text": "Process scheduling determines …",
                "version": 1,
                "created_at": "2025-06-01T12:00:00Z",
            }
        }
    }
