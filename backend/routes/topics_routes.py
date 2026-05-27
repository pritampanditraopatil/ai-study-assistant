"""
routes/topics_routes.py
-----------------------
FastAPI router for Topic CRUD endpoints.

Prefix  : /api/topics
Tags    : ["Topics"]
"""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from schemas.topic import TopicCreate, TopicResponse, TopicUpdate
from services import topic_service

router = APIRouter(prefix="/api/topics", tags=["Topics"])


@router.get(
    "/",
    response_model=List[TopicResponse],
    summary="List topics (optionally filtered by subject)",
)
async def list_topics(
    subject_id: Optional[str] = Query(default=None, description="Filter by parent Subject ID"),
) -> List[dict]:
    """
    Return all Topic documents, with an optional filter by ``subject_id``.

    Parameters
    ----------
    subject_id : Optional[str]
        Query parameter.  If provided, only topics for that subject are returned.

    Returns
    -------
    List[TopicResponse]
        Matching topic documents sorted by creation date.
    """
    return await topic_service.list_topics(subject_id=subject_id)


@router.post(
    "/",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new topic",
)
async def create_topic(payload: TopicCreate) -> dict:
    """
    Create a new Topic linked to a Subject.

    Parameters
    ----------
    payload : TopicCreate
        Request body with subject_id, title, and optional description.

    Returns
    -------
    TopicResponse
        The newly created topic document.
    """
    return await topic_service.create_topic(payload)


@router.get(
    "/{topic_id}",
    response_model=TopicResponse,
    summary="Get a topic by ID",
)
async def get_topic(topic_id: str) -> dict:
    """
    Retrieve a single Topic by its ID.

    Raises
    ------
    HTTPException(404)
        If no topic with the given ID exists.
    """
    try:
        topic = await topic_service.get_topic(topic_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if topic is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic '{topic_id}' not found.",
        )
    return topic


@router.put(
    "/{topic_id}",
    response_model=TopicResponse,
    summary="Update a topic",
)
async def update_topic(topic_id: str, payload: TopicUpdate) -> dict:
    """
    Partially update a Topic.

    Raises
    ------
    HTTPException(404)
        If no topic with the given ID exists.
    """
    try:
        updated = await topic_service.update_topic(topic_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic '{topic_id}' not found.",
        )
    return updated


@router.delete(
    "/{topic_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a topic",
)
async def delete_topic(topic_id: str) -> None:
    """
    Delete a Topic by ID.

    Raises
    ------
    HTTPException(404)
        If no topic with the given ID exists.
    """
    try:
        deleted = await topic_service.delete_topic(topic_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic '{topic_id}' not found.",
        )
