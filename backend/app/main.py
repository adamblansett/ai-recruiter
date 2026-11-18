from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.v1.router import api_router
from app.config import settings
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    setup_logging(debug=settings.DEBUG)
    yield
    # Shutdown actions


app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Job Discovery, Recruiter Identification, and Outreach Assistant API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# 1. Security Headers & Defense-in-Depth Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Enforce Request Body Size Limit to prevent memory exhaustion & DoS
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > settings.MAX_REQUEST_BODY_BYTES:
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={
                            "detail": f"Payload too large. Maximum permissible size is {settings.MAX_REQUEST_BODY_BYTES // (1024*1024)}MB."
                        },
                    )
            except ValueError:
                pass

        # Process request
        response: Response = await call_next(request)

        # Inject Defense-in-Depth Security Headers
        if settings.SECURITY_HEADERS_ENABLED:
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "img-src 'self' data: https:; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "connect-src 'self' http://localhost:* ws://localhost:*; "
                "frame-ancestors 'none';"
            )
            response.headers["Permissions-Policy"] = (
                "camera=(self), microphone=(self), geolocation=(), payment=()"
            )

            # Strict Transport Security (HSTS)
            if settings.STRICT_TRANSPORT_SECURITY or request.url.scheme == "https":
                response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

            # Remove server banner to obscure fingerprinting
            if "server" in response.headers:
                del response.headers["server"]

        return response


app.add_middleware(SecurityHeadersMiddleware)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 3. Include v1 API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "status": "online",
        "docs": "/docs" if settings.DEBUG else "disabled_in_prod",
    }


@app.get("/health", tags=["Root"])
async def simple_health():
    """Simple load balancer health check probe."""
    return {"status": "ok", "app": settings.APP_NAME}
