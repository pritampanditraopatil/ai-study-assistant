"""
routes/maps_routes.py
---------------------
FastAPI router for Mind-map generation and retrieval endpoints.

Prefix  : /api/maps
Tags    : ["Mind Maps"]
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from schemas.mindmap import GenerateMapRequest, MindmapResponse
from services import map_service

router = APIRouter(prefix="/api/maps", tags=["Mind Maps"])


@router.post(
    "/generate",
    response_model=MindmapResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a mind-map from ingested notes",
)
async def generate_mindmap(payload: GenerateMapRequest) -> dict:
    """
    Trigger mind-map generation for a Topic.

    The service fetches all notes for the topic, combines them, sends the
    text to the LLM, and persists the resulting concept tree.  If a mind-map
    already exists for the topic it is overwritten (upsert).

    Parameters
    ----------
    payload : GenerateMapRequest
        Request body containing the ``topic_id``.

    Raises
    ------
    HTTPException(422)
        If no notes are found for the given topic.
    HTTPException(500)
        If the LLM or persistence layer fails unexpectedly.

    Returns
    -------
    MindmapResponse
        The generated/updated mind-map document.
    """
    try:
        return await map_service.generate_map(payload.topic_id)
    except ValueError as exc:
        # e.g. "No notes found for topic_id=..."
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mind-map generation failed: {exc}",
        ) from exc


@router.get(
    "/{topic_id}",
    response_model=MindmapResponse,
    summary="Get the mind-map for a topic",
)
async def get_mindmap(topic_id: str) -> dict:
    """
    Retrieve the most recently generated Mind-map for a Topic.

    Parameters
    ----------
    topic_id : str
        The parent Topic document ID.

    Raises
    ------
    HTTPException(404)
        If no mind-map has been generated for the given topic yet.

    Returns
    -------
    MindmapResponse
        The stored mind-map document.
    """
    mindmap = await map_service.get_mindmap_by_topic(topic_id)
    if mindmap is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No mind-map found for topic '{topic_id}'. Generate one first.",
        )
    return mindmap
