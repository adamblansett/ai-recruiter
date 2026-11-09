import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class JobOpportunity(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "job_opportunities"

    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="RESTRICT"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(250), nullable=False)
    normalized_title: Mapped[str] = mapped_column(String(250), nullable=False)
    location: Mapped[str] = mapped_column(String(150), nullable=False)
    remote_type: Mapped[str] = mapped_column(String(30), index=True, nullable=False)  # 'REMOTE', 'HYBRID', 'ONSITE'
    employment_type: Mapped[str] = mapped_column(String(30), nullable=False)  # 'FULL_TIME', 'CONTRACT'
    min_salary: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    max_salary: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    source_adapter: Mapped[str] = mapped_column(String(50), nullable=False)
    external_job_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    raw_description: Mapped[str] = mapped_column(Text, nullable=False)
    cleaned_description: Mapped[str] = mapped_column(Text, nullable=False)
    dedup_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    pipeline_stage: Mapped[str] = mapped_column(String(50), index=True, nullable=False, default="DISCOVERED")
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    discovered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expired_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    company = relationship("Company", back_populates="jobs")
    evaluations = relationship("JobEvaluation", back_populates="job", cascade="all, delete-orphan")
    recruiter_associations = relationship("RecruiterJobAssociation", back_populates="job", cascade="all, delete-orphan")
    outreach_drafts = relationship("OutreachDraft", back_populates="job", cascade="all, delete-orphan")
