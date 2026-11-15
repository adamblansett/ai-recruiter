import json
import logging
from typing import Any, Dict, List, Optional, Type, TypeVar
import httpx
from pydantic import BaseModel

from app.adapters.ai.base import AICompletionResponse, BaseAIProvider
from app.config import settings

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


class BuiltinAIProvider(BaseAIProvider):
    """
    Built-in Local AI Provider.
    Communicates with the containerized open-weight inference engine (Ollama)
    running inside the Docker environment without requiring external API keys.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model_name: Optional[str] = None,
        embedding_model: Optional[str] = None,
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model_name = model_name or settings.BUILTIN_MODEL_NAME
        self.embedding_model = embedding_model or settings.BUILTIN_EMBEDDING_MODEL

    async def is_available(self) -> bool:
        """Check if local AI engine is responsive."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/version")
                return res.status_code == 200
        except Exception:
            return False

    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> AICompletionResponse:
        payload: Dict[str, Any] = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }
        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(f"{self.base_url}/api/generate", json=payload)
            res.raise_for_status()
            data = res.json()

            return AICompletionResponse(
                content=data.get("response", ""),
                raw_response=data,
                model_name=self.model_name,
                provider_name="builtin",
                prompt_tokens=data.get("prompt_eval_count", 0),
                completion_tokens=data.get("eval_count", 0),
                cost_usd=0.0,  # Built-in local execution is completely free
            )

    async def structured_complete(
        self,
        schema: Type[T],
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """
        Request structured JSON from the built-in model conforming to the schema.
        """
        json_schema = schema.model_json_schema()
        enforced_system = (
            f"{system_prompt or ''}\n\n"
            f"CRITICAL: You must return ONLY a valid JSON object strictly matching this schema:\n"
            f"{json.dumps(json_schema)}\n"
            f"Do not include markdown wrappers, thoughts, or comments outside the JSON."
        )

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "system": enforced_system,
            "format": "json",
            "stream": False,
            "options": {"temperature": temperature},
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            res = await client.post(f"{self.base_url}/api/generate", json=payload)
            res.raise_for_status()
            data = res.json()
            raw_text = data.get("response", "{}")

            try:
                parsed_json = json.loads(raw_text)
                return schema.model_validate(parsed_json)
            except Exception as e:
                logger.error(f"Failed to parse structured output from built-in AI: {e}. Output was: {raw_text}")
                raise

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate vector embeddings using built-in embedding model."""
        embeddings: List[List[float]] = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            for text in texts:
                res = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": self.embedding_model, "prompt": text},
                )
                res.raise_for_status()
                data = res.json()
                embeddings.append(data.get("embedding", []))
        return embeddings
