import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.schemas.offer import OfferInput
from app.services.offer_service import OfferService


@pytest.mark.asyncio
async def test_offer_evaluation_logic():
    # Test Staff engineer competitive package
    test_offer = OfferInput(
        company_name="Nexus AI",
        role_title="Staff Backend Engineer",
        base_salary=195000.0,
        equity_value_annual=50000.0,
        bonus_target_annual=25000.0,
        sign_on_bonus=20000.0,
    )
    # Using AsyncMock for DB session in standalone unit test
    from unittest.mock import AsyncMock
    mock_db = AsyncMock()
    
    result = await OfferService.evaluate_offer(mock_db, test_offer)
    assert result.first_year_tc == 290000.0
    assert result.recurring_annual_tc == 270000.0
    assert result.recommendation in ["ACCEPT", "NEGOTIATE"]
    assert "Nexus AI" in result.counter_offer_email_script
    assert result.counter_targets.target_base_salary >= 195000.0


@pytest.mark.asyncio
async def test_offer_evaluation_api_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post(
            "/api/v1/offers/evaluate",
            json={
                "company_name": "Stripe",
                "role_title": "Senior Infrastructure Engineer",
                "base_salary": 190000.0,
                "equity_value_annual": 40000.0,
                "bonus_target_annual": 20000.0,
                "sign_on_bonus": 15000.0,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["first_year_tc"] == 265000.0
        assert "counter_targets" in data
        assert "counter_offer_email_script" in data
