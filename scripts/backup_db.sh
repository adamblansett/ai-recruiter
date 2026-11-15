#!/usr/bin/env bash
# AI Recruiter - PostgreSQL Database Backup Script
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/ai_recruiter_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting database backup at ${TIMESTAMP}..."
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-ai_recruiter}" | gzip > "${BACKUP_FILE}"

echo "[SUCCESS] Database backup completed successfully: ${BACKUP_FILE}"
