import logging
import uuid
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class NegotiationOffer(BaseModel):
    base_salary: float
    equity_annual: float
    sign_on_bonus: float
    first_year_tc: float


class NegotiationScenario(BaseModel):
    session_id: str
    job_id: str
    company_name: str
    role_title: str
    recruiter_persona: str
    round_number: int
    current_offer: NegotiationOffer
    target_compensation: NegotiationOffer
    recruiter_objection: str
    tactical_hints: List[str]


class NegotiationEvaluation(BaseModel):
    session_id: str
    round_number: int
    leverage_score: int = Field(..., ge=0, le=100)
    firmness_score: int = Field(..., ge=0, le=100)
    value_optimization_score: int = Field(..., ge=0, le=100)
    overall_tactical_score: int = Field(..., ge=0, le=100)
    verdict: str  # "HIGH_LEVERAGE_COUNTER", "MODERATE_PROGRESS", "CONCEDED_TOO_EARLY"
    strengths: List[str]
    tactical_critique: List[str]
    model_counter_script: str
    recruiter_counter_response: str
    revised_offer: NegotiationOffer


class StartNegotiationPayload(BaseModel):
    job_id: str
    company_name: Optional[str] = "Target Enterprise"
    role_title: Optional[str] = "Staff Backend Engineer"
    initial_base: Optional[float] = 195000
    initial_equity: Optional[float] = 45000
    initial_sign_on: Optional[float] = 15000
    persona_type: Optional[str] = "big_tech"  # "big_tech", "series_a", "collaborative_hr", "custom"
    custom_persona_name: Optional[str] = None
    custom_base_flexibility: Optional[int] = 15000
    custom_equity_flexibility: Optional[int] = 25000
    custom_aggression_level: Optional[int] = 3


PERSONA_PROFILES = {
    "big_tech": {
        "name": "Rachel Miller, Lead Compensation Partner",
        "title": "Big Tech Comp Committee Chair",
        "style": "Formal, band-governed, benchmark-driven",
        "description": "Rigid base salary band ceilings; deep pockets for RSUs, sign-on bridges, and performance refreshers.",
        "base_flex": 10000,
        "equity_flex": 20000,
        "sign_on_flex": 15000,
        "objection": (
            "We are thrilled to extend an offer for the {role} role at {company}! Our compensation team put together our strongest standard package: "
            "${base:,.0f} base salary, ${equity:,.0f}/yr RSU equity, and a ${sign_on:,.0f} sign-on bonus. "
            "Our internal engineering bands have a strict policy ceiling around base salary to maintain parity across our Staff L6 cohort. "
            "How does this align with your expectations?"
        ),
        "hints": [
            "Acknowledge genuine enthusiasm for the team's scale and technical roadmap first.",
            "Respect their base band ceiling, but pivot aggressively to RSUs and a Year 1 sign-on cash bridge.",
            "Cite comparable offers or market benchmarks for 10+ years backend scale.",
        ],
    },
    "series_a": {
        "name": "Alex Chen, Founding CTO & Co-Founder",
        "title": "Series A/B Startup Founder",
        "style": "Entrepreneurial, runway-conscious, equity-heavy",
        "description": "Fiercely guards cash burn; high willingness to grant outsized equity upside and milestone refreshers.",
        "base_flex": 5000,
        "equity_flex": 35000,
        "sign_on_flex": 5000,
        "objection": (
            "Adam, the entire engineering team was blown away by your systems design walkthrough. We want you leading our backend infrastructure as {role}. "
            "Because we are managing our Series A cash runway carefully, our cash base is capped at ${base:,.0f}, but we've allocated a top-tier ${equity:,.0f}/yr equity stake. "
            "We need owners who believe in 10x upside rather than maximizing immediate cash. Can you make this work?"
        ),
        "hints": [
            "Demonstrate understanding of startup unit economics and runway discipline.",
            "Ask for expanded equity grants, accelerated vesting provisions, or extended exercise windows.",
            "Propose a 6-month performance milestone for an automatic cash base adjustment upon hitting scale metrics.",
        ],
    },
    "collaborative_hr": {
        "name": "Marcus Vance, VP of People & Talent",
        "title": "Director of Talent Experience",
        "style": "Empathetic, consultative, total-rewards focused",
        "description": "Collaborative and values team retention; open to balanced base bumps, title upgrades, and remote allowances.",
        "base_flex": 15000,
        "equity_flex": 15000,
        "sign_on_flex": 10000,
        "objection": (
            "Welcome to {company}! We are so excited to extend this offer for {role}. We crafted an initial total package of ${base:,.0f} base, "
            "${equity:,.0f}/yr equity, and ${sign_on:,.0f} sign-on, along with comprehensive benefits and full remote flexibility. "
            "We want you to feel valued and supported from day one. Walk me through your thoughts on the overall compensation structure."
        ),
        "hints": [
            "Express clear enthusiasm and appreciation for the transparent process.",
            "State your target total compensation ($300k TC) calmly and ask how you can work together to bridge the gap.",
            "Leverage non-cash levers: remote setup budget, conference stipends, and early review cadences.",
        ],
    },
}


