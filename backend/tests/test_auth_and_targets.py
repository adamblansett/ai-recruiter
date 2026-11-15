import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock, patch
from app.main import app


@pytest.mark.asyncio
async def test_google_auth_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/auth/google/status")
        assert response.status_code == 200
        data = response.json()
        assert "is_connected" in data
        assert "scopes" in data


@pytest.mark.asyncio
async def test_google_oauth_url_generation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/auth/google/url")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data


@pytest.mark.asyncio
async def test_list_adapters_and_add_target_board():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Query info
        info_res = await ac.get("/api/v1/jobs/adapters/info")
        assert info_res.status_code == 200
        adapters = info_res.json()
        assert any(a["source_name"] == "greenhouse_api" for a in adapters)

        # 2. Add target company
        add_res = await ac.post(
            "/api/v1/jobs/adapters/target",
            json={"adapter_type": "greenhouse", "company_slug": "hashicorp"},
        )
        assert add_res.status_code == 200
        assert add_res.json()["status"] == "success"

        # 3. Verify added
        info_res2 = await ac.get("/api/v1/jobs/adapters/info")
        gh = next(a for a in info_res2.json() if a["source_name"] == "greenhouse_api")
        assert "hashicorp" in gh["target_boards"]
