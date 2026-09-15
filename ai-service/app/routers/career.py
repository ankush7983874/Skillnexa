"""
Career Intelligence Router — Phase 10
Endpoints: career-readiness, skill-gap, career-roles, learning-roadmap, development-plan
All scoring is deterministic and explainable from actual student profile data.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import math

router = APIRouter(prefix="/career", tags=["Career Intelligence"])


# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────

class SkillEntry(BaseModel):
    name: str
    category: str = "General"
    score: int = 0          # 0–100
    verified: bool = False


class ProjectEntry(BaseModel):
    title: str
    description: str = ""
    techStack: List[str] = []
    achievements: List[str] = []


class CertificateEntry(BaseModel):
    certificateName: str
    issuingOrganization: str = ""


class InternshipEntry(BaseModel):
    company: str
    role: str
    description: str = ""
    skillsUsed: List[str] = []
    completionStatus: str = "COMPLETED"


class AchievementEntry(BaseModel):
    title: str
    description: str = ""


class StudentProfilePayload(BaseModel):
    skills: List[SkillEntry] = []
    softSkills: List[str] = []
    interests: List[str] = []
    projects: List[ProjectEntry] = []
    certificates: List[CertificateEntry] = []
    internships: List[InternshipEntry] = []
    achievements: List[AchievementEntry] = []
    cgpa: float = 0.0
    graduationYear: int = 2025
    resumeUrl: str = ""
    githubUrl: str = ""
    linkedinUrl: str = ""
    college: str = ""
    degree: str = ""
    branch: str = ""


class JobDemandEntry(BaseModel):
    skill: str
    demandCount: int = 1


class CareerReadinessRequest(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"
    jobMarketSkills: List[str] = []


class SkillGapRequest(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"
    requiredSkills: List[str] = []
    preferredSkills: List[str] = []


class LearningRoadmapRequest(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"
    missingSkills: List[str] = []
    timelineWeeks: int = 12


class CareerRolesRequest(BaseModel):
    profile: StudentProfilePayload


class DevelopmentPlanRequest(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"
    targetCompanyType: str = "Product"


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

# Role → typical required skills mapping
ROLE_SKILL_MAP: Dict[str, List[str]] = {
    "Full Stack Developer": ["JavaScript", "React", "Node.js", "MongoDB", "HTML", "CSS", "REST APIs", "TypeScript"],
    "Backend Developer": ["Node.js", "Python", "Java", "REST APIs", "MongoDB", "PostgreSQL", "Docker", "AWS"],
    "Frontend Developer": ["JavaScript", "React", "TypeScript", "HTML", "CSS", "Vue.js", "Next.js"],
    "Data Engineer": ["Python", "SQL", "Spark", "Kafka", "Airflow", "AWS", "GCP", "Data Pipelines"],
    "Data Scientist": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "Statistics", "Pandas"],
    "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "Jenkins"],
    "Mobile Developer": ["Flutter", "React Native", "Android", "iOS", "Swift", "Kotlin"],
    "Cloud Engineer": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Linux"],
    "Software Engineer": ["Data Structures", "Algorithms", "OOP", "Git", "REST APIs", "Testing", "SQL"],
    "ML Engineer": ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Docker", "REST APIs", "SQL"],
}

DIFFICULTY_MAP = {
    "Docker": "Intermediate",
    "Kubernetes": "Advanced",
    "AWS": "Intermediate",
    "React": "Intermediate",
    "Python": "Beginner",
    "JavaScript": "Beginner",
    "TypeScript": "Intermediate",
    "Machine Learning": "Advanced",
    "TensorFlow": "Advanced",
    "SQL": "Beginner",
    "MongoDB": "Intermediate",
    "Node.js": "Intermediate",
    "CI/CD": "Intermediate",
    "System Design": "Advanced",
    "Data Structures": "Intermediate",
    "Algorithms": "Intermediate",
}

TIME_MAP = {
    "Beginner": "1–2 weeks",
    "Intermediate": "3–4 weeks",
    "Advanced": "6–8 weeks",
}


def get_student_skill_names(profile: StudentProfilePayload) -> List[str]:
    return [s.name.lower() for s in profile.skills]


def calculate_skill_overlap(student_skills: List[str], required: List[str]) -> float:
    if not required:
        return 0.75
    matched = sum(1 for r in required if r.lower() in student_skills)
    return matched / len(required)


# ─────────────────────────────────────────────
# 1. Career Readiness Score
# ─────────────────────────────────────────────

@router.post("/readiness")
def get_career_readiness(req: CareerReadinessRequest):
    p = req.profile
    student_skills_lower = get_student_skill_names(p)

    # Factor 1: Technical Skills (25 pts)
    tech_skills = [s for s in p.skills if s.category not in ["Soft", "Soft Skills", "Communication"]]
    if tech_skills:
        avg_tech_score = sum(s.score for s in tech_skills) / len(tech_skills)
        verified_boost = sum(5 for s in tech_skills if s.verified)
        raw_tech = (avg_tech_score / 100) * 20 + min(5, verified_boost)
    else:
        raw_tech = 0
    tech_score = round(min(25, raw_tech), 1)

    # Factor 2: Academic Performance (15 pts)
    cgpa_norm = (p.cgpa / 10.0) * 15 if p.cgpa > 0 else 5
    academic_score = round(min(15, cgpa_norm), 1)

    # Factor 3: Projects (20 pts)
    pc = len(p.projects)
    if pc >= 4:
        proj_score = 20
    elif pc == 3:
        proj_score = 16
    elif pc == 2:
        proj_score = 12
    elif pc == 1:
        proj_score = 7
    else:
        proj_score = 0

    # Factor 4: Certifications (10 pts)
    cc = len(p.certificates)
    cert_score = min(10, cc * 3.5)

    # Factor 5: Internships / Experience (10 pts)
    ic = len(p.internships)
    completed = sum(1 for i in p.internships if i.completionStatus == "COMPLETED")
    exp_score = min(10, completed * 4 + (ic - completed) * 2)

    # Factor 6: Soft Skills (5 pts)
    soft_score = min(5, len(p.softSkills) * 1.25)

    # Factor 7: Achievements (5 pts)
    ach_score = min(5, len(p.achievements) * 2)

    # Factor 8: Industry Alignment (10 pts)
    job_market = [j.lower() for j in req.jobMarketSkills]
    if job_market:
        aligned = sum(1 for sk in student_skills_lower if sk in job_market)
        align_score = min(10, (aligned / max(1, len(job_market))) * 10)
    else:
        role_skills = [r.lower() for r in ROLE_SKILL_MAP.get(req.targetRole, [])]
        if role_skills:
            aligned = sum(1 for sk in student_skills_lower if sk in role_skills)
            align_score = min(10, (aligned / len(role_skills)) * 10)
        else:
            align_score = 5

    # Total
    total = tech_score + academic_score + proj_score + cert_score + exp_score + soft_score + ach_score + align_score
    total_score = round(min(100, total))

    # Sub-scores as percentages for UI
    sub_scores = {
        "Technical Skills": round((tech_score / 25) * 100),
        "Academic Performance": round((academic_score / 15) * 100),
        "Projects": round((proj_score / 20) * 100),
        "Certifications": round((cert_score / 10) * 100),
        "Experience": round((exp_score / 10) * 100),
        "Soft Skills": round((soft_score / 5) * 100),
        "Achievements": round((ach_score / 5) * 100),
        "Industry Alignment": round((align_score / 10) * 100),
    }

    # Strengths and weaknesses
    strengths = [k for k, v in sub_scores.items() if v >= 70]
    weak_areas = [k for k, v in sub_scores.items() if v < 40]

    # Recommended actions
    actions = []
    if proj_score < 10:
        actions.append("Build 2+ real-world projects with GitHub repositories")
    if cert_score < 5:
        actions.append("Earn certifications in your target domain")
    if exp_score < 5:
        actions.append("Apply for internships to gain practical industry experience")
    if tech_score < 15:
        actions.append("Improve technical skills through practice and assessments")
    if align_score < 6:
        actions.append(f"Learn skills demanded in {req.targetRole} roles")
    if not p.linkedinUrl:
        actions.append("Complete your LinkedIn profile")
    if not p.githubUrl:
        actions.append("Create a GitHub profile and push your projects")

    return {
        "success": True,
        "careerReadinessScore": total_score,
        "targetRole": req.targetRole,
        "subScores": sub_scores,
        "breakdown": {
            "technicalSkills": {"score": tech_score, "maxScore": 25, "count": len(tech_skills)},
            "academicPerformance": {"score": academic_score, "maxScore": 15, "cgpa": p.cgpa},
            "projects": {"score": proj_score, "maxScore": 20, "count": pc},
            "certifications": {"score": cert_score, "maxScore": 10, "count": cc},
            "experience": {"score": exp_score, "maxScore": 10, "count": ic},
            "softSkills": {"score": soft_score, "maxScore": 5, "count": len(p.softSkills)},
            "achievements": {"score": ach_score, "maxScore": 5, "count": len(p.achievements)},
            "industryAlignment": {"score": align_score, "maxScore": 10},
        },
        "strengthAreas": strengths,
        "weakAreas": weak_areas,
        "recommendedActions": actions,
        "readinessLevel": (
            "Expert" if total_score >= 85 else
            "Advanced" if total_score >= 70 else
            "Intermediate" if total_score >= 50 else
            "Beginner"
        ),
    }


# ─────────────────────────────────────────────
# 2. Skill Gap Analyzer
# ─────────────────────────────────────────────

@router.post("/skill-gap")
def get_skill_gap(req: SkillGapRequest):
    p = req.profile
    student_skill_map = {s.name.lower(): s for s in p.skills}

    role_skills = ROLE_SKILL_MAP.get(req.targetRole, [])
    required = list(set(req.requiredSkills + role_skills))
    preferred = req.preferredSkills

    matched, missing, weak = [], [], []
    for skill in required:
        sk_lower = skill.lower()
        if sk_lower in student_skill_map:
            entry = student_skill_map[sk_lower]
            level = "Strong" if entry.score >= 70 else "Medium" if entry.score >= 40 else "Weak"
            matched.append({"skill": skill, "level": level, "score": entry.score, "verified": entry.verified})
            if entry.score < 50:
                weak.append(skill)
        else:
            missing.append(skill)

    preferred_gap = []
    for skill in preferred:
        if skill.lower() not in student_skill_map:
            preferred_gap.append(skill)

    # Priority scoring based on demand
    priority_missing = []
    for skill in missing:
        all_role_skills = []
        for role_skill_list in ROLE_SKILL_MAP.values():
            all_role_skills.extend([s.lower() for s in role_skill_list])
        demand_count = all_role_skills.count(skill.lower())
        priority = "HIGH" if demand_count >= 4 else "MEDIUM" if demand_count >= 2 else "LOW"
        priority_missing.append({"skill": skill, "priority": priority, "demandCount": demand_count})

    priority_missing.sort(key=lambda x: x["demandCount"], reverse=True)

    return {
        "success": True,
        "targetRole": req.targetRole,
        "summary": {
            "totalRequired": len(required),
            "matched": len(matched),
            "missing": len(missing),
            "weak": len(weak),
            "matchPercentage": round((len(matched) / max(1, len(required))) * 100),
        },
        "matchedSkills": matched,
        "missingSkills": priority_missing,
        "weakSkills": weak,
        "preferredGap": preferred_gap,
        "topPrioritySkills": [s["skill"] for s in priority_missing if s["priority"] == "HIGH"][:5],
    }


# ─────────────────────────────────────────────
# 3. Career Role Recommendations
# ─────────────────────────────────────────────

@router.post("/roles")
def get_career_roles(req: CareerRolesRequest):
    p = req.profile
    student_skills_lower = get_student_skill_names(p)
    extra_skills_lower = [sk.lower() for sk in p.softSkills + p.interests]

    role_scores = []
    for role, required_skills in ROLE_SKILL_MAP.items():
        req_lower = [r.lower() for r in required_skills]
        matched = [r for r in req_lower if r in student_skills_lower]
        base_match = len(matched) / len(req_lower) if req_lower else 0

        # Boost for verified skills in role domain
        verified_in_role = sum(
            1 for s in p.skills if s.name.lower() in req_lower and s.verified
        )
        verify_boost = min(0.1, verified_in_role * 0.03)

        # Academic boost
        academic_boost = min(0.05, (p.cgpa / 10) * 0.05)

        final_score = min(100, round((base_match + verify_boost + academic_boost) * 100))

        matched_skills_display = [s.title() for s in matched]
        missing_skills_display = [r.title() for r in req_lower if r not in student_skills_lower][:4]

        why_parts = []
        if matched_skills_display:
            why_parts.append(f"You have {len(matched_skills_display)} of {len(required_skills)} required skills")
        if verified_in_role > 0:
            why_parts.append(f"{verified_in_role} skills are assessment-verified")
        if p.cgpa >= 7.5:
            why_parts.append("strong academic performance")

        role_scores.append({
            "role": role,
            "matchScore": final_score,
            "matchedSkills": matched_skills_display,
            "missingSkills": missing_skills_display,
            "why": ". ".join(why_parts) if why_parts else "Partial skill overlap with this role.",
        })

    role_scores.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "success": True,
        "topRoles": role_scores[:6],
        "primaryRecommendation": role_scores[0] if role_scores else None,
        "note": "Scores are calculated from your SkillNexa profile data.",
    }


# ─────────────────────────────────────────────
# 4. Personalized Learning Roadmap
# ─────────────────────────────────────────────

@router.post("/learning-roadmap")
def get_learning_roadmap(req: LearningRoadmapRequest):
    p = req.profile
    student_skills_lower = get_student_skill_names(p)

    role_skills = ROLE_SKILL_MAP.get(req.targetRole, [])
    missing_from_role = [s for s in role_skills if s.lower() not in student_skills_lower]

    # Combine explicitly provided missing skills + role gaps
    all_missing = list(dict.fromkeys(req.missingSkills + missing_from_role))

    # Sort by priority (demand count)
    all_role_skills = []
    for role_skill_list in ROLE_SKILL_MAP.values():
        all_role_skills.extend([s.lower() for s in role_skill_list])

    def demand_score(skill: str) -> int:
        return all_role_skills.count(skill.lower())

    all_missing.sort(key=demand_score, reverse=True)

    # Build week-by-week plan
    weeks_available = min(req.timelineWeeks, 16)
    roadmap = []
    week = 1

    for skill in all_missing[:weeks_available]:
        difficulty = DIFFICULTY_MAP.get(skill, "Intermediate")
        duration = TIME_MAP.get(difficulty, "2–3 weeks")
        weeks_needed = 1 if difficulty == "Beginner" else 2 if difficulty == "Intermediate" else 3

        # Find roles that use this skill
        related_roles = [role for role, skills in ROLE_SKILL_MAP.items() if skill in skills][:3]

        milestone = {
            "week": week,
            "skill": skill,
            "difficulty": difficulty,
            "estimatedTime": duration,
            "priority": "HIGH" if demand_score(skill) >= 4 else "MEDIUM" if demand_score(skill) >= 2 else "LOW",
            "relatedRoles": related_roles,
            "reason": f"Required for {req.targetRole} — demanded in {demand_score(skill)} role categories",
            "resources": [
                f"Official {skill} documentation",
                f"{skill} hands-on projects",
                f"{skill} SkillNexa assessment",
            ],
        }
        roadmap.append(milestone)
        week += weeks_needed
        if week > weeks_available:
            break

    # Already strong skills
    strong = [s for s in p.skills if s.score >= 70]

    return {
        "success": True,
        "targetRole": req.targetRole,
        "timelineWeeks": weeks_available,
        "totalMilestones": len(roadmap),
        "roadmap": roadmap,
        "alreadyStrong": [s.name for s in strong],
        "estimatedCompletionWeeks": min(week - 1, weeks_available),
        "note": "Roadmap generated from your current profile vs target role requirements on SkillNexa platform data.",
    }


# ─────────────────────────────────────────────
# 5. AI Development Plan
# ─────────────────────────────────────────────

@router.post("/development-plan")
def get_development_plan(req: DevelopmentPlanRequest):
    p = req.profile
    student_skills_lower = get_student_skill_names(p)
    role_skills = ROLE_SKILL_MAP.get(req.targetRole, [])
    missing = [s for s in role_skills if s.lower() not in student_skills_lower]
    matched = [s for s in role_skills if s.lower() in student_skills_lower]

    # Current level assessment
    if len(matched) >= len(role_skills) * 0.8:
        current_level = "Advanced"
    elif len(matched) >= len(role_skills) * 0.5:
        current_level = "Intermediate"
    else:
        current_level = "Beginner"

    # Projects to build
    projects_to_build = []
    if req.targetRole == "Full Stack Developer":
        projects_to_build = [
            "Full-stack CRUD application with React + Node.js + MongoDB",
            "Real-time chat app with WebSockets",
            "REST API with authentication and role-based access",
        ]
    elif req.targetRole == "Data Scientist":
        projects_to_build = [
            "ML model for prediction with real dataset",
            "Data visualization dashboard",
            "NLP text classification project",
        ]
    elif req.targetRole == "DevOps Engineer":
        projects_to_build = [
            "CI/CD pipeline with GitHub Actions + Docker",
            "Kubernetes cluster deployment",
            "Infrastructure as code with Terraform",
        ]
    else:
        projects_to_build = [
            f"Portfolio project demonstrating core {req.targetRole} skills",
            "Open-source contribution to a relevant project",
            "End-to-end project with deployment on cloud",
        ]

    # Certifications
    cert_map = {
        "Full Stack Developer": ["MongoDB Developer", "AWS Cloud Practitioner", "Meta React Developer"],
        "Data Scientist": ["Google Data Analytics", "IBM Data Science", "DeepLearning.AI TensorFlow"],
        "DevOps Engineer": ["AWS DevOps Professional", "CKA (Kubernetes)", "HashiCorp Terraform Associate"],
        "Backend Developer": ["AWS Solutions Architect", "MongoDB Developer", "Oracle Java SE"],
        "Frontend Developer": ["Meta Frontend Developer", "Google UX Design"],
    }
    certs = cert_map.get(req.targetRole, ["Google IT Professional Certificate", "AWS Cloud Practitioner"])

    # Milestones timeline
    milestones = [
        {"phase": "Phase 1 (Month 1–2)", "goal": f"Complete core {missing[:3]} skills", "deliverable": "Mini project"},
        {"phase": "Phase 2 (Month 3–4)", "goal": "Build portfolio project", "deliverable": "GitHub repository"},
        {"phase": "Phase 3 (Month 5–6)", "goal": "Earn one certification", "deliverable": "Certificate"},
        {"phase": "Phase 4 (Month 7–8)", "goal": "Apply for internship or job", "deliverable": "Application sent"},
    ]

    return {
        "success": True,
        "careerGoal": req.targetRole,
        "targetCompanyType": req.targetCompanyType,
        "currentLevel": current_level,
        "currentSkillCount": len(p.skills),
        "targetSkillCount": len(role_skills),
        "skillCompletion": round((len(matched) / max(1, len(role_skills))) * 100),
        "skillGaps": missing,
        "projectsToBuild": projects_to_build,
        "certificationsToEarn": certs,
        "internshipTargets": [
            f"Junior {req.targetRole} at a startup",
            f"{req.targetRole} intern at a product company",
            "Open source contributor",
        ],
        "jobTargets": [
            f"Junior {req.targetRole}",
            f"Associate {req.targetRole}",
            "Software Developer Trainee",
        ],
        "milestones": milestones,
        "estimatedReadinessMonths": 6 if current_level == "Intermediate" else 12 if current_level == "Beginner" else 3,
        "note": "Development plan is generated from your SkillNexa profile and target role requirements.",
    }
