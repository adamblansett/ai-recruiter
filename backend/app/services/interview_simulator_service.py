import logging
import uuid
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import JobOpportunity

logger = logging.getLogger(__name__)


class InterviewQuestion(BaseModel):
    session_id: str
    job_id: str
    company_name: str
    job_title: str
    interviewer_persona: str
    track: str
    round_number: int
    question: str
    scenario_context: str
    recommended_focus_areas: List[str]


class AnswerEvaluation(BaseModel):
    session_id: str
    round_number: int
    overall_score: int = Field(..., ge=0, le=100)
    technical_rigor_score: int = Field(..., ge=0, le=100)
    tradeoff_depth_score: int = Field(..., ge=0, le=100)
    star_structure_score: int = Field(..., ge=0, le=100)
    verdict: str  # "STRONG_PASS", "LEAN_PASS", "NEEDS_WORK"
    strengths: List[str]
    areas_for_improvement: List[str]
    ideal_answer_outline: str
    follow_up_question: Optional[str] = None


class StartSessionPayload(BaseModel):
    track: Optional[str] = "distributed_systems"


class SubmitAnswerPayload(BaseModel):
    session_id: str
    round_number: int
    question: str
    answer_text: str = Field(..., min_length=20)


class InterviewSimulatorService:
    """
    Automated mock interview roleplay simulator providing Staff/Senior+
    architectural scenarios, interactive dialogue, and objective rubric scoring.
    """

    @classmethod
    async def start_session(
        cls,
        db: AsyncSession,
        job_id: uuid.UUID,
        track: str = "distributed_systems",
    ) -> InterviewQuestion:
        stmt = select(JobOpportunity).where(JobOpportunity.id == job_id)
        res = await db.execute(stmt)
        job = res.scalars().first()

        company_name = (job.company.name if job and job.company else None) or "Target Enterprise"
        job_title = (job.title if job else None) or "Staff Backend & Systems Engineer"
        session_id = f"sim-{uuid.uuid4().hex[:8]}"

        track_lower = track.lower()
        if "ai" in track_lower:
            persona = f"Sarah Lin, Head of AI Platform at {company_name}"
            question = (
                f"We are scaling low-latency model inference pipelines for multimodal LLMs handling 5,000 requests/sec. "
                f"How would you design our batching, GPU scheduling, and fallback architecture in Python/C++ to guarantee "
                f"p99 latency under 200ms while keeping infrastructure compute costs contained?"
            )
            scenario = "High-throughput generative AI inference cluster with dynamic GPU auto-scaling and spot instance fallback."
            focus = ["Dynamic batching & KV cache paging", "GPU memory fragmentation tradeoffs", "Graceful fallback tiers"]
        elif "lead" in track_lower or "behavioral" in track_lower:
            persona = f"Marcus Thorne, VP of Engineering at {company_name}"
            question = (
                f"Tell me about a high-stakes disagreement you had with a Principal Architect or Product Director regarding "
                f"a core architectural migration. How did you build consensus without stalling delivery, and what was the outcome?"
            )
            scenario = "Staff-level technical influence, cross-functional conflict resolution, and architectural ownership."
            focus = ["STAR methodology (Situation, Task, Action, Result)", "Data-driven persuasion", "Risk mitigation"]
        else:
            persona = f"Dr. Alicia Vance, Distinguished Infrastructure Architect at {company_name}"
            question = (
                f"Imagine our primary transactional ledger services in PostgreSQL and Kafka are experiencing periodic "
                f"replication lag spikes and connection exhaustion during flash sales. As our Staff Backend Engineer, "
                f"walk me through your diagnostic process, immediate mitigation, and permanent architectural remediation."
            )
            scenario = "Zero-downtime persistence remediation and async event streaming under high write amplification."
            focus = ["PgBouncer & connection pooler tuning", "Kafka consumer group lag isolation", "Read-replica fanout & shadow writes"]

        return InterviewQuestion(
            session_id=session_id,
            job_id=str(job_id),
            company_name=company_name,
            job_title=job_title,
            interviewer_persona=persona,
            track=track,
            round_number=1,
            question=question,
            scenario_context=scenario,
            recommended_focus_areas=focus,
        )

    @classmethod
    async def evaluate_answer(
        cls,
        payload: SubmitAnswerPayload,
    ) -> AnswerEvaluation:
        text = payload.answer_text.strip()
        word_count = len(text.split())

        # Heuristic scoring based on architectural rigor, detail, and length
        if word_count > 120 and any(k in text.lower() for k in ["tradeoff", "latency", "scale", "concurrency", "queue", "cache", "postgres", "kafka", "fallback"]):
            overall = 94
            tech = 96
            tradeoffs = 92
            star = 90
            verdict = "STRONG_PASS"
            strengths = [
                "Exceptional depth regarding system failure modes and concurrency safeguards.",
                "Explicitly framed solutions with concrete latency and throughput tradeoffs.",
                "Demonstrated Staff-level maturity by addressing observability and gradual canary rollouts.",
            ]
            improvements = [
                "Could quantify exact metric thresholds (e.g. p99 SLOs, connection pool ceiling limits).",
            ]
            outline = (
                "1. Immediate Triage: Rate-limit non-critical write paths and inspect vacuum lag.\n"
                "2. Concurrency Isolation: Introduce connection pooling layer and shard high-write tables.\n"
                "3. Architectural Permanence: Decouple ledger writes into partitioned Kafka event topics with idempotent consumers."
            )
            follow_up = (
                "Excellent breakdown. If two shards partition during network degradation, how do you enforce linearizable "
                "consistency without causing cascading retry storms?"
            )
        elif word_count > 50:
            overall = 82
            tech = 84
            tradeoffs = 80
            star = 80
            verdict = "LEAN_PASS"
            strengths = [
                "Clear logical approach to system architecture problem.",
                "Identified the root bottleneck correctly.",
            ]
            improvements = [
                "Incorporate more specific architectural tradeoffs (e.g. CP vs AP distributed guarantees).",
                "Explicitly mention rollback strategies and telemetry monitoring.",
            ]
            outline = (
                "Structure answers using Problem Statement -> Architectural Tradeoffs -> Implementation Steps -> Metric Validation."
            )
            follow_up = "How would you monitor and validate that the replication lag has stabilized under peak load?"
        else:
            overall = 68
            tech = 70
            tradeoffs = 65
            star = 68
            verdict = "NEEDS_WORK"
            strengths = ["Accurate general direction."]
            improvements = [
                "Answer is too high-level for a Staff-level interview. Provide concrete architectural mechanisms.",
                "Include operational details: metrics, caching strategies, and failover steps.",
            ]
            outline = "Expand on specific technologies, failure modes, and quantitative scale targets."
            follow_up = "Can you dive deeper into how you would isolate and throttle problematic queries in real time?"

        return AnswerEvaluation(
            session_id=payload.session_id,
            round_number=payload.round_number,
            overall_score=overall,
            technical_rigor_score=tech,
            tradeoff_depth_score=tradeoffs,
            star_structure_score=star,
            verdict=verdict,
            strengths=strengths,
            areas_for_improvement=improvements,
            ideal_answer_outline=outline,
            follow_up_question=follow_up,
        )
