import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock


@pytest.mark.asyncio
async def test_trigger_async_discovery_task_endpoint(client: AsyncClient):
    with patch("app.tasks.discovery_tasks.background_job_discovery_task.delay") as mock_delay:
        mock_task = MagicMock()
        mock_task.id = "celery-task-discovery-12345"
        mock_delay.return_value = mock_task

        response = await client.post("/api/v1/tasks/discovery/trigger")
        assert response.status_code == 202
        data = response.json()
        assert data["task_id"] == "celery-task-discovery-12345"
        assert data["status"] == "PENDING"


@pytest.mark.asyncio
async def test_trigger_async_evaluation_task_endpoint(client: AsyncClient):
    with patch("app.tasks.discovery_tasks.background_batch_evaluation_task.delay") as mock_delay:
        mock_task = MagicMock()
        mock_task.id = "celery-task-evaluation-67890"
        mock_delay.return_value = mock_task

        response = await client.post("/api/v1/tasks/evaluation/trigger")
        assert response.status_code == 202
        data = response.json()
        assert data["task_id"] == "celery-task-evaluation-67890"


@pytest.mark.asyncio
async def test_get_simulated_task_status_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/tasks/status/simulated_task_123")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["ready"] is True
    assert data["successful"] is True
