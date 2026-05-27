"""Routes for the ``/api/subjects`` resource."""

from fastapi import APIRouter, HTTPException, status

from schemas.subject import SubjectCreate, SubjectResponse, SubjectUpdate
from services import subject_service

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])


@router.get(
    "/",
    response_model=list[SubjectResponse],
    summary="List all subjects",
)
async def list_subjects() -> list[dict]:
    """Return every subject, sorted newest-first."""
    return await subject_service.list_subjects()


@router.post(
    "/",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a subject",
)
async def create_subject(body: SubjectCreate) -> dict:
    """Create a new academic subject."""
    return await subject_service.create_subject(body)


@router.get(
    "/{subject_id}",
    response_model=SubjectResponse,
    summary="Get a subject by ID",
)
async def get_subject(subject_id: str) -> dict:
    """Fetch a single subject.  Returns 404 if not found."""
    subject = await subject_service.get_subject(subject_id)
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject {subject_id} not found.",
        )
    return subject


@router.put(
    "/{subject_id}",
    response_model=SubjectResponse,
    summary="Update a subject",
)
async def update_subject(subject_id: str, body: SubjectUpdate) -> dict:
    """Update an existing subject.  Returns 404 if not found."""
    subject = await subject_service.update_subject(subject_id, body)
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject {subject_id} not found.",
        )
    return subject


@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a subject",
)
async def delete_subject(subject_id: str) -> None:
    """Delete a subject by ID.  Returns 404 if not found."""
    deleted = await subject_service.delete_subject(subject_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject {subject_id} not found.",
        )
