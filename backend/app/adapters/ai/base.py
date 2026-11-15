from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class AICompletionResponse(BaseModel):
    content: str
    raw_response: Dict[str, Any] = {}
    model_name: str
    provider_name: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cost_usd: float = 0.0


class BaseAIProvider(ABC):
    """Abstract interface for all AI LLM providers (Built-in Local & Cloud)."""

    @abstractmethod
    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> AICompletionResponse:
        """Standard text completion."""
        pass

    @abstractmethod
    async def structured_complete(
        self,
        schema: Type[T],
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """Structured completion strictly conforming to a Pydantic schema."""
        pass

    @abstractmethod
    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate vector embeddings for semantic search and matching."""
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if provider/service is reachable and functional."""
        pass
