import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class Recruiter(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "recruiters"

    company_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    recruiter_type: Mapped[str] = mapped_column(String(50), nullable=False, default="INTERNAL_TA")
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    public_profile_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    source_of_discovery: Mapped[str] = mapped_column(String(100), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    company = relationship("Company", back_populates="recruiters")
    contacts = relationship("RecruiterContact", back_populates="recruiter", cascade="all, delete-orphan")
    job_associations = relationship("RecruiterJobAssociation", back_populates="recruiter", cascade="all, delete-orphan")
    outreach_drafts = relationship("OutreachDraft", back_populates="recruiter")


class RecruiterContact(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "recruiter_contacts"
    __table_args__ = (UniqueConstraint("recruiter_id", "contact_type", "contact_value", name="uq_recruiter_contact"),)

    recruiter_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    contact_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'EMAIL', 'LINKEDIN_MESSAGE', 'PHONE'
    contact_value: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_method: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    confidence_score: Mapped[float] = mapped_column(Numeric(3, 2), default=0.00, nullable=False)
    verification_evidence: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    recruiter = relationship("Recruiter", back_populates="contacts")


class RecruiterJobAssociation(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "recruiter_job_associations"
    __table_args__ = (UniqueConstraint("recruiter_id", "job_id", name="uq_recruiter_job"),)

    recruiter_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("job_opportunities.id", ondelete="CASCADE"), nullable=False)
    association_type: Mapped[str] = mapped_column(String(50), default="PRIMARY_RECRUITER", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    recruiter = relationship("Recruiter", back_populates="job_associations")
    job = relationship("JobOpportunity", back_populates="recruiter_associations")
