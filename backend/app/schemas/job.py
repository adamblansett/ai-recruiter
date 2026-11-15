import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ================= Company Schemas =================
class CompanyBase(BaseModel):
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    website_url: Optional[str] = None


class CompanyRead(CompanyBase):
    id: uuid.UUID
    normalized_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ================= Job Schemas =================
class JobOpportunityBase(BaseModel):
    title: str
    location: str
    remote_type: str = "REMOTE"  # 'REMOTE', 'HYBRID', 'ONSITE'
    employment_type: str = "FULL_TIME"  # 'FULL_TIME', 'CONTRACT'
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    currency: str = "USD"
    source_url: str
    raw_description: str
    cleaned_description: Optional[str] = None


class JobOpportunityCreate(JobOpportunityBase):
    company_name: str
    company_domain: Optional[str] = None
    source_adapter: str = "manual"
    external_job_id: Optional[str] = None
    published_at: Optional[datetime] = None


class ManualJobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=250)
    company_name: str = Field(..., min_length=1, max_length=200)
    company_domain: Optional[str] = None
    location: str = Field(default="United States (Remote)")
    remote_type: str = Field(default="REMOTE")
    employment_type: str = Field(default="FULL_TIME")
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    currency: str = "USD"
    source_url: str = Field(..., min_length=5)
    raw_description: str = Field(..., min_length=10)


class JobStageUpdate(BaseModel):
    pipeline_stage: str = Field(..., example="QUALIFIED")


class JobSearchFilter(BaseModel):
    query: Optional[str] = None
    remote_only: Optional[bool] = None
    min_salary: Optional[float] = None
    pipeline_stage: Optional[str] = None
    limit: int = 50
    offset: int = 0


class JobOpportunityRead(JobOpportunityBase):
    id: uuid.UUID
    company_id: uuid.UUID
    company_name: Optional[str] = None
    company_domain: Optional[str] = None
    normalized_title: str
    source_adapter: str
    external_job_id: Optional[str] = None
    dedup_hash: str
    pipeline_stage: str
    discovered_at: datetime
    published_at: Optional[datetime] = None
    is_active: bool

    model_config = {"from_attributes": True}


class JobDiscoveryResult(BaseModel):
    discovered_count: int
    new_ingested_count: int
    duplicate_count: int
    sources_polled: List[str]
