"""
models/subject.py
-----------------
Pydantic model representing a Subject document in MongoDB.

A Subject is a high-level academic course or discipline (e.g. "Operating
Systems", "Database Management Systems") under which Topics are organised.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field
from pydantic import ConfigDict


class SubjectModel(BaseModel):
    """
    MongoDB document shape for a Subject.

    Attributes
    ----------
    id : Optional[str]
        The MongoDB ``_id`` serialised as a plain string.
    name : str
        Full human-readable name of the subject (e.g. "Operating Systems").
    code : str
        Short identifier / abbreviation (e.g. "OS", "DBMS").
    description : Optional[str]
        Optional free-text description of the subject.
    created_at : datetime
        UTC timestamp of document creation.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
