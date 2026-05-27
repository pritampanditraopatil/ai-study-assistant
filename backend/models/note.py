"""
models/note.py
--------------
Pydantic model representing a Note document in MongoDB.

A Note stores raw student text ingested for a Topic, along with a cleaned
version produced by pre-processing. Multiple versions can coexist.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class NoteModel(BaseModel):
    """
    MongoDB document shape for a Note.

    Attributes
    ----------
    id : Optional[str]
        The MongoDB ``_id`` serialised as a plain string.
    topic_id : str
        Foreign-key reference to the parent ``TopicModel._id``.
    raw_text : str
        The original, unmodified text as submitted by the student.
    cleaned_text : Optional[str]
        Text after whitespace normalisation and basic pre-processing.
        Populated by the service layer before persistence.
    version : int
        Monotonically increasing version counter (default 1).
    created_at : datetime
        UTC timestamp of document creation.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    topic_id: str
    raw_text: str
    cleaned_text: Optional[str] = None
    version: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
