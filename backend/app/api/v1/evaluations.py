import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.evaluation import JobEvaluationRead, JobEvaluationRequest
from app.services.evaluation_service import EvaluationService

router = APIRouter(tags=["AI Evaluations"])


def serialize_evaluation(e) -> JobEvaluationRead:
    return JobEvaluationRead(
        id=e.id,
        job_id=e.job_id,
        candidate_id=e.candidate_id,
        overall_score=float(e.overall_score),
        technical_match_score=float(e.technical_match_score),
        seniority_fit_score=float(e.seniority_fit_score),
        compensation_fit_score=float(e.compensation_fit_score) if e.compensation_fit_score else None,
        recommendation=e.recommendation,
        mandatory_skills_met=e.mandatory_skills_met or [],
        preferred_skills_met=e.preferred_skills_met or [],
        missing_qualifications=e.missing_qualifications or [],
        strengths=e.strengths or [],
        potential_concerns=e.potential_concerns or [],
        rationale_markdown=e.rationale_markdown,
        ai_provider=e.ai_provider,
        ai_model=e.ai_model,
        prompt_version=e.prompt_version,
        prompt_tokens=e.prompt_tokens,
        completion_tokens=e.completion_tokens,
        cost_usd=float(e.cost_usd),
        created_at=e.created_at,
    )


@router.post("/evaluate", response_model=JobEvaluationRead, status_code=status.HTTP_201_CREATED, summary="Evaluate Job Opportunity with AI")
async def evaluate_job_opportunity(
    request: JobEvaluationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Execute AI evaluation comparing a job opportunity against the candidate's verified profile.
    Uses Built-in Local AI by default (0 external keys needed).
    Produces structured match scores, gap analysis, strengths, and recommendations.
    """
    try:
        evaluation = await EvaluationService.evaluate_job(db, request)
        return serialize_evaluation(evaluation)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI evaluation failure: {str(e)}")


@router.get("/job/{job_id}", response_model=List[JobEvaluationRead], summary="Get Evaluations for Job")
async def get_job_evaluations(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all AI evaluations for a specific job opportunity."""
    evals = await EvaluationService.get_evaluations_for_job(db, job_id)
    return [serialize_evaluation(e) for e in evals]
