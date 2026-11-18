from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.offer import OfferEvaluationResult, OfferInput
from app.services.offer_service import OfferService

router = APIRouter(prefix="/offers", tags=["Salary Negotiation & Offers"])


@router.post("/evaluate", response_model=OfferEvaluationResult, summary="Evaluate Compensation Offer & Generate Negotiation Counter-Script")
async def evaluate_job_offer(
    offer: OfferInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluates an employment offer against market benchmarks (Staff/Senior US Remote)
    and candidate minimum baseline ($185k+), generating customized negotiation scripts.
    """
    try:
        return await OfferService.evaluate_offer(db, offer)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
