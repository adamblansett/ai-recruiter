import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.services.inbound_service import InboundClassificationService


def test_calendar_link_extraction():
    sample_text = (
        "Hi Adam, please pick a time on my calendar at https://calendly.com/recruiter-mary/30min "
        "or join via https://zoom.us/j/123456789 directly."
    )
    links = InboundClassificationService.extract_calendar_links(sample_text)
    assert len(links) >= 1
    assert any("calendly.com" in link for link in links)


def test_intent_classification_heuristics():
    # 1. Interview signal
    intent, sentiment, stage = InboundClassificationService.classify_intent_heuristics(
        "We'd love to schedule an initial phone screen with our team next week."
    )
    assert intent == "INTERVIEW_REQUEST"
    assert sentiment == "POSITIVE"
    assert stage == "SCREENING"

    # 2. Rejection signal
    intent, sentiment, stage = InboundClassificationService.classify_intent_heuristics(
        "Unfortunately, we have decided to pursue other candidates at this time."
    )
    assert intent == "REJECTION"
    assert sentiment == "NEGATIVE"
    assert stage == "REJECTED"

    # 3. Information signal
    intent, sentiment, stage = InboundClassificationService.classify_intent_heuristics(
        "Could you let us know your salary expectation and work authorization status?"
    )
    assert intent == "INFORMATION_REQUEST"
    assert stage == "INTERESTED"


@pytest.mark.asyncio
async def test_analytics_funnel_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/analytics/funnel")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "funnel_stages" in data
        assert "pending_followups" in data
        assert data["summary"]["total_jobs"] >= 0
