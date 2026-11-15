import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ================= Contacts =================
class RecruiterContactBase(BaseModel):
    contact_type: str = Field(default="EMAIL", example="EMAIL")  # 'EMAIL', 'LINKEDIN_MESSAGE', 'PHONE'
    contact_value: str = Field(..., min_length=3, max_length=255)


class RecruiterContactCreate(RecruiterContactBase):
    pass


class RecruiterContactRead(RecruiterContactBase):
    id: uuid.UUID
    recruiter_id: uuid.UUID
    is_verified: bool
    verification_method: Optional[str] = None
    confidence_score: float
    verification_evidence: Dict[str, Any] = Field(default_factory=dict)
    verified_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ================= Recruiter =================
class RecruiterBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=150)
    title: str = Field(..., min_length=1, max_length=150)
    recruiter_type: str = Field(default="INTERNAL_TA")  # 'INTERNAL_TA', 'HIRING_MANAGER', 'AGENCY_RECRUITER'
    linkedin_url: Optional[str] = None
    public_profile_url: Optional[str] = None
    source_of_discovery: str = "manual_entry"
    notes: Optional[str] = None


class RecruiterCreate(RecruiterBase):
    company_id: Optional[uuid.UUID] = None
    company_name: Optional[str] = None
    company_domain: Optional[str] = None
    initial_email: Optional[str] = None


class RecruiterRead(RecruiterBase):
    id: uuid.UUID
    company_id: Optional[uuid.UUID] = None
    company_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    contacts: List[RecruiterContactRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


# ================= Job Associations =================
class RecruiterJobAssociationCreate(BaseModel):
    recruiter_id: uuid.UUID
    job_id: uuid.UUID
    association_type: str = Field(default="PRIMARY_RECRUITER")  # 'PRIMARY_RECRUITER', 'HIRING_MANAGER'


class RecruiterJobAssociationRead(BaseModel):
    id: uuid.UUID
    recruiter_id: uuid.UUID
    job_id: uuid.UUID
    association_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ================= Discovery =================
class RecruiterDiscoveryRequest(BaseModel):
    company_name: str
    company_domain: Optional[str] = None
    job_id: Optional[uuid.UUID] = None
    limit: int = 5


class RecruiterDiscoveryResponse(BaseModel):
    discovered_count: int
    recruiters: List[RecruiterRead]
