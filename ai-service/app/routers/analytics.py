"""
Industry Analytics Router — Phase 10
Endpoint: /analytics/industry-insights
Analyzes REAL job data passed from MongoDB via backend.
No invented statistics — clearly labeled as SkillNexa platform data.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import Counter

router = APIRouter(prefix="/analytics", tags=["Industry Analytics"])


class JobDataEntry(BaseModel):
    title: str
    requiredSkills: List[str] = []
    preferredSkills: List[str] = []
    location: str = ""
    employmentType: str = "Full-time"
    salary: str = ""
    status: str = "Published"
    companyName: str = ""


class ApplicationDataEntry(BaseModel):
    jobTitle: str = ""
    status: str = ""


class IndustryInsightsRequest(BaseModel):
    jobs: List[JobDataEntry] = []
    applications: List[ApplicationDataEntry] = []
    placements: List[dict] = []


@router.post("/industry-insights")
def get_industry_insights(req: IndustryInsightsRequest):
    if not req.jobs:
        return {
            "success": True,
            "dataLabel": "Based on SkillNexa platform data",
            "message": "No job data available yet. Post jobs to see industry insights.",
            "topSkills": [],
            "topRoles": [],
            "insights": {},
        }

    # Aggregate all skills from published jobs
    all_required_skills = []
    all_preferred_skills = []
    all_locations = []
    all_employment_types = []
    company_skill_map: Dict[str, List[str]] = {}

    for job in req.jobs:
        all_required_skills.extend(job.requiredSkills)
        all_preferred_skills.extend(job.preferredSkills)
        if job.location:
            all_locations.append(job.location)
        if job.employmentType:
            all_employment_types.append(job.employmentType)
        if job.companyName:
            if job.companyName not in company_skill_map:
                company_skill_map[job.companyName] = []
            company_skill_map[job.companyName].extend(job.requiredSkills)

    # Top demanded skills (required only — most valuable signal)
    skill_counter = Counter(all_required_skills)
    top_required = [{"skill": k, "demandCount": v, "type": "Required"} for k, v in skill_counter.most_common(15)]

    # Preferred skills popularity
    pref_counter = Counter(all_preferred_skills)
    top_preferred = [{"skill": k, "demandCount": v, "type": "Preferred"} for k, v in pref_counter.most_common(10)]

    # Job title frequency
    title_words = []
    for job in req.jobs:
        words = job.title.split()
        title_words.extend(words)
    role_counter = Counter(
        job.title for job in req.jobs
    )
    top_roles = [{"role": k, "count": v} for k, v in role_counter.most_common(10)]

    # Location distribution
    location_counter = Counter(all_locations)
    top_locations = [{"location": k, "count": v} for k, v in location_counter.most_common(8)]

    # Employment type distribution
    type_counter = Counter(all_employment_types)
    employment_dist = dict(type_counter)

    # Application funnel (if data provided)
    funnel = {}
    if req.applications:
        status_counter = Counter(a.status for a in req.applications)
        funnel = dict(status_counter)

    # Placement data
    placement_count = len(req.placements)

    # Skill categories
    programming_languages = ["Python", "JavaScript", "Java", "TypeScript", "C++", "Go", "PHP", "Kotlin", "Swift"]
    frameworks = ["React", "Node.js", "Django", "Flask", "Spring Boot", "Vue", "Angular", "Express", "FastAPI"]
    cloud_devops = ["AWS", "Docker", "Kubernetes", "GCP", "Azure", "Terraform", "CI/CD"]
    databases = ["MongoDB", "PostgreSQL", "MySQL", "Redis", "DynamoDB"]

    def categorize_skills(skills_list):
        cat = {"Programming Languages": [], "Frameworks": [], "Cloud & DevOps": [], "Databases": [], "Other": []}
        for skill, count in Counter(skills_list).most_common(30):
            if skill in programming_languages:
                cat["Programming Languages"].append({"skill": skill, "count": count})
            elif skill in frameworks:
                cat["Frameworks"].append({"skill": skill, "count": count})
            elif skill in cloud_devops:
                cat["Cloud & DevOps"].append({"skill": skill, "count": count})
            elif skill in databases:
                cat["Databases"].append({"skill": skill, "count": count})
            else:
                cat["Other"].append({"skill": skill, "count": count})
        return cat

    categorized = categorize_skills(all_required_skills)

    # Average skills per job
    avg_skills_per_job = round(len(all_required_skills) / max(1, len(req.jobs)), 1)

    # Top companies by job count
    company_counter = Counter(job.companyName for job in req.jobs if job.companyName)
    top_companies = [{"company": k, "jobCount": v} for k, v in company_counter.most_common(5)]

    return {
        "success": True,
        "dataLabel": "Based on SkillNexa platform data",
        "dataTimestamp": "real-time",
        "summary": {
            "totalJobsAnalyzed": len(req.jobs),
            "totalApplications": len(req.applications),
            "totalPlacements": placement_count,
            "uniqueSkillsFound": len(skill_counter),
            "averageSkillsPerJob": avg_skills_per_job,
        },
        "topDemandedSkills": top_required,
        "topPreferredSkills": top_preferred,
        "skillsByCategory": categorized,
        "topJobRoles": top_roles,
        "topLocations": top_locations,
        "employmentTypeDistribution": employment_dist,
        "applicationFunnel": funnel,
        "topCompanies": top_companies,
        "companySkillDemand": {
            company: Counter(skills).most_common(5)
            for company, skills in list(company_skill_map.items())[:5]
        },
    }
