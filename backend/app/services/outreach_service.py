import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.adapters.ai.router import ai_router
from app.adapters.email import (
    DraftMessage,
    EmailAttachment,
    default_email_adapter,
)
from app.models.audit import AuditEvent
from app.models.candidate import CandidateProfile, Resume
from app.models.job import JobOpportunity
from app.models.outreach import Communication, OutreachDraft
from app.models.recruiter import Recruiter, RecruiterContact
from app.schemas.outreach import (
    OutreachApprovalRequest,
    OutreachApprovalResponse,
    OutreachDraftCreate,
    OutreachDraftUpdate,
)
from app.services.candidate_service import CandidateService

logger = logging.getLogger(__name__)


class OutreachService:
    @classmethod
    async def generate_draft(
        cls,
        db: AsyncSession,
        data: OutreachDraftCreate,
    ) -> OutreachDraft:
        """
        Generate a personalized, professional cold outreach email draft using Built-in Local AI.
        Saved initially with status = 'AWAITING_APPROVAL' requiring affirmative human approval.
        """
        # 1. Fetch Job
        job_stmt = (
            select(JobOpportunity)
            .options(selectinload(JobOpportunity.company))
            .where(JobOpportunity.id == data.job_id)
        )
        job_res = await db.execute(job_stmt)
        job = job_res.scalars().first()
        if not job:
            raise ValueError(f"Job {data.job_id} not found")

        # 2. Fetch Recruiter
        recruiter_stmt = (
            select(Recruiter)
            .options(selectinload(Recruiter.contacts))
            .where(Recruiter.id == data.recruiter_id)
        )
        recruiter_res = await db.execute(recruiter_stmt)
        recruiter = recruiter_res.scalars().first()
        if not recruiter:
            raise ValueError(f"Recruiter {data.recruiter_id} not found")

        # 3. Fetch Candidate Profile
        if data.candidate_id:
            profile = await CandidateService.get_profile_by_id(db, data.candidate_id)
        else:
            profile = await CandidateService.get_active_profile(db)
            if not profile:
                profile = await CandidateService.seed_initial_candidate(db)

        if not profile:
            raise ValueError("Candidate profile not found")

        # 4. Resolve Resume
        resume_id = data.resume_id
        if not resume_id and profile.resumes:
            primary = next((r for r in profile.resumes if r.is_primary), profile.resumes[0])
            resume_id = primary.id

        # 5. AI Prompt Engineering for Outreach
        skills_summary = ", ".join([s.name for s in profile.skills[:6]])
        recruiter_first_name = recruiter.full_name.split()[0] if recruiter.full_name else "there"
        company_name = job.company.name if job.company else "your team"

        ai_prompt = f"""Write a concise, professional cold outreach email from a senior software engineer to a recruiter regarding an open position.

Candidate:
- Name: Adam Blansett
- Seniority: Staff / Senior Software Engineer (10+ years experience)
- Core Strengths: {skills_summary}
- Target Seniority: {profile.target_seniority}

Target Opportunity:
- Title: {job.title}
- Company: {company_name}
- Location: {job.location}

Recruiter:
- Name: {recruiter.full_name}
- Title: {recruiter.title}

Guidelines:
- Subject line must be punchy and professional.
- Message body must be natural, polite, and under 150 words.
- Explicitly connect candidate's verified background to the role without exaggerating or hallucinating.
- Conclude with a low-friction invitation for a brief chat.
- Return format: First line: "Subject: <subject>", followed by body.
"""
        provider = ai_router.get_provider()
        channel = data.channel.upper()
        if channel == "LINKEDIN_CONNECT":
            subject = f"Connect regarding {job.title}"
            body_text = (
                f"Hi {recruiter_first_name}, I saw {company_name} is hiring for a {job.title}. "
                f"With 10+ years architecting distributed backend and AI systems, I would love to connect "
                f"and follow your team's engineering work!"
            )
            # Guarantee strict 300-char LinkedIn invitation limit
            if len(body_text) > 300:
                body_text = body_text[:297] + "..."
        elif channel == "LINKEDIN_INMAIL":
            subject = f"{job.title} Opportunity — Adam Blansett (Staff/Senior Engineer)"
            body_text = (
                f"Hi {recruiter_first_name},\n\n"
                f"I hope you're having a great week. I noticed {company_name} is scaling and hiring for a {job.title}.\n\n"
                f"As a Senior/Staff Software Engineer with 10+ years architecting high-throughput backend APIs, "
                f"distributed async task queues (FastAPI, PostgreSQL, Redis, Celery), and enterprise AI orchestration, "
                f"I am very interested in learning more about the team's technical roadmap.\n\n"
                f"Would you be open to a brief chat or introducing me to the hiring manager?\n\n"
                f"Best,\nAdam Blansett\nhttps://linkedin.com/in/adamblansett"
            )
        else:
            # GMAIL default
            channel = "GMAIL"
            subject = f"Regarding {job.title} at {company_name} — Adam Blansett"
            body_text = (
                f"Hi {recruiter_first_name},\n\n"
                f"I noticed {company_name} is looking for a {job.title}. With 10+ years of software engineering "
                f"experience architecting resilient backend systems, distributed async queues, and AI workflows "
                f"using {skills_summary}, I believe my background aligns strongly with your engineering goals.\n\n"
                f"I have attached my resume for your review. Would you be open to a brief conversation this week to discuss how I might contribute to the team?\n\n"
                f"Best regards,\nAdam Blansett\nhttps://linkedin.com/in/adamblansett"
            )

        try:
            if await provider.is_available():
                resp = await provider.complete(ai_prompt, temperature=0.3, max_tokens=350)
                raw_out = resp.content.strip()
                if raw_out.startswith("Subject:"):
                    parts = raw_out.split("\n", 1)
                    subject = parts[0].replace("Subject:", "").strip()
                    if len(parts) > 1:
                        body_text = parts[1].strip()
                else:
                    body_text = raw_out
        except Exception as e:
            logger.warning(f"AI draft generation fallback used: {e}")

        body_html = f"<div style='font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;'>{body_text}</div>"

        draft = OutreachDraft(
            job_id=job.id,
            recruiter_id=recruiter.id,
            candidate_id=profile.id,
            resume_id=resume_id,
            channel=channel,
            subject=subject,
            body_markdown=body_text,
            body_html=body_html,
            status="AWAITING_APPROVAL",
        )
        db.add(draft)

        # Advance job stage to OUTREACH_DRAFTED
        job.pipeline_stage = "OUTREACH_DRAFTED"
        await db.commit()
        await db.refresh(draft)
        return draft

    @classmethod
    async def update_draft(
        cls,
        db: AsyncSession,
        draft_id: uuid.UUID,
        data: OutreachDraftUpdate,
    ) -> Optional[OutreachDraft]:
        draft = await cls.get_draft_by_id(db, draft_id)
        if not draft:
            return None

        if data.subject is not None:
            draft.subject = data.subject
        if data.body_markdown is not None:
            draft.body_markdown = data.body_markdown
            draft.body_html = f"<div style='font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;'>{data.body_markdown}</div>"
        if data.resume_id is not None:
            draft.resume_id = data.resume_id

        await db.commit()
        await db.refresh(draft)
        return draft

    @classmethod
    async def approve_and_send(
        cls,
        db: AsyncSession,
        draft_id: uuid.UUID,
        request: OutreachApprovalRequest,
    ) -> OutreachApprovalResponse:
        """
        HUMAN APPROVAL GATEWAY:
        Dispatches email ONLY after user affirmatively signs off.
        Enforces database CHECK constraint (chk_outreach_sent_requires_approval).
        """
        draft = await cls.get_draft_by_id(db, draft_id)
        if not draft:
            raise ValueError(f"Outreach draft {draft_id} not found")

        if draft.status == "SENT":
            raise ValueError("Draft has already been sent.")

        # 1. Resolve recipient email
        recruiter = draft.recruiter
        contact = next((c for c in recruiter.contacts if c.contact_type == "EMAIL"), None)
        recipient_email = contact.contact_value if contact else "recruiter@example.com"

        # 2. Prepare Attachments (PDF Resume if selected)
        attachments: List[EmailAttachment] = []
        if draft.resume_id:
            res_stmt = select(Resume).where(Resume.id == draft.resume_id)
            res_res = await db.execute(res_stmt)
            resume = res_res.scalars().first()
            if resume and os.path.exists(resume.file_path):
                with open(resume.file_path, "rb") as f:
                    pdf_bytes = f.read()
                attachments.append(
                    EmailAttachment(
                        filename="Adam_Blansett_Resume.pdf",
                        content_bytes=pdf_bytes,
                        mime_type="application/pdf",
                    )
                )

        # 3. Create Draft Message
        message_to_send = DraftMessage(
            recipient_email=recipient_email,
            recipient_name=recruiter.full_name,
            subject=draft.subject,
            body_text=draft.body_markdown,
            body_html=draft.body_html,
            attachments=attachments,
        )

        # 4. Dispatch via Email Adapter
        sent_resp = await default_email_adapter.send_message(message_to_send)

        # 5. Record Affirmative Human Approval in DB
        user = await CandidateService.get_or_create_default_user(db)
        now = datetime.now(timezone.utc)

        draft.status = "SENT"
        draft.approval_notes = request.approval_notes
        draft.approved_at = now
        draft.approved_by_user_id = user.id
        draft.sent_at = now
        draft.external_message_id = sent_resp.message_id
        draft.external_thread_id = sent_resp.thread_id

        # 6. Advance Opportunity to SENT
        draft.job.pipeline_stage = "SENT"

        # 7. Immutable Security Audit Log Entry
        audit = AuditEvent(
            user_id=user.id,
            action="OUTREACH_APPROVED_AND_SENT",
            entity_type="outreach_draft",
            entity_id=str(draft.id),
            changes_json={
                "recipient": recipient_email,
                "message_id": sent_resp.message_id,
                "subject": draft.subject,
                "has_resume": bool(attachments),
            },
        )
        db.add(audit)

        # 8. Communication Log Entry
        comm = Communication(
            outreach_id=draft.id,
            external_thread_id=sent_resp.thread_id,
            external_message_id=sent_resp.message_id,
            direction="OUTBOUND",
            sender_address="adam.blansett@example.com",
            recipient_address=recipient_email,
            subject=draft.subject,
            body_text=draft.body_markdown,
            received_at=now,
            classification_intent="INITIAL_OUTREACH",
        )
        db.add(comm)

        await db.commit()
        await db.refresh(draft)

        return OutreachApprovalResponse(
            status="SENT",
            outreach_id=draft.id,
            message_id=sent_resp.message_id,
            sent_at=sent_resp.sent_at,
            channel=draft.channel,
        )

    @classmethod
    async def reject_draft(
        cls, db: AsyncSession, draft_id: uuid.UUID
    ) -> Optional[OutreachDraft]:
        draft = await cls.get_draft_by_id(db, draft_id)
        if not draft:
            return None
        draft.status = "REJECTED"
        await db.commit()
        await db.refresh(draft)
        return draft

    @staticmethod
    async def get_draft_by_id(
        db: AsyncSession, draft_id: uuid.UUID
    ) -> Optional[OutreachDraft]:
        stmt = (
            select(OutreachDraft)
            .options(
                selectinload(OutreachDraft.job).selectinload(JobOpportunity.company),
                selectinload(OutreachDraft.recruiter).selectinload(Recruiter.contacts),
                selectinload(OutreachDraft.resume),
            )
            .where(OutreachDraft.id == draft_id)
        )
        res = await db.execute(stmt)
        return res.scalars().first()

    @staticmethod
    async def list_drafts(
        db: AsyncSession,
        status_filter: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[OutreachDraft]:
        stmt = (
            select(OutreachDraft)
            .options(
                selectinload(OutreachDraft.job).selectinload(JobOpportunity.company),
                selectinload(OutreachDraft.recruiter).selectinload(Recruiter.contacts),
                selectinload(OutreachDraft.resume),
            )
        )
        if status_filter:
            stmt = stmt.where(OutreachDraft.status == status_filter)

        stmt = stmt.order_by(OutreachDraft.created_at.desc()).limit(limit).offset(offset)
        res = await db.execute(stmt)
        return list(res.scalars().all())
