"""Subject request / response schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SubjectCreate(BaseModel):
    """Payload for creating a new subject.

    Attributes:
        name: Human-readable subject name (required).
        code: Short alphanumeric code, e.g. ``"OS"`` (required).
        description: Optional longer description.
    """

    name: str = Field(..., min_length=1, max_length=200, examples=["Operating Systems"])
    code: str = Field(..., min_length=1, max_length=20, examples=["OS"])
    description: Optional[str] = Field(default=None, max_length=2000)


class SubjectUpdate(BaseModel):
    """Payload for updating an existing subject.  All fields are optional."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    code: Optional[str] = Field(default=None, min_length=1, max_length=20)
    description: Optional[str] = Field(default=None, max_length=2000)


class SubjectResponse(BaseModel):
    """Serialised subject returned to the client.

    Attributes:
        id: String representation of the MongoDB ObjectId.
        name: Subject name.
        code: Short code.
        description: Optional description.
        created_at: UTC creation timestamp.
    """

    id: str
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "665f1a2b3c4d5e6f7a8b9c0d",
                "name": "Operating Systems",
                "code": "OS",
                "description": "Study of OS concepts.",
                "created_at": "2025-06-01T12:00:00Z",
            }
        }
    }
