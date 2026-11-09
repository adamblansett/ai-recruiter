import os
import pytest
from typing import AsyncGenerator
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock, patch

# Configure test environment
os.environ["APP_ENV"] = "test"
os.environ["DEBUG"] = "true"
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-1234567890"
os.environ["ENCRYPTION_KEY"] = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

from app.main import app
from app.core.database import get_db


@pytest.fixture
async def mock_db_session():
    """Mock database session that simulates successful execution."""
    session = AsyncMock()
    session.execute = AsyncMock(return_value=None)
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.close = AsyncMock()
    return session


@pytest.fixture
async def client(mock_db_session) -> AsyncGenerator[AsyncClient, None]:
    """Test HTTP client with overridden dependencies."""
    async def override_get_db():
        yield mock_db_session

    app.dependency_overrides[get_db] = override_get_db

    with patch("redis.asyncio.from_url") as mock_redis:
        mock_r = AsyncMock()
        mock_r.ping = AsyncMock(return_value=True)
        mock_r.aclose = AsyncMock()
        mock_redis.return_value = mock_r

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

    app.dependency_overrides.clear()
