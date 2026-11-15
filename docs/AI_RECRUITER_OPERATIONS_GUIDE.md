# AI Recruiter — Production Operations & Deployment Guide

**Document Version:** 1.0.0  
**Classification:** Operational Runbook  
**Target Platform:** Linux Server (Ubuntu 22.04+ / Debian 12) with Docker & Docker Compose  

---

## 1. System Architecture in Production

In production, AI Recruiter runs as a secure, containerized stack composed of:
1. `ai_recruiter_postgres`: PostgreSQL 16 database with persistent volume.
2. `ai_recruiter_redis`: Redis 7.2 broker and memory cache.
3. `ai_recruiter_ai_engine`: Local open-weight inference container (Ollama / Llama 3.2 3B). Zero external API keys needed.
4. `ai_recruiter_backend`: FastAPI Python 3.12 application.
5. `ai_recruiter_celery_worker`: Background task processor for scraping and evaluations.
6. `ai_recruiter_celery_beat`: Periodic scheduler triggering automated routines.
7. `ai_recruiter_frontend`: React TypeScript dashboard served through hardened Nginx.

---

## 2. Server Provisioning & Initial Deployment

### 2.1 Prerequisites on Linux Host
```bash
sudo apt-get update && sudo apt-get install -y curl git docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker
```

### 2.2 Clone & Configure
```bash
git clone https://github.com/adamblansett/ai-recruiter.git /opt/ai-recruiter
cd /opt/ai-recruiter
cp .env.example .env
```

Generate secure production keys:
```bash
# Generate 32-byte secret keys
openssl rand -hex 32
```
Update `.env` with strong random values for `SECRET_KEY`, `ENCRYPTION_KEY`, and `POSTGRES_PASSWORD`.

### 2.3 Pull Model Weights into Built-in AI Engine
Once containers boot, pull the default local model:
```bash
docker compose exec ai_engine ollama pull llama3.2:3b
```

### 2.4 Run Database Migrations & Initial Seed
```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.db.seed
```

---

## 3. Operational Runbooks

### 3.1 Backup Database
Run the included backup script:
```bash
./scripts/backup_db.sh
```
Creates a timestamped, gzip-compressed SQL dump in `./backups/`.

### 3.2 Restore Database
```bash
./scripts/restore_db.sh ./backups/ai_recruiter_backup_YYYYMMDD_HHMMSS.sql.gz
```

### 3.3 Log Inspection & Health Probes
```bash
# View backend logs
docker compose logs -f backend

# View Celery worker logs
docker compose logs -f celery_worker

# Probe health
curl -f http://localhost:8000/health
curl -f http://localhost:8000/api/v1/system/status
```

---

## 4. Security Invariants Checklist

- [x] **Human-in-the-Loop Gate:** All outbound communications require explicit user approval. Database check constraint `chk_outreach_sent_requires_approval` strictly blocks automated transmission.
- [x] **Encrypted Credentials:** All stored OAuth tokens and keys are encrypted at rest with AES-256-GCM.
- [x] **Prompt Isolation:** Job postings and external emails are wrapped in XML tags and treated as untrusted data.
- [x] **Built-in Local AI:** No external cloud dependency required for opportunity discovery and evaluation.
