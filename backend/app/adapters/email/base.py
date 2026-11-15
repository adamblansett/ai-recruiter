import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EmailAttachment(BaseModel):
    filename: str
    content_bytes: bytes
    mime_type: str = "application/pdf"


class DraftMessage(BaseModel):
    recipient_email: str
    recipient_name: str
    subject: str
    body_text: str
    body_html: str
    attachments: List[EmailAttachment] = Field(default_factory=list)
    thread_id: Optional[str] = None


class SentMessageResponse(BaseModel):
    message_id: str
    thread_id: str
    recipient: str
    sent_at: str
    raw_response: Dict[str, Any] = Field(default_factory=dict)


class BaseEmailAdapter(ABC):
    """Abstract interface for authorized email sending and draft synchronization."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the email provider."""
        pass

    @abstractmethod
    async def create_draft(self, draft: DraftMessage) -> str:
        """Create draft directly in user's email client (e.g. Gmail drafts). Returns external draft ID."""
        pass

    @abstractmethod
    async def send_message(self, message: DraftMessage) -> SentMessageResponse:
        """
        Send approved message through authorized API.
        MUST ONLY be invoked after affirmative human approval is recorded.
        """
        pass

    @abstractmethod
    async def is_authenticated(self) -> bool:
        """Check if OAuth2 credentials or connection are active."""
        pass
