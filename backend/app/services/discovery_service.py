import hashlib
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.adapters.jobs.base import JobSearchQuery, RawJobListing
from app.adapters.jobs.registry import job_adapter_registry
from app.models.company import Company
from app.models.job import JobOpportunity
from app.schemas.job import (
    JobDiscoveryResult,
    JobOpportunityRead,
    JobSearchFilter,
    ManualJobCreate,
)

logger = logging.getLogger(__name__)


class DiscoveryService:
    @staticmethod
    def compute_dedup_hash(company_name: str, title: str, description: str) -> str:
        """
        Compute an immutable SHA-256 deduplication hash based on
        normalized company, title, and sanitized description text.
        """
        norm_company = re.sub(r"[^a-zA-Z0-9]", "", company_name.lower())
        norm_title = re.sub(r"[^a-zA-Z0-9]", "", title.lower())
        # Canonicalize first 500 characters of description
        norm_desc = re.sub(r"\s+", " ", description.lower().strip())[:500]

        payload = f"{norm_company}:{norm_title}:{norm_desc}".encode("utf-8")
        return hashlib.sha256(payload).hexdigest()

    @classmethod
    async def get_or_create_company(
        cls, db: AsyncSession, name: str, domain: Optional[str] = None
    ) -> Company:
        norm_name = re.sub(r"[^a-zA-Z0-9]", "", name.lower())
        stmt = select(Company).where(
            or_(Company.normalized_name == norm_name, Company.name.ilike(name))
        )
        result = await db.execute(stmt)
        company = result.scalars().first()

        if not company:
            company = Company(
                name=name,
                normalized_name=norm_name,
                domain=domain or f"{norm_name}.com",
            )
            db.add(company)
            await db.flush()
        return company

    @classmethod
    async def ingest_raw_listing(
        cls, db: AsyncSession, listing: RawJobListing
    ) -> Tuple[Optional[JobOpportunity], bool]:
        """
        Ingest a raw job listing.
        Returns (JobOpportunity, is_new). If duplicate, returns (existing_job, False).
        """
        dedup_hash = cls.compute_dedup_hash(
            company_name=listing.company_name,
            title=listing.title,
            description=listing.raw_description,
        )

        # Check for existing duplicate
        existing_stmt = select(JobOpportunity).where(JobOpportunity.dedup_hash == dedup_hash)
        existing_res = await db.execute(existing_stmt)
        existing_job = existing_res.scalars().first()

        if existing_job:
            return existing_job, False

        # Resolve or create company
        company = await cls.get_or_create_company(
            db, name=listing.company_name, domain=listing.company_domain
        )

        cleaned_desc = re.sub(r"<[^>]+>", " ", listing.raw_description)
        cleaned_desc = re.sub(r"\s+", " ", cleaned_desc).strip()

        job = JobOpportunity(
            company_id=company.id,
            title=listing.title,
            normalized_title=listing.title.strip(),
            location=listing.location,
            remote_type=listing.remote_type,
            employment_type=listing.employment_type,
            min_salary=listing.min_salary,
            max_salary=listing.max_salary,
            currency=listing.currency,
            source_adapter=listing.source_adapter,
            external_job_id=listing.external_job_id,
            source_url=listing.source_url,
            raw_description=listing.raw_description,
            cleaned_description=cleaned_desc,
            dedup_hash=dedup_hash,
            pipeline_stage="DISCOVERED",
            discovered_at=datetime.now(timezone.utc),
            published_at=listing.published_at or datetime.now(timezone.utc),
            is_active=True,
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)
        return job, True

    @classmethod
    async def run_discovery(
        cls, db: AsyncSession, query: Optional[JobSearchQuery] = None
    ) -> JobDiscoveryResult:
        """Run discovery across all registered adapters and persist new opportunities."""
        q = query or JobSearchQuery()
        adapters = job_adapter_registry.get_all_adapters()

        total_discovered = 0
        total_ingested = 0
        total_duplicates = 0
        sources_polled: List[str] = []

        for adapter in adapters:
            sources_polled.append(adapter.source_name)
            try:
                listings = await adapter.fetch_jobs(q)
                total_discovered += len(listings)
                for item in listings:
                    _, is_new = await cls.ingest_raw_listing(db, item)
                    if is_new:
                        total_ingested += 1
                    else:
                        total_duplicates += 1
            except Exception as e:
                logger.error(f"Error fetching from adapter '{adapter.source_name}': {e}")

        return JobDiscoveryResult(
            discovered_count=total_discovered,
            new_ingested_count=total_ingested,
            duplicate_count=total_duplicates,
            sources_polled=sources_polled,
        )

    @classmethod
    async def ingest_manual_job(cls, db: AsyncSession, data: ManualJobCreate) -> JobOpportunity:
        """Ingest a manual job posting submitted by the user."""
        raw_listing = RawJobListing(
            title=data.title,
            company_name=data.company_name,
            company_domain=data.company_domain,
            location=data.location,
            remote_type=data.remote_type,
            employment_type=data.employment_type,
            min_salary=data.min_salary,
            max_salary=data.max_salary,
            currency=data.currency,
            source_adapter="manual",
            source_url=data.source_url,
            raw_description=data.raw_description,
            published_at=datetime.now(timezone.utc),
        )
        job, _ = await cls.ingest_raw_listing(db, raw_listing)
        return job

    @staticmethod
    async def list_opportunities(
        db: AsyncSession, filters: JobSearchFilter
    ) -> List[JobOpportunity]:
        stmt = (
            select(JobOpportunity)
            .options(selectinload(JobOpportunity.company))
            .where(JobOpportunity.is_active == True)
        )

        if filters.remote_only:
            stmt = stmt.where(JobOpportunity.remote_type == "REMOTE")
        if filters.min_salary is not None:
            stmt = stmt.where(JobOpportunity.min_salary >= filters.min_salary)
        if filters.pipeline_stage:
            stmt = stmt.where(JobOpportunity.pipeline_stage == filters.pipeline_stage)
        if filters.query:
            term = f"%{filters.query}%"
            stmt = stmt.where(
                or_(
                    JobOpportunity.title.ilike(term),
                    JobOpportunity.cleaned_description.ilike(term),
                )
            )

        stmt = stmt.order_by(JobOpportunity.discovered_at.desc())
        stmt = stmt.limit(filters.limit).offset(filters.offset)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_job_by_id(db: AsyncSession, job_id: uuid.UUID) -> Optional[JobOpportunity]:
        stmt = (
            select(JobOpportunity)
            .options(selectinload(JobOpportunity.company))
            .where(JobOpportunity.id == job_id)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def update_stage(
        db: AsyncSession, job_id: uuid.UUID, new_stage: str
    ) -> Optional[JobOpportunity]:
        stmt = (
            select(JobOpportunity)
            .options(selectinload(JobOpportunity.company))
            .where(JobOpportunity.id == job_id)
        )
        result = await db.execute(stmt)
        job = result.scalars().first()
        if not job:
            return None

        job.pipeline_stage = new_stage
        await db.commit()
        await db.refresh(job)
        return job
