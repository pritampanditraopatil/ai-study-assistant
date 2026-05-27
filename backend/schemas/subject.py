"""
schemas/subject.py
------------------
Pydantic DTOs for Subject create / update / response operations.

These schemas are used exclusively at the HTTP layer (request bodies and
response serialisation).  They are separate from the MongoDB document model
(``SubjectModel``) so that the API contract can evolve independently.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SubjectCreate(BaseModel):
    """
    Payload for creating a new Subject.

    Attributes
    ----------
    name : str
        Full human-readable name (e.g. "Operating Systems").
    code : str
        Short code / abbreviation (e.g. "OS").  Must be non-empty.
    description : Optional[str]
        Optional free-text description.
    """

    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=20)
    description: Optional[str] = Field(default=None, max_length=1000)


class SubjectUpdate(BaseModel):
    """
    Payload for partially updating an existing Subject.

    All fields are optional; only provided fields will be modified.

    Attributes
    ----------
    name : Optional[str]
        New name for the subject.
    code : Optional[str]
        New code/abbreviation.
    description : Optional[str]
        New description text.
    """

    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    code: Optional[str] = Field(default=None, min_length=1, max_length=20)
    description: Optional[str] = Field(default=None, max_length=1000)


class SubjectResponse(BaseModel):
    """
    Response DTO returned to the client after any Subject operation.

    Attributes
    ----------
    id : str
        MongoDB document ID as a string.
    name : str
        Subject name.
    code : str
        Subject code.
    description : Optional[str]
        Subject description.
    created_at : datetime
        UTC creation timestamp.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime
