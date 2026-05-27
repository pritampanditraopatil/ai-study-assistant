"""Topic request / response schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TopicCreate(BaseModel):
    """Payload for creating a new topic under a subject.

    Attributes:
        subject_id: The parent subject's ID (hex string).
        title: Topic title.
        description: Optional elaboration.
    """

    subject_id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1, max_length=300, examples=["Process Scheduling"])
    description: Optional[str] = Field(default=None, max_length=2000)


class TopicUpdate(BaseModel):
    """Payload for updating an existing topic.  All fields optional."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=300)
    description: Optional[str] = Field(default=None, max_length=2000)


class TopicResponse(BaseModel):
    """Serialised topic returned to the client.

    Attributes:
        id: String representation of the MongoDB ObjectId.
        subject_id: Parent subject ID.
        title: Topic title.
        description: Optional description.
        created_at: UTC creation timestamp.
    """

    id: str
    subject_id: str
    title: str
    description: Optional[str] = None
    created_at: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "665f1a2b3c4d5e6f7a8b9c0d",
                "subject_id": "665f1a2b3c4d5e6f7a8b9c0e",
                "title": "Process Scheduling",
                "description": "CPU scheduling algorithms.",
                "created_at": "2025-06-01T12:00:00Z",
            }
        }
    }
