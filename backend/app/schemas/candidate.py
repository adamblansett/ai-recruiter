import uuid
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ================= Skills =================
class CandidateSkillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., max_length=50, example="Backend")
    years_experience: float = Field(..., ge=0.0, le=50.0)
    proficiency_level: str = Field(default="EXPERT", example="EXPERT")
    is_primary: bool = False


class CandidateSkillCreate(CandidateSkillBase):
    pass


class CandidateSkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    years_experience: Optional[float] = None
    proficiency_level: Optional[str] = None
    is_primary: Optional[bool] = None


class CandidateSkillRead(CandidateSkillBase):
    id: uuid.UUID
    candidate_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ================= Experience =================
class CandidateExperienceBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=150)
    title: str = Field(..., min_length=1, max_length=150)
    location: Optional[str] = None
    is_current: bool = False
    start_date: date
    end_date: Optional[date] = None
    summary: str
    technologies_used: List[str] = Field(default_factory=list)
    accomplishments: List[str] = Field(default_factory=list)


class CandidateExperienceCreate(CandidateExperienceBase):
    pass


class CandidateExperienceRead(CandidateExperienceBase):
    id: uuid.UUID
    candidate_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ================= Education =================
class CandidateEducationBase(BaseModel):
    institution: str = Field(..., min_length=1, max_length=200)
    degree: str = Field(..., min_length=1, max_length=150)
    field_of_study: str = Field(..., min_length=1, max_length=150)
    graduation_year: Optional[int] = None


class CandidateEducationCreate(CandidateEducationBase):
    pass


class CandidateEducationRead(CandidateEducationBase):
    id: uuid.UUID
    candidate_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ================= Resume Summary =================
class ResumeSummaryRead(BaseModel):
    id: uuid.UUID
    label: str
    file_path: str
    file_hash: str
    file_size_bytes: int
    mime_type: str
    target_role_category: Optional[str] = None
    is_primary: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ================= Candidate Profile =================
class CandidateProfileBase(BaseModel):
    headline: str = Field(..., min_length=1, max_length=255)
    summary: str = Field(..., min_length=1)
    target_seniority: str = Field(..., example="Senior")
    location_base: str = Field(default="United States")
    remote_preference: str = Field(default="REMOTE_FIRST")
    employment_types: List[str] = Field(default_factory=lambda: ["FULL_TIME", "CONTRACT"])
    target_min_salary: Optional[int] = None
    preferred_currency: str = Field(default="USD", max_length=3)
    work_authorization_status: str = Field(default="US_CITIZEN")
    is_active: bool = True


class CandidateProfileCreate(CandidateProfileBase):
    user_id: Optional[uuid.UUID] = None


class CandidateProfileUpdate(BaseModel):
    headline: Optional[str] = None
    summary: Optional[str] = None
    target_seniority: Optional[str] = None
    location_base: Optional[str] = None
    remote_preference: Optional[str] = None
    employment_types: Optional[List[str]] = None
    target_min_salary: Optional[int] = None
    preferred_currency: Optional[str] = None
    work_authorization_status: Optional[str] = None
    is_active: Optional[bool] = None


class CandidateProfileRead(CandidateProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CandidateProfileDetailRead(CandidateProfileRead):
    skills: List[CandidateSkillRead] = Field(default_factory=list)
    experiences: List[CandidateExperienceRead] = Field(default_factory=list)
    educations: List[CandidateEducationRead] = Field(default_factory=list)
    resumes: List[ResumeSummaryRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}
