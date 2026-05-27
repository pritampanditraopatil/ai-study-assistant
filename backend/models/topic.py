"""Topic document model – a topic belongs to a subject."""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class TopicModel(BaseModel):
    """MongoDB document shape for a topic.

    Attributes:
        id: MongoDB ``_id`` as a string.
        subject_id: Foreign key referencing the parent subject.
        title: Topic title.
        description: Optional elaboration.
        created_at: UTC timestamp of creation.
    """

    id: Optional[str] = Field(default=None, alias="_id")
    subject_id: str
    title: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "subject_id": "665f1a2b3c4d5e6f7a8b9c0d",
                "title": "Process Scheduling",
                "description": "CPU scheduling algorithms and their trade-offs.",
            }
        },
    }
