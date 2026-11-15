#!/usr/bin/env bash
# AI Recruiter - PostgreSQL Database Restore Script
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path_to_backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "[ERROR] Backup file '${BACKUP_FILE}' does not exist."
    exit 1
fi

echo "[WARNING] This will overwrite current database contents in '${POSTGRES_DB:-ai_recruiter}'."
read -p "Are you sure you want to proceed? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo "[INFO] Restoring database from ${BACKUP_FILE}..."
gunzip -c "${BACKUP_FILE}" | docker compose exec -T postgres psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-ai_recruiter}"

echo "[SUCCESS] Database restoration completed."
