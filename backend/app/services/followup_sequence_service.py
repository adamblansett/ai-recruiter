import datetime
import logging
import uuid
from typing import Dict, List, Optional
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.outreach import OutreachCampaign
from app.models.job import JobOpportunity
from app.models.recruiter import Recruiter

logger = logging.getLogger(__name__)


class FollowupRule(BaseModel):
    touchpoint_number: int
    days_after_previous: int
    name: str
    description: str
    focus: str


class GeneratedFollowup(BaseModel):
    id: str
    original_campaign_id: str
    touchpoint_number: int
    candidate_name: str
    recruiter_name: str
    recruiter_email: Optional[str]
    company_name: str
    job_title: str
    subject: str
    body_markdown: str
    scheduled_trigger_days: int
    status: str  # "AWAITING_APPROVAL"


class FollowupSequenceService:
    """
    Automated multi-touch cadence sequence engine.
    Crafts staged follow-ups (Touch 2: Day 4 Gentle Nudge, Touch 3: Day 9 Architectural Value-Add)
    strictly gated by human approval.
    """

    CADENCE_RULES = [
        FollowupRule(
            touchpoint_number=2,
            days_after_previous=4,
            name="Touch 2: Day 4 Gentle Nudge",
            description="Polite, concise bump referencing original intro and highlighting remote availability.",
            focus="Polite brevity & schedule inquiry",
        ),
        FollowupRule(
            touchpoint_number=3,
            days_after_previous=9,
            name="Touch 3: Day 9 Architectural Value-Add",
            description="Shares relevant distributed systems architectural insight and Google Calendar open slots.",
            focus="Technical depth & low-friction scheduling",
        ),
    ]

    @classmethod
    def get_cadence_rules(cls) -> List[FollowupRule]:
        return cls.CADENCE_RULES

    @classmethod
    async def evaluate_pending_followups(
        cls,
        db: AsyncSession,
        candidate_name: str = "Adam Blansett",
    ) -> List[GeneratedFollowup]:
        """
        Scans sent campaigns where no reply has been received and generates
        staged follow-up drafts awaiting affirmative human approval.
        """
        # Fetch sent outreach campaigns
        stmt = (
            select(OutreachCampaign)
            .where(OutreachCampaign.status == "SENT")
            .limit(20)
        )
        res = await db.execute(stmt)
        campaigns = res.scalars().all()

        followups: List[GeneratedFollowup] = []
        now = datetime.datetime.now(datetime.timezone.utc)

        for camp in campaigns:
            sent_at = camp.sent_at or camp.created_at
            if sent_at.tzinfo is None:
                sent_at = sent_at.replace(tzinfo=datetime.timezone.utc)
            days_elapsed = (now - sent_at).days

            # Touch 2: 4+ days elapsed
            if days_elapsed >= 4:
                recruiter_name = camp.recruiter.full_name if camp.recruiter else "Hiring Manager"
                rec_email = None
                if camp.recruiter and camp.recruiter.contacts:
                    rec_email = camp.recruiter.contacts[0].contact_value
                company = camp.job.company.name if camp.job and camp.job.company else "Target Company"
                title = camp.job.title if camp.job else "Staff Backend Engineer"

                # Generate Touch 2 or Touch 3 based on elapsed days
                touch = 3 if days_elapsed >= 9 else 2

                if touch == 2:
                    subject = f"Re: {camp.subject or f'{title} — {candidate_name}'}"
                    body = (
                        f"Hi {recruiter_name},\n\n"
                        f"Following up briefly on my note from last week regarding the {title} role at {company}. "
                        f"I know how busy engineering hiring cycles can be, so I wanted to check if you had a moment to review my background.\n\n"
                        f"With over a decade of production backend experience in Python, FastAPI, and distributed microservices, "
                        f"I would be glad to hop on a brief 15-minute call if this role is still an active priority.\n\n"
                        f"Best regards,\n"
                        f"**{candidate_name}**"
                    )
                else:
                    subject = f"Re: {camp.subject or f'{title} — {candidate_name}'} (Architecture Note)"
                    body = (
                        f"Hi {recruiter_name},\n\n"
                        f"I wanted to share one quick additional thought regarding {company}'s distributed infrastructure roadmap. "
                        f"In similar high-throughput architectures, I've seen teams face connection pool exhaustion and Kafka partition "
                        f"lag under flash write spikes — something I've mitigated through PgBouncer transaction-mode pooling and idempotent worker sharding.\n\n"
                        f"If you'd like to compare notes on your current engineering challenges, here are a few open windows this week:\n"
                        f"• Wednesday: 10:00 AM – 11:30 AM or 2:00 PM – 4:00 PM ET\n"
                        f"• Thursday: 11:00 AM – 1:00 PM or 3:30 PM – 5:00 PM ET\n\n"
                        f"Warmly,\n"
                        f"**{candidate_name}**"
                    )

                followups.append(
                    GeneratedFollowup(
                        id=f"fu-{camp.id[:8]}-t{touch}",
                        original_campaign_id=camp.id,
                        touchpoint_number=touch,
                        candidate_name=candidate_name,
                        recruiter_name=recruiter_name,
                        recruiter_email=rec_email,
                        company_name=company,
                        job_title=title,
                        subject=subject,
                        body_markdown=body,
                        scheduled_trigger_days=days_elapsed,
                        status="AWAITING_APPROVAL",
                    )
                )

        return followups
