"""Routes for the ``/api/topics`` resource."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from schemas.topic import TopicCreate, TopicResponse, TopicUpdate
from services import topic_service

router = APIRouter(prefix="/api/topics", tags=["Topics"])


@router.get(
    "/",
    response_model=list[TopicResponse],
    summary="List topics",
)
async def list_topics(
    subject_id: Optional[str] = Query(default=None, description="Filter by subject ID"),
) -> list[dict]:
    """Return topics, optionally filtered by ``subject_id``."""
    return await topic_service.list_topics(subject_id=subject_id)


@router.post(
    "/",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a topic",
)
async def create_topic(body: TopicCreate) -> dict:
    """Create a new topic under a subject."""
    return await topic_service.create_topic(body)


@router.get(
    "/{topic_id}",
    response_model=TopicResponse,
    summary="Get a topic by ID",
)
async def get_topic(topic_id: str) -> dict:
    """Fetch a single topic.  Returns 404 if not found."""
    topic = await topic_service.get_topic(topic_id)
    if topic is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic {topic_id} not found.",
        )
    return topic


@router.put(
    "/{topic_id}",
    response_model=TopicResponse,
    summary="Update a topic",
)
async def update_topic(topic_id: str, body: TopicUpdate) -> dict:
    """Update an existing topic.  Returns 404 if not found."""
    topic = await topic_service.update_topic(topic_id, body)
    if topic is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic {topic_id} not found.",
        )
    return topic


@router.delete(
    "/{topic_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a topic",
)
async def delete_topic(topic_id: str) -> None:
    """Delete a topic by ID.  Returns 404 if not found."""
    deleted = await topic_service.delete_topic(topic_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic {topic_id} not found.",
        )
