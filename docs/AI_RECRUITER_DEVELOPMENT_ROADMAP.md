# AI Recruiter — Phased Implementation Roadmap & Acceptance Criteria

**Document Version:** 1.0.0  
**Target Completion:** Phased Delivery (Milestones 1 – 8)  
**Status:** Under Architectural Review  
**Date:** November 9, 2026  

---

## 1. Roadmap Overview & Phasing Strategy

The `ai-recruiter` platform will be constructed in eight disciplined, test-driven milestones. Each milestone delivers functional, independently verifiable software with automated tests, measurable acceptance criteria, and zero regressions.

```mermaid
flowchart LR
    M1[M1: Architecture & Foundation] --> M2[M2: Candidate Profile & Models]
    M2 --> M3[M3: Job Discovery Engine]
    M3 --> M4[M4: AI Evaluation Engine]
    M4 --> M5[M5: Recruiter Research]
    M5 --> M6[M6: Outreach & Gmail Gate]
    M6 --> M7[M7: Automation & Celery]
    M7 --> M8[M8: Hardening & Production]
```

---

## 2. Milestone Breakdown & Measurable Acceptance Criteria

---

### Milestone 1: Architecture, Environment & Foundation

#### Objectives
Establish the repository baseline, containerized local development environment, FastAPI backend scaffolding, React + Vite frontend scaffolding, PostgreSQL database with Alembic migration pipeline, and automated test runners.

#### Deliverables
- Fully configured repository structure: `backend/`, `frontend/`, `docker/`, `docs/`.
- `docker-compose.yml` orchestrating PostgreSQL 16, Redis 7, Backend API, and Frontend dev server.
- Python backend package configuration (`pyproject.toml`) with pinned dependencies.
- FastAPI core application with health check endpoint (`/health`, `/api/v1/system/status`).
- SQLAlchemy 2.0 async engine and session management.
- Alembic migration environment connected to PostgreSQL with initial baseline migration.
- React + Vite + TypeScript frontend initialized with Tailwind CSS.
- Automated testing harness: Pytest with async support and Vitest for frontend.

#### Measurable Acceptance Criteria
1. `docker compose up -d` boots all services (PostgreSQL, Redis, FastAPI, React Vite) with green health checks within 60 seconds.
2. `curl http://localhost:8000/health` returns `{"status": "healthy", "database": "connected", "redis": "connected"}` with HTTP 200.
3. `alembic upgrade head` runs without errors in the backend container.
4. `pytest` executes and passes 100% of initial health check and configuration tests.
5. `npm test` / `vitest` executes and passes in the frontend directory.

---

### Milestone 2: Candidate Profile Management & Core Database Models

#### Objectives
Implement the complete candidate profile data layer and API, allowing dynamic configuration of candidate skills, work history, seniority preferences, and resume PDF uploads without hardcoding credentials or profiles in business logic. Seed the initial candidate profile for Adam Blansett.

#### Deliverables
- SQLAlchemy ORM models for `User`, `CandidateProfile`, `CandidateSkill`, `CandidateExperience`, `CandidateEducation`, `Resume`, `Company`, `JobOpportunity`, `Recruiter`.
- Pydantic v2 schemas for CRUD operations on candidate profiles, skills, and employment history.
- RESTful API endpoints under `/api/v1/candidate` and `/api/v1/resumes`.
- Resume upload handler with MIME validation, SHA-256 integrity hashing, and secure local file persistence.
- Profile management UI page in the React dashboard with forms for editing skills, experience, and target roles.
- Seed data migration creating Adam Blansett's profile as the primary active candidate.

#### Measurable Acceptance Criteria
1. Candidate profile for Adam Blansett is seedable via database migration or CLI command without hardcoding in business logic.
2. API supports creating, reading, updating, and querying candidate skills with proficiency levels.
3. Resume upload rejects non-PDF files and files exceeding 5MB with appropriate HTTP 400/415 errors.
4. Uploaded resume file SHA-256 hash in database matches file on disk.
5. Pytest suite validates all candidate CRUD endpoints with at least 90% code coverage.

---

### Milestone 3: Modular Job Discovery Engine & Adapters

#### Objectives
Build an extensible job discovery pipeline with provider-neutral adapter abstractions. Ingest opportunities from target sources, normalize data, detect duplicates, and track listing lifecycle.

#### Deliverables
- Abstract base class `BaseJobSourceAdapter` with standardized query and listing extraction methods.
- Implementation of initial discovery adapters (e.g., Greenhouse API adapter, Lever API adapter, RSS/structured feeds adapter).
- Canonical job data normalizer mapping external fields to `JobOpportunityCreate` schema.
- Cryptographic deduplication engine computing SHA-256 hashes from normalized title, company domain, and body text.
- REST API endpoints (`/api/v1/jobs`) with search, filter (remote, location, seniority), and manual job ingestion.
- React dashboard "Job Discovery" view with search filters and listing cards.

