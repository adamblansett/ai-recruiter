import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class OutreachDraftCreate(BaseModel):
    job_id: uuid.UUID
    recruiter_id: uuid.UUID
    candidate_id: Optional[uuid.UUID] = None
    resume_id: Optional[uuid.UUID] = None
    channel: str = Field(default="GMAIL", example="GMAIL")
    custom_instructions: Optional[str] = None


class OutreachDraftUpdate(BaseModel):
    subject: Optional[str] = None
    body_markdown: Optional[str] = None
    resume_id: Optional[uuid.UUID] = None


class OutreachApprovalRequest(BaseModel):
    approval_notes: Optional[str] = Field(default="Approved by candidate via dashboard")


class OutreachDraftRead(BaseModel):
    id: uuid.UUID
    job_id: uuid.UUID
    recruiter_id: uuid.UUID
    candidate_id: uuid.UUID
    resume_id: Optional[uuid.UUID] = None
    channel: str
    subject: str
    body_markdown: str
    body_html: str
    status: str  # 'DRAFT', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT', 'FAILED'
    approval_notes: Optional[str] = None
    approved_at: Optional[datetime] = None
    approved_by_user_id: Optional[uuid.UUID] = None
    sent_at: Optional[datetime] = None
    external_message_id: Optional[str] = None
    external_thread_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Display Helpers
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None

    model_config = {"from_attributes": True}


class OutreachApprovalResponse(BaseModel):
    status: str
    outreach_id: uuid.UUID
    message_id: str
    sent_at: str
    channel: str


# ================= Inbound Processing & Classification =================
class InboundMessagePayload(BaseModel):
    outreach_id: Optional[uuid.UUID] = None
    sender_email: str
    recipient_email: str = "adam.blansett@gmail.com"
    subject: str
    body_text: str
    external_thread_id: Optional[str] = None
    external_message_id: Optional[str] = None


class InboundClassificationResult(BaseModel):
    communication_id: uuid.UUID
    intent: str  # 'INTERVIEW_REQUEST', 'INFORMATION_REQUEST', 'NOT_A_FIT_NOW', 'REJECTION'
    sentiment: str  # 'POSITIVE', 'NEUTRAL', 'NEGATIVE'
    has_calendar_link: bool
    calendar_links: list[str] = Field(default_factory=list)
    suggested_reply_markdown: str
    recommended_pipeline_stage: str
    received_at: datetime


class CommunicationRead(BaseModel):
    id: uuid.UUID
    outreach_id: Optional[uuid.UUID] = None
    external_thread_id: str
    external_message_id: str
    direction: str
    sender_address: str
    recipient_address: str
    subject: str
    body_text: str
    classification_intent: Optional[str] = None
    sentiment: Optional[str] = None
    received_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
