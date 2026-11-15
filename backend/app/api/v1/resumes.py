import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.candidate import Resume
from app.schemas.resume import ResumeRead, ResumeUploadResponse
from app.services.candidate_service import CandidateService
from app.services.resume_service import ResumeService

router = APIRouter(tags=["Resumes"])


@router.post("/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED, summary="Upload PDF Resume")
async def upload_resume(
    file: UploadFile = File(..., description="PDF Resume document"),
    label: str = Form(..., description="Label for this resume version, e.g. 'Backend AI Staff'"),
    is_primary: bool = Form(default=False),
    target_role_category: Optional[str] = Form(default=None),
    candidate_id: Optional[uuid.UUID] = Form(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Securely upload and parse a PDF resume.
    Validates MIME type, PDF magic bytes (%PDF-), 5MB size limit, computes SHA-256 hash.
    """
    # 1. Resolve candidate profile
    if not candidate_id:
        profile = await CandidateService.get_active_profile(db)
        if not profile:
            profile = await CandidateService.seed_initial_candidate(db)
        cid = profile.id
    else:
        cid = candidate_id

    # 2. Check content-type header
    if file.content_type not in ["application/pdf", "application/x-pdf", "binary/octet-stream"]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF documents are accepted for resume upload.",
        )

    # 3. Store and parse
    try:
        resume = await ResumeService.process_and_store_resume(
            db=db,
            candidate_id=cid,
            file=file,
            label=label,
            is_primary=is_primary,
            target_role_category=target_role_category,
        )
        return ResumeUploadResponse(
            id=resume.id,
            candidate_id=resume.candidate_id,
            label=resume.label,
            file_path=resume.file_path,
            file_hash=resume.file_hash,
            file_size_bytes=resume.file_size_bytes,
            mime_type=resume.mime_type,
            target_role_category=resume.target_role_category,
            is_primary=resume.is_primary,
            created_at=resume.created_at,
            parsed_snippet=resume.parsed_markdown[:200] if resume.parsed_markdown else None,
        )
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))


@router.get("/{resume_id}", response_model=ResumeRead, summary="Get Resume Details")
async def get_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve resume metadata and parsed markdown content."""
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume
