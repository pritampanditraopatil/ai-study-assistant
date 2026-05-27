"""Subject document model – represents an academic subject (e.g. OS, DBMS)."""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class SubjectModel(BaseModel):
    """MongoDB document shape for a subject.

    Attributes:
        id: MongoDB ``_id`` stored as a string (hex ObjectId).
        name: Human-readable subject name.
        code: Short code such as ``"OS"`` or ``"DBMS"``.
        description: Optional longer description.
        created_at: UTC timestamp of creation.
    """

    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "name": "Operating Systems",
                "code": "OS",
                "description": "Study of OS concepts including processes, memory, and file systems.",
            }
        },
    }
