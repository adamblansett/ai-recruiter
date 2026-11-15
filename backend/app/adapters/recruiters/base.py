from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RecruiterSearchQuery(BaseModel):
    company_name: str
    company_domain: Optional[str] = None
    target_titles: List[str] = Field(
        default_factory=lambda: [
            "Technical Recruiter",
            "Talent Acquisition",
            "Engineering Manager",
            "Head of Engineering",
            "Director of Engineering",
        ]
    )
    limit: int = 10


class RawRecruiterContact(BaseModel):
    full_name: str
    title: str
    company_name: str
    company_domain: Optional[str] = None
    recruiter_type: str = "INTERNAL_TA"  # 'INTERNAL_TA', 'HIRING_MANAGER', 'AGENCY_RECRUITER'
    linkedin_url: Optional[str] = None
    public_profile_url: Optional[str] = None
    source_of_discovery: str
    suggested_email: Optional[str] = None
    notes: Optional[str] = None


class VerificationResult(BaseModel):
    is_valid_format: bool
    has_valid_domain: bool
    has_mx_records: bool
    is_verified: bool
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    verification_method: str
    evidence: Dict[str, Any] = Field(default_factory=dict)


class BaseRecruiterResearchAdapter(ABC):
    """Abstract interface for professional recruiter research and discovery."""

    @property
    @abstractmethod
    def adapter_name(self) -> str:
        """Name of the research adapter."""
        pass

    @abstractmethod
    async def discover_recruiters(self, query: RecruiterSearchQuery) -> List[RawRecruiterContact]:
        """Search and discover professional recruiters and hiring managers for a company."""
        pass

    @abstractmethod
    async def verify_contact(self, email: str, domain: str) -> VerificationResult:
        """Execute multi-step evidence-based contact verification."""
        pass
