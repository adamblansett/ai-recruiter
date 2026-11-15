import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.recruiter import (
    RecruiterContactCreate,
    RecruiterContactRead,
    RecruiterCreate,
    RecruiterDiscoveryRequest,
    RecruiterDiscoveryResponse,
    RecruiterJobAssociationRead,
    RecruiterRead,
)
from app.services.recruiter_service import RecruiterService

router = APIRouter(tags=["Recruiters & Contacts"])


def serialize_recruiter(r) -> RecruiterRead:
    return RecruiterRead(
        id=r.id,
        company_id=r.company_id,
        company_name=r.company.name if r.company else None,
        full_name=r.full_name,
        title=r.title,
        recruiter_type=r.recruiter_type,
        linkedin_url=r.linkedin_url,
        public_profile_url=r.public_profile_url,
        source_of_discovery=r.source_of_discovery,
        notes=r.notes,
        created_at=r.created_at,
        updated_at=r.updated_at,
        contacts=[
            RecruiterContactRead(
                id=c.id,
                recruiter_id=c.recruiter_id,
                contact_type=c.contact_type,
                contact_value=c.contact_value,
                is_verified=c.is_verified,
                verification_method=c.verification_method,
                confidence_score=float(c.confidence_score),
                verification_evidence=c.verification_evidence or {},
                verified_at=c.verified_at,
                created_at=c.created_at,
            )
            for c in (r.contacts or [])
        ],
    )


@router.get("", response_model=List[RecruiterRead], summary="List and Search Recruiters")
async def list_recruiters(
    query: Optional[str] = Query(None, description="Search by recruiter name or title"),
    company_id: Optional[uuid.UUID] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve recruiters with verification status and contact records."""
    recruiters = await RecruiterService.list_recruiters(
        db, query=query, company_id=company_id, limit=limit, offset=offset
    )
    return [serialize_recruiter(r) for r in recruiters]


@router.post("", response_model=RecruiterRead, status_code=status.HTTP_201_CREATED, summary="Create Recruiter")
async def create_recruiter(
    data: RecruiterCreate,
    db: AsyncSession = Depends(get_db),
):
    """Manually add a recruiter with optional initial verified contact."""
    recruiter = await RecruiterService.create_recruiter(db, data)
    return serialize_recruiter(recruiter)


@router.get("/{recruiter_id}", response_model=RecruiterRead, summary="Get Recruiter Details")
async def get_recruiter(
    recruiter_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    recruiter = await RecruiterService.get_recruiter_by_id(db, recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return serialize_recruiter(recruiter)


@router.post("/{recruiter_id}/contacts", response_model=RecruiterContactRead, status_code=status.HTTP_201_CREATED, summary="Add & Verify Contact")
async def add_contact(
    recruiter_id: uuid.UUID,
    data: RecruiterContactCreate,
    domain: Optional[str] = Query(None, description="Optional company domain for verification alignment"),
    db: AsyncSession = Depends(get_db),
):
    """
    Add a contact to a recruiter and execute verification pipeline.
    Validates email format, performs DNS MX lookup, and computes evidence-based confidence score.
    """
    recruiter = await RecruiterService.get_recruiter_by_id(db, recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    contact = await RecruiterService.add_and_verify_contact(
        db=db,
        recruiter_id=recruiter_id,
        contact_type=data.contact_type,
        contact_value=data.contact_value,
        domain=domain or (recruiter.company.domain if recruiter.company else None),
    )
    return RecruiterContactRead(
        id=contact.id,
        recruiter_id=contact.recruiter_id,
        contact_type=contact.contact_type,
        contact_value=contact.contact_value,
        is_verified=contact.is_verified,
        verification_method=contact.verification_method,
        confidence_score=float(contact.confidence_score),
        verification_evidence=contact.verification_evidence or {},
        verified_at=contact.verified_at,
        created_at=contact.created_at,
    )


@router.post("/{recruiter_id}/associate/{job_id}", response_model=RecruiterJobAssociationRead, summary="Associate Recruiter with Job")
async def associate_recruiter(
    recruiter_id: uuid.UUID,
    job_id: uuid.UUID,
    association_type: str = Query("PRIMARY_RECRUITER"),
    db: AsyncSession = Depends(get_db),
):
    """Associate a recruiter with a job opportunity and advance stage to RECRUITER_IDENTIFIED."""
    assoc = await RecruiterService.associate_recruiter_with_job(
        db, recruiter_id=recruiter_id, job_id=job_id, association_type=association_type
    )
    return RecruiterJobAssociationRead(
        id=assoc.id,
        recruiter_id=assoc.recruiter_id,
        job_id=assoc.job_id,
        association_type=assoc.association_type,
        created_at=assoc.created_at,
    )


@router.get("/job/{job_id}", response_model=List[RecruiterRead], summary="Get Recruiters for Job")
async def get_job_recruiters(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """List recruiters associated with a specific job opportunity."""
    recruiters = await RecruiterService.get_recruiters_for_job(db, job_id)
    return [serialize_recruiter(r) for r in recruiters]


@router.post("/discover", response_model=RecruiterDiscoveryResponse, summary="Discover Recruiters for Company")
async def discover_recruiters_endpoint(
    req: RecruiterDiscoveryRequest,
    db: AsyncSession = Depends(get_db),
):
    """Run research adapter to discover professional contacts and verify their information."""
    recruiters = await RecruiterService.discover_company_recruiters(
        db,
        company_name=req.company_name,
        company_domain=req.company_domain,
        job_id=req.job_id,
        limit=req.limit,
    )
    return RecruiterDiscoveryResponse(
        discovered_count=len(recruiters),
        recruiters=[serialize_recruiter(r) for r in recruiters],
    )
