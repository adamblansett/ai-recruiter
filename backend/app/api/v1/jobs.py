import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.adapters.jobs.base import JobSearchQuery
from app.adapters.jobs.greenhouse_adapter import GreenhouseBoardAdapter
from app.adapters.jobs.lever_adapter import LeverBoardAdapter
from app.adapters.jobs.registry import job_adapter_registry
from app.core.database import get_db
from app.schemas.job import (
    JobDiscoveryResult,
    JobOpportunityRead,
    JobSearchFilter,
    JobStageUpdate,
    ManualJobCreate,
)
from app.services.discovery_service import DiscoveryService
from pydantic import BaseModel, Field

router = APIRouter(tags=["Job Opportunities"])


class AddTargetBoardPayload(BaseModel):
    adapter_type: str = Field(..., description="'greenhouse' or 'lever'")
    company_slug: str = Field(..., min_length=2, max_length=100)


def serialize_job(job) -> JobOpportunityRead:
    return JobOpportunityRead(
        id=job.id,
        company_id=job.company_id,
        company_name=job.company.name if job.company else None,
        company_domain=job.company.domain if job.company else None,
        title=job.title,
        normalized_title=job.normalized_title,
        location=job.location,
        remote_type=job.remote_type,
        employment_type=job.employment_type,
        min_salary=float(job.min_salary) if job.min_salary else None,
        max_salary=float(job.max_salary) if job.max_salary else None,
        currency=job.currency,
        source_adapter=job.source_adapter,
        external_job_id=job.external_job_id,
        source_url=job.source_url,
        raw_description=job.raw_description,
        cleaned_description=job.cleaned_description,
        dedup_hash=job.dedup_hash,
        pipeline_stage=job.pipeline_stage,
        discovered_at=job.discovered_at,
        published_at=job.published_at,
        is_active=job.is_active,
    )


@router.post("/discover", response_model=JobDiscoveryResult, summary="Trigger Automated Job Discovery")
async def trigger_discovery(
    query: Optional[JobSearchQuery] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Execute job discovery across all registered adapters (Greenhouse, Lever, Remote Feeds).
    Extracts structured listings, normalizes fields, and detects duplicates.
    """
    return await DiscoveryService.run_discovery(db, query)


@router.get("", response_model=List[JobOpportunityRead], summary="Search and Filter Job Opportunities")
async def list_jobs(
    query: Optional[str] = Query(None, description="Search term for title or description"),
    remote_only: Optional[bool] = Query(None, description="Filter for 100% remote roles"),
    min_salary: Optional[float] = Query(None, description="Filter by minimum compensation"),
    pipeline_stage: Optional[str] = Query(None, description="Filter by recruiting pipeline stage"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Search and filter discovered job opportunities across the pipeline."""
    filters = JobSearchFilter(
        query=query,
        remote_only=remote_only,
        min_salary=min_salary,
        pipeline_stage=pipeline_stage,
        limit=limit,
        offset=offset,
    )
    jobs = await DiscoveryService.list_opportunities(db, filters)
    return [serialize_job(j) for j in jobs]


@router.post("/manual", response_model=JobOpportunityRead, status_code=status.HTTP_201_CREATED, summary="Manually Add Job Opportunity")
async def add_manual_job(
    data: ManualJobCreate,
    db: AsyncSession = Depends(get_db),
):
    """Manually ingest a job opportunity via URL or description with automatic deduplication."""
    job = await DiscoveryService.ingest_manual_job(db, data)
    return serialize_job(job)


@router.get("/{job_id}", response_model=JobOpportunityRead, summary="Get Job Opportunity Details")
async def get_job_detail(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full details of an opportunity."""
    job = await DiscoveryService.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found")
    return serialize_job(job)


@router.patch("/{job_id}/stage", response_model=JobOpportunityRead, summary="Advance Recruitment Pipeline Stage")
async def update_job_pipeline_stage(
    job_id: uuid.UUID,
    stage_data: JobStageUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Transition an opportunity to a new recruitment pipeline stage (e.g. QUALIFIED, EVALUATED)."""
    job = await DiscoveryService.update_stage(db, job_id, stage_data.pipeline_stage)
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found")
    return serialize_job(job)


@router.get("/adapters/info", summary="List Active Job Adapters & Target Companies")
async def get_adapters_info():
    """Returns active job discovery adapters and configured target company boards."""
    adapters_info = []
    for adapter in job_adapter_registry.get_all_adapters():
        info = {
            "source_name": adapter.source_name,
            "type": adapter.__class__.__name__,
        }
        if isinstance(adapter, GreenhouseBoardAdapter):
            info["target_boards"] = adapter.target_boards
        elif isinstance(adapter, LeverBoardAdapter):
            info["target_sites"] = adapter.target_sites
        adapters_info.append(info)
    return adapters_info


@router.post("/adapters/target", summary="Add Target Company Board for Discovery")
async def add_target_board(payload: AddTargetBoardPayload):
    """Dynamically register a new Greenhouse or Lever target company board for automated crawling."""
    if payload.adapter_type.lower() == "greenhouse":
        job_adapter_registry.add_greenhouse_board(payload.company_slug)
    elif payload.adapter_type.lower() == "lever":
        job_adapter_registry.add_lever_site(payload.company_slug)
    else:
        raise HTTPException(status_code=400, detail="Invalid adapter_type. Must be 'greenhouse' or 'lever'.")
    return {
        "status": "success",
        "message": f"Added '{payload.company_slug}' to {payload.adapter_type} target boards",
    }
