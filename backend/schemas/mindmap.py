"""Mindmap request / response schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class MindmapNode(BaseModel):
    """A single node in the concept-map tree (recursive).

    Attributes:
        id: Unique node identifier.
        title: Short concept label.
        summary: Brief explanation of the concept.
        children: Nested child nodes.
    """

    id: str
    title: str
    summary: str
    children: list[MindmapNode] = Field(default_factory=list)


# Resolve forward reference for the recursive children field.
MindmapNode.model_rebuild()


class GenerateMapRequest(BaseModel):
    """Payload for triggering mindmap generation.

    Attributes:
        topic_id: The topic whose notes should be synthesised into a map.
    """

    topic_id: str = Field(..., min_length=1)


class MindmapResponse(BaseModel):
    """Serialised mindmap returned to the client.

    Attributes:
        id: String representation of the MongoDB ObjectId.
        topic_id: Parent topic ID.
        root: Root node of the concept tree.
        created_at: UTC creation timestamp.
    """

    id: str
    topic_id: str
    root: MindmapNode
    created_at: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "665f1a2b3c4d5e6f7a8b9c0d",
                "topic_id": "665f1a2b3c4d5e6f7a8b9c0e",
                "root": {
                    "id": "root",
                    "title": "Process Scheduling",
                    "summary": "Overview of scheduling.",
                    "children": [],
                },
                "created_at": "2025-06-01T12:00:00Z",
            }
        }
    }
