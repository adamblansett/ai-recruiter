import uuid
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class OfferInput(BaseModel):
    job_id: Optional[uuid.UUID] = None
    company_name: str = Field(..., example="Stripe")
    role_title: str = Field(..., example="Staff Software Engineer")
    base_salary: float = Field(..., ge=0.0, description="Annual base compensation in USD")
    equity_value_annual: float = Field(default=0.0, ge=0.0, description="Expected annual equity (RSUs/options) vesting")
    bonus_target_annual: float = Field(default=0.0, ge=0.0, description="Annual performance bonus target")
    sign_on_bonus: float = Field(default=0.0, ge=0.0, description="One-time sign-on cash bonus")
    vesting_years: int = Field(default=4, ge=1, le=10)
    benefits_notes: Optional[str] = None


class CounterOfferTargets(BaseModel):
    target_base_salary: float
    target_equity_annual: float
    target_sign_on_bonus: float
    target_first_year_tc: float


class OfferEvaluationResult(BaseModel):
    company_name: str
    role_title: str
    first_year_tc: float
    recurring_annual_tc: float
    baseline_diff_base: float
    market_percentile: str
    recommendation: str  # 'ACCEPT', 'NEGOTIATE', 'DECLINE'
    verdict_summary: str
    leverage_points: List[str]
    counter_targets: CounterOfferTargets
    counter_offer_email_script: str
    talking_points_phone: List[str]
