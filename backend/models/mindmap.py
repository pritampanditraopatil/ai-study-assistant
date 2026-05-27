"""Mindmap document model – a tree of concept nodes linked to a topic."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class MindmapNodeModel(BaseModel):
    """A single node in the concept-map tree.

    Attributes:
        id: Unique node identifier (not necessarily an ObjectId).
        title: Short label for this concept.
        summary: One-or-two-sentence explanation.
        children: Recursively nested child nodes.
    """

    id: str
    title: str
    summary: str
    children: list[MindmapNodeModel] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


# Rebuild to resolve the forward reference for the recursive `children` field.
MindmapNodeModel.model_rebuild()


class MindmapModel(BaseModel):
    """MongoDB document shape for a full mindmap.

    Attributes:
        id: MongoDB ``_id`` as a string.
        topic_id: Foreign key referencing the parent topic.
        root: Root node of the concept-map tree.
        created_at: UTC timestamp of creation.
    """

    id: Optional[str] = Field(default=None, alias="_id")
    topic_id: str
    root: MindmapNodeModel
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "topic_id": "665f1a2b3c4d5e6f7a8b9c0d",
                "root": {
                    "id": "root",
                    "title": "Process Scheduling",
                    "summary": "Overview of CPU scheduling.",
                    "children": [],
                },
            }
        },
    }
