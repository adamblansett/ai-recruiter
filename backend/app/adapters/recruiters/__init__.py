from app.adapters.recruiters.base import (
    BaseRecruiterResearchAdapter,
    RawRecruiterContact,
    RecruiterSearchQuery,
    VerificationResult,
)
from app.adapters.recruiters.research_adapter import ProfessionalRecruiterResearchAdapter

default_recruiter_adapter = ProfessionalRecruiterResearchAdapter()

__all__ = [
    "BaseRecruiterResearchAdapter",
    "RawRecruiterContact",
    "RecruiterSearchQuery",
    "VerificationResult",
    "ProfessionalRecruiterResearchAdapter",
    "default_recruiter_adapter",
]
