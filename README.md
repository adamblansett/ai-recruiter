# AI Recruiter

An intelligent, personal career discovery, recruiter identification, opportunity evaluation, and professional outreach management platform.

Built with a **Python-first architecture** (FastAPI, SQLAlchemy 2.0, Alembic, Celery, Redis) and a modern **React + Vite + TypeScript** dashboard.

---

## Core Capabilities

- **Personal Job Search Assistant:** Candidate-first platform focused on personal opportunity discovery, tracking, and targeted outreach.
- **Provider-Neutral AI Evaluation:** Structured LLM evaluations evaluating candidate-job alignment, required vs. preferred skills, and cost/token tracking.
- **Recruiter Identification & Evidence-Based Verification:** Pinpoints technical recruiters and hiring managers with DNS MX-record validation and confidence scoring.
- **Human-in-the-Loop Outreach:** Tailors personalized email communications via authorized Google Gmail APIs with an ironclad database-enforced human approval gate.
- **18-Stage Recruiting Pipeline:** Complete tracking from initial discovery to interview, offer, or archival.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.12+, FastAPI, Pydantic v2 |
| **Persistence & ORM** | PostgreSQL 16, SQLAlchemy 2.0 (Async), Alembic |
| **Worker Queue & Broker** | Celery 5.4, Redis 7.2 |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query |
| **Security & Crypto** | AES-256-GCM authenticated credential encryption, Argon2, JWT |
| **Deployment** | Docker & Docker Compose |

---

## Documentation

- [Architecture Assessment & Specification](file:///c:/Users/adamb/StudioProjects/ai-recruiter/docs/AI_RECRUITER_ARCHITECTURE.md)
- [Database Schema & ER Design](file:///c:/Users/adamb/StudioProjects/ai-recruiter/docs/AI_RECRUITER_DATABASE_DESIGN.md)
- [Security Requirements & Threat Model](file:///c:/Users/adamb/StudioProjects/ai-recruiter/docs/AI_RECRUITER_SECURITY_REQUIREMENTS.md)
- [Phased Implementation Roadmap & Acceptance Criteria](file:///c:/Users/adamb/StudioProjects/ai-recruiter/docs/AI_RECRUITER_DEVELOPMENT_ROADMAP.md)
- [Current State Audit](file:///c:/Users/adamb/StudioProjects/ai-recruiter/docs/AI_RECRUITER_CURRENT_STATE_AUDIT.md)

---

## Quickstart (Docker Compose)

1. Clone repository and copy environment configuration:
   ```bash
   cp .env.example .env
   ```

2. Start the application services:
   ```bash
   docker compose up -d
   ```

3. Access the services:
   - **Frontend Dashboard:** http://localhost:3000
   - **Backend API Docs:** http://localhost:8000/docs
   - **API Health Check:** http://localhost:8000/health

---

## License

This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/adamb/StudioProjects/ai-recruiter/LICENSE) file for details.
