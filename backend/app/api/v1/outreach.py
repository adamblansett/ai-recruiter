import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.outreach import (
    CommunicationRead,
    InboundClassificationResult,
    InboundMessagePayload,
    OutreachApprovalRequest,
    OutreachApprovalResponse,
    OutreachDraftCreate,
    OutreachDraftRead,
    OutreachDraftUpdate,
)
from app.services.inbound_service import InboundClassificationService
from app.services.outreach_service import OutreachService
from app.models.outreach import Communication
from sqlalchemy import select

router = APIRouter(tags=["Outreach & Human Approval"])


def serialize_draft(d) -> OutreachDraftRead:
    recruiter = d.recruiter
    contact = next((c for c in recruiter.contacts if c.contact_type == "EMAIL"), None) if recruiter else None

    return OutreachDraftRead(
        id=d.id,
        job_id=d.job_id,
        recruiter_id=d.recruiter_id,
        candidate_id=d.candidate_id,
        resume_id=d.resume_id,
        channel=d.channel,
        subject=d.subject,
        body_markdown=d.body_markdown,
        body_html=d.body_html,
        status=d.status,
        approval_notes=d.approval_notes,
        approved_at=d.approved_at,
        approved_by_user_id=d.approved_by_user_id,
        sent_at=d.sent_at,
        external_message_id=d.external_message_id,
        external_thread_id=d.external_thread_id,
        created_at=d.created_at,
        updated_at=d.updated_at,
        recruiter_name=recruiter.full_name if recruiter else None,
        recruiter_email=contact.contact_value if contact else None,
        job_title=d.job.title if d.job else None,
        company_name=d.job.company.name if d.job and d.job.company else None,
    )


@router.post("/generate", response_model=OutreachDraftRead, status_code=status.HTTP_201_CREATED, summary="Generate Tailored Outreach Draft")
async def generate_outreach(
    data: OutreachDraftCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate tailored cold outreach email using Built-in Local AI.
    Saved initially in AWAITING_APPROVAL status; cannot send without human approval.
    """
    try:
        draft = await OutreachService.generate_draft(db, data)
        return serialize_draft(draft)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("", response_model=List[OutreachDraftRead], summary="List Outreach Drafts")
async def list_drafts(
    status_filter: Optional[str] = Query(None, description="Filter by status (e.g. AWAITING_APPROVAL, SENT)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve outreach drafts awaiting review or already sent."""
    drafts = await OutreachService.list_drafts(db, status_filter=status_filter, limit=limit, offset=offset)
    return [serialize_draft(d) for d in drafts]


@router.get("/{draft_id}", response_model=OutreachDraftRead, summary="Get Draft Details")
async def get_draft(
    draft_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    draft = await OutreachService.get_draft_by_id(db, draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail="Outreach draft not found")
    return serialize_draft(draft)


@router.patch("/{draft_id}", response_model=OutreachDraftRead, summary="Edit Draft Text & Resume")
async def edit_draft(
    draft_id: uuid.UUID,
    data: OutreachDraftUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Allows candidate to modify generated subject, text, or attached resume before approving."""
    updated = await OutreachService.update_draft(db, draft_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Draft not found")
    return serialize_draft(updated)


@router.post("/{draft_id}/approve", response_model=OutreachApprovalResponse, summary="Human Affirmative Approval & Dispatch")
async def approve_and_send_draft(
    draft_id: uuid.UUID,
    request: OutreachApprovalRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    HUMAN APPROVAL GATEWAY:
    Affirmatively approve and send the message through Gmail API.
    Records user ID and timestamp to satisfy database CHECK constraint.
    """
    try:
        return await OutreachService.approve_and_send(db, draft_id, request)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.post("/{draft_id}/reject", response_model=OutreachDraftRead, summary="Reject or Discard Draft")
async def reject_draft_endpoint(
    draft_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Discard an outreach draft without sending."""
    draft = await OutreachService.reject_draft(db, draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return serialize_draft(draft)


# ================= Inbound Email & Communication Endpoints =================
@router.post("/inbound/process", response_model=InboundClassificationResult, summary="Process Inbound Recruiter Message")
async def process_inbound_recruiter_email(
    payload: InboundMessagePayload,
    db: AsyncSession = Depends(get_db),
):
    """
    Ingest, classify, extract calendar links, and generate AI suggested reply
    for an incoming recruiter email. Updates opportunity pipeline stage automatically.
    """
    return await InboundClassificationService.process_inbound_message(db, payload)


@router.get("/communications/history", response_model=List[CommunicationRead], summary="List Communication History")
async def list_communication_history(
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve chronologically ordered inbound and outbound communication history."""
    stmt = select(Communication).order_by(Communication.received_at.desc()).limit(limit)
    result = await db.execute(stmt)
    records = result.scalars().all()
    return records
