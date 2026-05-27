"""Routes for the ``/api/maps`` resource (concept mindmaps)."""

from fastapi import APIRouter, HTTPException, status

from llm_client import LLMClientError
from schemas.mindmap import GenerateMapRequest, MindmapResponse
from services import map_service

router = APIRouter(prefix="/api/maps", tags=["Mindmaps"])


@router.post(
    "/generate",
    response_model=MindmapResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a mindmap",
)
async def generate_mindmap(body: GenerateMapRequest) -> dict:
    """Generate a concept mindmap from all notes under a topic.

    Returns 400 if there are no notes for the specified topic.
    """
    try:
        return await map_service.generate_map(body.topic_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except LLMClientError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc


@router.get(
    "/{topic_id}",
    response_model=MindmapResponse,
    summary="Get mindmap by topic",
)
async def get_mindmap(topic_id: str) -> dict:
    """Retrieve the most-recent mindmap for a topic.  Returns 404 if none exists."""
    mindmap = await map_service.get_mindmap_by_topic(topic_id)
    if mindmap is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No mindmap found for topic {topic_id}.",
        )
    return mindmap
