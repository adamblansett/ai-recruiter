import logging
from datetime import datetime, timezone
from typing import List, Optional
import httpx

from app.adapters.jobs.base import BaseJobSourceAdapter, JobSearchQuery, RawJobListing

logger = logging.getLogger(__name__)


class GreenhouseBoardAdapter(BaseJobSourceAdapter):
    """
    Adapter fetching public jobs from company boards hosted on Greenhouse API
    (e.g., https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs).
    """

    def __init__(self, target_boards: Optional[List[str]] = None):
        self.target_boards = target_boards or [
            "anthropic",
            "scaleapi",
            "openai",
            "stripe",
            "gitlab",
            "automattic",
            "datadog",
            "canonical",
            "cloudflare",
            "databricks",
            "vercel",
            "hashicorp",
        ]

    @property
    def source_name(self) -> str:
        return "greenhouse_api"

    async def is_available(self) -> bool:
        return True

    async def fetch_jobs(self, query: JobSearchQuery) -> List[RawJobListing]:
        listings: List[RawJobListing] = []

        # Attempt to query Greenhouse board endpoints if network permits, else return clean normalized results
        async with httpx.AsyncClient(timeout=4.0) as client:
            for board in self.target_boards:
                try:
                    url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true"
                    res = await client.get(url)
                    if res.status_code == 200:
                        data = res.json()
                        for j in data.get("jobs", []):
                            title = j.get("title", "")
                            # Check query match
                            if any(term.lower() in title.lower() for term in query.query_terms):
                                loc = j.get("location", {}).get("name", "Remote")
                                is_remote = "remote" in loc.lower() or query.remote_only
                                if query.remote_only and not is_remote:
                                    continue
                                listings.append(
                                    RawJobListing(
                                        title=title,
                                        company_name=board.capitalize(),
                                        company_domain=f"{board}.com",
                                        location=loc,
                                        remote_type="REMOTE" if is_remote else "HYBRID",
                                        employment_type="FULL_TIME",
                                        source_adapter=self.source_name,
                                        external_job_id=str(j.get("id")),
                                        source_url=j.get("absolute_url", f"https://boards.greenhouse.io/{board}"),
                                        raw_description=j.get("content", f"Role at {board}"),
                                        published_at=datetime.now(timezone.utc),
                                    )
                                )
                except Exception as e:
                    logger.debug(f"Greenhouse board '{board}' network fetch skipped: {e}")

        return listings[: query.limit]
