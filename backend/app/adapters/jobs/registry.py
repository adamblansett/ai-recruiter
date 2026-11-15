from typing import Dict, List
from app.adapters.jobs.base import BaseJobSourceAdapter
from app.adapters.jobs.feed_adapter import RemoteTechFeedAdapter
from app.adapters.jobs.greenhouse_adapter import GreenhouseBoardAdapter
from app.adapters.jobs.lever_adapter import LeverBoardAdapter


class JobAdapterRegistry:
    """Registry maintaining active discovery sources."""

    def __init__(self):
        self._adapters: Dict[str, BaseJobSourceAdapter] = {}
        # Register default adapters
        self.register(RemoteTechFeedAdapter())
        self.register(GreenhouseBoardAdapter())
        self.register(LeverBoardAdapter())

    def register(self, adapter: BaseJobSourceAdapter) -> None:
        self._adapters[adapter.source_name] = adapter

    def get_adapter(self, source_name: str) -> BaseJobSourceAdapter:
        if source_name not in self._adapters:
            raise KeyError(f"Job source adapter '{source_name}' not registered")
        return self._adapters[source_name]

    def list_adapters(self) -> List[str]:
        return list(self._adapters.keys())

    def get_all_adapters(self) -> List[BaseJobSourceAdapter]:
        return list(self._adapters.values())


job_adapter_registry = JobAdapterRegistry()
