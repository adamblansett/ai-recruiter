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

    def add_greenhouse_board(self, board_slug: str) -> None:
        gh = self._adapters.get("greenhouse_api")
        if isinstance(gh, GreenhouseBoardAdapter) and board_slug.lower() not in gh.target_boards:
            gh.target_boards.append(board_slug.lower())

    def add_lever_site(self, site_slug: str) -> None:
        lev = self._adapters.get("lever_api")
        if isinstance(lev, LeverBoardAdapter) and site_slug.lower() not in lev.target_sites:
            lev.target_sites.append(site_slug.lower())


job_adapter_registry = JobAdapterRegistry()
