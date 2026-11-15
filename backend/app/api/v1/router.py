from fastapi import APIRouter
from app.api.v1.candidate import router as candidate_router
from app.api.v1.evaluations import router as evaluations_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.system import router as system_router

api_router = APIRouter()
api_router.include_router(system_router, prefix="/system", tags=["System"])
api_router.include_router(candidate_router, prefix="/candidate", tags=["Candidate Profile"])
api_router.include_router(resumes_router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["Job Opportunities"])
api_router.include_router(evaluations_router, prefix="/evaluations", tags=["AI Evaluations"])