#### Measurable Acceptance Criteria
1. Adding a new job source requires implementing only `BaseJobSourceAdapter` without modifying discovery service logic.
2. Deduplication engine correctly identifies and rejects identical job postings arriving from different sources or reposts.
3. Search API supports filtering by remote status (`REMOTE`, `HYBRID`, `ONSITE`) and minimum salary.
4. Ingestion of 100 job listings completes in under 5 seconds with zero database deadlocks.
5. Unit tests with mocked external HTTP responses verify error handling (rate limits, network timeouts, invalid JSON).

---

### Milestone 4: AI Evaluation Engine & Model Routing

#### Objectives
Construct a provider-neutral AI orchestration layer that evaluates discovered jobs against the candidate profile using structured LLM outputs, generates suitability scores, and tracks token usage and costs.

#### Deliverables
- Abstract base class `BaseAIProvider` and provider implementations (`OpenAIProvider`, `AnthropicProvider`, `GeminiProvider`, `OllamaProvider`).
- Model router supporting primary and fallback providers with configurable token budgets.
- Pydantic schema `JobEvaluationResult` enforcing structured output (scores, recommendation, mandatory vs. preferred skills match, strengths, concerns, rationale).
- Evaluation service computing multi-factor fit: technical skills, years of experience, seniority, compensation, and remote eligibility.
- Cost tracking module recording prompt tokens, completion tokens, and calculated USD expenditure per evaluation in `job_evaluations`.
- React UI evaluation modal displaying detailed match breakdown, radar/score metrics, and recommendation pills.

#### Measurable Acceptance Criteria
1. AI evaluation returns 100% schema-valid JSON conforming to `JobEvaluationResult`; malformed outputs trigger automatic retry.
2. Non-mandatory missing qualifications do not cause automatic rejection; recommendation logic weighs overall suitability.
3. Every completed evaluation has accurate `prompt_tokens`, `completion_tokens`, and non-zero `cost_usd` recorded in the database.
4. Switching from OpenAI to Anthropic or Gemini requires only an environment or configuration change.
5. Unit tests with mocked LLM responses verify evaluation logic across diverse candidate-job match scenarios.

---

### Milestone 5: Recruiter Discovery & Contact Verification

#### Objectives
Identify relevant technical recruiters, hiring managers, and talent specialists for qualified opportunities. Implement an evidence-based verification pipeline to eliminate fabricated contact information.

#### Deliverables
- Abstract base class `BaseRecruiterResearchAdapter` for professional contact discovery.
- Contact research service linking recruiters to companies and specific job opportunities (`recruiter_job_associations`).
- Multi-step email verification engine:
  - Syntax and RFC compliance validation.
  - DNS MX-record verification.
  - Source confidence scoring (0.00 to 1.00).
- Strict non-fabrication rule: Contact records are explicitly flagged `is_verified = FALSE` unless corroborated by authoritative evidence.
- React dashboard "Recruiter Directory" and job-recruiter association view.

#### Measurable Acceptance Criteria
1. System never marks an email as verified without a recorded verification method and timestamp.
2. Associating a recruiter with a job links them through the normalized database relation.
3. Invalid email domains (non-existent MX records) are flagged with 0.0 confidence score and rejected.
4. Recruiter research adapter tests verify parsing and contact association with 100% pass rate.

---

### Milestone 6: Professional Outreach Engine & Gmail Integration (Human Gate Enforced)

#### Objectives
Generate tailored, professional outreach drafts and integrate authorized Google Gmail APIs with an ironclad human approval gateway.

#### Deliverables
- Outreach generator creating concise, personalized email drafts tailored to the specific role and recruiter.
- Google OAuth 2.0 authorization flow (`/api/v1/auth/google`) storing refresh tokens encrypted with AES-256-GCM.
- Draft creation in Gmail via Google Gmail API (`users.drafts.create`).
- Strict human approval gateway: API endpoint `POST /api/v1/outreach/{id}/approve` and database constraint `chk_outreach_sent_requires_approval`.
- Outreach approval dashboard page in React:
  - Side-by-side view of recruiter, job, AI match summary, and draft message.
  - Inline editing of subject and message body.
  - Resume attachment selector.
  - Explicit "Approve & Send" and "Reject / Discard" buttons.
- Inbound response tracker monitoring email threads and classifying replies (interview request, rejection, inquiry).

