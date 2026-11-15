import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from app.schemas.evaluation import JobEvaluationResult
from app.services.evaluation_service import EvaluationService


def test_heuristic_fallback_scoring():
    profile = AsyncMock(
        headline="Staff Software Engineer",
        summary="10+ years engineering",
        target_seniority="Staff",
        remote_preference="REMOTE",
        location_base="United States",
        skills=[
            AsyncMock(name="Python", years_experience=10.0, proficiency_level="EXPERT"),
            AsyncMock(name="FastAPI", years_experience=5.0, proficiency_level="EXPERT"),
            AsyncMock(name="PostgreSQL", years_experience=8.0, proficiency_level="EXPERT"),
            AsyncMock(name="Docker", years_experience=6.0, proficiency_level="ADVANCED"),
        ],
    )

    job = AsyncMock(
        title="Staff Backend Engineer - Python & FastAPI",
        location="Remote",
        remote_type="REMOTE",
        cleaned_description="Looking for Staff Python engineer with FastAPI and PostgreSQL background.",
        min_salary=190000,
        max_salary=240000,
        currency="USD",
    )

    result = EvaluationService._heuristic_fallback_evaluation(profile, job)
    assert isinstance(result, JobEvaluationResult)
    assert result.overall_score >= 80.0
    assert result.recommendation in ["STRONG_APPLY", "APPLY"]
    assert "Python" in result.mandatory_skills_met


@pytest.mark.asyncio
async def test_evaluate_job_endpoint(client: AsyncClient):
    job_id = uuid.uuid4()
    candidate_id = uuid.uuid4()

    mock_eval = AsyncMock(
        id=uuid.uuid4(),
        job_id=job_id,
        candidate_id=candidate_id,
        overall_score=88.5,
        technical_match_score=92.0,
        seniority_fit_score=90.0,
        compensation_fit_score=85.0,
        recommendation="STRONG_APPLY",
        mandatory_skills_met=["Python", "FastAPI"],
        preferred_skills_met=["Docker"],
        missing_qualifications=[],
        strengths=["10+ years backend tenure", "Deep Python expertise"],
        potential_concerns=[],
        rationale_markdown="Candidate has exceptional match for this role.",
        ai_provider="builtin",
        ai_model="llama3.2:3b",
        prompt_version="v1.2.0",
        prompt_tokens=420,
        completion_tokens=180,
        cost_usd=0.0,
        created_at="2026-11-15T00:00:00Z",
    )

    with patch(
        "app.services.evaluation_service.EvaluationService.evaluate_job",
        new=AsyncMock(return_value=mock_eval),
    ):
        response = await client.post(
            "/api/v1/evaluations/evaluate",
            json={"job_id": str(job_id), "candidate_id": str(candidate_id)},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["overall_score"] == 88.5
        assert data["recommendation"] == "STRONG_APPLY"
        assert data["ai_provider"] == "builtin"
        assert "Python" in data["mandatory_skills_met"]


@pytest.mark.asyncio
async def test_get_job_evaluations_endpoint(client: AsyncClient):
    job_id = uuid.uuid4()
    mock_eval = AsyncMock(
        id=uuid.uuid4(),
        job_id=job_id,
        candidate_id=uuid.uuid4(),
        overall_score=75.0,
        technical_match_score=70.0,
        seniority_fit_score=80.0,
        compensation_fit_score=75.0,
        recommendation="APPLY",
        mandatory_skills_met=["TypeScript"],
        preferred_skills_met=[],
        missing_qualifications=["Kubernetes"],
        strengths=["Solid full-stack skills"],
        potential_concerns=[],
        rationale_markdown="Good fit.",
        ai_provider="builtin",
        ai_model="llama3.2:3b",
        prompt_version="v1.2.0",
        prompt_tokens=300,
        completion_tokens=150,
        cost_usd=0.0,
        created_at="2026-11-15T00:00:00Z",
    )

    with patch(
        "app.services.evaluation_service.EvaluationService.get_evaluations_for_job",
        new=AsyncMock(return_value=[mock_eval]),
    ):
        response = await client.get(f"/api/v1/evaluations/job/{job_id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["recommendation"] == "APPLY"
