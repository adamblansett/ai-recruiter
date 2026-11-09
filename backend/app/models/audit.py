import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    ARRAY,
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class ApiCredential(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "api_credentials"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(50), nullable=False)  # 'google_gmail', 'openai', 'anthropic', 'gemini'
    encrypted_access_token: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)
    encrypted_refresh_token: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)
    encrypted_api_key: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)
    token_expiry: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    scopes: Mapped[List[str]] = mapped_column(ARRAY(String(255)), default=list, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="api_credentials")


class AiModelConfig(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "ai_model_configs"

    provider_name: Mapped[str] = mapped_column(String(50), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    model_alias: Mapped[str] = mapped_column(String(100), nullable=False)
    cost_per_million_input: Mapped[float] = mapped_column(Numeric(8, 4), default=0.0, nullable=False)
    cost_per_million_output: Mapped[float] = mapped_column(Numeric(8, 4), default=0.0, nullable=False)
    context_window: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    routing_tier: Mapped[str] = mapped_column(String(20), default="PRIMARY", nullable=False)  # 'PRIMARY', 'FAST', 'FALLBACK'
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class TaskExecution(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "task_executions"

    task_name: Mapped[str] = mapped_column(String(100), nullable=False)
    celery_task_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)  # 'PENDING', 'RUNNING', 'SUCCESS', 'FAILURE'
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    result_summary: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    changes_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
