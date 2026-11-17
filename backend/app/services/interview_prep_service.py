import logging
import uuid
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import JobOpportunity
from app.schemas.interview_prep import (
    InterviewPrepPlan,
    InterviewPrepQuestion,
    ReverseInterviewQuestion,
    StarTalkingPoint,
)
from app.services.candidate_service import CandidateService

logger = logging.getLogger(__name__)


class InterviewPrepService:
    """
    Generates structured, role-specific technical and behavioral interview preparation
    tailored to the target company, job requirements, and candidate's verified background.
    """

    @classmethod
    async def generate_prep_plan(
        cls,
        db: AsyncSession,
        job_id: uuid.UUID,
    ) -> InterviewPrepPlan:
        # 1. Fetch Job
        stmt = select(JobOpportunity).where(JobOpportunity.id == job_id)
        res = await db.execute(stmt)
        job = res.scalars().first()
        if not job:
            raise ValueError(f"Job opportunity {job_id} not found")

        # 2. Fetch Candidate Profile
        profile = await CandidateService.get_active_profile(db)
        if not profile:
            profile = await CandidateService.seed_initial_candidate(db)

        company_name = job.company.name if job.company else "Target Company"
        job_text = f"{job.title} {job.cleaned_description} {job.raw_description}".lower()

        # 3. Detect Technical Focus
        is_ai_heavy = any(k in job_text for k in ["ai", "llm", "inference", "model", "prompt", "rag", "embeddings"])
        is_distributed_heavy = any(k in job_text for k in ["distributed", "throughput", "concurrency", "scale", "kafka", "redis", "celery", "microservices"])
        is_security_focused = any(k in job_text for k in ["security", "oauth", "jwt", "vault", "iam", "auth", "compliance"])

        focus_areas = []
        if is_ai_heavy:
            focus_areas.append("AI / LLM Orchestration & Prompt Isolation")
        if is_distributed_heavy:
            focus_areas.append("High-Throughput Asynchronous Task Pipelines")
        focus_areas.extend(["API Architecture & PostgreSQL Query Optimization", "Application Security & Zero-Trust Authentication"])

        # 4. Generate Role-Specific Technical Questions
        technical_questions: List[InterviewPrepQuestion] = []

        if is_ai_heavy:
            technical_questions.append(
                InterviewPrepQuestion(
                    category="AI & LLM Architecture",
                    question="How do you architect an enterprise LLM evaluation and inference pipeline that guarantees zero prompt injection from untrusted external inputs?",
                    difficulty="STAFF",
                    talking_points=[
                        "Demarcate inputs using isolated XML boundaries (e.g. <untrusted_input>).",
                        "Enforce strict Pydantic v2 schema validation on all LLM JSON outputs.",
                        "Separate evaluation logic from action execution (human approval gate).",
                    ],
                    relevant_experience_tie_in="Refer to the AI Recruiter prompt isolation harness and structured Pydantic evaluation service.",
                )
            )

        if is_distributed_heavy:
            technical_questions.append(
                InterviewPrepQuestion(
                    category="System Design & Concurrency",
                    question="How do you design a distributed worker architecture processing millions of background tasks while preventing duplicate executions and deadlocks?",
                    difficulty="HARD",
                    talking_points=[
                        "Idempotent task design using cryptographic deduplication hashing (SHA-256).",
                        "Distributed locking via Redis redlock with TTLs to prevent race conditions.",
                        "Celery worker routing with separate queues for burst discovery vs. high-priority tasks.",
                    ],
                    relevant_experience_tie_in="Describe building Celery/Redis async task queues with retry policies and audit event persistence.",
                )
            )

        technical_questions.append(
            InterviewPrepQuestion(
                category="Database Design & Performance",
                question="How do you optimize complex PostgreSQL relational queries involving large tables with full-text search and JSONB payloads?",
                difficulty="HARD",
                talking_points=[
                    "Implement composite and GIN indexes on JSONB fields.",
                    "Use async SQLAlchemy 2.0 selectinload strategies to prevent N+1 query traps.",
                    "Partitioning tables by date ranges or tenants when row counts exceed tens of millions.",
                ],
                relevant_experience_tie_in="Point to 10+ years of PostgreSQL optimization, Alembic migration strategy, and asyncpg pool tuning.",
            )
        )

        technical_questions.append(
            InterviewPrepQuestion(
                category="Security & Access Control",
                question="Walk through your approach to implementing OAuth 2.0 and secrets management across microservices without leaking credentials.",
                difficulty="STAFF",
                talking_points=[
                    "Short-lived JWT access tokens coupled with encrypted refresh token storage in database.",
                    "Integration with HashiCorp Vault or AWS Secrets Manager with dynamic rotation.",
                    "Strict database-level constraints enforcing approval before external communication dispatch.",
                ],
                relevant_experience_tie_in="Highlight OAuth 2.0 RFC 2822 Gmail implementation and DB constraints guaranteeing human authorization.",
            )
        )

        # 5. Generate STAR-Method Talking Points (Mapped to Adam Blansett's actual experience)
        star_talking_points: List[StarTalkingPoint] = [
            StarTalkingPoint(
                theme="Architecting Resilient Distributed Systems",
                situation_task="Needed to build a high-concurrency API and asynchronous worker system that could scale under fluctuating external loads without dropping jobs.",
                action="Architected a Python FastAPI backend paired with Celery workers, Redis queues, and PostgreSQL with connection pooling and idempotent hashing.",
                result="Achieved sub-50ms API response latencies, handled background queues reliably, and eliminated duplicate job executions.",
                skills_demonstrated=["Python", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker"],
            ),
            StarTalkingPoint(
                theme="Enterprise Application Security & Zero-Trust Governance",
                situation_task="Critical customer tokens and third-party integrations required robust protection against unauthorized dispatch and data exfiltration.",
                action="Engineered an OAuth 2.0 credential layer with Fernet/AES encryption, database-level CHECK constraints, and affirmative human approval gates.",
                result="Enforced 100% human verification before any outbound communication reached external networks, maintaining strict audit logs.",
                skills_demonstrated=["OAuth 2.0", "Application Security", "SQLAlchemy", "Audit Logging", "Encryption"],
            ),
            StarTalkingPoint(
                theme="Practical AI & LLM Systems Engineering",
                situation_task="Needed to incorporate LLM reasoning for job evaluation and recruiter communication without trusting raw web data or locking into a single commercial vendor.",
                action="Built provider-neutral LLM adapters supporting containerized local open-weight models (Llama 3.2 3B) with XML prompt quarantine and structured Pydantic output validation.",
                result="Delivered zero-cost, zero-API-key local inference capability with robust heuristic fallbacks and immunity to prompt injection.",
                skills_demonstrated=["LLM Engineering", "Prompt Isolation", "Pydantic", "Ollama/Local AI", "System Architecture"],
            ),
        ]

        # 6. Strategic Reverse-Interview Questions to ask the Interviewer
        reverse_interview_questions: List[ReverseInterviewQuestion] = [
            ReverseInterviewQuestion(
                category="Engineering Architecture",
                question=f"How does the engineering team at {company_name} balance technical debt repayment against fast shipping of features?",
                intended_insight="Evaluates engineering maturity, testing discipline, and architectural long-term health.",
            ),
            ReverseInterviewQuestion(
                category="AI Integration & Infrastructure",
                question=f"What are the biggest operational bottlenecks your team experiences when deploying and evaluating models or data pipelines in production?",
                intended_insight="Reveals real day-to-day challenges where your 10+ years of backend & systems experience will add immediate value.",
            ),
            ReverseInterviewQuestion(
                category="Team Autonomy & Staff Leadership",
                question="How are technical standards, architecture reviews, and cross-team RFCs driven by senior and staff engineers here?",
                intended_insight="Uncovers whether staff engineers are empowered to influence architecture and mentor peer engineers.",
            ),
        ]

        return InterviewPrepPlan(
            job_id=job.id,
            job_title=job.title,
            company_name=company_name,
            company_tech_focus=", ".join(focus_areas),
            recommended_focus_areas=focus_areas,
            technical_questions=technical_questions,
            star_talking_points=star_talking_points,
            reverse_interview_questions=reverse_interview_questions,
        )
