import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class JobOpportunityBase(BaseModel):
    title: str
    location: str
    remote_type: str  # 'REMOTE', 'HYBRID', 'ONSITE'
    employment_type: str  # 'FULL_TIME', 'CONTRACT'
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    currency: str = "USD"
    source_url: str
    raw_description: str
    cleaned_description: str


class JobOpportunityCreate(JobOpportunityBase):
    company_name: str
    company_domain: Optional[str] = None
    source_adapter: str = "manual"
    external_job_id: Optional[str] = None
    published_at: Optional[datetime] = None


class JobOpportunityRead(JobOpportunityBase):
    id: uuid.UUID
    company_id: uuid.UUID
    normalized_title: str
    source_adapter: str
    external_job_id: Optional[str] = None
    dedup_hash: str
    pipeline_stage: str
    discovered_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}
