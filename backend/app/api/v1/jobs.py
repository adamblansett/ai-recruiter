import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.adapters.jobs.base import JobSearchQuery
from app.adapters.jobs.greenhouse_adapter import GreenhouseBoardAdapter
from app.adapters.jobs.lever_adapter import LeverBoardAdapter
from app.adapters.jobs.registry import job_adapter_registry
from app.core.database import get_db
from app.schemas.interview_prep import InterviewPrepPlan
from app.schemas.job import (
    JobDiscoveryResult,
    JobOpportunityRead,
    JobSearchFilter,
    JobStageUpdate,
    ManualJobCreate,
)
from app.services.company_intelligence_service import (
    CompanyDossier,
    CompanyIntelligenceService,
)
from app.services.discovery_service import DiscoveryService
from app.services.interview_prep_service import InterviewPrepService
from app.services.interview_simulator_service import (
    AnswerEvaluation,
    InterviewQuestion,
    InterviewSimulatorService,
    StartSessionPayload,
    SubmitAnswerPayload,
)
from app.services.negotiation_simulator_service import (
    NegotiationEvaluation,
    NegotiationScenario,
    NegotiationSimulatorService,
    StartNegotiationPayload,
    SubmitCounterPayload,
)
from app.services.application_autofill_service import (
    ApplicationAutofillService,
    AutofillApplicationPreview,
    AutofillSubmitRequest,
    AutofillSubmitResult,
)
from app.services.tailored_artifact_service import TailoredArtifactService
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


