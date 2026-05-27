"""
routes/notes_routes.py
----------------------
FastAPI router for Note ingestion and retrieval endpoints.

Prefix  : /api/notes
Tags    : ["Notes"]
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException, Query, status

from schemas.note import NoteIngest, NoteResponse
from services import notes_service

router = APIRouter(prefix="/api/notes", tags=["Notes"])


@router.post(
    "/ingest",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest raw notes for a topic",
)
async def ingest_note(payload: NoteIngest) -> dict:
    """
    Ingest raw student notes for a Topic.

    The service layer cleans the text and persists both the raw and cleaned
    versions.  Version number is auto-incremented per topic.

    Parameters
    ----------
    payload : NoteIngest
        Request body containing ``topic_id`` and ``raw_text``.

    Returns
    -------
    NoteResponse
        The stored note document including cleaned text and version.
    """
    try:
        return await notes_service.ingest_note(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest note: {exc}",
        ) from exc


@router.get(
    "/",
    response_model=List[NoteResponse],
    summary="Get notes for a topic",
)
async def get_notes(
    topic_id: str = Query(..., description="The Topic ID to retrieve notes for"),
) -> List[dict]:
    """
    Retrieve all notes associated with a given Topic, ordered by version.

    Parameters
    ----------
    topic_id : str
        Required query parameter — the parent Topic document ID.

    Returns
    -------
    List[NoteResponse]
        All note documents for the specified topic.
    """
    notes = await notes_service.get_notes_by_topic(topic_id)
    if not notes:
        # Return empty list — not a 404; the topic may exist with no notes yet
        return []
    return notes
