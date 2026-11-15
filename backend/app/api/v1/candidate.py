import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.candidate import (
    CandidateEducationCreate,
    CandidateEducationRead,
    CandidateExperienceCreate,
    CandidateExperienceRead,
    CandidateProfileCreate,
    CandidateProfileDetailRead,
    CandidateProfileRead,
    CandidateProfileUpdate,
    CandidateSkillCreate,
    CandidateSkillRead,
    CandidateSkillUpdate,
)
from app.services.candidate_service import CandidateService

router = APIRouter(tags=["Candidate Profile"])


@router.get("/profile", response_model=CandidateProfileDetailRead, summary="Get Active Candidate Profile")
async def get_active_candidate_profile(db: AsyncSession = Depends(get_db)):
    """Retrieve the primary active candidate profile with all skills and experiences."""
    profile = await CandidateService.get_active_profile(db)
    if not profile:
        # Automatically seed Adam Blansett's profile on initial query
        profile = await CandidateService.seed_initial_candidate(db)
    return profile


@router.post("/profile", response_model=CandidateProfileRead, status_code=status.HTTP_201_CREATED, summary="Create Candidate Profile")
async def create_candidate_profile(
    data: CandidateProfileCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new candidate profile."""
    return await CandidateService.create_profile(db, data)


@router.patch("/profile/{profile_id}", response_model=CandidateProfileRead, summary="Update Candidate Profile")
async def update_candidate_profile(
    profile_id: uuid.UUID,
    data: CandidateProfileUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update profile details (preferences, compensation, summary)."""
    updated = await CandidateService.update_profile(db, profile_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    return updated


# ================= Skills Endpoints =================
@router.post("/profile/{profile_id}/skills", response_model=CandidateSkillRead, status_code=status.HTTP_201_CREATED, summary="Add Skill to Profile")
async def add_candidate_skill(
    profile_id: uuid.UUID,
    data: CandidateSkillCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add a verified technical skill to the candidate's profile."""
    profile = await CandidateService.get_profile_by_id(db, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    return await CandidateService.add_skill(db, profile_id, data)


@router.patch("/skills/{skill_id}", response_model=CandidateSkillRead, summary="Update Skill")
async def update_candidate_skill(
    skill_id: uuid.UUID,
    data: CandidateSkillUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update skill proficiency or years of experience."""
    skill = await CandidateService.update_skill(db, skill_id, data)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Skill")
async def delete_candidate_skill(
    skill_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Remove a skill from the candidate profile."""
    success = await CandidateService.delete_skill(db, skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")


# ================= Experience Endpoints =================
@router.post("/profile/{profile_id}/experiences", response_model=CandidateExperienceRead, status_code=status.HTTP_201_CREATED, summary="Add Experience")
async def add_candidate_experience(
    profile_id: uuid.UUID,
    data: CandidateExperienceCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add verified employment history to the profile."""
    profile = await CandidateService.get_profile_by_id(db, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    return await CandidateService.add_experience(db, profile_id, data)


# ================= Education Endpoints =================
@router.post("/profile/{profile_id}/educations", response_model=CandidateEducationRead, status_code=status.HTTP_201_CREATED, summary="Add Education")
async def add_candidate_education(
    profile_id: uuid.UUID,
    data: CandidateEducationCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add education credentials to the candidate profile."""
    profile = await CandidateService.get_profile_by_id(db, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    return await CandidateService.add_education(db, profile_id, data)
