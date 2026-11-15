import logging
from typing import Optional
from app.adapters.ai.base import BaseAIProvider
from app.adapters.ai.builtin_provider import BuiltinAIProvider
from app.config import settings

logger = logging.getLogger(__name__)


class AIRouter:
    """
    Intelligent router selecting the active AI provider.
    Defaults to BuiltinAIProvider (0 keys required).
    """

    def __init__(self):
        self._builtin = BuiltinAIProvider()

    def get_provider(self, preference: Optional[str] = None) -> BaseAIProvider:
        provider_type = preference or settings.AI_PROVIDER_DEFAULT

        # Builtin is primary default
        if provider_type == "builtin":
            return self._builtin

        # Optional cloud providers can be added here
        logger.warning(f"Requested provider '{provider_type}' not configured; falling back to built-in local AI.")
        return self._builtin


ai_router = AIRouter()
