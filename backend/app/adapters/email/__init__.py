from app.adapters.email.base import (
    BaseEmailAdapter,
    DraftMessage,
    EmailAttachment,
    SentMessageResponse,
)
from app.adapters.email.gmail_adapter import GmailAPIAdapter

default_email_adapter = GmailAPIAdapter()

__all__ = [
    "BaseEmailAdapter",
    "DraftMessage",
    "EmailAttachment",
    "SentMessageResponse",
    "GmailAPIAdapter",
    "default_email_adapter",
]
