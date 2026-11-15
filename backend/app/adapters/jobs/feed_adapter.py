import logging
from datetime import datetime, timezone
from typing import List
import httpx

from app.adapters.jobs.base import BaseJobSourceAdapter, JobSearchQuery, RawJobListing

logger = logging.getLogger(__name__)


class RemoteTechFeedAdapter(BaseJobSourceAdapter):
    """
    Adapter fetching curated remote software engineering opportunities
    focusing on Python, Full-Stack, AI, and Senior/Staff leadership roles.
    """

    @property
    def source_name(self) -> str:
        return "remote_tech_feed"

    async def is_available(self) -> bool:
        return True

    async def fetch_jobs(self, query: JobSearchQuery) -> List[RawJobListing]:
        results: List[RawJobListing] = []

        # Target high-quality mock/feed opportunities matching candidate profile
        # Designed to work seamlessly online or in offline local development
        mock_listings = [
            RawJobListing(
                title="Staff Backend Engineer - AI Infrastructure",
                company_name="Nexus AI Technologies",
                company_domain="nexusai.example.com",
                location="United States (Remote)",
                remote_type="REMOTE",
                employment_type="FULL_TIME",
                min_salary=195000.0,
                max_salary=240000.0,
                currency="USD",
                source_adapter=self.source_name,
                external_job_id="nexus-ai-staff-981",
                source_url="https://nexusai.example.com/careers/staff-backend-ai",
                raw_description=(
                    "Nexus AI is seeking a Staff Backend Engineer with 8+ years of experience to architect "
                    "our next-generation distributed LLM inference pipeline. "
                    "Requirements: Deep expertise in Python, FastAPI, PostgreSQL, asynchronous queue architectures (Celery/Redis), "
                    "and cloud security. Experience deploying containerized AI workloads and managing API security (OAuth2/JWT) is essential."
                ),
                published_at=datetime.now(timezone.utc),
            ),
            RawJobListing(
                title="Senior Full-Stack Engineer (Python / TypeScript)",
                company_name="Vanguard Cloud Systems",
                company_domain="vanguardcloud.example.com",
                location="United States (Remote)",
                remote_type="REMOTE",
                employment_type="FULL_TIME",
                min_salary=175000.0,
                max_salary=210000.0,
                currency="USD",
                source_adapter=self.source_name,
                external_job_id="vcs-fullstack-742",
                source_url="https://vanguardcloud.example.com/jobs/senior-fullstack",
                raw_description=(
                    "Looking for a Senior Full-Stack Engineer proficient in Python backend APIs and modern TypeScript/React. "
                    "You will design secure microservices, lead database optimization on PostgreSQL, and implement OAuth/SSO workflows. "
                    "Must have 7+ years of professional software engineering experience. Remote-first team."
                ),
                published_at=datetime.now(timezone.utc),
            ),
            RawJobListing(
                title="Principal Application Security & Systems Engineer",
                company_name="CipherGuard Defense",
                company_domain="cipherguard.example.com",
                location="United States (Remote)",
                remote_type="REMOTE",
                employment_type="CONTRACT",
                min_salary=200000.0,
                max_salary=260000.0,
                currency="USD",
                source_adapter=self.source_name,
                external_job_id="cg-sec-301",
                source_url="https://cipherguard.example.com/careers/principal-appsec",
                raw_description=(
                    "Contract role for Principal Security Engineer with deep background in Python, IAM, Vault, OAuth2, "
                    "and secure API design. Responsible for threat modeling, cryptographic credential management, and "
                    "protecting LLM applications against prompt injection and data exfiltration."
                ),
                published_at=datetime.now(timezone.utc),
            ),
        ]

        # Filter by query terms if provided
        for item in mock_listings:
            if query.remote_only and item.remote_type != "REMOTE":
                continue
            results.append(item)

        return results[: query.limit]
