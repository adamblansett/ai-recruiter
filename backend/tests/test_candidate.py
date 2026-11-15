import io
import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from app.schemas.candidate import CandidateProfileDetailRead


@pytest.mark.asyncio
async def test_get_or_seed_candidate_profile(client: AsyncClient):
    # Mock candidate profile return
    fake_profile = {
        "id": str(uuid.uuid4()),
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
                "candidate_id": str(uuid.uuid4()),
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
        new=AsyncMock(return_value=fake_profile),
    ):
        response = await client.get("/api/v1/candidate/profile")
        assert response.status_code == 200
        data = response.json()
        assert data["headline"] == "Staff / Senior Full-Stack & AI Systems Software Engineer"
        assert len(data["skills"]) == 1
        assert data["skills"][0]["name"] == "Python"


@pytest.mark.asyncio
async def test_resume_upload_valid_pdf(client: AsyncClient):
    candidate_id = uuid.uuid4()
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"

    fake_resume_resp = {
        "id": str(uuid.uuid4()),
        "candidate_id": str(candidate_id),
        "label": "Staff Backend Resume",
        "file_path": "./uploads/resumes/test.pdf",
        "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "file_size_bytes": len(pdf_content),
        "mime_type": "application/pdf",
        "target_role_category": "Staff Backend",
        "is_primary": True,
        "created_at": "2026-11-15T00:00:00Z",
        "parsed_snippet": "Resume PDF parsed",
    }

    with patch(
        "app.services.candidate_service.CandidateService.get_active_profile",
        new=AsyncMock(return_value=AsyncMock(id=candidate_id)),
    ), patch(
        "app.services.resume_service.ResumeService.process_and_store_resume",
        new=AsyncMock(
            return_value=AsyncMock(
                id=uuid.UUID(fake_resume_resp["id"]),
                candidate_id=candidate_id,
                label=fake_resume_resp["label"],
                file_path=fake_resume_resp["file_path"],
                file_hash=fake_resume_resp["file_hash"],
                file_size_bytes=fake_resume_resp["file_size_bytes"],
                mime_type="application/pdf",
                target_role_category="Staff Backend",
                is_primary=True,
                created_at="2026-11-15T00:00:00Z",
                parsed_markdown="Resume PDF parsed",
            )
        ),
    ):
        files = {"file": ("test_resume.pdf", io.BytesIO(pdf_content), "application/pdf")}
        data = {"label": "Staff Backend Resume", "is_primary": "true"}

        response = await client.post("/api/v1/resumes/upload", files=files, data=data)
        assert response.status_code == 201
        res = response.json()
        assert res["label"] == "Staff Backend Resume"
        assert res["is_primary"] is True


@pytest.mark.asyncio
async def test_resume_upload_rejects_non_pdf(client: AsyncClient):
    text_content = b"Not a PDF file content"
    files = {"file": ("malicious.exe", io.BytesIO(text_content), "text/plain")}
    data = {"label": "Bad Resume"}

    response = await client.post("/api/v1/resumes/upload", files=files, data=data)
    assert response.status_code == 415