@router.get("/{job_id}/interview-prep", response_model=InterviewPrepPlan, summary="Generate Role-Specific AI Interview Prep")
async def get_interview_prep(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Synthesize job requirements, company technical focus, and candidate verified experience
    to generate technical architecture questions, STAR talking points, and reverse-interview questions.
    """
    try:
        return await InterviewPrepService.generate_prep_plan(db, job_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.post("/{job_id}/tailored-artifacts", summary="Generate Role-Specific Tailored Resume & Cover Letter")
async def generate_tailored_artifacts(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Dynamically generates a customized single-page PDF resume and targeted cover letter
    highlighting the candidate's most relevant skills and achievements for this specific role.
    """
    try:
        return await TailoredArtifactService.generate_tailored_artifacts(db, job_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/{job_id}/tailored-resume/download", summary="Download Tailored PDF Resume")
async def download_tailored_resume(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Download the generated role-specific tailored PDF resume."""
    artifacts = await TailoredArtifactService.generate_tailored_artifacts(db, job_id)
    pdf_path = artifacts["resume_pdf_path"]
    filename = f"Adam_Blansett_{artifacts['company_name']}_Tailored_Resume.pdf"
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=filename,
    )


@router.get("/{job_id}/executive-dossier/download", summary="Download Tailored Executive Interview Dossier PDF")
async def download_executive_dossier(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Download the executive architectural briefing dossier PDF for final-round panel interviews."""
    dossier_meta = await TailoredArtifactService.generate_executive_dossier_pdf(db, job_id)
    pdf_path = dossier_meta["dossier_pdf_path"]
    filename = f"Adam_Blansett_{dossier_meta['company_name']}_Executive_Dossier.pdf"
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=filename,
    )


@router.get("/{job_id}/company-dossier", response_model=CompanyDossier, summary="Generate Company Technical Intelligence & Dossier")
async def get_company_dossier(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Synthesize deep technical intelligence for the target company:
    primary tech stack, engineering blog insights, leadership dossier, and strategic positioning.
    """
    try:
        return await CompanyIntelligenceService.get_company_dossier(db, job_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.post("/{job_id}/mock-interview/start", response_model=InterviewQuestion, summary="Start Interactive AI Mock Interview Session")
async def start_mock_interview(
    job_id: uuid.UUID,
    payload: Optional[StartSessionPayload] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Initiates an interactive AI mock interview simulation with an interviewer persona
    tailored to the target role and company.
    """
    track = payload.track if payload and payload.track else "distributed_systems"
    return await InterviewSimulatorService.start_session(db, job_id, track)


@router.post("/{job_id}/mock-interview/evaluate", response_model=AnswerEvaluation, summary="Submit & Evaluate Mock Interview Answer")
async def evaluate_mock_interview_answer(
    job_id: uuid.UUID,
    payload: SubmitAnswerPayload,
):
    """
    Evaluates candidate's architectural response on technical rigor, system scale tradeoffs,
    and STAR structure; returns instant scorecard and follow-up drill.
    """
    return await InterviewSimulatorService.evaluate_answer(payload)


@router.post("/{job_id}/negotiation/start", response_model=NegotiationScenario, summary="Start Interactive Salary Negotiation Simulation")
async def start_salary_negotiation(
    job_id: uuid.UUID,
    payload: Optional[StartNegotiationPayload] = None,
):
    """
    Initiates an interactive counter-offer negotiation simulation with a recruiter persona
    testing pushback on salary bands, equity trade-offs, and sign-on bonuses.
    """
    p = payload or StartNegotiationPayload(job_id=str(job_id))
    p.job_id = str(job_id)
    return NegotiationSimulatorService.start_negotiation(p)


@router.post("/{job_id}/negotiation/evaluate", response_model=NegotiationEvaluation, summary="Submit & Evaluate Salary Counter-Proposal")
async def evaluate_salary_counter_proposal(
    job_id: uuid.UUID,
    payload: SubmitCounterPayload,
):
    """
    Evaluates candidate's counter-offer phrasing on leverage, firmness, and total value optimization;
    returns recruiter response and revised compensation package.
    """
    return NegotiationSimulatorService.evaluate_counter(payload)


@router.post("/{job_id}/autofill-preview", response_model=AutofillApplicationPreview, summary="Generate Autonomous Application Auto-Fill Preview")
async def generate_autofill_preview(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Generates structured application form fields, synthesized answers to custom recruiter questions,
    and tailored cover letter with dry-run safety verification for human confirmation.
    """
    job = await DiscoveryService.get_job_by_id(db, job_id)
    company_name = job.company.name if job and job.company else "Target Tech"
    job_title = job.title if job else "Staff Backend Engineer"
    ats = job.source_adapter if job and job.source_adapter else "greenhouse"
    url = job.source_url if job else None

    return ApplicationAutofillService.generate_preview(
        job_id=str(job_id),
        job_title=job_title,
        company_name=company_name,
        ats_platform=ats,
        application_url=url,
    )


@router.post("/{job_id}/autofill-submit", response_model=AutofillSubmitResult, summary="Execute Confirmed Job Application Auto-Fill")
async def submit_autofill_application(
    job_id: uuid.UUID,
    payload: AutofillSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Submits the verified job application to the target ATS. Strictly enforces affirmative human
    confirmation (confirmed=True) before dispatching.
    """
    if not payload.confirmed:
        raise HTTPException(
            status_code=400,
            detail="Safety gate violation: explicit confirmation (confirmed=True) is required to submit.",
        )
    job = await DiscoveryService.get_job_by_id(db, job_id)
    company_name = job.company.name if job and job.company else "Target Tech"
    job_title = job.title if job else "Staff Backend Engineer"
    ats = job.source_adapter if job and job.source_adapter else "greenhouse"
    url = job.source_url if job else None

    preview = ApplicationAutofillService.generate_preview(
        job_id=str(job_id),
        job_title=job_title,
        company_name=company_name,
        ats_platform=ats,
        application_url=url,
    )
    return ApplicationAutofillService.submit_application(preview, payload)


class VectorSearchPayload(BaseModel):
    query: str = Field(..., min_length=2, description="Semantic search query")
    top_k: int = Field(5, ge=1, le=20)
    threshold: float = Field(0.4, ge=0.0, le=1.0)


@router.post("/vector-search", summary="Offline Accelerated Semantic Vector Search")
async def perform_vector_search(payload: VectorSearchPayload):
    """
    Sub-5ms local vector similarity search across job descriptions, architectural requirements,
    and candidate background without external cloud calls.
    """
    from app.services.vector_cache_service import VectorCacheService
    return VectorCacheService.search(
        query=payload.query,
        top_k=payload.top_k,
        threshold=payload.threshold,
    )
