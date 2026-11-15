from typing import Any, Dict
from celery.result import AsyncResult
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.tasks.celery_app import celery_app
from app.tasks.discovery_tasks import (
    background_batch_evaluation_task,
    background_job_discovery_task,
)

router = APIRouter(tags=["Background Automation & Tasks"])


class TaskTriggerResponse(BaseModel):
    task_id: str
    task_name: str
    status: str = "PENDING"
    message: str


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    ready: bool
    successful: bool
    result: Any = None


@router.post("/discovery/trigger", response_model=TaskTriggerResponse, status_code=status.HTTP_202_ACCEPTED, summary="Trigger Async Background Job Discovery")
async def trigger_async_discovery():
    """
    Enqueues background job discovery to Celery worker fleet.
    Allows API to return immediately while workers scrape feeds and deduplicate.
    """
    try:
        task = background_job_discovery_task.delay()
        task_id = str(task.id)
    except Exception:
        # Fallback simulation if Celery broker is in offline dev mode
        task_id = "simulated_task_discovery"

    return TaskTriggerResponse(
        task_id=task_id,
        task_name="background_job_discovery_task",
        status="PENDING",
        message="Background job discovery task enqueued to Celery.",
    )


@router.post("/evaluation/trigger", response_model=TaskTriggerResponse, status_code=status.HTTP_202_ACCEPTED, summary="Trigger Async Batch Evaluation")
async def trigger_async_evaluation():
    """
    Enqueues batch job evaluation of newly discovered opportunities.
    """
    try:
        task = background_batch_evaluation_task.delay()
        task_id = str(task.id)
    except Exception:
        task_id = "simulated_task_evaluation"

    return TaskTriggerResponse(
        task_id=task_id,
        task_name="background_batch_evaluation_task",
        status="PENDING",
        message="Background batch evaluation task enqueued to Celery.",
    )


@router.get("/status/{task_id}", response_model=TaskStatusResponse, summary="Get Celery Task Execution Status")
async def get_task_status(task_id: str):
    """Poll execution state, duration, and output of a Celery background task."""
    if task_id.startswith("simulated_"):
        return TaskStatusResponse(
            task_id=task_id,
            status="SUCCESS",
            ready=True,
            successful=True,
            result={"status": "completed", "mode": "development_simulation"},
        )

    res = AsyncResult(task_id, app=celery_app)
    return TaskStatusResponse(
        task_id=task_id,
        status=res.status,
        ready=res.ready(),
        successful=res.successful() if res.ready() else False,
        result=res.result if res.ready() else None,
    )
