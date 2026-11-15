import asyncio
import logging
from app.core.database import async_session_maker
from app.services.candidate_service import CandidateService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed():
    logger.info("Seeding candidate profile...")
    async with async_session_maker() as session:
        profile = await CandidateService.seed_initial_candidate(session)
        logger.info(f"Successfully seeded profile for: {profile.headline}")
        logger.info(f"Loaded {len(profile.skills)} technical skills.")


if __name__ == "__main__":
    asyncio.run(seed())