#### Measurable Acceptance Criteria
1. **Critical:** Under no circumstances can any automated process send an email without an authenticated user triggering the approval endpoint.
2. Direct database attempts to set `status = 'SENT'` without `approved_at` and `approved_by_user_id` fail with PostgreSQL constraint violation.
3. Stored Google OAuth tokens in PostgreSQL are verified to be ciphertext (AES-256-GCM), not plaintext.
4. Candidate can edit draft text prior to approval; approved text is what gets dispatched.
5. Sent message creates an immutable entry in `audit_events`.

---

### Milestone 7: Background Automation & Task Orchestration (Celery + Redis)

#### Objectives
Deploy Celery workers and Celery Beat scheduler for automated, periodic background tasks (scheduled discovery, staleness checks, response syncing) while respecting human approval boundaries.

#### Deliverables
- Celery application (`backend/app/tasks/celery_app.py`) with Redis broker.
- Scheduled tasks:
  - `scheduled_job_discovery`: Periodic querying of job adapters.
  - `check_job_expiration`: Inspecting active jobs for removed or expired links.
  - `sync_email_responses`: Checking Gmail threads for replies to outreach.
  - `batch_job_evaluation`: Evaluating unassessed jobs in the pipeline.
- Task monitoring API endpoints (`/api/v1/tasks/status/{task_id}`) and Celery task execution logging.
- Dead-letter handling and exponential backoff retry policies.

#### Measurable Acceptance Criteria
1. Celery Beat triggers scheduled jobs according to defined cron expressions.
2. Background workers run discovery, parsing, and draft generation autonomously without ever attempting automatic email transmission.
3. Failed tasks record error tracebacks in `task_executions` and retry with exponential backoff up to 3 times.
4. System load remains stable with worker concurrency limits properly configured.

---

### Milestone 8: Production Readiness, Security Hardening & Acceptance Testing

#### Objectives
Conduct full security auditing, prompt injection hardening, performance optimization, Docker production packaging, end-to-end integration testing, and deployment verification on Linux.

#### Deliverables
- Multi-stage production `Dockerfile`s optimized for minimal footprint and security.
- Production `docker-compose.prod.yml` with SSL reverse proxy, secure volume mappings, and secrets management.
- Security audit report validating OWASP Top 10 defenses, prompt injection boundaries, and rate limits.
- Backup and restore scripts for PostgreSQL (`scripts/backup_db.sh`, `scripts/restore_db.sh`).
- End-to-end (E2E) integration test suite validating the complete pipeline flow: Discovery → Evaluation → Recruiter Match → Draft → Human Approval → Dispatch simulation.
- Complete operational handbook (`docs/OPERATIONS_GUIDE.md`).

#### Measurable Acceptance Criteria
1. Full test suite (backend pytest + frontend vitest + E2E integration) passes with zero errors.
2. Security tests verify that indirect prompt injection inside a job posting cannot escape delimiters or invoke tools.
3. Cold-start deployment on a clean Linux Docker host completes via `docker compose -f docker-compose.prod.yml up -d` in under 3 minutes.
4. Database backup and restore verification test succeeds with zero data loss.
5. All documentation complete, accurate, and signed off.

---

## 3. Milestone 1 Detailed Action Plan (Immediate Next Step)

Upon user approval of this architecture and roadmap, Milestone 1 will be executed with the following precise tasks:

1. **Repository Setup:**
   - Create `.gitignore` (Python, Node, Docker, secrets, virtualenvs).
   - Create `.env.example` defining all required configuration variables.
2. **Backend Foundation:**
   - Create `backend/pyproject.toml` with pinned dependencies (FastAPI, Pydantic, SQLAlchemy, Alembic, Celery, Redis, etc.).
   - Configure `backend/app/main.py`, `backend/app/config.py`, `backend/app/core/database.py`.
   - Setup Alembic configuration (`alembic.ini`, `alembic/env.py`).
   - Implement health check API router (`/health`).
3. **Frontend Foundation:**
   - Scaffold `frontend/` using Vite with React + TypeScript template.
   - Configure Tailwind CSS (`tailwind.config.js`, `postcss.config.js`).
   - Create initial App shell with health status monitor.
4. **Docker Orchestration:**
   - Create `docker/Dockerfile.backend` and `docker/Dockerfile.frontend`.
   - Create root `docker-compose.yml` defining `postgres`, `redis`, `backend`, and `frontend` services with network isolation.
5. **Initial Test Suite:**
   - Implement backend pytest fixtures (`tests/conftest.py`) and test for `/health`.
   - Implement frontend vitest test checking App component render.
   - Run tests and confirm green status across the board.
