import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class OutreachDraft(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "outreach_drafts"
    __table_args__ = (
        CheckConstraint(
            "(status != 'SENT') OR (status = 'SENT' AND approved_at IS NOT NULL AND approved_by_user_id IS NOT NULL)",
            name="chk_outreach_sent_requires_approval",
        ),
    )

    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("job_opportunities.id", ondelete="CASCADE"), nullable=False)
    recruiter_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("recruiters.id", ondelete="RESTRICT"), nullable=False)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id", ondelete="RESTRICT"), nullable=False)
    resume_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    channel: Mapped[str] = mapped_column(String(30), default="GMAIL", nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    body_html: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), index=True, default="AWAITING_APPROVAL", nullable=False)
    approval_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    approved_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    external_message_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    external_thread_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    job = relationship("JobOpportunity", back_populates="outreach_drafts")
    recruiter = relationship("Recruiter", back_populates="outreach_drafts")
    resume = relationship("Resume")
    approved_by = relationship("User")
    communications = relationship("Communication", back_populates="outreach")


class Communication(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "communications"

    outreach_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("outreach_drafts.id", ondelete="SET NULL"), nullable=True)
    external_thread_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    external_message_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    direction: Mapped[str] = mapped_column(String(20), nullable=False)  # 'INBOUND', 'OUTBOUND'
    sender_address: Mapped[str] = mapped_column(String(255), nullable=False)
    recipient_address: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body_text: Mapped[str] = mapped_column(Text, nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    classification_intent: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    sentiment: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    raw_payload_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    outreach = relationship("OutreachDraft", back_populates="communications")
