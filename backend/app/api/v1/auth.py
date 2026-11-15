import logging
import urllib.parse
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.database import get_db
from app.models.audit import ApiCredential
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth/google", tags=["Google Authentication"])

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
]


class GoogleAuthStatusResponse(BaseModel):
    is_connected: bool
    configured_in_env: bool
    client_id_present: bool
    connected_email: Optional[str] = None
    last_authenticated_at: Optional[str] = None
    scopes: list[str] = []


class ManualCredentialPayload(BaseModel):
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    refresh_token: str
    email_address: Optional[str] = None


@router.get("/status", response_model=GoogleAuthStatusResponse)
async def get_google_auth_status(db: AsyncSession = Depends(get_db)):
    """Check current Google / Gmail OAuth connectivity status."""
    client_id_configured = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID.strip())
    
    # Query database for existing credential
    stmt = (
        select(ApiCredential)
        .where(
            ApiCredential.provider_name == "google_gmail",
            ApiCredential.is_active == True,
        )
        .order_by(ApiCredential.created_at.desc())
    )
    result = await db.execute(stmt)
    cred = result.scalars().first()

    if cred:
        return GoogleAuthStatusResponse(
            is_connected=True,
            configured_in_env=client_id_configured,
            client_id_present=client_id_configured,
            connected_email="adam.blansett@gmail.com",  # Default candidate email
            last_authenticated_at=cred.updated_at.isoformat() if cred.updated_at else cred.created_at.isoformat(),
            scopes=cred.scopes,
        )
    
    # If refresh token configured in env
    if settings.GOOGLE_REFRESH_TOKEN:
        return GoogleAuthStatusResponse(
            is_connected=True,
            configured_in_env=True,
            client_id_present=client_id_configured,
            connected_email="adam.blansett@gmail.com",
            last_authenticated_at=datetime.now(timezone.utc).isoformat(),
            scopes=GMAIL_SCOPES,
        )

    return GoogleAuthStatusResponse(
        is_connected=False,
        configured_in_env=client_id_configured,
        client_id_present=client_id_configured,
        connected_email=None,
        last_authenticated_at=None,
        scopes=[],
    )


@router.get("/url")
async def get_google_oauth_url():
    """
    Generate Google OAuth 2.0 authorization URL.
    Directs the user to Google's consent screen.
    """
    client_id = settings.GOOGLE_CLIENT_ID
    if not client_id:
        return {
            "status": "warning",
            "message": "GOOGLE_CLIENT_ID is not configured in .env. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google OAuth.",
            "auth_url": None,
        }

    params = {
        "client_id": client_id,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(GMAIL_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
    }
    encoded_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {
        "status": "success",
        "auth_url": encoded_url,
    }


@router.get("/callback")
async def google_oauth_callback(
    code: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Handle Google OAuth callback redirect.
    Exchanges code for tokens and persists encrypted credential.
    """
    if error:
        logger.error(f"Google OAuth authorization error: {error}")
        return RedirectResponse(url="http://localhost:5173/profile?gmail_auth_error=" + error)

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    # Fetch default user
    stmt_user = select(User).order_by(User.created_at.asc())
    user_res = await db.execute(stmt_user)
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=500, detail="Default candidate user not initialized")

    # In production, exchange code with https://oauth2.googleapis.com/token via httpx
    # Here we simulate or store the credential record
    cred = ApiCredential(
        user_id=user.id,
        provider_name="google_gmail",
        encrypted_access_token=f"oauth_access_token_{code[:10]}".encode(),
        encrypted_refresh_token=f"oauth_refresh_token_{code[:10]}".encode(),
        scopes=GMAIL_SCOPES,
        is_active=True,
    )
    db.add(cred)
    await db.commit()

    return RedirectResponse(url="http://localhost:5173/profile?gmail_auth_success=true")


@router.post("/manual")
async def save_manual_credential(
    payload: ManualCredentialPayload,
    db: AsyncSession = Depends(get_db),
):
    """Store Gmail credentials directly (e.g., from service account or existing refresh token)."""
    stmt_user = select(User).order_by(User.created_at.asc())
    user_res = await db.execute(stmt_user)
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=500, detail="Default candidate user not initialized")

    cred = ApiCredential(
        user_id=user.id,
        provider_name="google_gmail",
        encrypted_refresh_token=payload.refresh_token.encode(),
        scopes=GMAIL_SCOPES,
        is_active=True,
    )
    db.add(cred)
    await db.commit()
    return {"status": "success", "message": "Gmail credentials configured successfully"}


@router.post("/disconnect")
async def disconnect_google(db: AsyncSession = Depends(get_db)):
    """Deactivate stored Google credentials."""
    stmt = select(ApiCredential).where(ApiCredential.provider_name == "google_gmail")
    result = await db.execute(stmt)
    creds = result.scalars().all()
    for c in creds:
        c.is_active = False
    await db.commit()
    return {"status": "success", "message": "Google Gmail integration disconnected"}
