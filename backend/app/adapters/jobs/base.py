from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class JobSearchQuery(BaseModel):
    query_terms: List[str] = Field(default_factory=lambda: ["Python", "Backend", "AI", "Senior", "Staff"])
    remote_only: bool = True
    location: str = "United States"
    limit: int = 25


class RawJobListing(BaseModel):
    title: str
    company_name: str
    company_domain: Optional[str] = None
    location: str = "United States (Remote)"
    remote_type: str = "REMOTE"  # 'REMOTE', 'HYBRID', 'ONSITE'
    employment_type: str = "FULL_TIME"  # 'FULL_TIME', 'CONTRACT'
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    currency: str = "USD"
    source_adapter: str
    external_job_id: Optional[str] = None
    source_url: str
    raw_description: str
    published_at: Optional[datetime] = None
    extra_metadata: Dict[str, Any] = Field(default_factory=dict)


class BaseJobSourceAdapter(ABC):
    """Abstract interface for all job discovery sources and ATS adapters."""

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Unique identifier of the job source adapter."""
        pass

    @abstractmethod
    async def fetch_jobs(self, query: JobSearchQuery) -> List[RawJobListing]:
        """Fetch and normalize job listings matching the search criteria."""
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """Health check for external source or feed."""
        pass
