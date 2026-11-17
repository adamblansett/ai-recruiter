import os
import pytest
import uuid
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.services.interview_prep_service import InterviewPrepService
from app.services.tailored_artifact_service import TailoredArtifactService


def test_tailored_pdf_generation_primitives(tmp_path):
    output_pdf = str(tmp_path / "test_tailored_resume.pdf")
    TailoredArtifactService._render_pdf(
        output_path=output_pdf,
        title="ADAM BLANSETT",
        subtitle="Staff Software Engineer | Tailored for: Senior AI Infrastructure Role",
        sections={
            "Target Summary": ["10+ years engineering high-concurrency systems and distributed LLM pipelines."],
            "Technical Proficiencies": ["Python", "FastAPI", "PostgreSQL", "Docker", "Celery"],
        },
    )
    assert os.path.exists(output_pdf)
    assert os.path.getsize(output_pdf) > 500
    with open(output_pdf, "rb") as f:
        header = f.read(5)
        assert header == b"%PDF-"


@pytest.mark.asyncio
async def test_interview_prep_api_404_on_invalid_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        fake_id = uuid.uuid4()
        response = await ac.get(f"/api/v1/jobs/{fake_id}/interview-prep")
        assert response.status_code == 404
