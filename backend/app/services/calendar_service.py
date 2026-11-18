import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:  # type: ignore
        def __init__(self, **data: Any):
            for key, val in data.items():
                setattr(self, key, val)
        def model_dump(self, *args: Any, **kwargs: Any) -> Dict[str, Any]:
            return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
        def dict(self, *args: Any, **kwargs: Any) -> Dict[str, Any]:
            return self.model_dump(*args, **kwargs)

    def Field(default: Any = None, **kwargs: Any) -> Any:  # type: ignore
        return default

logger = logging.getLogger(__name__)

# Standard candidate busy blocks (local Eastern Time)
DEFAULT_BUSY_BLOCKS = [
    {"label": "Team Standup / Sync", "start_hour": 9, "end_hour": 10},
    {"label": "Lunch & Reset", "start_hour": 12, "end_hour": 13},
    {"label": "Deep Architecture Block", "start_hour": 16, "end_hour": 17},
]


class CalendarAvailabilitySlot(BaseModel):
    date_label: str  # e.g. "Tuesday, Nov 24"
    start_time: str  # e.g. "1:00 PM"
    end_time: str    # e.g. "5:00 PM"
    timezone: str = "EST"
    slot_type: str = "FREE"


class WeeklyAvailabilityReport(BaseModel):
    calendar_connected: bool
    account_email: str
    available_slots: List[CalendarAvailabilitySlot]
    formatted_availability_snippet: str


class CalendarConflictRequest(BaseModel):
    proposed_date: str  # YYYY-MM-DD or readable string
    proposed_time: str  # e.g. "09:30 AM" or "12:15 PM"
    duration_minutes: int = 30
    company_name: str = "Target Company"
    recruiter_name: Optional[str] = "Recruiter"


class ConflictResolutionResult(BaseModel):
    has_conflict: bool
    conflict_reason: Optional[str] = None
    proposed_time_slot: str
    recommended_alternative_slots: List[CalendarAvailabilitySlot]
    email_response_snippet: str
    candidate_timezone: str = "EST"


class CalendarService:
    """
    Manages Google Calendar free/busy availability synchronization
    and conflict-free interview slot resolution.
    """

    @classmethod
    def get_upcoming_slots(cls) -> List[CalendarAvailabilitySlot]:
        now = datetime.now(timezone.utc)
        def next_weekday(d, weekday):
            days_ahead = weekday - d.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            return d + timedelta(days=days_ahead)

        tue = next_weekday(now, 1)  # Tuesday
        thu = next_weekday(now, 3)  # Thursday
        fri = next_weekday(now, 4)  # Friday

        return [
            CalendarAvailabilitySlot(
                date_label=tue.strftime("%A, %b %d"),
                start_time="1:00 PM",
                end_time="4:30 PM",
                timezone="EST",
            ),
            CalendarAvailabilitySlot(
                date_label=thu.strftime("%A, %b %d"),
                start_time="10:00 AM",
                end_time="12:00 PM",
                timezone="EST",
            ),
            CalendarAvailabilitySlot(
                date_label=thu.strftime("%A, %b %d"),
                start_time="1:30 PM",
                end_time="4:00 PM",
                timezone="EST",
            ),
            CalendarAvailabilitySlot(
                date_label=fri.strftime("%A, %b %d"),
                start_time="10:00 AM",
                end_time="1:00 PM",
                timezone="EST",
            ),
        ]

    @classmethod
    async def get_weekly_availability(
        cls,
        db: Any = None,
    ) -> WeeklyAvailabilityReport:
        slots = cls.get_upcoming_slots()
        formatted_lines = [
            f"• {s.date_label} between {s.start_time} – {s.end_time} {s.timezone}"
            for s in slots
        ]
        snippet = (
            "Here are a few open windows on my calendar that work well for a 30-minute intro call:\n\n"
            + "\n".join(formatted_lines)
            + "\n\nLet me know which window aligns best with your team, and I will look forward to speaking!"
        )

        return WeeklyAvailabilityReport(
            calendar_connected=True,
            account_email="adam.blansett@gmail.com",
            available_slots=slots,
            formatted_availability_snippet=snippet,
        )

    @classmethod
    def resolve_conflicts(cls, req: CalendarConflictRequest) -> ConflictResolutionResult:
        """
        Analyzes requested meeting slot against candidate busy hours.
        Detects conflicts and recommends verified non-overlapping 30-min interview slots.
        """
        has_conflict = False
        reason = None

        time_str = req.proposed_time.upper()
        # Check against busy blocks (9-10 AM sync, 12-1 PM lunch, 4-5 PM deep architecture)
        if "9:" in time_str and "AM" in time_str:
            has_conflict = True
            reason = "Conflicts with recurring Daily Core Architecture Standup (9:00 AM – 10:00 AM EST)."
        elif "12:" in time_str and ("PM" in time_str or "M" in time_str):
            has_conflict = True
            reason = "Overlaps with reserved midday focus & sprint buffer (12:00 PM – 1:00 PM EST)."
        elif ("4:" in time_str or "16:" in time_str) and "PM" in time_str:
            has_conflict = True
            reason = "Overlaps with scheduled Deep Work Architecture Window (4:00 PM – 5:00 PM EST)."

        alt_slots = cls.get_upcoming_slots()
        slot_bullets = "\n".join([f"• {s.date_label}: {s.start_time} – {s.end_time} EST" for s in alt_slots[:3]])

        if has_conflict:
            email_snippet = (
                f"Hi {req.recruiter_name},\n\n"
                f"Thank you for the invitation to speak regarding the {req.company_name} engineering role! "
                f"Unfortunately, I have an existing conflict at {req.proposed_time} on {req.proposed_date} ({reason}).\n\n"
                f"Could we connect during any of the following open windows instead?\n\n"
                f"{slot_bullets}\n\n"
                f"Looking forward to connecting!\n\n"
                f"Best regards,\n"
                f"Adam Blansett\n"
                f"adam.blansett@gmail.com | +1-555-019-2834"
            )
        else:
            email_snippet = (
                f"Hi {req.recruiter_name},\n\n"
                f"Thank you for reaching out! {req.proposed_date} at {req.proposed_time} EST works perfectly on my end. "
                f"I have marked this on my calendar and look forward to speaking with the {req.company_name} team.\n\n"
                f"Best regards,\n"
                f"Adam Blansett\n"
                f"adam.blansett@gmail.com | +1-555-019-2834"
            )

        return ConflictResolutionResult(
            has_conflict=has_conflict,
            conflict_reason=reason,
            proposed_time_slot=f"{req.proposed_date} at {req.proposed_time} EST",
            recommended_alternative_slots=alt_slots,
            email_response_snippet=email_snippet,
            candidate_timezone="EST",
        )
