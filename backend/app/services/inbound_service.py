import logging
import re
import uuid
from datetime import datetime, timezone
from typing import List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import JobOpportunity
from app.models.outreach import Communication, OutreachDraft
from app.models.recruiter import Recruiter
from app.schemas.outreach import InboundClassificationResult, InboundMessagePayload

logger = logging.getLogger(__name__)

CALENDAR_LINK_REGEX = re.compile(
    r"https?://(?:[a-zA-Z0-9-]+\.)?(?:calendly\.com|calendar\.google\.com|hubspot\.com/meetings|chilipiper\.com|savvycal\.com|zoom\.us/j/[0-9]+)[^\s>\"')]*",
    re.IGNORECASE,
)


class InboundClassificationService:
    """
    Intelligent processor for incoming recruiter communications.
    Performs AI intent classification, calendar scheduling link extraction,
    and automatic reply draft generation with candidate availability.
    """

    @classmethod
    def extract_calendar_links(cls, text: str) -> List[str]:
        """Extract booking and video links (Calendly, Google Meet, Chili Piper, Zoom)."""
        return list(set(CALENDAR_LINK_REGEX.findall(text)))

    @classmethod
    def classify_intent_heuristics(cls, text: str) -> Tuple[str, str, str]:
        """
        Heuristic classification fallback for offline/test environments.
        Returns (intent, sentiment, recommended_stage).
        """
        text_lower = text.lower()

        # Rejection Triggers
        rejection_signals = [
            "unfortunately",
            "not moving forward",
            "other candidates",
            "pursuing other",
            "keep your resume on file",
            "not selected",
            "decided to move in a different direction",
        ]
        if any(sig in text_lower for sig in rejection_signals):
            return "REJECTION", "NEGATIVE", "REJECTED"

        # Interview & Screen Triggers
        interview_signals = [
            "interview",
            "phone screen",
            "chat with our team",
            "availability",
            "schedule a call",
            "quick call",
            "time to speak",
            "calendly",
            "next steps",
            "love to connect",
            "discuss the role",
        ]
        if any(sig in text_lower for sig in interview_signals):
            return "INTERVIEW_REQUEST", "POSITIVE", "SCREENING"

        # Information Request Triggers
        info_signals = [
            "salary expectation",
            "compensation",
            "rate",
            "visa",
            "sponsorship",
            "work authorization",
            "notice period",
            "start date",
        ]
        if any(sig in text_lower for sig in info_signals):
            return "INFORMATION_REQUEST", "NEUTRAL", "INTERESTED"

        return "GENERAL_INQUIRY", "NEUTRAL", "REPLIED"

    @classmethod
    def generate_suggested_reply(
        cls,
        intent: str,
        recruiter_name: str,
        job_title: str,
        calendar_links: List[str],
    ) -> str:
        """Generates a professional response draft tailored to the recruiter's message."""
        greeting = f"Hi {recruiter_name}," if recruiter_name and recruiter_name != "Recruiter" else "Hello,"

        if intent == "INTERVIEW_REQUEST":
            if calendar_links:
                return (
                    f"{greeting}\n\n"
                    f"Thank you for following up regarding the {job_title} opportunity! I would be delighted to speak with your team.\n\n"
                    f"I have received your scheduling link ({calendar_links[0]}) and will find a convenient time slot right away.\n\n"
                    f"Looking forward to our conversation.\n\n"
                    f"Best regards,\nAdam Blansett"
                )
            else:
                return (
                    f"{greeting}\n\n"
                    f"Thank you for the update on the {job_title} opportunity. I would be very interested in connecting for a conversation.\n\n"
                    f"I am generally available this week on Tuesday and Thursday afternoon (1:00 PM - 5:00 PM EST), "
                    f"or Friday morning (10:00 AM - 1:00 PM EST). If another time works better for your team, please let me know and I will gladly accommodate.\n\n"
                    f"Best regards,\nAdam Blansett"
                )

        elif intent == "INFORMATION_REQUEST":
            return (
                f"{greeting}\n\n"
                f"Thank you for checking in regarding the {job_title} role.\n\n"
                f"To answer your questions:\n"
                f"- Work Authorization: US Citizen (no sponsorship required).\n"
                f"- Compensation Target: Target base salary starting at $185,000+ USD (open to negotiation depending on overall total package and equity).\n"
                f"- Location: Remote-first (US).\n\n"
                f"Please let me know if you need any additional details, and I look forward to next steps.\n\n"
                f"Best regards,\nAdam Blansett"
            )

        elif intent == "REJECTION":
            return (
                f"{greeting}\n\n"
                f"Thank you for letting me know. I appreciate your team's time and consideration for the {job_title} role.\n\n"
                f"I will keep an eye out for future opportunities that align well with my engineering background.\n\n"
                f"Wishing you and the team all the best.\n\n"
                f"Best regards,\nAdam Blansett"
            )

        return (
            f"{greeting}\n\n"
            f"Thank you for your response regarding the {job_title} opportunity. Please let me know when you would like to connect.\n\n"
            f"Best regards,\nAdam Blansett"
        )

    @classmethod
    async def process_inbound_message(
        cls,
        db: AsyncSession,
        payload: InboundMessagePayload,
    ) -> InboundClassificationResult:
        """
        Ingests, classifies, extracts calendar links, updates pipeline stage,
        and saves communication record.
        """
        # 1. Extract Calendar Links
        calendar_links = cls.extract_calendar_links(payload.body_text)

        # 2. Intent Classification
        intent, sentiment, rec_stage = cls.classify_intent_heuristics(payload.body_text)

        # 3. Resolve Outreach Draft & Job context if present
        outreach: OutreachDraft | None = None
        job: JobOpportunity | None = None
        recruiter_name = "Recruiter"
        job_title = "Engineering Opportunity"

        if payload.outreach_id:
            res = await db.execute(select(OutreachDraft).where(OutreachDraft.id == payload.outreach_id))
            outreach = res.scalars().first()

        if not outreach and payload.sender_email:
            # Find recruiter by email
            rec_res = await db.execute(
                select(Recruiter).where(Recruiter.email == payload.sender_email)
            )
            recruiter = rec_res.scalars().first()
            if recruiter:
                recruiter_name = recruiter.name
                # Find most recent outreach
                stmt_o = (
                    select(OutreachDraft)
                    .where(OutreachDraft.recruiter_id == recruiter.id)
                    .order_by(OutreachDraft.created_at.desc())
                )
                o_res = await db.execute(stmt_o)
                outreach = o_res.scalars().first()

        if outreach:
            j_res = await db.execute(select(JobOpportunity).where(JobOpportunity.id == outreach.job_id))
            job = j_res.scalars().first()
            if job:
                job_title = job.title
                # Transition job pipeline stage
                job.pipeline_stage = rec_stage
                db.add(job)

        # 4. Generate AI Suggested Reply Draft
        suggested_reply = cls.generate_suggested_reply(
            intent=intent,
            recruiter_name=recruiter_name,
            job_title=job_title,
            calendar_links=calendar_links,
        )

        # 5. Persist Communication Record
        ext_msg_id = payload.external_message_id or f"inbound_{uuid.uuid4().hex[:12]}"
        ext_thread_id = (
            payload.external_thread_id
            or (outreach.external_thread_id if outreach else f"thread_{uuid.uuid4().hex[:12]}")
        )

        comm = Communication(
            outreach_id=outreach.id if outreach else None,
            external_thread_id=ext_thread_id,
            external_message_id=ext_msg_id,
            direction="INBOUND",
            sender_address=payload.sender_email,
            recipient_address=payload.recipient_email,
            subject=payload.subject,
            body_text=payload.body_text,
            received_at=datetime.now(timezone.utc),
            classification_intent=intent,
            sentiment=sentiment,
            raw_payload_json={
                "calendar_links": calendar_links,
                "suggested_reply": suggested_reply,
                "recommended_stage": rec_stage,
            },
        )
        db.add(comm)
        await db.commit()
        await db.refresh(comm)

        logger.info(
            f"Processed inbound recruiter email from {payload.sender_email} -> Intent: {intent}, Stage: {rec_stage}"
        )

        return InboundClassificationResult(
            communication_id=comm.id,
            intent=intent,
            sentiment=sentiment,
            has_calendar_link=len(calendar_links) > 0,
            calendar_links=calendar_links,
            suggested_reply_markdown=suggested_reply,
            recommended_pipeline_stage=rec_stage,
            received_at=comm.received_at,
        )
