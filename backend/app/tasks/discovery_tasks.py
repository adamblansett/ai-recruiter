import asyncio
import logging
from datetime import datetime, timezone
from celery import shared_task

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def run_async(coro):
    """Utility to run an async coroutine inside a synchronous Celery task."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def background_job_discovery_task(self):
    """
    Celery background worker task for scheduled job discovery.
    Respects human approval boundaries: strictly ingests and evaluates; NEVER sends outreach.
    """
    logger.info(f"Starting Celery background job discovery task: {self.request.id}")

    async def _execute():
        from app.core.database import async_session_maker
        from app.services.discovery_service import DiscoveryService

        async with async_session_maker() as session:
            result = await DiscoveryService.run_discovery(session)
            logger.info(
                f"Completed background discovery: {result.new_ingested_count} new, "
                f"{result.duplicate_count} duplicates."
            )
            return {
                "discovered": result.discovered_count,
                "ingested": result.new_ingested_count,
                "duplicates": result.duplicate_count,
                "sources": result.sources_polled,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }

    try:
        return run_async(_execute())
    except Exception as exc:
        logger.error(f"Background discovery task failed: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(bind=True)
def background_batch_evaluation_task(self):
    """
    Celery task that iterates through unassessed DISCOVERED opportunities
    and runs the Built-in AI Evaluation Engine.
    """
    logger.info("Executing background batch job evaluation.")

    async def _execute():
        from sqlalchemy import select
        from app.core.database import async_session_maker
        from app.models.job import JobOpportunity
        from app.schemas.evaluation import JobEvaluationRequest
        from app.services.evaluation_service import EvaluationService

        async with async_session_maker() as session:
            stmt = (
                select(JobOpportunity)
                .where(JobOpportunity.pipeline_stage == "DISCOVERED")
                .limit(10)
            )
            res = await session.execute(stmt)
            jobs = res.scalars().all()
            evaluated_count = 0

            for job in jobs:
                try:
                    await EvaluationService.evaluate_job(
                        session, JobEvaluationRequest(job_id=job.id)
                    )
                    evaluated_count += 1
                except Exception as e:
                    logger.warning(f"Failed evaluation for job {job.id}: {e}")

            return {
                "evaluated_count": evaluated_count,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }

    return run_async(_execute())
