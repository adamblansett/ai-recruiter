import asyncio
import json
import logging
import sys
from typing import List

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("live_discovery")

# Add backend directory to sys.path
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.adapters.jobs.base import JobSearchQuery
from app.adapters.jobs.greenhouse_adapter import GreenhouseBoardAdapter
from app.adapters.jobs.lever_adapter import LeverBoardAdapter


async def run_live_discovery_test():
    logger.info("==========================================================")
    logger.info("  AI Recruiter - Live Target Board Discovery Test Run     ")
    logger.info("==========================================================")

    query = JobSearchQuery(
        keywords=["Staff", "Senior", "Backend", "Distributed", "AI", "Platform"],
        remote_only=True,
        min_salary=185000,
    )

    gh_adapter = GreenhouseBoardAdapter()
    lever_adapter = LeverBoardAdapter()

    logger.info(f"Greenhouse Target Boards ({len(gh_adapter.target_boards)}): {', '.join(gh_adapter.target_boards)}")
    logger.info(f"Lever Target Sites ({len(lever_adapter.target_sites)}): {', '.join(lever_adapter.target_sites)}")

    logger.info("\nPolling Greenhouse Adapter...")
    gh_listings = await gh_adapter.fetch_jobs(query)
    logger.info(f"  -> Extracted {len(gh_listings)} opportunities from Greenhouse boards.")

    logger.info("\nPolling Lever Adapter...")
    lever_listings = await lever_adapter.fetch_jobs(query)
    logger.info(f"  -> Extracted {len(lever_listings)} opportunities from Lever sites.")

    total = len(gh_listings) + len(lever_listings)
    logger.info(f"\nTotal Live Opportunities Ingested: {total}")

    sample_count = min(3, len(gh_listings))
    if sample_count > 0:
        logger.info("\n--- Sample Ingested Greenhouse Roles ---")
        for job in gh_listings[:sample_count]:
            logger.info(f"• [{job.company_name}] {job.title} | {job.location} | Remote: {job.remote_type}")

    sample_lever = min(3, len(lever_listings))
    if sample_lever > 0:
        logger.info("\n--- Sample Ingested Lever Roles ---")
        for job in lever_listings[:sample_lever]:
            logger.info(f"• [{job.company_name}] {job.title} | {job.location} | Remote: {job.remote_type}")

    logger.info("\nDiscovery test completed successfully!")


if __name__ == "__main__":
    asyncio.run(run_live_discovery_test())
