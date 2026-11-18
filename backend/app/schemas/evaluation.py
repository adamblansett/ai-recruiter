import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class JobEvaluationResult(BaseModel):
    """Structured Pydantic schema for AI job match evaluations."""
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall match score from 0 to 100")
    technical_match_score: float = Field(..., ge=0.0, le=100.0, description="Technical skill alignment score")
    seniority_fit_score: float = Field(..., ge=0.0, le=100.0, description="Experience tenure and seniority alignment")
    compensation_fit_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    recommendation: str = Field(
        ...,
        description="'STRONG_APPLY', 'APPLY', 'CONSIDER', or 'SKIP'",
        example="STRONG_APPLY",
    )
    mandatory_skills_met: List[str] = Field(default_factory=list)
    preferred_skills_met: List[str] = Field(default_factory=list)
    missing_qualifications: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    potential_concerns: List[str] = Field(default_factory=list)
    rationale_markdown: str = Field(..., description="Markdown explanation of evaluation")


class JobEvaluationRequest(BaseModel):
    job_id: uuid.UUID
    candidate_id: Optional[uuid.UUID] = None
    ai_provider: Optional[str] = None  # None = built-in default


class JobEvaluationRead(JobEvaluationResult):
    id: uuid.UUID
    job_id: uuid.UUID
    candidate_id: uuid.UUID
    ai_provider: str
    ai_model: str
    prompt_version: str
    prompt_tokens: int
    completion_tokens: int
    cost_usd: float
    created_at: datetime

    model_config = {"from_attributes": True}


# ================= Multi-Model Evaluation Benchmark =================
class ModelBenchmarkEntry(BaseModel):
    provider: str
    model_name: str
    overall_score: float
    technical_score: float
    recommendation: str
    latency_ms: int
    tokens_used: int
    estimated_cost_usd: float
    verdict_highlight: str


class ModelBenchmarkComparisonResponse(BaseModel):
    job_id: uuid.UUID
    job_title: str
    company_name: str
    benchmarks: List[ModelBenchmarkEntry]
    consensus_recommendation: str
