import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "AI Recruiter"
    assert data["status"] == "online"
    assert data["docs"] == "/docs"


@pytest.mark.asyncio
async def test_simple_health_endpoint(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "AI Recruiter"


@pytest.mark.asyncio
async def test_system_health_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["redis"] == "connected"
    assert data["app_name"] == "AI Recruiter"


@pytest.mark.asyncio
async def test_system_status_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["app_name"] == "AI Recruiter"
    assert "uptime_seconds" in data
    assert data["system_metrics"]["python_runtime"] == "FastAPI + Pydantic v2"
