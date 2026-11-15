import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.adapters.recruiters import default_recruiter_adapter, RecruiterSearchQuery
from app.models.company import Company
from app.models.job import JobOpportunity
from app.models.recruiter import Recruiter, RecruiterContact, RecruiterJobAssociation
from app.schemas.recruiter import RecruiterContactCreate, RecruiterCreate
from app.services.discovery_service import DiscoveryService

logger = logging.getLogger(__name__)


class RecruiterService:
    @classmethod
    async def create_recruiter(
        cls, db: AsyncSession, data: RecruiterCreate
    ) -> Recruiter:
        company_id = data.company_id
        if not company_id and data.company_name:
            company = await DiscoveryService.get_or_create_company(
                db, name=data.company_name, domain=data.company_domain
            )
            company_id = company.id

        recruiter = Recruiter(
            company_id=company_id,
            full_name=data.full_name,
            title=data.title,
            recruiter_type=data.recruiter_type,
            linkedin_url=data.linkedin_url,
            public_profile_url=data.public_profile_url,
            source_of_discovery=data.source_of_discovery,
            notes=data.notes,
        )
        db.add(recruiter)
        await db.flush()

        # If an initial email was provided, run verification pipeline
        if data.initial_email:
            domain = data.company_domain
            await cls.add_and_verify_contact(
                db=db,
                recruiter_id=recruiter.id,
                contact_type="EMAIL",
                contact_value=data.initial_email,
                domain=domain,
            )

        await db.commit()
        await db.refresh(recruiter)
        return await cls.get_recruiter_by_id(db, recruiter.id)  # type: ignore

    @classmethod
    async def add_and_verify_contact(
        cls,
        db: AsyncSession,
        recruiter_id: uuid.UUID,
        contact_type: str,
        contact_value: str,
        domain: Optional[str] = None,
    ) -> RecruiterContact:
        """
        Add a contact to a recruiter and execute verification pipeline.
        Never marks verified without authoritative DNS MX or evidence.
        """
        # Run verification check
        if contact_type.upper() == "EMAIL":
            verif = await default_recruiter_adapter.verify_contact(contact_value, domain)
            is_verified = verif.is_verified
            confidence = verif.confidence_score
            method = verif.verification_method
            evidence = verif.evidence
        else:
            is_verified = False
            confidence = 0.50
            method = "FORMAT_CHECK_ONLY"
            evidence = {}

        # Check existing contact
        stmt = select(RecruiterContact).where(
            RecruiterContact.recruiter_id == recruiter_id,
            RecruiterContact.contact_value == contact_value,
        )
        res = await db.execute(stmt)
        existing = res.scalars().first()

        if existing:
            existing.is_verified = is_verified
            existing.confidence_score = confidence
            existing.verification_method = method
            existing.verification_evidence = evidence
            if is_verified:
                existing.verified_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(existing)
            return existing

        contact = RecruiterContact(
            recruiter_id=recruiter_id,
            contact_type=contact_type.upper(),
            contact_value=contact_value,
            is_verified=is_verified,
            verification_method=method,
            confidence_score=confidence,
            verification_evidence=evidence,
            verified_at=datetime.now(timezone.utc) if is_verified else None,
        )
        db.add(contact)
        await db.commit()
        await db.refresh(contact)
        return contact

    @staticmethod
    async def associate_recruiter_with_job(
        db: AsyncSession,
        recruiter_id: uuid.UUID,
        job_id: uuid.UUID,
        association_type: str = "PRIMARY_RECRUITER",
    ) -> RecruiterJobAssociation:
        stmt = select(RecruiterJobAssociation).where(
            RecruiterJobAssociation.recruiter_id == recruiter_id,
            RecruiterJobAssociation.job_id == job_id,
        )
        res = await db.execute(stmt)
        assoc = res.scalars().first()
        if assoc:
            return assoc

        new_assoc = RecruiterJobAssociation(
            recruiter_id=recruiter_id,
            job_id=job_id,
            association_type=association_type,
        )
        db.add(new_assoc)

        # Advance job stage to RECRUITER_IDENTIFIED if it was in earlier stages
        job_stmt = select(JobOpportunity).where(JobOpportunity.id == job_id)
        job_res = await db.execute(job_stmt)
        job = job_res.scalars().first()
        if job and job.pipeline_stage in ["DISCOVERED", "EVALUATED", "QUALIFIED"]:
            job.pipeline_stage = "RECRUITER_IDENTIFIED"

        await db.commit()
        await db.refresh(new_assoc)
        return new_assoc

    @staticmethod
    async def get_recruiter_by_id(
        db: AsyncSession, recruiter_id: uuid.UUID
    ) -> Optional[Recruiter]:
        stmt = (
            select(Recruiter)
            .options(
                selectinload(Recruiter.company),
                selectinload(Recruiter.contacts),
                selectinload(Recruiter.job_associations),
            )
            .where(Recruiter.id == recruiter_id)
        )
        res = await db.execute(stmt)
        return res.scalars().first()

    @staticmethod
    async def list_recruiters(
        db: AsyncSession,
        query: Optional[str] = None,
        company_id: Optional[uuid.UUID] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Recruiter]:
        stmt = (
            select(Recruiter)
            .options(
                selectinload(Recruiter.company),
                selectinload(Recruiter.contacts),
            )
        )
        if company_id:
            stmt = stmt.where(Recruiter.company_id == company_id)
        if query:
            term = f"%{query}%"
            stmt = stmt.where(
                or_(Recruiter.full_name.ilike(term), Recruiter.title.ilike(term))
            )

        stmt = stmt.order_by(Recruiter.created_at.desc()).limit(limit).offset(offset)
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def get_recruiters_for_job(
        db: AsyncSession, job_id: uuid.UUID
    ) -> List[Recruiter]:
        stmt = (
            select(Recruiter)
            .join(RecruiterJobAssociation, Recruiter.id == RecruiterJobAssociation.recruiter_id)
            .options(
                selectinload(Recruiter.company),
                selectinload(Recruiter.contacts),
            )
            .where(RecruiterJobAssociation.job_id == job_id)
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @classmethod
    async def discover_company_recruiters(
        cls,
        db: AsyncSession,
        company_name: str,
        company_domain: Optional[str] = None,
        job_id: Optional[uuid.UUID] = None,
        limit: int = 5,
    ) -> List[Recruiter]:
        """
        Discover contacts associated with a company, verify contacts, and optionally associate with a job.
        """
        company = await DiscoveryService.get_or_create_company(
            db, name=company_name, domain=company_domain
        )
        q = RecruiterSearchQuery(
            company_name=company.name,
            company_domain=company.domain,
            limit=limit,
        )

        raw_contacts = await default_recruiter_adapter.discover_recruiters(q)
        saved_recruiters: List[Recruiter] = []

        for rc in raw_contacts:
            recruiter = await cls.create_recruiter(
                db,
                RecruiterCreate(
                    company_id=company.id,
                    company_name=company.name,
                    company_domain=company.domain,
                    full_name=rc.full_name,
                    title=rc.title,
                    recruiter_type=rc.recruiter_type,
                    linkedin_url=rc.linkedin_url,
                    public_profile_url=rc.public_profile_url,
                    source_of_discovery=rc.source_of_discovery,
                    notes=rc.notes,
                    initial_email=rc.suggested_email,
                ),
            )
            if job_id:
                await cls.associate_recruiter_with_job(db, recruiter.id, job_id)
            saved_recruiters.append(recruiter)

        return saved_recruiters
