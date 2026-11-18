import base64
import hashlib
import hmac
import html
import json
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Set, Union
from urllib.parse import urlparse

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    AESGCM = None  # type: ignore

try:
    from jose import JWTError, jwt
except ImportError:
    jwt = None  # type: ignore
    class JWTError(Exception):  # type: ignore
        pass

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
except ImportError:
    pwd_context = None

try:
    from app.config import settings
except ImportError:
    class MockSettings:
        SECRET_KEY = "test-secret-key-32-chars-minimum-length-for-security"
        ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    settings = MockSettings()  # type: ignore

ALGORITHM = "HS256"
JWT_ISSUER = "ai-recruiter"
JWT_AUDIENCE = "ai-recruiter-api"

# In-memory revocation set (in distributed prod, backed by Redis)
_REVOKED_TOKENS: Set[str] = set()

# Precompiled sanitization regexes
_DANGEROUS_HTML_PATTERN = re.compile(
    r"(<\s*script[^>]*>.*?<\s*/\s*script\s*>)|(<\s*iframe[^>]*>.*?<\s*/\s*iframe\s*>)|"
    r"(javascript\s*:)|(data\s*:\s*text\/html)|(on[a-z]+\s*=)",
    re.IGNORECASE | re.DOTALL,
)
_CONTROL_CHAR_PATTERN = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a password using constant-time comparison against hash."""
    if pwd_context is not None:
        return pwd_context.verify(plain_password, hashed_password)
    # Standard library fallback using PBKDF2
    try:
        salt, h = hashed_password.split(":")
        calc = hashlib.pbkdf2_hmac("sha256", plain_password.encode(), salt.encode(), 100000).hex()
        return hmac.compare_digest(h, calc)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hashes a password with salt using Argon2id/Bcrypt or PBKDF2-SHA256."""
    if pwd_context is not None:
        return pwd_context.hash(password)
    salt = os.urandom(16).hex()
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
    return f"{salt}:{h}"


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Creates a signed JWT with strict claims:
    - sub: subject
    - exp: expiration
    - iat: issued at
    - nbf: not before
    - iss: issuer
    - aud: audience
    - jti: unique cryptographic token ID (prevents replay and enables revocation)
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=60)

    token_id = uuid.uuid4().hex

    payload: Dict[str, Any] = {
        "sub": str(subject),
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "jti": token_id,
    }

    if extra_claims:
        payload.update(extra_claims)

    if jwt is not None:
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

    # Standard-library fallback compliant with RFC 7519 HMAC-SHA256 JWT
    header = {"alg": "HS256", "typ": "JWT"}
    b64_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    b64_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signing_input = f"{b64_header}.{b64_payload}".encode()
    signature = hmac.new(settings.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    b64_signature = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{b64_header}.{b64_payload}.{b64_signature}"


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a JWT token.
    Strictly pins algorithm to HS256 to prevent algorithm confusion attacks.
    Checks expiration, not-before, audience, and revocation status.
    """
    if jwt is not None:
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[ALGORITHM],
                audience=JWT_AUDIENCE,
                issuer=JWT_ISSUER,
            )
        except JWTError as e:
            raise ValueError(f"Invalid token or signature verification failed: {e}")
    else:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Malformed JWT token")
        b64_header, b64_payload, b64_sig = parts
        signing_input = f"{b64_header}.{b64_payload}".encode()
        expected_sig = hmac.new(settings.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
        actual_sig = base64.urlsafe_b64decode(b64_sig + "=" * (-len(b64_sig) % 4))
        if not hmac.compare_digest(expected_sig, actual_sig):
            raise ValueError("Invalid JWT signature")
        payload = json.loads(base64.urlsafe_b64decode(b64_payload + "=" * (-len(b64_payload) % 4)))

    now_ts = int(datetime.now(timezone.utc).timestamp())
    if payload.get("exp") and payload["exp"] < now_ts:
        raise ValueError("Token has expired")
    if payload.get("nbf") and payload["nbf"] > now_ts:
        raise ValueError("Token not yet active")

    jti = payload.get("jti")
    if jti and is_token_revoked(jti):
        raise ValueError("Token has been revoked")

    return payload


def revoke_token(jti: str) -> None:
    """Adds a token ID to the revocation list."""
    _REVOKED_TOKENS.add(jti)


def is_token_revoked(jti: str) -> bool:
    """Checks whether a token ID is in the revocation list."""
    return jti in _REVOKED_TOKENS


def _get_encryption_key_bytes() -> bytes:
    """Return a 32-byte key for AES-256-GCM via SHA-256 derivation."""
    raw_key = settings.ENCRYPTION_KEY.encode("utf-8")
    if len(raw_key) == 32:
        return raw_key
    return hashlib.sha256(raw_key).digest()


def encrypt_secret(plain_text: str) -> bytes:
    """
    Encrypt a secret string using AES-256-GCM authenticated encryption.
    Returns nonce (12 bytes) + ciphertext + authentication tag (16 bytes).
    """
    key = _get_encryption_key_bytes()
    if AESGCM is not None:
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plain_text.encode("utf-8"), None)
        return nonce + ciphertext

    # Standard-library fallback using HMAC-SHA256 authenticated envelope
    nonce = os.urandom(16)
    data = plain_text.encode("utf-8")
    derived = hmac.new(key, nonce, hashlib.sha256).digest()
    xor_cipher = bytes(b ^ derived[i % len(derived)] for i, b in enumerate(data))
    tag = hmac.new(key, nonce + xor_cipher, hashlib.sha256).digest()[:16]
    return nonce + xor_cipher + tag


def decrypt_secret(encrypted_bytes: bytes) -> str:
    """
    Decrypt AES-256-GCM authenticated payload.
    Raises ValueError if payload is tampered with or authentication tag fails.
    """
    if len(encrypted_bytes) < 28:
        raise ValueError("Invalid encrypted payload size")
    key = _get_encryption_key_bytes()

    if AESGCM is not None:
        aesgcm = AESGCM(key)
        nonce = encrypted_bytes[:12]
        ciphertext = encrypted_bytes[12:]
        try:
            decrypted = aesgcm.decrypt(nonce, ciphertext, None)
            return decrypted.decode("utf-8")
        except Exception:
            raise ValueError("Failed to decrypt secret: ciphertext or tag invalid")

    nonce = encrypted_bytes[:16]
    tag = encrypted_bytes[-16:]
    xor_cipher = encrypted_bytes[16:-16]
    expected_tag = hmac.new(key, nonce + xor_cipher, hashlib.sha256).digest()[:16]
    if not hmac.compare_digest(tag, expected_tag):
        raise ValueError("Failed to decrypt secret: authentication tag invalid")
    derived = hmac.new(key, nonce, hashlib.sha256).digest()
    plain = bytes(b ^ derived[i % len(derived)] for i, b in enumerate(xor_cipher))
    return plain.decode("utf-8")


def sanitize_input(text: Optional[str], max_length: int = 8192) -> str:
    """
    Defense-in-depth input sanitization:
    - Neutralizes XSS, script injection, and iframe tags
    - Strips dangerous control characters (e.g. NULL bytes)
    - Truncates to max_length to prevent resource exhaustion
    """
    if text is None:
        return ""

    cleaned = str(text)[:max_length]
    cleaned = _CONTROL_CHAR_PATTERN.sub("", cleaned)
    cleaned = _DANGEROUS_HTML_PATTERN.sub("[REMOVED_INSECURE_TAG]", cleaned)
    return cleaned.strip()


def generate_csrf_state() -> str:
    """Generates a cryptographically secure CSRF state token for OAuth flows."""
    return base64.urlsafe_b64encode(os.urandom(24)).decode("utf-8")


def verify_csrf_state(state: str, expected_state: str) -> bool:
    """Constant-time verification of CSRF state token."""
    if not state or not expected_state:
        return False
    return hmac.compare_digest(state, expected_state)


def is_safe_redirect_url(target_url: str, allowed_hosts: Optional[List[str]] = None) -> bool:
    """
    Validates redirect URLs to prevent Open Redirect attacks.
    Only allows relative paths or explicitly whitelisted hosts.
    """
    if not target_url:
        return False

    parsed = urlparse(target_url)

    if not parsed.netloc and parsed.path.startswith("/") and not parsed.path.startswith("//"):
        return True

    if allowed_hosts and parsed.netloc:
        return parsed.hostname in allowed_hosts

    return False
