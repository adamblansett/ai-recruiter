import base64
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from jose import jwt
from passlib.context import CryptContext

from app.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def _get_encryption_key_bytes() -> bytes:
    """Return a 32-byte key for AES-256-GCM."""
    raw_key = settings.ENCRYPTION_KEY.encode("utf-8")
    if len(raw_key) == 32:
        return raw_key
    import hashlib
    return hashlib.sha256(raw_key).digest()


def encrypt_secret(plain_text: str) -> bytes:
    """Encrypt a secret string using AES-256-GCM. Returns nonce (12 bytes) + ciphertext + tag."""
    key = _get_encryption_key_bytes()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plain_text.encode("utf-8"), None)
    return nonce + ciphertext


def decrypt_secret(encrypted_bytes: bytes) -> str:
    """Decrypt AES-256-GCM payload (nonce 12 bytes + ciphertext + tag)."""
    if len(encrypted_bytes) < 28:
        raise ValueError("Invalid encrypted payload size")
    key = _get_encryption_key_bytes()
    aesgcm = AESGCM(key)
    nonce = encrypted_bytes[:12]
    ciphertext = encrypted_bytes[12:]
    decrypted = aesgcm.decrypt(nonce, ciphertext, None)
    return decrypted.decode("utf-8")
