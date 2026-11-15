import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from app.schemas.evaluation import JobEvaluationResult
from app.schemas.outreach import OutreachApprovalResponse


@pytest.mark.asyncio
async def test_complete_e2e_recruiting_pipeline(client: AsyncClient):
    """
    End-to-End lifecycle test validating the entire recruiting assistant pipeline:
    Profile -> Job Discovery -> AI Evaluation -> Recruiter Match -> Human Approval -> Send.
    """
    # 1. Probe System Health
    health_res = await client.get("/api/v1/system/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"

    # 2. Check Candidate Profile (Adam Blansett)
    profile_id = uuid.uuid4()
    mock_profile = {
        "id": str(profile_id),
        "user_id": str(uuid.uuid4()),
        "headline": "Staff / Senior Full-Stack & AI Systems Software Engineer",
        "summary": "10+ years engineering experience",
        "target_seniority": "Senior / Staff / Lead",
        "location_base": "United States",
        "remote_preference": "REMOTE_FIRST",
        "employment_types": ["FULL_TIME", "CONTRACT"],
        "target_min_salary": 180000,
        "preferred_currency": "USD",
        "work_authorization_status": "US_CITIZEN",
        "is_active": True,
        "created_at": "2026-11-15T00:00:00Z",
        "updated_at": "2026-11-15T00:00:00Z",
        "skills": [
            {
                "id": str(uuid.uuid4()),
                "candidate_id": str(profile_id),
                "name": "Python",
                "category": "Backend",
                "years_experience": 10.0,
                "proficiency_level": "EXPERT",
                "is_primary": True,
                "created_at": "2026-11-15T00:00:00Z",
            }
        ],
        "experiences": [],
        "educations": [],
        "resumes": [],
    }

    with patch(
        "app.services.candidate_service.CandidateService.get_active_profile",
        new=AsyncMock(return_value=mock_profile),
    ):
        prof_resp = await client.get("/api/v1/candidate/profile")
        assert prof_resp.status_code == 200
        assert prof_resp.json()["headline"] == mock_profile["headline"]

    # 3. Ingest Opportunity
    job_id = uuid.uuid4()
    mock_job = AsyncMock(
        id=job_id,
        company_id=uuid.uuid4(),
        company=AsyncMock(name="Nexus AI Technologies", domain="nexusai.example.com"),
        title="Staff Backend Engineer - AI Systems",
        normalized_title="Staff Backend Engineer - AI Systems",
        location="United States (Remote)",
        remote_type="REMOTE",
        employment_type="FULL_TIME",
        min_salary=195000,
        max_salary=240000,
        currency="USD",
        source_adapter="remote_tech_feed",
        external_job_id="nexus-101",
        source_url="https://nexusai.example.com/jobs/staff-ai",
        raw_description="Staff backend role in Python and FastAPI.",
        cleaned_description="Staff backend role in Python and FastAPI.",
        dedup_hash="hash_nexus_ai_staff",
        pipeline_stage="DISCOVERED",
        discovered_at="2026-11-15T00:00:00Z",
        published_at="2026-11-15T00:00:00Z",
        is_active=True,
    )

    with patch("app.services.discovery_service.DiscoveryService.ingest_manual_job", new=AsyncMock(return_value=mock_job)):
        job_resp = await client.post(
            "/api/v1/jobs/manual",
            json={
                "title": "Staff Backend Engineer - AI Systems",
                "company_name": "Nexus AI Technologies",
                "source_url": "https://nexusai.example.com/jobs/staff-ai",
                "raw_description": "Staff backend role in Python and FastAPI.",
                "min_salary": 195000,
            },
        )
        assert job_resp.status_code == 201

    # 4. Run AI Fit Evaluation
    mock_eval = AsyncMock(
        id=uuid.uuid4(),
        job_id=job_id,
        candidate_id=profile_id,
        overall_score=92.5,
        technical_match_score=95.0,
        seniority_fit_score=90.0,
        compensation_fit_score=90.0,
        recommendation="STRONG_APPLY",
        mandatory_skills_met=["Python", "FastAPI"],
        preferred_skills_met=[],
        missing_qualifications=[],
        strengths=["Exceptional Python tenure"],
        potential_concerns=[],
        rationale_markdown="Excellent match.",
        ai_provider="builtin",
        ai_model="llama3.2:3b",
        prompt_version="v1.2.0",
        prompt_tokens=400,
        completion_tokens=150,
        cost_usd=0.0,
        created_at="2026-11-15T00:00:00Z",
    )

    with patch("app.services.evaluation_service.EvaluationService.evaluate_job", new=AsyncMock(return_value=mock_eval)):
        eval_resp = await client.post("/api/v1/evaluations/evaluate", json={"job_id": str(job_id)})
        assert eval_resp.status_code == 201
        assert eval_resp.json()["overall_score"] == 92.5

    # 5. Discover & Verify Recruiter
    recruiter_id = uuid.uuid4()
    mock_recruiter = AsyncMock(
        id=recruiter_id,
        company_id=mock_job.company_id,
        company=mock_job.company,
        full_name="Elena Rostova",
        title="Head of Technical Recruiting",
        recruiter_type="INTERNAL_TA",
        linkedin_url="https://linkedin.com/in/elena-rostova",
        public_profile_url="https://nexusai.example.com/team",
        source_of_discovery="company_careers_directory",
        notes=None,
        created_at="2026-11-15T00:00:00Z",
        updated_at="2026-11-15T00:00:00Z",
        contacts=[
            AsyncMock(
                id=uuid.uuid4(),
                recruiter_id=recruiter_id,
                contact_type="EMAIL",
                contact_value="elena@nexusai.example.com",
                is_verified=True,
                verification_method="DNS_MX_AND_SYNTAX_VALIDATION",
                confidence_score=0.95,
                verification_evidence={},
                verified_at="2026-11-15T00:00:00Z",
                created_at="2026-11-15T00:00:00Z",
            )
        ],
    )

    with patch("app.services.recruiter_service.RecruiterService.create_recruiter", new=AsyncMock(return_value=mock_recruiter)):
        rec_resp = await client.post(
            "/api/v1/recruiters",
            json={
                "full_name": "Elena Rostova",
                "title": "Head of Technical Recruiting",
                "company_name": "Nexus AI Technologies",
                "initial_email": "elena@nexusai.example.com",
            },
        )
        assert rec_resp.status_code == 201
        assert rec_resp.json()["contacts"][0]["is_verified"] is True

    # 6. Generate Cold Outreach Draft (Saved in AWAITING_APPROVAL status)
    draft_id = uuid.uuid4()
    mock_draft = AsyncMock(
        id=draft_id,
        job_id=job_id,
        recruiter_id=recruiter_id,
        candidate_id=profile_id,
        resume_id=None,
        channel="GMAIL",
        subject="Regarding Staff Backend Engineer - Adam Blansett",
        body_markdown="Hi Elena, I noticed your opening...",
        body_html="<p>Hi Elena</p>",
        status="AWAITING_APPROVAL",
        approval_notes=None,
        approved_at=None,
        approved_by_user_id=None,
        sent_at=None,
        external_message_id=None,
        external_thread_id=None,
        created_at="2026-11-15T00:00:00Z",
        updated_at="2026-11-15T00:00:00Z",
        recruiter=mock_recruiter,
        job=mock_job,
    )

    with patch("app.services.outreach_service.OutreachService.generate_draft", new=AsyncMock(return_value=mock_draft)):
        draft_resp = await client.post(
            "/api/v1/outreach/generate",
            json={"job_id": str(job_id), "recruiter_id": str(recruiter_id)},
        )
        assert draft_resp.status_code == 201
        assert draft_resp.json()["status"] == "AWAITING_APPROVAL"

    # 7. Affirmative Human Approval Gateway
    mock_sent_resp = OutreachApprovalResponse(
        status="SENT",
        outreach_id=draft_id,
        message_id="gmail_msg_e2e_verified",
        sent_at="2026-11-15T00:00:00Z",
        channel="GMAIL",
    )

    with patch("app.services.outreach_service.OutreachService.approve_and_send", new=AsyncMock(return_value=mock_sent_resp)):
        send_resp = await client.post(
            f"/api/v1/outreach/{draft_id}/approve",
            json={"approval_notes": "Affirmatively verified and sent by Adam"},
        )
        assert send_resp.status_code == 200
        assert send_resp.json()["status"] == "SENT"
        assert send_resp.json()["message_id"] == "gmail_msg_e2e_verified"
