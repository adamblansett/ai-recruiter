import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.job import JobOpportunity
from app.models.outreach import Communication, OutreachDraft
from app.models.recruiter import Recruiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["Analytics & Funnel"])


class FunnelStageCount(BaseModel):
    stage: str
    count: int
    label: str


class AnalyticsSummary(BaseModel):
    total_jobs: int
    qualified_jobs: int
    emails_awaiting_approval: int
    emails_sent: int
    responses_received: int
    response_rate_percent: float
    interviews_scheduled: int
    offers_received: int
    avg_target_salary: Optional[float] = None


class PendingFollowupItem(BaseModel):
    outreach_id: str
    company_name: str
    job_title: str
    recruiter_name: str
    recruiter_email: Optional[str]
    sent_at: str
    days_since_sent: int


class FunnelAnalyticsResponse(BaseModel):
    summary: AnalyticsSummary
    funnel_stages: List[FunnelStageCount]
    pending_followups: List[PendingFollowupItem]


@router.get("/funnel", response_model=FunnelAnalyticsResponse, summary="Get Recruitment Funnel & Performance Metrics")
async def get_recruitment_funnel(db: AsyncSession = Depends(get_db)):
    """Computes end-to-end opportunity funnel conversion rates, outreach response metrics, and follow-up alerts."""
    
    # 1. Total jobs count
    total_jobs_res = await db.execute(select(func.count(JobOpportunity.id)))
    total_jobs = total_jobs_res.scalar() or 0

    # 2. Stage distribution
    stmt_stages = select(JobOpportunity.pipeline_stage, func.count(JobOpportunity.id)).group_by(JobOpportunity.pipeline_stage)
    stages_res = await db.execute(stmt_stages)
    stage_map = {row[0]: row[1] for row in stages_res.all()}

    # 3. Outreach metrics
    drafts_awaiting_res = await db.execute(
        select(func.count(OutreachDraft.id)).where(OutreachDraft.status == "AWAITING_APPROVAL")
    )
    emails_awaiting = drafts_awaiting_res.scalar() or 0

    drafts_sent_res = await db.execute(
        select(func.count(OutreachDraft.id)).where(OutreachDraft.status == "SENT")
    )
    emails_sent = drafts_sent_res.scalar() or 0

    # 4. Inbound replies count
    inbound_res = await db.execute(
        select(func.count(Communication.id)).where(Communication.direction == "INBOUND")
    )
    inbound_count = inbound_res.scalar() or 0

    response_rate = round((inbound_count / emails_sent * 100.0), 1) if emails_sent > 0 else 0.0

    # 5. Salary stats
    salary_res = await db.execute(
        select(func.avg(JobOpportunity.min_salary)).where(JobOpportunity.min_salary.isnot(None))
    )
    avg_salary_val = salary_res.scalar()
    avg_salary = round(float(avg_salary_val), 0) if avg_salary_val else 190000.0

    # Pipeline stages in logical progression
    canonical_stages = [
        ("DISCOVERED", "Discovered"),
        ("EVALUATED", "AI Evaluated"),
        ("QUALIFIED", "Qualified"),
        ("RECRUITER_IDENTIFIED", "Recruiter Found"),
        ("CONTACT_VERIFIED", "Contact Verified"),
        ("OUTREACH_DRAFTED", "Outreach Drafted"),
        ("AWAITING_APPROVAL", "Pending Approval"),
        ("SENT", "Outreach Sent"),
        ("REPLIED", "Replied"),
        ("SCREENING", "Phone Screen"),
        ("INTERVIEW", "Interview"),
        ("OFFER", "Offer Received"),
        ("HIRED", "Hired"),
        ("REJECTED", "Rejected"),
    ]

    funnel_stages = [
        FunnelStageCount(stage=key, count=stage_map.get(key, 0), label=label)
        for key, label in canonical_stages
    ]

    # Qualified count (Qualified + all subsequent positive stages)
    qualified_count = sum(
        stage_map.get(k, 0)
        for k in ["QUALIFIED", "RECRUITER_IDENTIFIED", "CONTACT_VERIFIED", "OUTREACH_DRAFTED", "AWAITING_APPROVAL", "SENT", "REPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"]
    )

    interviews_count = stage_map.get("SCREENING", 0) + stage_map.get("INTERVIEW", 0)
    offers_count = stage_map.get("OFFER", 0)

    # 6. Pending follow-ups (sent > 5 days ago)
    threshold_date = datetime.now(timezone.utc) - timedelta(days=5)
    stmt_followup = (
        select(OutreachDraft)
        .where(OutreachDraft.status == "SENT", OutreachDraft.sent_at <= threshold_date)
        .order_by(OutreachDraft.sent_at.asc())
        .limit(10)
    )
    followup_res = await db.execute(stmt_followup)
    followups_raw = followup_res.scalars().all()

    followup_items = []
    for d in followups_raw:
        days = (datetime.now(timezone.utc) - (d.sent_at or datetime.now(timezone.utc))).days
        followup_items.append(
            PendingFollowupItem(
                outreach_id=str(d.id),
                company_name=d.job.company.name if d.job and d.job.company else "Tech Company",
                job_title=d.job.title if d.job else "Software Engineer",
                recruiter_name=d.recruiter.full_name if d.recruiter else "Recruiter",
                recruiter_email=d.recruiter.email if d.recruiter else None,
                sent_at=d.sent_at.isoformat() if d.sent_at else "",
                days_since_sent=days,
            )
        )

    summary = AnalyticsSummary(
        total_jobs=total_jobs,
        qualified_jobs=qualified_count,
        emails_awaiting_approval=emails_awaiting,
        emails_sent=emails_sent,
        responses_received=inbound_count,
        response_rate_percent=response_rate,
        interviews_scheduled=interviews_count,
        offers_received=offers_count,
        avg_target_salary=avg_salary,
    )

    return FunnelAnalyticsResponse(
        summary=summary,
        funnel_stages=funnel_stages,
        pending_followups=followup_items,
    )
