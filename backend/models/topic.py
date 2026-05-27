"""
models/topic.py
---------------
Pydantic model representing a Topic document in MongoDB.

A Topic belongs to a Subject and groups related Notes and Mind-maps
(e.g. "Process Scheduling" under "Operating Systems").
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TopicModel(BaseModel):
    """
    MongoDB document shape for a Topic.

    Attributes
    ----------
    id : Optional[str]
        The MongoDB ``_id`` serialised as a plain string.
    subject_id : str
        Foreign-key reference to the parent ``SubjectModel._id``.
    title : str
        Title of the topic (e.g. "Process Scheduling").
    description : Optional[str]
        Optional summary or learning objective for this topic.
    created_at : datetime
        UTC timestamp of document creation.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    subject_id: str
    title: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
