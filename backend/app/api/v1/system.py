import time
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.database import get_db
from app.schemas.system import HealthCheckResponse, SystemStatusResponse

router = APIRouter(tags=["System"])
START_TIME = time.time()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Application Health Check",
)
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint validating API, Database, and Broker connectivity."""
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"degraded: {type(exc).__name__}"

    # Redis check
    redis_status = "connected"
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.REDIS_URL, socket_timeout=1.0)
        await r.ping()
        await r.aclose()
    except Exception as exc:
        redis_status = f"degraded: {type(exc).__name__}"

    overall_status = "healthy" if db_status == "connected" and redis_status == "connected" else "degraded"

    return HealthCheckResponse(
        status=overall_status,
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        version="0.1.0",
        database=db_status,
        redis=redis_status,
    )


@router.get(
    "/status",
    response_model=SystemStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="System Operational Status",
)
async def system_status():
    """Detailed operational status and uptime."""
    uptime = time.time() - START_TIME
    return SystemStatusResponse(
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        debug=settings.DEBUG,
        version="0.1.0",
        uptime_seconds=round(uptime, 2),
        system_metrics={
            "python_runtime": "FastAPI + Pydantic v2",
            "api_prefix": settings.API_V1_PREFIX,
        },
    )
