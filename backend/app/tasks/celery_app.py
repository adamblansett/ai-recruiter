from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "ai_recruiter_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.discovery_tasks",
        "app.tasks.email_sync_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour hard limit
    # Celery Beat Periodic Schedules
    beat_schedule={
        # Scheduled job discovery every 6 hours
        "scheduled_job_discovery_every_6h": {
            "task": "app.tasks.discovery_tasks.background_job_discovery_task",
            "schedule": crontab(minute=0, hour="*/6"),
        },
        # Background batch evaluation of newly discovered jobs every hour
        "scheduled_batch_evaluation_hourly": {
            "task": "app.tasks.discovery_tasks.background_batch_evaluation_task",
            "schedule": crontab(minute=30, hour="*"),
        },
        # Periodic Gmail inbox reply sync every 15 minutes
        "scheduled_inbox_sync_every_15m": {
            "task": "app.tasks.email_sync_tasks.background_inbox_sync_task",
            "schedule": crontab(minute="*/15"),
        },
    },
)
