import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from app.schemas.outreach import OutreachApprovalResponse


@pytest.mark.asyncio
async def test_generate_outreach_draft_endpoint(client: AsyncClient):
    job_id = uuid.uuid4()
    recruiter_id = uuid.uuid4()

    mock_draft = AsyncMock(
        id=uuid.uuid4(),
        job_id=job_id,
        recruiter_id=recruiter_id,
        candidate_id=uuid.uuid4(),
        resume_id=uuid.uuid4(),
        channel="GMAIL",
        subject="Regarding Staff Backend Engineer - Adam Blansett",
        body_markdown="Hi there, I noticed your role...",
        body_html="<p>Hi there</p>",
        status="AWAITING_APPROVAL",
        approval_notes=None,
        approved_at=None,
        approved_by_user_id=None,
        sent_at=None,
        external_message_id=None,
        external_thread_id=None,
        created_at="2026-11-15T00:00:00Z",
        updated_at="2026-11-15T00:00:00Z",
        recruiter=AsyncMock(full_name="Sarah Connor", contacts=[AsyncMock(contact_type="EMAIL", contact_value="sarah@nexusai.com")]),
        job=AsyncMock(title="Staff Backend Engineer", company=AsyncMock(name="Nexus AI")),
    )

    with patch(
        "app.services.outreach_service.OutreachService.generate_draft",
        new=AsyncMock(return_value=mock_draft),
    ):
        data = {
            "job_id": str(job_id),
            "recruiter_id": str(recruiter_id),
            "channel": "GMAIL",
        }
        response = await client.post("/api/v1/outreach/generate", json=data)
        assert response.status_code == 201
        res = response.json()
        assert res["status"] == "AWAITING_APPROVAL"
        assert res["recruiter_name"] == "Sarah Connor"


@pytest.mark.asyncio
async def test_human_approval_gateway_endpoint(client: AsyncClient):
    draft_id = uuid.uuid4()

    mock_resp = OutreachApprovalResponse(
        status="SENT",
        outreach_id=draft_id,
        message_id="gmail_msg_12345",
        sent_at="2026-11-15T00:00:00Z",
        channel="GMAIL",
    )

    with patch(
        "app.services.outreach_service.OutreachService.approve_and_send",
        new=AsyncMock(return_value=mock_resp),
    ):
        response = await client.post(
            f"/api/v1/outreach/{draft_id}/approve",
            json={"approval_notes": "Reviewed and approved by Adam"},
        )
        assert response.status_code == 200
        res = response.json()
        assert res["status"] == "SENT"
        assert res["message_id"] == "gmail_msg_12345"


@pytest.mark.asyncio
async def test_edit_outreach_draft_endpoint(client: AsyncClient):
    draft_id = uuid.uuid4()

    mock_draft = AsyncMock(
        id=draft_id,
        job_id=uuid.uuid4(),
        recruiter_id=uuid.uuid4(),
        candidate_id=uuid.uuid4(),
        resume_id=None,
        channel="GMAIL",
        subject="Updated Subject Line",
        body_markdown="Custom tailored message text...",
        body_html="<p>Custom tailored message text...</p>",
        status="AWAITING_APPROVAL",
        approval_notes=None,
        approved_at=None,
        approved_by_user_id=None,
        sent_at=None,
        external_message_id=None,
        external_thread_id=None,
        created_at="2026-11-15T00:00:00Z",
        updated_at="2026-11-15T00:00:00Z",
        recruiter=None,
        job=None,
    )

    with patch(
        "app.services.outreach_service.OutreachService.update_draft",
        new=AsyncMock(return_value=mock_draft),
    ):
        response = await client.patch(
            f"/api/v1/outreach/{draft_id}",
            json={"subject": "Updated Subject Line", "body_markdown": "Custom tailored message text..."},
        )
        assert response.status_code == 200
        res = response.json()
        assert res["subject"] == "Updated Subject Line"
