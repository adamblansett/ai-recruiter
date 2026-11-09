# AI Recruiter Backend

Python 3.12+ FastAPI backend service providing RESTful APIs, data persistence via PostgreSQL + SQLAlchemy 2.0, background job execution via Celery + Redis, and provider-neutral AI integrations.

## Local Development Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -e ".[dev]"
   ```

3. Run migrations:
   ```bash
   alembic upgrade head
   ```

4. Run the API server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. Run test suite:
   ```bash
   pytest
   ```
