import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from app.adapters.recruiters.research_adapter import ProfessionalRecruiterResearchAdapter


@pytest.mark.asyncio
async def test_recruiter_contact_verification_logic():
    adapter = ProfessionalRecruiterResearchAdapter()

    # Valid syntax email
    res_valid = await adapter.verify_contact("talent@example.com", domain="example.com")
    assert res_valid.is_valid_format is True
    assert res_valid.confidence_score > 0.0

    # Invalid syntax email
    res_invalid = await adapter.verify_contact("not-an-email-at-all", domain="example.com")
    assert res_invalid.is_valid_format is False
    assert res_invalid.is_verified is False
    assert res_invalid.confidence_score == 0.0


@pytest.mark.asyncio
async def test_create_recruiter_endpoint(client: AsyncClient):
    mock_recruiter = AsyncMock(
        id=uuid.uuid4(),
        company_id=uuid.uuid4(),
        company=AsyncMock(name="Nexus AI"),
        full_name="Sarah Connor",
        title="Senior Technical Sourcer",
        recruiter_type="INTERNAL_TA",
        linkedin_url="https://linkedin.com/in/sarah-connor",
        public_profile_url="https://nexusai.com/team",
        source_of_discovery="manual_entry",
        notes="Primary engineering recruiter",
        created_at="2026-11-15T00:00:00Z",
        updated_at="2026-11-15T00:00:00Z",
        contacts=[],
    )

    with patch(
        "app.services.recruiter_service.RecruiterService.create_recruiter",
        new=AsyncMock(return_value=mock_recruiter),
    ):
        data = {
            "full_name": "Sarah Connor",
            "title": "Senior Technical Sourcer",
            "company_name": "Nexus AI",
            "recruiter_type": "INTERNAL_TA",
        }
        response = await client.post("/api/v1/recruiters", json=data)
        assert response.status_code == 201
        res = response.json()
        assert res["full_name"] == "Sarah Connor"
        assert res["company_name"] == "Nexus AI"


@pytest.mark.asyncio
async def test_add_and_verify_contact_endpoint(client: AsyncClient):
    recruiter_id = uuid.uuid4()
    mock_recruiter = AsyncMock(
        id=recruiter_id,
        company=AsyncMock(domain="nexusai.com"),
    )
    mock_contact = AsyncMock(
        id=uuid.uuid4(),
        recruiter_id=recruiter_id,
        contact_type="EMAIL",
        contact_value="sconnor@nexusai.com",
        is_verified=True,
        verification_method="DNS_MX_AND_SYNTAX_VALIDATION",
        confidence_score=0.95,
        verification_evidence={"domain": "nexusai.com"},
        verified_at="2026-11-15T00:00:00Z",
        created_at="2026-11-15T00:00:00Z",
    )

    with patch(
        "app.services.recruiter_service.RecruiterService.get_recruiter_by_id",
        new=AsyncMock(return_value=mock_recruiter),
    ), patch(
        "app.services.recruiter_service.RecruiterService.add_and_verify_contact",
        new=AsyncMock(return_value=mock_contact),
    ):
        response = await client.post(
            f"/api/v1/recruiters/{recruiter_id}/contacts",
            json={"contact_type": "EMAIL", "contact_value": "sconnor@nexusai.com"},
        )
        assert response.status_code == 201
        res = response.json()
        assert res["contact_value"] == "sconnor@nexusai.com"
        assert res["is_verified"] is True
        assert res["confidence_score"] == 0.95


@pytest.mark.asyncio
async def test_associate_recruiter_with_job_endpoint(client: AsyncClient):
    recruiter_id = uuid.uuid4()
    job_id = uuid.uuid4()

    mock_assoc = AsyncMock(
        id=uuid.uuid4(),
        recruiter_id=recruiter_id,
        job_id=job_id,
        association_type="PRIMARY_RECRUITER",
        created_at="2026-11-15T00:00:00Z",
    )

    with patch(
        "app.services.recruiter_service.RecruiterService.associate_recruiter_with_job",
        new=AsyncMock(return_value=mock_assoc),
    ):
        response = await client.post(
            f"/api/v1/recruiters/{recruiter_id}/associate/{job_id}?association_type=PRIMARY_RECRUITER"
        )
        assert response.status_code == 200
        res = response.json()
        assert res["association_type"] == "PRIMARY_RECRUITER"
