"""
Company AI Router — Phase 10
Endpoints: job-description-assist, candidate-insights, shortlisting-rank
AI assistance for HR — humans remain responsible for final decisions.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/company", tags=["Company AI"])

from app.routers.career import ROLE_SKILL_MAP, DIFFICULTY_MAP


class JobDescriptionRequest(BaseModel):
    title: str
    description: str
    currentSkills: List[str] = []
    employmentType: str = "Full-time"


class CandidateInsightRequest(BaseModel):
    candidateName: str
    candidateSkills: List[str] = []
    candidateSkillScores: Dict[str, int] = {}  # skill_name -> score 0-100
    verifiedSkills: List[str] = []
    cgpa: float = 0.0
    projectCount: int = 0
    certCount: int = 0
    internshipCount: int = 0
    matchScore: int = 0
    jobRequiredSkills: List[str] = []
    jobPreferredSkills: List[str] = []


class ShortlistingRequest(BaseModel):
    jobTitle: str
    requiredSkills: List[str] = []
    minCgpa: float = 0.0
    candidates: List[dict]  # [{name, matchScore, cgpa, skills, ...}]


@router.post("/job-description-assist")
def analyze_job_description(req: JobDescriptionRequest):
    """Analyze job description and suggest improvements + skill tags."""
    desc_lower = req.description.lower()
    title_lower = req.title.lower()

    # Detect likely role category
    if any(w in title_lower for w in ["full stack", "fullstack"]):
        detected_role = "Full Stack Developer"
    elif any(w in title_lower for w in ["backend", "back-end", "api"]):
        detected_role = "Backend Developer"
    elif any(w in title_lower for w in ["frontend", "front-end", "ui"]):
        detected_role = "Frontend Developer"
    elif any(w in title_lower for w in ["data", "analytics"]):
        detected_role = "Data Engineer"
    elif any(w in title_lower for w in ["devops", "sre", "cloud"]):
        detected_role = "DevOps Engineer"
    elif any(w in title_lower for w in ["ml", "machine learning", "ai"]):
        detected_role = "ML Engineer"
    else:
        detected_role = "Software Engineer"

    role_skills = ROLE_SKILL_MAP.get(detected_role, [])

    # Extract skills mentioned in description
    from app.routers.resume import TECH_SKILLS_TAXONOMY
    import re
    mentioned_skills = []
    for skill in TECH_SKILLS_TAXONOMY:
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', desc_lower):
            mentioned_skills.append(skill)

    # Suggested required skills
    suggested_required = [s for s in role_skills[:6] if s not in req.currentSkills]
    suggested_preferred = [s for s in role_skills[6:] if s not in req.currentSkills][:4]

    # Completeness issues
    issues = []
    if len(req.description) < 100:
        issues.append("Job description is too short. Add responsibilities, requirements, and company culture.")
    if not req.currentSkills:
        issues.append("No required skills specified. Add specific technology requirements.")
    if len(req.currentSkills) < 3:
        issues.append("Too few required skills listed. Specify at least 4–5 core technical skills.")
    if "responsibilities" not in desc_lower and "duties" not in desc_lower:
        issues.append("No responsibilities section detected. List day-to-day role expectations.")
    if "benefits" not in desc_lower and "perks" not in desc_lower:
        issues.append("Consider adding benefits/perks to attract top candidates.")

    # Quality tips
    tips = [
        "Use specific, searchable technology names (e.g., 'React.js' instead of 'modern frontend frameworks')",
        "Include experience level requirements clearly (e.g., '0–2 years experience')",
        "Mention growth opportunities and learning culture to attract ambitious candidates",
        "Keep job descriptions to 300–500 words for best ATS performance",
    ]

    return {
        "success": True,
        "detectedRole": detected_role,
        "mentionedSkillsInDescription": mentioned_skills,
        "suggestedRequiredSkills": suggested_required,
        "suggestedPreferredSkills": suggested_preferred,
        "descriptionIssues": issues,
        "improvementTips": tips,
        "completenessScore": max(20, 100 - len(issues) * 20),
        "note": "These are AI suggestions. Review and approve before saving.",
    }


@router.post("/candidate-insights")
def get_candidate_insights(req: CandidateInsightRequest):
    """Deep candidate analysis for HR — transparent, explainable."""
    skills_lower = [s.lower() for s in req.candidateSkills]
    required_lower = [s.lower() for s in req.jobRequiredSkills]
    preferred_lower = [s.lower() for s in req.jobPreferredSkills]

    matched_required = [s for s in req.jobRequiredSkills if s.lower() in skills_lower]
    missing_required = [s for s in req.jobRequiredSkills if s.lower() not in skills_lower]
    matched_preferred = [s for s in req.jobPreferredSkills if s.lower() in skills_lower]

    # Compute insights
    skill_match_pct = round((len(matched_required) / max(1, len(req.jobRequiredSkills))) * 100)

    # Readiness indicator (not a hiring decision)
    readiness_score = req.matchScore
    if readiness_score >= 80:
        readiness = "Strong Match"
    elif readiness_score >= 60:
        readiness = "Good Match"
    elif readiness_score >= 40:
        readiness = "Moderate Match"
    else:
        readiness = "Partial Match"

    # Strengths
    strengths = []
    if verified := req.verifiedSkills:
        strengths.append(f"Assessment-verified skills: {', '.join(verified[:3])}")
    if req.cgpa >= 8.0:
        strengths.append(f"Strong academic performance (CGPA: {req.cgpa})")
    if req.projectCount >= 3:
        strengths.append(f"Solid project portfolio ({req.projectCount} projects)")
    if req.certCount >= 2:
        strengths.append(f"Multiple certifications ({req.certCount} certificates)")
    if req.internshipCount >= 1:
        strengths.append(f"Has internship experience ({req.internshipCount} internship(s))")
    if matched_preferred:
        strengths.append(f"Has preferred skills: {', '.join(matched_preferred[:2])}")

    # Considerations (NOT disqualifications)
    considerations = []
    if missing_required:
        considerations.append(f"Missing required skills: {', '.join(missing_required[:3])}")
    if req.cgpa < 6.0 and req.cgpa > 0:
        considerations.append(f"CGPA ({req.cgpa}) is below typical threshold")
    if req.projectCount == 0:
        considerations.append("No projects in SkillNexa portfolio")

    # Skill score distribution
    skill_quality = []
    for skill_name in matched_required:
        score = req.candidateSkillScores.get(skill_name, 0)
        level = "Strong (verified)" if skill_name in req.verifiedSkills else ("Strong" if score >= 70 else "Moderate" if score >= 40 else "Basic")
        skill_quality.append({"skill": skill_name, "level": level, "score": score})

    return {
        "success": True,
        "candidateName": req.candidateName,
        "overallMatchScore": req.matchScore,
        "skillMatchPercentage": skill_match_pct,
        "readinessIndicator": readiness,
        "matchedRequiredSkills": matched_required,
        "missingRequiredSkills": missing_required,
        "matchedPreferredSkills": matched_preferred,
        "skillQuality": skill_quality,
        "strengths": strengths,
        "considerations": considerations,
        "portfolioMetrics": {
            "projects": req.projectCount,
            "certifications": req.certCount,
            "internships": req.internshipCount,
            "verifiedSkills": len(req.verifiedSkills),
        },
        "disclaimer": "AI insights assist HR decision-making. Final hiring decisions remain with the company.",
    }


@router.post("/shortlisting-rank")
def get_shortlisting_rank(req: ShortlistingRequest):
    """Transparent candidate ranking with explainable factors."""
    if not req.candidates:
        return {"success": False, "error": "No candidates provided"}

    ranked = []
    for c in req.candidates:
        name = c.get("candidateName", c.get("name", "Unknown"))
        match = c.get("matchScore", 0)
        cgpa = c.get("cgpa", 0)
        skills = c.get("skills", [])
        projects = c.get("projectCount", 0)
        certs = c.get("certCount", 0)
        internships = c.get("internshipCount", 0)
        verified = c.get("verifiedSkills", [])

        # Transparent scoring
        skill_score = match * 0.4  # 40% from AI match score
        academic_score = min(10, (cgpa / 10) * 10) if cgpa > 0 else 0  # 10%
        portfolio_score = min(15, projects * 4 + certs * 2 + internships * 2)  # 15%
        verified_bonus = min(5, len(verified) * 1.5)  # 5% verified bonus

        eligibility_penalty = -10 if (req.minCgpa > 0 and cgpa > 0 and cgpa < req.minCgpa) else 0

        total = round(skill_score + academic_score + portfolio_score + verified_bonus + eligibility_penalty)
        total = max(0, min(100, total))

        ranked.append({
            "candidateName": name,
            "rankScore": total,
            "matchScore": match,
            "cgpa": cgpa,
            "factors": {
                "skillCompatibility": round(skill_score),
                "academicPerformance": round(academic_score),
                "portfolioStrength": round(portfolio_score),
                "verifiedSkillsBonus": round(verified_bonus),
                "eligibilityPenalty": eligibility_penalty,
            },
            "meetsMinCgpa": cgpa >= req.minCgpa if req.minCgpa > 0 else True,
            "verifiedSkillCount": len(verified),
            "applicantData": c,
        })

    ranked.sort(key=lambda x: x["rankScore"], reverse=True)

    for i, r in enumerate(ranked):
        r["rank"] = i + 1

    return {
        "success": True,
        "jobTitle": req.jobTitle,
        "totalCandidates": len(ranked),
        "rankedCandidates": ranked,
        "topRecommendations": ranked[:3],
        "disclaimer": "Rankings are AI-generated from transparent, explainable factors. Human review is required before final shortlisting.",
        "rankingFactors": {
            "skillCompatibility": "40% — AI match score from job requirements",
            "academicPerformance": "10% — CGPA normalized score",
            "portfolioStrength": "15% — Projects, certifications, internships",
            "verifiedSkillsBonus": "5% — Assessment-verified skills",
        },
    }
