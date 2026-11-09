import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin


class JobEvaluation(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "job_evaluations"

    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("job_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_score: Mapped[float] = mapped_column(Numeric(4, 1), index=True, nullable=False)
    technical_match_score: Mapped[float] = mapped_column(Numeric(4, 1), nullable=False)
    seniority_fit_score: Mapped[float] = mapped_column(Numeric(4, 1), nullable=False)
    compensation_fit_score: Mapped[Optional[float]] = mapped_column(Numeric(4, 1), nullable=True)
    recommendation: Mapped[str] = mapped_column(String(30), nullable=False)  # 'STRONG_APPLY', 'APPLY', 'CONSIDER', 'SKIP'
    mandatory_skills_met: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
    preferred_skills_met: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
    missing_qualifications: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
    strengths: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
    potential_concerns: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
    rationale_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    ai_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    ai_model: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_version: Mapped[str] = mapped_column(String(20), nullable=False)
    prompt_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    completion_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    cost_usd: Mapped[float] = mapped_column(Numeric(8, 5), default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    job = relationship("JobOpportunity", back_populates="evaluations")
    candidate = relationship("CandidateProfile", back_populates="evaluations")