class SubmitCounterPayload(BaseModel):
    session_id: str
    round_number: int
    counter_text: str = Field(..., min_length=20)


class NegotiationSimulatorService:
    """
    Interactive salary and total compensation negotiation simulator.
    Simulates realistic recruiter objections (salary band caps, equity trade-offs, sign-on resistance)
    and evaluates candidate counter-tactics with objective scoring and model scripts.
    """

    @classmethod
    def start_negotiation(cls, payload: StartNegotiationPayload) -> NegotiationScenario:
        session_id = f"neg-{uuid.uuid4().hex[:8]}"
        initial_tc = (payload.initial_base or 195000) + (payload.initial_equity or 45000) + (payload.initial_sign_on or 15000)

        current_offer = NegotiationOffer(
            base_salary=payload.initial_base or 195000,
            equity_annual=payload.initial_equity or 45000,
            sign_on_bonus=payload.initial_sign_on or 15000,
            first_year_tc=initial_tc,
        )

        target_comp = NegotiationOffer(
            base_salary=215000,
            equity_annual=60000,
            sign_on_bonus=25000,
            first_year_tc=300000,
        )

        p_type = payload.persona_type or "big_tech"
        if p_type == "custom":
            recruiter_name = payload.custom_persona_name or "Custom Executive Recruiter"
            objection = (
                f"Thank you for interviewing for the {payload.role_title} role at {payload.company_name}. "
                f"Our committee's initial package is ${current_offer.base_salary:,.0f} base salary, ${current_offer.equity_annual:,.0f}/yr equity, "
                f"and a ${current_offer.sign_on_bonus:,.0f} sign-on bonus. How does this align with your expectations?"
            )
            hints = [
                "Clearly articulate your total compensation expectations with confidence.",
                "Highlight your 10+ years backend and distributed systems accomplishments.",
                "Provide flexible tradeoffs across base, equity, and sign-on bonus.",
            ]
        else:
            profile = PERSONA_PROFILES.get(p_type, PERSONA_PROFILES["big_tech"])
            recruiter_name = profile["name"]
            objection = profile["objection"].format(
                role=payload.role_title,
                company=payload.company_name,
                base=current_offer.base_salary,
                equity=current_offer.equity_annual,
                sign_on=current_offer.sign_on_bonus,
            )
            hints = profile["hints"]

        return NegotiationScenario(
            session_id=session_id,
            job_id=payload.job_id,
            company_name=payload.company_name or "Target Enterprise",
            role_title=payload.role_title or "Staff Backend Engineer",
            recruiter_persona=recruiter_name,
            round_number=1,
            current_offer=current_offer,
            target_compensation=target_comp,
            recruiter_objection=objection,
            tactical_hints=hints,
        )

    @classmethod
    def evaluate_counter(cls, payload: SubmitCounterPayload) -> NegotiationEvaluation:
        text = payload.counter_text.strip()
        words = len(text.split())

        has_enthusiasm = any(w in text.lower() for w in ["excited", "thrilled", "enthusiastic", "love", "mission", "appreciate"])
        has_concrete_numbers = any(c.isdigit() for c in text) or any(w in text.lower() for w in ["thousand", "base", "equity", "sign-on", "total comp", "package"])
        has_leverage_framing = any(w in text.lower() for w in ["10+", "decade", "experience", "distributed", "immediate", "value", "scale", "ramp"])
        has_concession = any(w in text.lower() for w in ["i guess", "if you can't", "take what i can get", "okay then", "not sure"])

        if words > 70 and has_enthusiasm and has_concrete_numbers and has_leverage_framing and not has_concession:
            leverage = 96
            firmness = 94
            optimization = 95
            overall = 95
            verdict = "HIGH_LEVERAGE_COUNTER"
            strengths = [
                "Masterful framing: leads with genuine team enthusiasm before anchoring counter numbers.",
                "Reinforces high-leverage value proposition (10+ years production architecture).",
                "Strategically gives the recruiter creative levers (equity & sign-on) to bypass rigid base ceilings.",
            ]
            critique = [
                "Could offer an explicit signing commitment condition (e.g. 'If we can align on this, I am prepared to sign immediately').",
            ]
            model_script = (
                "Thank you so much for putting this together. I am genuinely excited about the team's distributed infrastructure roadmap. "
                "Looking at the scope of the role and my 10+ years designing high-throughput backend systems, I am targeting $215,000 base and $60,000 annual equity. "
                "If base salary is strictly capped at $200,000, I would be happy to sign immediately if we bridge the difference with a $25,000 sign-on bonus and expanded equity grant."
            )
            recruiter_reply = (
                "I appreciate your candor and clear enthusiasm for our roadmap. Given your decade of backend scale experience, "
                "I took this to our VP of Engineering and Compensation Committee. While we can only bump base to $205,000 to maintain team equity, "
                "they approved increasing your equity to $60,000/yr and approved a $25,000 sign-on bonus! This brings your first-year total comp to $290,000."
            )
            revised = NegotiationOffer(
                base_salary=205000,
                equity_annual=60000,
                sign_on_bonus=25000,
                first_year_tc=290000,
            )
        elif words > 40:
            leverage = 82
            firmness = 80
            optimization = 82
            overall = 81
            verdict = "MODERATE_PROGRESS"
            strengths = [
                "Clear statement of desired compensation.",
                "Maintained polite and professional tone.",
            ]
            critique = [
                "Anchor more explicitly on candidate qualifications and risk reduction.",
                "Offer a clear closing trigger (signing immediately upon adjustment).",
            ]
            model_script = (
                "I appreciate the offer and am excited to join. Based on market data for Staff Engineers with 10+ years experience, "
                "I would love to see if we can get total first-year comp closer to $295,000 via a sign-on bonus or additional equity."
            )
            recruiter_reply = (
                "Thanks for sharing. I checked with our team — we can add a $10,000 sign-on bonus and bump equity by $5,000/yr, "
                "bringing first year TC to $270,000. Let me know if that works for you."
            )
            revised = NegotiationOffer(
                base_salary=195000,
                equity_annual=50000,
                sign_on_bonus=25000,
                first_year_tc=270000,
            )
        else:
            leverage = 65
            firmness = 60
            optimization = 62
            overall = 62
            verdict = "CONCEDED_TOO_EARLY"
            strengths = ["Responded promptly."]
            critique = [
                "Counter is too brief and lacks persuasive leverage.",
                "Specify target figures and quantify first-year total compensation.",
            ]
            model_script = (
                "Thank you for the offer. To move forward, I am looking for total compensation closer to $290k-$300k. "
                "Can we explore bridging this through sign-on or equity?"
            )
            recruiter_reply = (
                "Understood. Unfortunately without specific counter-proposals or competing offers, our initial offer stands as presented."
            )
            revised = NegotiationOffer(
                base_salary=195000,
                equity_annual=45000,
                sign_on_bonus=15000,
                first_year_tc=255000,
            )

        return NegotiationEvaluation(
            session_id=payload.session_id,
            round_number=payload.round_number,
            leverage_score=leverage,
            firmness_score=firmness,
            value_optimization_score=optimization,
            overall_tactical_score=overall,
            verdict=verdict,
            strengths=strengths,
            tactical_critique=critique,
            model_counter_script=model_script,
            recruiter_counter_response=recruiter_reply,
            revised_offer=revised,
        )
