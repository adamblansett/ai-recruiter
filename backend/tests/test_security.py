import pytest
from app.core.security import (
    create_access_token,
    decrypt_secret,
    encrypt_secret,
    get_password_hash,
    verify_password,
)
from jose import jwt
from app.config import settings


def test_password_hashing():
    password = "SuperSecureCandidatePassword2026!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_encryption_and_decryption_aes_gcm():
    secret_text = "ya29.a0AfH6SMD-google-refresh-token-secret-12345"
    encrypted_bytes = encrypt_secret(secret_text)

    # Must not contain plain text
    assert secret_text.encode("utf-8") not in encrypted_bytes

    # Decrypt and verify equality
    decrypted_text = decrypt_secret(encrypted_bytes)
    assert decrypted_text == secret_text


def test_encryption_tamper_detection():
    secret_text = "sensitive_api_key_sk_live_99999"
    encrypted_bytes = bytearray(encrypt_secret(secret_text))

    # Tamper with the ciphertext/tag
    encrypted_bytes[-1] ^= 0x01

    with pytest.raises(Exception):
        decrypt_secret(bytes(encrypted_bytes))


def test_create_access_token():
    subject = "user-uuid-1234"
    token = create_access_token(subject)
    assert token is not None

    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    assert payload["sub"] == subject
    assert "exp" in payload
