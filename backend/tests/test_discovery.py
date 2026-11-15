import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from app.adapters.jobs.base import RawJobListing
from app.services.discovery_service import DiscoveryService


def test_dedup_hash_deterministic_and_unique():
    hash1 = DiscoveryService.compute_dedup_hash("Google", "Senior Software Engineer", "Python backend role...")
    hash2 = DiscoveryService.compute_dedup_hash("Google", "Senior Software Engineer", "Python backend role...")
    hash3 = DiscoveryService.compute_dedup_hash("Google", "Staff Software Engineer", "Python backend role...")

    assert hash1 == hash2
    assert hash1 != hash3


@pytest.mark.asyncio
async def test_manual_job_ingestion(client: AsyncClient):
    manual_data = {
        "title": "Senior AI Systems Engineer",
        "company_name": "Synthetix Labs",
        "company_domain": "synthetix.example.com",
        "location": "United States (Remote)",
        "remote_type": "REMOTE",
        "employment_type": "FULL_TIME",
        "min_salary": 185000,
        "max_salary": 225000,
        "currency": "USD",
        "source_url": "https://synthetix.example.com/careers/ai-eng",
        "raw_description": "We are seeking a Senior AI Systems Engineer with Python and FastAPI experience.",
    }

    mock_job = AsyncMock(
        id=uuid.uuid4(),
        company_id=uuid.uuid4(),
        company=AsyncMock(name="Synthetix Labs", domain="synthetix.example.com"),
        title=manual_data["title"],
        normalized_title=manual_data["title"],
        location=manual_data["location"],
        remote_type=manual_data["remote_type"],
        employment_type=manual_data["employment_type"],
        min_salary=manual_data["min_salary"],
        max_salary=manual_data["max_salary"],
        currency="USD",
        source_adapter="manual",
        external_job_id=None,
        source_url=manual_data["source_url"],
        raw_description=manual_data["raw_description"],
        cleaned_description=manual_data["raw_description"],
        dedup_hash="abc123hash",
        pipeline_stage="DISCOVERED",
        discovered_at="2026-11-15T00:00:00Z",
        published_at="2026-11-15T00:00:00Z",
        is_active=True,
    )

    with patch("app.services.discovery_service.DiscoveryService.ingest_manual_job", new=AsyncMock(return_value=mock_job)):
        response = await client.post("/api/v1/jobs/manual", json=manual_data)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Senior AI Systems Engineer"
        assert data["company_name"] == "Synthetix Labs"
        assert data["pipeline_stage"] == "DISCOVERED"


@pytest.mark.asyncio
async def test_trigger_discovery(client: AsyncClient):
    mock_discovery_result = {
        "discovered_count": 5,
        "new_ingested_count": 3,
        "duplicate_count": 2,
        "sources_polled": ["remote_tech_feed", "greenhouse_api", "lever_api"],
    }

    with patch(
        "app.services.discovery_service.DiscoveryService.run_discovery",
        new=AsyncMock(return_value=mock_discovery_result),
    ):
        response = await client.post("/api/v1/jobs/discover")
        assert response.status_code == 200
        data = response.json()
        assert data["discovered_count"] == 5
        assert data["new_ingested_count"] == 3
        assert len(data["sources_polled"]) == 3


@pytest.mark.asyncio
async def test_update_job_stage(client: AsyncClient):
    job_id = uuid.uuid4()
    mock_job = AsyncMock(
        id=job_id,
        company_id=uuid.uuid4(),
        company=AsyncMock(name="Acme Corp", domain="acme.com"),
        title="Lead Python Architect",
        normalized_title="Lead Python Architect",
        location="Remote",
        remote_type="REMOTE",
        employment_type="FULL_TIME",
        min_salary=200000,
        max_salary=250000,
        currency="USD",
        source_adapter="manual",
        external_job_id=None,
        source_url="https://acme.com/jobs/1",
        raw_description="Lead Python role",
        cleaned_description="Lead Python role",
        dedup_hash="def456hash",
        pipeline_stage="QUALIFIED",
        discovered_at="2026-11-15T00:00:00Z",
        published_at="2026-11-15T00:00:00Z",
        is_active=True,
    )

    with patch("app.services.discovery_service.DiscoveryService.update_stage", new=AsyncMock(return_value=mock_job)):
        response = await client.patch(f"/api/v1/jobs/{job_id}/stage", json={"pipeline_stage": "QUALIFIED"})
        assert response.status_code == 200
        data = response.json()
        assert data["pipeline_stage"] == "QUALIFIED"
