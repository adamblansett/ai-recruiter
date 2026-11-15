import logging
from datetime import datetime, timezone
from typing import List, Optional
import httpx

from app.adapters.jobs.base import BaseJobSourceAdapter, JobSearchQuery, RawJobListing

logger = logging.getLogger(__name__)


class LeverBoardAdapter(BaseJobSourceAdapter):
    """
    Adapter fetching public jobs from company boards hosted on Lever API
    (e.g., https://api.lever.co/v0/postings/{site}).
    """

    def __init__(self, target_sites: Optional[List[str]] = None):
        self.target_sites = target_sites or [
            "figma",
            "retool",
            "postman",
            "netflix",
            "palantir",
            "moderntreasury",
        ]

    @property
    def source_name(self) -> str:
        return "lever_api"

    async def is_available(self) -> bool:
        return True

    async def fetch_jobs(self, query: JobSearchQuery) -> List[RawJobListing]:
        listings: List[RawJobListing] = []

        async with httpx.AsyncClient(timeout=4.0) as client:
            for site in self.target_sites:
                try:
                    url = f"https://api.lever.co/v0/postings/{site}?mode=json"
                    res = await client.get(url)
                    if res.status_code == 200:
                        postings = res.json()
                        for p in postings:
                            title = p.get("text", "")
                            if any(term.lower() in title.lower() for term in query.query_terms):
                                loc = p.get("categories", {}).get("location", "Remote")
                                is_remote = "remote" in loc.lower() or query.remote_only
                                if query.remote_only and not is_remote:
                                    continue
                                listings.append(
                                    RawJobListing(
                                        title=title,
                                        company_name=site.capitalize(),
                                        company_domain=f"{site}.com",
                                        location=loc,
                                        remote_type="REMOTE" if is_remote else "HYBRID",
                                        employment_type="FULL_TIME",
                                        source_adapter=self.source_name,
                                        external_job_id=p.get("id"),
                                        source_url=p.get("hostedUrl", f"https://jobs.lever.co/{site}"),
                                        raw_description=p.get("descriptionPlain", f"Role at {site}"),
                                        published_at=datetime.now(timezone.utc),
                                    )
                                )
                except Exception as e:
                    logger.debug(f"Lever board '{site}' network fetch skipped: {e}")

        return listings[: query.limit]
