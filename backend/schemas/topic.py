"""
schemas/topic.py
----------------
Pydantic DTOs for Topic create / update / response operations.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TopicCreate(BaseModel):
    """
    Payload for creating a new Topic under a Subject.

    Attributes
    ----------
    subject_id : str
        The ``_id`` string of the parent Subject document.
    title : str
        Title of the topic (e.g. "Process Scheduling").
    description : Optional[str]
        Optional summary / learning objective for this topic.
    """

    subject_id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(default=None, max_length=2000)


class TopicUpdate(BaseModel):
    """
    Payload for partially updating an existing Topic.

    Attributes
    ----------
    title : Optional[str]
        New topic title.
    description : Optional[str]
        New description text.
    """

    title: Optional[str] = Field(default=None, min_length=1, max_length=300)
    description: Optional[str] = Field(default=None, max_length=2000)


class TopicResponse(BaseModel):
    """
    Response DTO returned to the client after any Topic operation.

    Attributes
    ----------
    id : str
        MongoDB document ID as a string.
    subject_id : str
        Parent Subject ID.
    title : str
        Topic title.
    description : Optional[str]
        Topic description.
    created_at : datetime
        UTC creation timestamp.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: str
    subject_id: str
    title: str
    description: Optional[str] = None
    created_at: datetime
