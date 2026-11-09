from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(..., example="healthy")
    app_name: str
    environment: str
    version: str = "0.1.0"
    database: str = Field(..., example="connected")
    redis: str = Field(..., example="connected")


class SystemStatusResponse(BaseModel):
    app_name: str
    environment: str
    debug: bool
    version: str
    uptime_seconds: float
    system_metrics: Dict[str, Any] = Field(default_factory=dict)
