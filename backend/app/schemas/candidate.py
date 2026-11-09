import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class CandidateSkillBase(BaseModel):
    name: str
    category: str
    years_experience: float
    proficiency_level: str = "EXPERT"
    is_primary: bool = False


class CandidateSkillCreate(CandidateSkillBase):
    pass


class CandidateSkillRead(CandidateSkillBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}


class CandidateProfileBase(BaseModel):
    headline: str
    summary: str
    target_seniority: str
    location_base: str = "United States"
    remote_preference: str = "REMOTE_FIRST"
    employment_types: List[str] = Field(default_factory=lambda: ["FULL_TIME", "CONTRACT"])
    target_min_salary: Optional[int] = None
    preferred_currency: str = "USD"
    work_authorization_status: str = "US_CITIZEN"


class CandidateProfileCreate(CandidateProfileBase):
    pass


class CandidateProfileRead(CandidateProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_active: bool
    skills: List[CandidateSkillRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}
