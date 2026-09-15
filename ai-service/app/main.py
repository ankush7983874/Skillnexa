from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Phase 10 Routers
from app.routers.career import router as career_router
from app.routers.resume import router as resume_router
from app.routers.interview import router as interview_router
from app.routers.assistant import router as assistant_router
from app.routers.company import router as company_router
from app.routers.analytics import router as analytics_router
from app.routers.proctoring import router as proctoring_router
from app.routers.intelligence import router as intelligence_router

app = FastAPI(
    title="SkillNexa AI & Intelligence Service",
    description="Dedicated FastAPI service for explainable candidate matching, skill gap analysis, career intelligence, and resume analysis",
    version="2.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phase 1–9 routes (preserved)
@app.get("/")
def read_root():
    return {
        "success": True,
        "message": "SkillNexa AI Microservice Engine is operational",
        "version": "2.0.0",
        "phase": "Phase 10 — AI Career Intelligence",
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SkillNexa AI Service",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }

# Phase 10 & 12 Routers
app.include_router(career_router)
app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(assistant_router)
app.include_router(company_router)
app.include_router(analytics_router)
app.include_router(proctoring_router)
app.include_router(intelligence_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
