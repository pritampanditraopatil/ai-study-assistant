"""
routes/subjects_routes.py
-------------------------
FastAPI router for Subject CRUD endpoints.

All route handlers are thin wrappers over ``subject_service`` functions.
Business logic and database access live exclusively in the service layer.

Prefix  : /api/subjects
Tags    : ["Subjects"]
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException, status

from schemas.subject import SubjectCreate, SubjectResponse, SubjectUpdate
from services import subject_service

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])


@router.get(
    "/",
    response_model=List[SubjectResponse],
    summary="List all subjects",
)
async def list_subjects() -> List[dict]:
    """
    Return a list of all Subject documents sorted by creation date.

    Returns
    -------
    List[SubjectResponse]
        All subjects in the database.
    """
    return await subject_service.list_subjects()


@router.post(
    "/",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new subject",
)
async def create_subject(payload: SubjectCreate) -> dict:
    """
    Create a new Subject from the provided payload.

    Parameters
    ----------
    payload : SubjectCreate
        Request body containing name, code, and optional description.

    Returns
    -------
    SubjectResponse
        The newly created subject document.
    """
    return await subject_service.create_subject(payload)


@router.get(
    "/{subject_id}",
    response_model=SubjectResponse,
    summary="Get a subject by ID",
)
async def get_subject(subject_id: str) -> dict:
    """
    Retrieve a single Subject by its MongoDB document ID.

    Parameters
    ----------
    subject_id : str
        The hex string of the MongoDB ObjectId.

    Raises
    ------
    HTTPException(404)
        If no subject with the given ID exists.

    Returns
    -------
    SubjectResponse
        The matching subject document.
    """
    try:
        subject = await subject_service.get_subject(subject_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject '{subject_id}' not found.",
        )
    return subject


@router.put(
    "/{subject_id}",
    response_model=SubjectResponse,
    summary="Update a subject",
)
async def update_subject(subject_id: str, payload: SubjectUpdate) -> dict:
    """
    Partially update an existing Subject.

    Parameters
    ----------
    subject_id : str
        Target document ID.
    payload : SubjectUpdate
        Fields to update (all optional).

    Raises
    ------
    HTTPException(404)
        If no subject with the given ID exists.

    Returns
    -------
    SubjectResponse
        The updated subject document.
    """
    try:
        updated = await subject_service.update_subject(subject_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject '{subject_id}' not found.",
        )
    return updated


@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a subject",
)
async def delete_subject(subject_id: str) -> None:
    """
    Delete a Subject by ID.

    Parameters
    ----------
    subject_id : str
        Target document ID.

    Raises
    ------
    HTTPException(404)
        If no subject with the given ID exists.
    """
    try:
        deleted = await subject_service.delete_subject(subject_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject '{subject_id}' not found.",
        )
