"""
schemas/mindmap.py
------------------
Pydantic DTOs for Mind-map generation requests and responses.

``MindmapNode`` is a self-referencing schema (recursive children).
Call ``MindmapNode.model_rebuild()`` after class definition to resolve the
forward reference.
"""

from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class MindmapNode(BaseModel):
    """
    A single concept node in the mind-map tree (API representation).

    Attributes
    ----------
    id : str
        Unique node identifier (slug or UUID).
    title : str
        Short concept label shown in the UI.
    summary : str
        One-to-three sentence description of the concept.
    children : List[MindmapNode]
        Ordered list of child concept nodes; empty for leaf nodes.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    summary: str
    children: List["MindmapNode"] = Field(default_factory=list)


# Resolve self-referencing forward annotation
MindmapNode.model_rebuild()


class GenerateMapRequest(BaseModel):
    """
    Request payload for triggering mind-map generation.

    Attributes
    ----------
    topic_id : str
        The ``_id`` string of the Topic whose notes should be mapped.
    """

    topic_id: str = Field(..., min_length=1)


class MindmapResponse(BaseModel):
    """
    Response DTO returned after a Mind-map is generated or retrieved.

    Attributes
    ----------
    id : str
        MongoDB document ID as a string.
    topic_id : str
        Parent Topic ID.
    root : MindmapNode
        Root node of the generated concept tree.
    created_at : datetime
        UTC creation timestamp.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: str
    topic_id: str
    root: MindmapNode
    created_at: datetime
