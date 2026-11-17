import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class InterviewPrepQuestion(BaseModel):
    category: str = Field(..., description="e.g. System Design, Backend Concurrency, AI Integration")
    question: str
    difficulty: str = Field(default="HARD", description="MEDIUM, HARD, STAFF")
    talking_points: List[str] = Field(default_factory=list)
    relevant_experience_tie_in: str


class StarTalkingPoint(BaseModel):
    theme: str
    situation_task: str
    action: str
    result: str
    skills_demonstrated: List[str]


class ReverseInterviewQuestion(BaseModel):
    category: str = Field(default="Engineering Culture & Architecture")
    question: str
    intended_insight: str


class InterviewPrepPlan(BaseModel):
    job_id: uuid.UUID
    job_title: str
    company_name: str
    company_tech_focus: str
    recommended_focus_areas: List[str]
    technical_questions: List[InterviewPrepQuestion]
    star_talking_points: List[StarTalkingPoint]
    reverse_interview_questions: List[ReverseInterviewQuestion]
