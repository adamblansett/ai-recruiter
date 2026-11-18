import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.offer import CounterOfferTargets, OfferEvaluationResult, OfferInput
from app.services.candidate_service import CandidateService

logger = logging.getLogger(__name__)

# US Remote Staff/Senior Market Benchmarks (Senior: $180k-$220k TC, Staff: $230k-$300k TC)
STAFF_MARKET_MEDIAN_TC = 245000.0
STAFF_MARKET_75TH_TC = 285000.0
STAFF_MARKET_90TH_TC = 330000.0


class OfferService:
    """
    Evaluates total compensation packages, compares against candidate baseline
    and US Staff/Senior engineering benchmarks, and generates data-backed negotiation scripts.
    """

    @classmethod
    async def evaluate_offer(
        cls,
        db: AsyncSession,
        offer: OfferInput,
    ) -> OfferEvaluationResult:
        # 1. Fetch Candidate Profile baseline
        profile = await CandidateService.get_active_profile(db)
        target_min_salary = float(profile.target_min_salary) if profile and profile.target_min_salary else 185000.0

        # 2. Compute Compensation Totals
        first_year_tc = (
            offer.base_salary
            + offer.equity_value_annual
            + offer.bonus_target_annual
            + offer.sign_on_bonus
        )
        recurring_tc = (
            offer.base_salary
            + offer.equity_value_annual
            + offer.bonus_target_annual
        )
        baseline_diff = offer.base_salary - target_min_salary

        # 3. Market Percentile Assessment
        if recurring_tc >= STAFF_MARKET_90TH_TC:
            market_percentile = "Top 10% (Exceptional Tier)"
        elif recurring_tc >= STAFF_MARKET_75TH_TC:
            market_percentile = "75th Percentile (Upper Market)"
        elif recurring_tc >= STAFF_MARKET_MEDIAN_TC:
            market_percentile = "50th-65th Percentile (Competitive Median)"
        elif recurring_tc >= 200000.0:
            market_percentile = "35th-50th Percentile (Moderate Senior/Staff)"
        else:
            market_percentile = "Below Market (< 25th Percentile)"

        # 4. Recommendation & Strategy
        leverage_points: List[str] = [
            "10+ years of hands-on software engineering spanning backend APIs, distributed queues, and LLM orchestration.",
            "Specialized expertise in application security, zero-trust OAuth 2.0/Vault, and containerized cloud workloads.",
            "Proven track record architecting resilient high-concurrency systems.",
        ]

        if baseline_diff < 0:
            recommendation = "NEGOTIATE"
            verdict_summary = (
                f"Base salary of ${offer.base_salary:,.0f} is ${abs(baseline_diff):,.0f} below your preferred minimum target of "
                f"${target_min_salary:,.0f}. Strong negotiation required on base compensation."
            )
        elif recurring_tc >= STAFF_MARKET_75TH_TC:
            recommendation = "ACCEPT"
            verdict_summary = (
                f"Outstanding offer exceeding market medians. First-year TC: ${first_year_tc:,.0f}. "
                f"Exceeds baseline by ${baseline_diff:,.0f}. Safe to accept or ask for minor sign-on bonus bump."
            )
        else:
            recommendation = "NEGOTIATE"
            verdict_summary = (
                f"Solid competitive offer at {market_percentile}, but there is healthy room to negotiate "
                f"base compensation or sign-on bonus before signing."
            )

        # 5. Formulate Counter-Offer Targets
        proposed_base = max(offer.base_salary * 1.08, target_min_salary + 10000.0)
        proposed_equity = offer.equity_value_annual * 1.15 if offer.equity_value_annual > 0 else 0.0
        proposed_signon = max(offer.sign_on_bonus * 1.25, 20000.0)

        counter_targets = CounterOfferTargets(
            target_base_salary=round(proposed_base, -3),
            target_equity_annual=round(proposed_equity, -3),
            target_sign_on_bonus=round(proposed_signon, -3),
            target_first_year_tc=round(proposed_base + proposed_equity + offer.bonus_target_annual + proposed_signon, -3),
        )

        # 6. Craft High-Leverage Counter-Offer Email Script
        counter_email = (
            f"Subject: {offer.role_title} Offer — Adam Blansett\n\n"
            f"Dear Hiring Team,\n\n"
            f"Thank you so much for extending the offer to join {offer.company_name} as a {offer.role_title}! "
            f"I truly enjoyed our discussions and am deeply excited about the engineering challenges your team is tackling.\n\n"
            f"After carefully reviewing the details of the offer alongside current market data for Staff-level engineers, "
            f"I would love to find a package that makes this an immediate, easy decision for both of us. "
            f"Given my 10+ years of distributed backend and AI systems architecture experience, "
            f"if we can adjust the base compensation to ${counter_targets.target_base_salary:,.0f} "
            f"(or bridge the gap with a ${counter_targets.target_sign_on_bonus:,.0f} sign-on bonus), "
            f"I would be thrilled to sign the offer immediately and begin onboarding.\n\n"
            f"Please let me know if this adjustment is feasible for your team. Thank you again for your time, "
            f"and I look forward to working together!\n\n"
            f"Warm regards,\n\n"
            f"Adam Blansett\nStaff & Senior Software Engineer"
        )

        talking_points_phone = [
            f"Reiterate enthusiasm: 'I am 100% aligned with the team's mission and engineering culture.'",
            f"Anchor on base: 'My baseline target for Staff roles is ${counter_targets.target_base_salary:,.0f} base.'",
            f"Flexibility: 'If base is capped by band bands, I am very flexible on equity or sign-on bonus.'",
            f"Commitment: 'If we can meet at this number, I will withdraw other applications and sign today.'",
        ]

        return OfferEvaluationResult(
            company_name=offer.company_name,
            role_title=offer.role_title,
            first_year_tc=first_year_tc,
            recurring_annual_tc=recurring_tc,
            baseline_diff_base=baseline_diff,
            market_percentile=market_percentile,
            recommendation=recommendation,
            verdict_summary=verdict_summary,
            leverage_points=leverage_points,
            counter_targets=counter_targets,
            counter_offer_email_script=counter_email,
            talking_points_phone=talking_points_phone,
        )
