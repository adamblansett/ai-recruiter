"""initial core schema

Revision ID: 0001_initial_core
Revises: 
Create Date: 2026-11-09 03:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001_initial_core"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(120), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # 2. candidate_profiles
    op.create_table(
        "candidate_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("headline", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("target_seniority", sa.String(50), nullable=False),
        sa.Column("location_base", sa.String(100), nullable=False, server_default="United States"),
        sa.Column("remote_preference", sa.String(30), nullable=False, server_default="REMOTE_FIRST"),
        sa.Column("employment_types", postgresql.ARRAY(sa.String(50)), nullable=False),
        sa.Column("target_min_salary", sa.Integer(), nullable=True),
        sa.Column("preferred_currency", sa.String(3), nullable=False, server_default="USD"),
        sa.Column("work_authorization_status", sa.String(50), nullable=False, server_default="US_CITIZEN"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 3. candidate_skills
    op.create_table(
        "candidate_skills",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("years_experience", sa.Numeric(4, 1), nullable=False),
        sa.Column("proficiency_level", sa.String(30), nullable=False, server_default="EXPERT"),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("candidate_id", "name", name="uq_candidate_skill"),
    )
    op.create_index("ix_candidate_skills_name", "candidate_skills", ["name"])

    # 4. candidate_experiences
    op.create_table(
        "candidate_experiences",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_name", sa.String(150), nullable=False),
        sa.Column("title", sa.String(150), nullable=False),
        sa.Column("location", sa.String(100), nullable=True),
        sa.Column("is_current", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("technologies_used", postgresql.ARRAY(sa.String(100)), nullable=False),
        sa.Column("accomplishments", postgresql.JSONB(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 5. candidate_educations
    op.create_table(
        "candidate_educations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("institution", sa.String(200), nullable=False),
        sa.Column("degree", sa.String(150), nullable=False),
        sa.Column("field_of_study", sa.String(150), nullable=False),
        sa.Column("graduation_year", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 6. resumes
    op.create_table(
        "resumes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("label", sa.String(100), nullable=False),
        sa.Column("file_path", sa.String(512), nullable=False),
        sa.Column("file_hash", sa.String(64), nullable=False),
        sa.Column("file_size_bytes", sa.Integer(), nullable=False),
        sa.Column("mime_type", sa.String(50), nullable=False, server_default="application/pdf"),
        sa.Column("parsed_markdown", sa.Text(), nullable=True),
        sa.Column("target_role_category", sa.String(100), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 7. companies
    op.create_table(
        "companies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("normalized_name", sa.String(200), nullable=False),
        sa.Column("domain", sa.String(255), nullable=True, unique=True),
        sa.Column("industry", sa.String(100), nullable=True),
        sa.Column("company_size", sa.String(50), nullable=True),
        sa.Column("website_url", sa.String(500), nullable=True),
        sa.Column("careers_url", sa.String(500), nullable=True),
        sa.Column("linkedin_url", sa.String(500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_companies_normalized_name", "companies", ["normalized_name"])

    # 8. job_opportunities
    op.create_table(
        "job_opportunities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("title", sa.String(250), nullable=False),
        sa.Column("normalized_title", sa.String(250), nullable=False),
        sa.Column("location", sa.String(150), nullable=False),
        sa.Column("remote_type", sa.String(30), nullable=False),
        sa.Column("employment_type", sa.String(30), nullable=False),
        sa.Column("min_salary", sa.Numeric(12, 2), nullable=True),
        sa.Column("max_salary", sa.Numeric(12, 2), nullable=True),
        sa.Column("currency", sa.String(3), nullable=False, server_default="USD"),
        sa.Column("source_adapter", sa.String(50), nullable=False),
        sa.Column("external_job_id", sa.String(255), nullable=True),
        sa.Column("source_url", sa.String(1000), nullable=False),
        sa.Column("raw_description", sa.Text(), nullable=False),
        sa.Column("cleaned_description", sa.Text(), nullable=False),
        sa.Column("dedup_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("pipeline_stage", sa.String(50), nullable=False, server_default="DISCOVERED"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("discovered_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expired_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_jobs_pipeline_stage", "job_opportunities", ["pipeline_stage"])
    op.create_index("ix_jobs_dedup_hash", "job_opportunities", ["dedup_hash"])

    # 9. recruiters
    op.create_table(
        "recruiters",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("full_name", sa.String(150), nullable=False),
        sa.Column("title", sa.String(150), nullable=False),
        sa.Column("recruiter_type", sa.String(50), nullable=False, server_default="INTERNAL_TA"),
        sa.Column("linkedin_url", sa.String(500), nullable=True),
        sa.Column("public_profile_url", sa.String(500), nullable=True),
        sa.Column("source_of_discovery", sa.String(100), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 10. recruiter_contacts
    op.create_table(
        "recruiter_contacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("recruiter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("contact_type", sa.String(20), nullable=False),
        sa.Column("contact_value", sa.String(255), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("verification_method", sa.String(100), nullable=True),
        sa.Column("confidence_score", sa.Numeric(3, 2), nullable=False, server_default="0.00"),
        sa.Column("verification_evidence", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("recruiter_id", "contact_type", "contact_value", name="uq_recruiter_contact"),
    )

    # 11. recruiter_job_associations
    op.create_table(
        "recruiter_job_associations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("recruiter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("job_opportunities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("association_type", sa.String(50), nullable=False, server_default="PRIMARY_RECRUITER"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("recruiter_id", "job_id", name="uq_recruiter_job"),
    )

    # 12. job_evaluations
    op.create_table(
        "job_evaluations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("job_opportunities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("overall_score", sa.Numeric(4, 1), nullable=False),
        sa.Column("technical_match_score", sa.Numeric(4, 1), nullable=False),
        sa.Column("seniority_fit_score", sa.Numeric(4, 1), nullable=False),
        sa.Column("compensation_fit_score", sa.Numeric(4, 1), nullable=True),
        sa.Column("recommendation", sa.String(30), nullable=False),
        sa.Column("mandatory_skills_met", postgresql.JSONB(), nullable=False, server_default="[]"),
        sa.Column("preferred_skills_met", postgresql.JSONB(), nullable=False, server_default="[]"),
        sa.Column("missing_qualifications", postgresql.JSONB(), nullable=False, server_default="[]"),
        sa.Column("strengths", postgresql.JSONB(), nullable=False, server_default="[]"),
        sa.Column("potential_concerns", postgresql.JSONB(), nullable=False, server_default="[]"),
        sa.Column("rationale_markdown", sa.Text(), nullable=False),
        sa.Column("ai_provider", sa.String(50), nullable=False),
        sa.Column("ai_model", sa.String(100), nullable=False),
        sa.Column("prompt_version", sa.String(20), nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), nullable=False),
        sa.Column("completion_tokens", sa.Integer(), nullable=False),
        sa.Column("cost_usd", sa.Numeric(8, 5), nullable=False, server_default="0.00000"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 13. outreach_drafts with CHECK constraint
    op.create_table(
        "outreach_drafts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("job_opportunities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recruiter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("recruiters.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidate_profiles.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("resume_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True),
        sa.Column("channel", sa.String(30), nullable=False, server_default="GMAIL"),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("body_markdown", sa.Text(), nullable=False),
        sa.Column("body_html", sa.Text(), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="AWAITING_APPROVAL"),
        sa.Column("approval_notes", sa.Text(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("external_message_id", sa.String(255), nullable=True),
        sa.Column("external_thread_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "(status != 'SENT') OR (status = 'SENT' AND approved_at IS NOT NULL AND approved_by_user_id IS NOT NULL)",
            name="chk_outreach_sent_requires_approval",
        ),
    )

    # 14. communications
    op.create_table(
        "communications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("outreach_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("outreach_drafts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("external_thread_id", sa.String(255), nullable=False),
        sa.Column("external_message_id", sa.String(255), nullable=False, unique=True),
        sa.Column("direction", sa.String(20), nullable=False),
        sa.Column("sender_address", sa.String(255), nullable=False),
        sa.Column("recipient_address", sa.String(255), nullable=False),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("body_text", sa.Text(), nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("classification_intent", sa.String(50), nullable=True),
        sa.Column("sentiment", sa.String(30), nullable=True),
        sa.Column("raw_payload_json", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 15. api_credentials
    op.create_table(
        "api_credentials",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider_name", sa.String(50), nullable=False),
        sa.Column("encrypted_access_token", sa.LargeBinary(), nullable=True),
        sa.Column("encrypted_refresh_token", sa.LargeBinary(), nullable=True),
        sa.Column("encrypted_api_key", sa.LargeBinary(), nullable=True),
        sa.Column("token_expiry", sa.DateTime(timezone=True), nullable=True),
        sa.Column("scopes", postgresql.ARRAY(sa.String(255)), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "provider_name", name="uq_user_provider"),
    )

    # 16. ai_model_configs
    op.create_table(
        "ai_model_configs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("provider_name", sa.String(50), nullable=False),
        sa.Column("model_name", sa.String(100), nullable=False),
        sa.Column("model_alias", sa.String(100), nullable=False),
        sa.Column("cost_per_million_input", sa.Numeric(8, 4), nullable=False, server_default="0.0000"),
        sa.Column("cost_per_million_output", sa.Numeric(8, 4), nullable=False, server_default="0.0000"),
        sa.Column("context_window", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("routing_tier", sa.String(20), nullable=False, server_default="PRIMARY"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 17. task_executions
    op.create_table(
        "task_executions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("task_name", sa.String(100), nullable=False),
        sa.Column("celery_task_id", sa.String(100), nullable=False, unique=True),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("result_summary", postgresql.JSONB(), nullable=False, server_default="{}"),
    )

    # 18. audit_events
    op.create_table(
        "audit_events",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.String(100), nullable=False),
        sa.Column("changes_json", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_audit_entity", "audit_events", ["entity_type", "entity_id"])
    op.create_index("ix_audit_created_at", "audit_events", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_events")
    op.drop_table("task_executions")
    op.drop_table("ai_model_configs")
    op.drop_table("api_credentials")
    op.drop_table("communications")
    op.drop_table("outreach_drafts")
    op.drop_table("job_evaluations")
    op.drop_table("recruiter_job_associations")
    op.drop_table("recruiter_contacts")
    op.drop_table("recruiters")
    op.drop_table("job_opportunities")
    op.drop_table("companies")
    op.drop_table("resumes")
    op.drop_table("candidate_educations")
    op.drop_table("candidate_experiences")
    op.drop_table("candidate_skills")
    op.drop_table("candidate_profiles")
    op.drop_table("users")
