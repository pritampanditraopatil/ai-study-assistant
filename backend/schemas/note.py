"""
schemas/note.py
---------------
Pydantic DTOs for Note ingestion and retrieval.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class NoteIngest(BaseModel):
    """
    Payload for ingesting raw student notes for a Topic.

    Attributes
    ----------
    topic_id : str
        The ``_id`` string of the parent Topic document.
    raw_text : str
        The original, unmodified text submitted by the student.
        Must be at least 10 characters.
    """

    topic_id: str = Field(..., min_length=1)
    raw_text: str = Field(..., min_length=10)


class NoteResponse(BaseModel):
    """
    Response DTO returned after a Note is stored.

    Attributes
    ----------
    id : str
        MongoDB document ID as a string.
    topic_id : str
        Parent Topic ID.
    raw_text : str
        Original submitted text.
    cleaned_text : Optional[str]
        Pre-processed / normalised text, populated by the service layer.
    version : int
        Note version (starts at 1).
    created_at : datetime
        UTC creation timestamp.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: str
    topic_id: str
    raw_text: str
    cleaned_text: Optional[str] = None
    version: int
    created_at: datetime
