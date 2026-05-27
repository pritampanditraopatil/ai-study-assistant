"""Routes for the ``/api/notes`` resource."""

from fastapi import APIRouter, Query, status

from schemas.note import NoteIngest, NoteResponse
from services import notes_service

router = APIRouter(prefix="/api/notes", tags=["Notes"])


@router.post(
    "/ingest",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a note",
)
async def ingest_note(body: NoteIngest) -> dict:
    """Accept raw note text, clean it, and store both versions."""
    return await notes_service.ingest_note(body)


@router.get(
    "/",
    response_model=list[NoteResponse],
    summary="List notes by topic",
)
async def list_notes(
    topic_id: str = Query(..., description="Topic ID to fetch notes for"),
) -> list[dict]:
    """Return all notes belonging to the specified topic."""
    return await notes_service.get_notes_by_topic(topic_id)
