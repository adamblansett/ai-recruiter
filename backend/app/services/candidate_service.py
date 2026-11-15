import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.candidate import (
    CandidateEducation,
    CandidateExperience,
    CandidateProfile,
    CandidateSkill,
    Resume,
)
from app.models.user import User
from app.schemas.candidate import (
    CandidateEducationCreate,
    CandidateExperienceCreate,
    CandidateProfileCreate,
    CandidateProfileUpdate,
    CandidateSkillCreate,
    CandidateSkillUpdate,
)


class CandidateService:
    @staticmethod
    async def get_or_create_default_user(db: AsyncSession) -> User:
        result = await db.execute(select(User).limit(1))
        user = result.scalars().first()
        if not user:
            from app.core.security import get_password_hash
            user = User(
                email="adam.blansett@example.com",
                hashed_password=get_password_hash("LocalDevSecurePassword2026!"),
                full_name="Adam Blansett",
                is_active=True,
                is_superuser=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user

    @staticmethod
    async def get_active_profile(db: AsyncSession) -> Optional[CandidateProfile]:
        query = (
            select(CandidateProfile)
            .where(CandidateProfile.is_active == True)
            .options(
                selectinload(CandidateProfile.skills),
                selectinload(CandidateProfile.experiences),
                selectinload(CandidateProfile.educations),
                selectinload(CandidateProfile.resumes),
            )
            .limit(1)
        )
        result = await db.execute(query)
        return result.scalars().first()

    @staticmethod
    async def get_profile_by_id(db: AsyncSession, profile_id: uuid.UUID) -> Optional[CandidateProfile]:
        query = (
            select(CandidateProfile)
            .where(CandidateProfile.id == profile_id)
            .options(
                selectinload(CandidateProfile.skills),
                selectinload(CandidateProfile.experiences),
                selectinload(CandidateProfile.educations),
                selectinload(CandidateProfile.resumes),
            )
        )
        result = await db.execute(query)
        return result.scalars().first()

    @classmethod
    async def create_profile(cls, db: AsyncSession, data: CandidateProfileCreate) -> CandidateProfile:
        if not data.user_id:
            user = await cls.get_or_create_default_user(db)
            user_id = user.id
        else:
            user_id = data.user_id

        profile = CandidateProfile(
            user_id=user_id,
            headline=data.headline,
            summary=data.summary,
            target_seniority=data.target_seniority,
            location_base=data.location_base,
            remote_preference=data.remote_preference,
            employment_types=data.employment_types,
            target_min_salary=data.target_min_salary,
            preferred_currency=data.preferred_currency,
            work_authorization_status=data.work_authorization_status,
            is_active=data.is_active,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile

    @classmethod
    async def update_profile(
        cls, db: AsyncSession, profile_id: uuid.UUID, data: CandidateProfileUpdate
    ) -> Optional[CandidateProfile]:
        profile = await cls.get_profile_by_id(db, profile_id)
        if not profile:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(profile, field, value)

        await db.commit()
        await db.refresh(profile)
        return profile

    # ================= Skills Operations =================
    @staticmethod
    async def add_skill(
        db: AsyncSession, profile_id: uuid.UUID, data: CandidateSkillCreate
    ) -> CandidateSkill:
        skill = CandidateSkill(
            candidate_id=profile_id,
            name=data.name,
            category=data.category,
            years_experience=data.years_experience,
            proficiency_level=data.proficiency_level,
            is_primary=data.is_primary,
        )
        db.add(skill)
        await db.commit()
        await db.refresh(skill)
        return skill

    @staticmethod
    async def update_skill(
        db: AsyncSession, skill_id: uuid.UUID, data: CandidateSkillUpdate
    ) -> Optional[CandidateSkill]:
        result = await db.execute(select(CandidateSkill).where(CandidateSkill.id == skill_id))
        skill = result.scalars().first()
        if not skill:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(skill, field, value)

        await db.commit()
        await db.refresh(skill)
        return skill

    @staticmethod
    async def delete_skill(db: AsyncSession, skill_id: uuid.UUID) -> bool:
        result = await db.execute(select(CandidateSkill).where(CandidateSkill.id == skill_id))
        skill = result.scalars().first()
        if not skill:
            return False
        await db.delete(skill)
        await db.commit()
        return True

    # ================= Experience Operations =================
    @staticmethod
    async def add_experience(
        db: AsyncSession, profile_id: uuid.UUID, data: CandidateExperienceCreate
    ) -> CandidateExperience:
        experience = CandidateExperience(
            candidate_id=profile_id,
            company_name=data.company_name,
            title=data.title,
            location=data.location,
            is_current=data.is_current,
            start_date=data.start_date,
            end_date=data.end_date,
            summary=data.summary,
            technologies_used=data.technologies_used,
            accomplishments=data.accomplishments,
        )
        db.add(experience)
        await db.commit()
        await db.refresh(experience)
        return experience

    # ================= Education Operations =================
    @staticmethod
    async def add_education(
        db: AsyncSession, profile_id: uuid.UUID, data: CandidateEducationCreate
    ) -> CandidateEducation:
        education = CandidateEducation(
            candidate_id=profile_id,
            institution=data.institution,
            degree=data.degree,
            field_of_study=data.field_of_study,
            graduation_year=data.graduation_year,
        )
        db.add(education)
        await db.commit()
        await db.refresh(education)
        return education

    # ================= Seed Initial Profile =================
    @classmethod
    async def seed_initial_candidate(cls, db: AsyncSession) -> CandidateProfile:
        """Seeds Adam Blansett's configurable candidate profile without hardcoding in business logic."""
        existing = await cls.get_active_profile(db)
        if existing:
            return existing

        user = await cls.get_or_create_default_user(db)
        profile = CandidateProfile(
            user_id=user.id,
            headline="Staff / Senior Full-Stack & AI Systems Software Engineer",
            summary=(
                "Staff Software Engineer with 10+ years of high-impact engineering experience "
                "spanning full-stack architecture, backend API systems, AI and LLM integration, "
                "cross-platform application development, application security, and cloud infrastructure."
            ),
            target_seniority="Senior / Staff / Lead",
            location_base="United States",
            remote_preference="REMOTE_FIRST",
            employment_types=["FULL_TIME", "CONTRACT"],
            target_min_salary=180000,
            preferred_currency="USD",
            work_authorization_status="US_CITIZEN",
            is_active=True,
        )
        db.add(profile)
        await db.flush()

        # Seed Skills
        initial_skills = [
            ("Python", "Backend", 10.0, "EXPERT", True),
            ("TypeScript", "Frontend & Full-Stack", 8.0, "EXPERT", True),
            ("FastAPI & REST APIs", "Backend", 6.0, "EXPERT", True),
            ("AI & LLM Engineering", "AI_ML", 4.0, "EXPERT", True),
            ("Flutter & Cross-Platform", "Mobile_Frontend", 5.0, "ADVANCED", False),
            ("PostgreSQL & Database Design", "Database", 10.0, "EXPERT", True),
            ("Application Security & OAuth/JWT/IAM", "Security", 8.0, "EXPERT", True),
            ("AWS & Cloud Infrastructure", "Cloud", 7.0, "ADVANCED", True),
            ("Docker & Containerization", "DevOps", 8.0, "EXPERT", False),
            ("Vault & Secrets Governance", "Security", 5.0, "ADVANCED", False),
            ("Celery & Asynchronous Task Queues", "Backend", 6.0, "EXPERT", False),
            ("AI Evaluation & Model Routing", "AI_ML", 3.0, "EXPERT", True),
        ]
        for name, category, years, prof, is_prim in initial_skills:
            db.add(
                CandidateSkill(
                    candidate_id=profile.id,
                    name=name,
                    category=category,
                    years_experience=years,
                    proficiency_level=prof,
                    is_primary=is_prim,
                )
            )

        # Seed Sample Experience Summary
        db.add(
            CandidateExperience(
                candidate_id=profile.id,
                company_name="Senior Software Engineering Practice",
                title="Lead / Staff Software Engineer",
                location="United States (Remote)",
                is_current=True,
                start_date=date(2016, 1, 1),
                end_date=None,
                summary="Architected resilient backend APIs, distributed async queues, and AI evaluation systems.",
                technologies_used=["Python", "TypeScript", "FastAPI", "PostgreSQL", "Docker", "AWS"],
                accomplishments=[
                    "Engineered mission-critical backend microservices handling millions of operations",
                    "Architected secure OAuth 2.0 / SSO authentication and authorization systems",
                    "Integrated automated LLM workflows and evaluation pipelines",
                ],
            )
        )

        await db.commit()
        await db.refresh(profile)
        return await cls.get_profile_by_id(db, profile.id)  # type: ignore
