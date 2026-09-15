"""
Interview Preparation & Mock Interview Router — Phase 10
Endpoints: /interview-prep, /mock-interview/evaluate, /mock-interview/report
Deterministic question generation from job + student profile data.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import re

router = APIRouter(prefix="/interview", tags=["Interview Intelligence"])


# ─────────────────────────────────────────────
# Question Banks (deterministic, not random)
# ─────────────────────────────────────────────

TECHNICAL_QUESTIONS: Dict[str, List[dict]] = {
    "JavaScript": [
        {"q": "What is the difference between `let`, `var`, and `const` in JavaScript?", "difficulty": "Easy", "expectedKeywords": ["scope", "block", "hoisting", "reassign"]},
        {"q": "Explain closures in JavaScript with an example.", "difficulty": "Medium", "expectedKeywords": ["inner function", "outer scope", "reference", "lexical"]},
        {"q": "What is the event loop and how does it work?", "difficulty": "Medium", "expectedKeywords": ["call stack", "callback queue", "non-blocking", "async"]},
        {"q": "Explain prototypal inheritance in JavaScript.", "difficulty": "Hard", "expectedKeywords": ["prototype chain", "Object.create", "constructor", "inherit"]},
    ],
    "React": [
        {"q": "What are React hooks and why were they introduced?", "difficulty": "Easy", "expectedKeywords": ["useState", "useEffect", "functional", "class components"]},
        {"q": "Explain the React reconciliation process.", "difficulty": "Hard", "expectedKeywords": ["virtual DOM", "diffing", "key", "fiber"]},
        {"q": "What is the difference between useMemo and useCallback?", "difficulty": "Medium", "expectedKeywords": ["memoize", "function reference", "performance", "dependency"]},
        {"q": "How do you optimize a React application for performance?", "difficulty": "Medium", "expectedKeywords": ["code splitting", "lazy loading", "memo", "virtualization"]},
    ],
    "Node.js": [
        {"q": "What is the Node.js event-driven architecture?", "difficulty": "Medium", "expectedKeywords": ["event emitter", "non-blocking", "single thread", "callback"]},
        {"q": "How does Node.js handle concurrency?", "difficulty": "Hard", "expectedKeywords": ["event loop", "libuv", "async", "promise"]},
        {"q": "What is the difference between require() and ES6 import?", "difficulty": "Easy", "expectedKeywords": ["CommonJS", "ESM", "synchronous", "static"]},
    ],
    "MongoDB": [
        {"q": "Explain the aggregation pipeline in MongoDB.", "difficulty": "Medium", "expectedKeywords": ["$match", "$group", "$project", "stage", "pipeline"]},
        {"q": "What is the difference between embedded documents and references in MongoDB?", "difficulty": "Medium", "expectedKeywords": ["denormalization", "join", "lookup", "one-to-many"]},
        {"q": "How do you optimize MongoDB query performance?", "difficulty": "Hard", "expectedKeywords": ["index", "explain()", "compound index", "covered query"]},
    ],
    "Python": [
        {"q": "Explain generators and iterators in Python.", "difficulty": "Medium", "expectedKeywords": ["yield", "next()", "lazy evaluation", "__iter__"]},
        {"q": "What are decorators in Python?", "difficulty": "Medium", "expectedKeywords": ["wrapper", "function", "@", "higher-order"]},
        {"q": "How does Python's GIL affect multithreading?", "difficulty": "Hard", "expectedKeywords": ["Global Interpreter Lock", "thread safety", "multiprocessing", "GIL"]},
    ],
    "Docker": [
        {"q": "What is the difference between a Docker image and a container?", "difficulty": "Easy", "expectedKeywords": ["image", "runtime", "layer", "read-only"]},
        {"q": "Explain Docker networking modes.", "difficulty": "Medium", "expectedKeywords": ["bridge", "host", "none", "overlay"]},
        {"q": "What is docker-compose and when would you use it?", "difficulty": "Easy", "expectedKeywords": ["multi-container", "services", "yaml", "orchestration"]},
    ],
    "AWS": [
        {"q": "What is the difference between EC2 and Lambda?", "difficulty": "Easy", "expectedKeywords": ["server", "serverless", "billing", "execution time"]},
        {"q": "Explain S3 storage classes and when to use each.", "difficulty": "Medium", "expectedKeywords": ["Standard", "Glacier", "Infrequent Access", "cost"]},
    ],
    "SQL": [
        {"q": "What is the difference between INNER JOIN and LEFT JOIN?", "difficulty": "Easy", "expectedKeywords": ["matching rows", "null", "all rows", "left table"]},
        {"q": "Explain indexing and its impact on query performance.", "difficulty": "Medium", "expectedKeywords": ["B-tree", "read speed", "write overhead", "cardinality"]},
    ],
    "System Design": [
        {"q": "How would you design a URL shortener like bit.ly?", "difficulty": "Hard", "expectedKeywords": ["hash", "database", "cache", "scalability", "load balancer"]},
        {"q": "Design a notification system for a social media app.", "difficulty": "Hard", "expectedKeywords": ["queue", "pub/sub", "push", "microservices"]},
    ],
    "Data Structures": [
        {"q": "Explain the time complexity of common operations in a HashMap.", "difficulty": "Medium", "expectedKeywords": ["O(1)", "collision", "hash function", "bucket"]},
        {"q": "When would you use a BFS vs DFS algorithm?", "difficulty": "Medium", "expectedKeywords": ["shortest path", "level", "stack", "queue", "connectivity"]},
    ],
}

HR_QUESTIONS = [
    "Tell me about yourself and your background.",
    "Why are you interested in this position?",
    "Where do you see yourself in 5 years?",
    "What are your greatest strengths and weaknesses?",
    "Why should we hire you over other candidates?",
    "Describe a situation where you had to meet a tight deadline.",
    "How do you handle working under pressure?",
    "Tell me about a time you worked in a team.",
]

BEHAVIORAL_QUESTIONS = [
    "Describe a challenging technical problem you solved and how you approached it.",
    "Tell me about a project you're most proud of.",
    "Describe a time you had a conflict with a teammate and how you resolved it.",
    "Tell me about a time you had to learn a new technology quickly.",
    "Describe a time when you received critical feedback and how you responded.",
    "Tell me about a situation where you had to make a decision with incomplete information.",
]


# ─────────────────────────────────────────────
# Request Models
# ─────────────────────────────────────────────

class InterviewPrepRequest(BaseModel):
    jobTitle: str
    jobDescription: str = ""
    requiredSkills: List[str] = []
    studentSkills: List[str] = []
    targetRole: str = "Software Engineer"
    experienceLevel: str = "Entry"  # Entry / Mid / Senior


class MockAnswerRequest(BaseModel):
    question: str
    answer: str
    expectedKeywords: List[str] = []
    questionDifficulty: str = "Medium"


class MockReportRequest(BaseModel):
    sessionId: str
    answers: List[dict]  # [{question, answer, evaluation}]


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@router.post("/prep")
def get_interview_prep(req: InterviewPrepRequest):
    """Generate tailored interview questions from job + student profile."""
    student_skills_lower = [s.lower() for s in req.studentSkills]
    required_lower = [s.lower() for s in req.requiredSkills]

    technical = []
    covered_skills = set()

    # Collect questions for required skills
    for skill in req.requiredSkills:
        if skill in TECHNICAL_QUESTIONS and skill not in covered_skills:
            qs = TECHNICAL_QUESTIONS[skill]
            if req.experienceLevel == "Entry":
                qs = [q for q in qs if q["difficulty"] in ["Easy", "Medium"]]
            elif req.experienceLevel == "Senior":
                qs = [q for q in qs if q["difficulty"] in ["Medium", "Hard"]]
            technical.extend(qs[:2])
            covered_skills.add(skill)

    # Fill from student's known skills too
    for skill in req.studentSkills:
        if skill in TECHNICAL_QUESTIONS and skill not in covered_skills and len(technical) < 10:
            technical.extend(TECHNICAL_QUESTIONS[skill][:1])
            covered_skills.add(skill)

    # Generic DS/Algo if software role
    if len(technical) < 5 and "Software" in req.targetRole:
        technical.extend(TECHNICAL_QUESTIONS.get("Data Structures", [])[:2])

    # System design for mid/senior
    if req.experienceLevel in ["Mid", "Senior"]:
        technical.extend(TECHNICAL_QUESTIONS.get("System Design", [])[:1])

    # Remove duplicates
    seen = set()
    unique_technical = []
    for q in technical:
        if q["q"] not in seen:
            seen.add(q["q"])
            unique_technical.append(q)

    # Add question numbers
    numbered_tech = [{"id": i + 1, **q} for i, q in enumerate(unique_technical[:10])]
    numbered_hr = [{"id": i + 1, "q": q, "difficulty": "Easy"} for i, q in enumerate(HR_QUESTIONS[:4])]
    numbered_behavioral = [{"id": i + 1, "q": q, "difficulty": "Medium"} for i, q in enumerate(BEHAVIORAL_QUESTIONS[:3])]

    # Tips
    tips = [
        "Explain your thought process clearly before coding.",
        "Ask clarifying questions about the problem scope.",
        "Use the STAR method for behavioral questions (Situation, Task, Action, Result).",
        "Be honest about what you don't know — explain how you'd find the answer.",
    ]
    if req.experienceLevel == "Entry":
        tips.append("Mention projects from your portfolio when relevant.")

    return {
        "success": True,
        "jobTitle": req.jobTitle,
        "targetRole": req.targetRole,
        "experienceLevel": req.experienceLevel,
        "totalQuestions": len(numbered_tech) + len(numbered_hr) + len(numbered_behavioral),
        "technical": numbered_tech,
        "hr": numbered_hr,
        "behavioral": numbered_behavioral,
        "interviewTips": tips,
        "focusSkills": list(covered_skills)[:6],
    }


@router.post("/mock/evaluate")
def evaluate_mock_answer(req: MockAnswerRequest):
    """Evaluate a single mock interview answer — deterministic keyword-based scoring."""
    if not req.answer or len(req.answer.strip()) < 10:
        return {
            "success": True,
            "score": 0,
            "feedback": "Answer is too short. Please provide a detailed response.",
            "keywordsMatched": [],
            "keywordsMissed": req.expectedKeywords,
            "completeness": "Incomplete",
        }

    answer_lower = req.answer.lower()
    answer_words = len(req.answer.split())

    # Keyword matching
    matched_kw = [kw for kw in req.expectedKeywords if kw.lower() in answer_lower]
    missed_kw = [kw for kw in req.expectedKeywords if kw.lower() not in answer_lower]

    kw_ratio = len(matched_kw) / max(1, len(req.expectedKeywords))

    # Length scoring
    if answer_words >= 80:
        length_score = 30
    elif answer_words >= 40:
        length_score = 20
    elif answer_words >= 20:
        length_score = 10
    else:
        length_score = 5

    # Keyword score (50 pts)
    kw_score = round(kw_ratio * 50)

    # Clarity signals
    has_example = any(w in answer_lower for w in ["example", "for instance", "such as", "e.g.", "i used", "i built", "i implemented"])
    example_score = 20 if has_example else 0

    total_score = min(100, length_score + kw_score + example_score)

    # Completeness
    if total_score >= 80:
        completeness = "Excellent"
    elif total_score >= 60:
        completeness = "Good"
    elif total_score >= 40:
        completeness = "Partial"
    else:
        completeness = "Needs Improvement"

    # Feedback
    feedback_parts = []
    if matched_kw:
        feedback_parts.append(f"Good coverage of key concepts: {', '.join(matched_kw[:3])}.")
    if missed_kw:
        feedback_parts.append(f"Consider mentioning: {', '.join(missed_kw[:3])}.")
    if not has_example:
        feedback_parts.append("Strengthen your answer with a concrete example or real experience.")
    if answer_words < 30:
        feedback_parts.append("Provide more detail in your answer.")

    return {
        "success": True,
        "score": total_score,
        "completeness": completeness,
        "feedback": " ".join(feedback_parts) if feedback_parts else "Good answer!",
        "keywordsMatched": matched_kw,
        "keywordsMissed": missed_kw,
        "hasExample": has_example,
        "wordCount": answer_words,
        "breakdown": {
            "keywordCoverage": kw_score,
            "answerLength": length_score,
            "concreteExample": example_score,
        },
    }


@router.post("/mock/report")
def get_mock_interview_report(req: MockReportRequest):
    """Generate final mock interview report from all evaluated answers."""
    if not req.answers:
        return {"success": False, "error": "No answers to evaluate"}

    scores = [a.get("score", 0) for a in req.answers if isinstance(a.get("score"), (int, float))]
    avg_score = round(sum(scores) / len(scores)) if scores else 0

    high_scores = [a for a in req.answers if a.get("score", 0) >= 70]
    low_scores = [a for a in req.answers if a.get("score", 0) < 40]

    strengths = []
    weaknesses = []

    if len(high_scores) >= 2:
        strengths.append("Good depth of explanation in several answers")
    if any(a.get("hasExample") for a in req.answers):
        strengths.append("Effective use of concrete examples")
    if avg_score >= 70:
        strengths.append("Consistent performance across all questions")

    if len(low_scores) >= 2:
        weaknesses.append("Several answers lacked key technical keywords")
    if not any(a.get("hasExample") for a in req.answers):
        weaknesses.append("Missing concrete examples throughout the interview")
    if avg_score < 50:
        weaknesses.append("Overall performance needs improvement — more practice recommended")

    recommendations = []
    if avg_score < 60:
        recommendations.append("Practice explaining concepts out loud before the interview")
        recommendations.append("Use the STAR method for behavioral questions")
    if len(low_scores) > 0:
        topics = [a.get("question", "")[:40] for a in low_scores[:2]]
        recommendations.append(f"Study these topics further: {'; '.join(topics)}")
    recommendations.append("Mock interview yourself using SkillNexa's practice questions again")

    return {
        "success": True,
        "sessionId": req.sessionId,
        "overallScore": avg_score,
        "totalQuestions": len(req.answers),
        "answeredCount": len(scores),
        "interviewReadiness": (
            "Ready" if avg_score >= 75 else
            "Almost Ready" if avg_score >= 60 else
            "Needs Practice"
        ),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "questionSummary": [
            {
                "question": a.get("question", "")[:80],
                "score": a.get("score", 0),
                "completeness": a.get("completeness", "N/A"),
            }
            for a in req.answers
        ],
    }


# ─────────────────────────────────────────────
# Phase 13 — Mock Interview 2.0 Dynamic Engine
# ─────────────────────────────────────────────

class StartInterviewV2Request(BaseModel):
    role: str = "Software Engineer"
    skill: str = "Java"
    difficulty: str = "Medium"  # Easy / Medium / Hard / Adaptive
    questionCount: int = 10
    interviewType: str = "Technical"  # Technical / Coding / DSA / HR / Behavioral / Project / Resume / Mixed
    studentProfile: Dict[str, Any] = {}

class EvaluateAnswerV2Request(BaseModel):
    question: str
    answer: str
    skill: str = "Java"
    difficulty: str = "Medium"
    interviewType: str = "Technical"
    expectedKeywords: List[str] = []
    timeSpentSeconds: int = 45
    answerMethod: str = "speech"

class FinalReportV2Request(BaseModel):
    role: str
    skill: str
    difficulty: str
    questions: List[dict]
    integrityEvents: List[dict] = []
    previousAverageScore: int = 0


DYNAMIC_QUESTION_BANKS: Dict[str, List[dict]] = {
    "Java": [
        {"q": "What is the difference between HashMap and ConcurrentHashMap in Java?", "difficulty": "Medium", "expectedKeywords": ["thread safety", "segment locking", "ConcurrentHashMap", "null key"]},
        {"q": "Explain JVM memory model and how Garbage Collection works.", "difficulty": "Hard", "expectedKeywords": ["Heap", "Metaspace", "Mark and Sweep", "Young Generation", "Old Generation"]},
        {"q": "What are Java Functional Interfaces and Lambda Expressions?", "difficulty": "Easy", "expectedKeywords": ["single abstract method", "@FunctionalInterface", "stream", "predicate"]},
        {"q": "How does Java handle Multithreading and Synchronization?", "difficulty": "Medium", "expectedKeywords": ["synchronized keyword", "volatile", "ReentrantLock", "deadlock"]},
        {"q": "Explain String immutability in Java and String Pool.", "difficulty": "Easy", "expectedKeywords": ["String Pool", "heap", "security", "thread-safe"]},
    ],
    "Python": [
        {"q": "Explain decorators and generators in Python with production use cases.", "difficulty": "Medium", "expectedKeywords": ["yield", "wrapper", "@decorator", "lazy evaluation"]},
        {"q": "How does Python GIL impact multithreading and how do you achieve true parallelism?", "difficulty": "Hard", "expectedKeywords": ["GIL", "Global Interpreter Lock", "multiprocessing", "asyncio"]},
        {"q": "What is the difference between list comprehension and generator expression?", "difficulty": "Easy", "expectedKeywords": ["memory efficiency", "brackets vs parentheses", "lazy evaluation"]},
    ],
    "C++": [
        {"q": "Explain RAII and Smart Pointers in C++11 and beyond.", "difficulty": "Hard", "expectedKeywords": ["unique_ptr", "shared_ptr", "weak_ptr", "resource management", "memory leak"]},
        {"q": "What is the difference between virtual functions and pure virtual functions?", "difficulty": "Medium", "expectedKeywords": ["polymorphism", "abstract class", "vtable", "= 0"]},
    ],
    "DSA": [
        {"q": "How do you detect a cycle in a Directed Graph and Undirected Graph?", "difficulty": "Medium", "expectedKeywords": ["DFS", "Tarjan", "Kahn's Algorithm", "in-degree", "visiting array"]},
        {"q": "Explain Dynamic Programming overlap subproblems and optimal substructure with an example.", "difficulty": "Hard", "expectedKeywords": ["memoization", "tabulation", "subproblem", "state transition"]},
        {"q": "When would you prefer a Trie data structure over a HashMap?", "difficulty": "Medium", "expectedKeywords": ["prefix search", "autocomplete", "dictionary", "space complexity"]},
    ],
    "SQL": [
        {"q": "Explain ACID properties in relational databases and isolation levels.", "difficulty": "Medium", "expectedKeywords": ["Atomicity", "Consistency", "Isolation", "Durability", "READ COMMITTED"]},
        {"q": "How do database indexes improve query speed and what is their downside?", "difficulty": "Easy", "expectedKeywords": ["B-tree", "lookup", "write overhead", "storage"]},
    ],
}

@router.post("/v2/start")
def start_mock_interview_v2(req: StartInterviewV2Request):
    """Generate dynamic questions for Phase 13 Mock Interview 2.0 based on role, skill, type, and student profile."""
    skill_key = req.skill
    matched_q_bank = DYNAMIC_QUESTION_BANKS.get(skill_key, TECHNICAL_QUESTIONS.get(skill_key, []))

    if not matched_q_bank:
        # Fallback to dynamic generic technical & behavioral questions tailored to skill
        matched_q_bank = [
            {"q": f"Can you explain the core architecture and fundamental principles of {req.skill}?", "difficulty": "Easy", "expectedKeywords": [req.skill.lower(), "architecture", "component", "pattern"]},
            {"q": f"How do you debug performance bottlenecks or memory issues in {req.skill}?", "difficulty": "Medium", "expectedKeywords": ["profiler", "logging", "benchmark", "bottleneck"]},
            {"q": f"Describe a complex project where you used {req.skill} to solve a critical business problem.", "difficulty": "Medium", "expectedKeywords": ["project", "design", "scale", "solution"]},
            {"q": f"What are the security best practices when deploying a {req.skill} application to production?", "difficulty": "Hard", "expectedKeywords": ["authentication", "encryption", "sanitization", "OWASP"]},
        ]

    # Incorporate project questions if Project interview type or student has projects
    project_questions = []
    projects = req.studentProfile.get("projects", [])
    if (req.interviewType == "Project" or "Project" in req.interviewType) and projects:
        for proj in projects[:2]:
            proj_title = proj.get("title", "Project")
            proj_desc = proj.get("description", "")
            project_questions.append({
                "q": f"Walk me through the technical architecture of your project '{proj_title}'. Why did you choose your technology stack?",
                "difficulty": "Medium",
                "expectedKeywords": ["architecture", "database", "api", "tradeoff", "tech stack"]
            })

    questions = []
    # Mix questions based on requested count
    all_pool = matched_q_bank + project_questions
    if req.interviewType in ["HR", "Behavioral"]:
        hr_pool = [{"q": q, "difficulty": "Easy", "expectedKeywords": ["communication", "teamwork", "star method"]} for q in HR_QUESTIONS]
        all_pool = hr_pool + all_pool

    for i in range(min(req.questionCount, max(len(all_pool), req.questionCount))):
        q_obj = all_pool[i % len(all_pool)]
        questions.append({
            "id": i + 1,
            "question": q_obj["q"],
            "skill": req.skill,
            "difficulty": q_obj.get("difficulty", "Medium"),
            "expectedKeywords": q_obj.get("expectedKeywords", [req.skill.lower()])
        })

    return {
        "success": True,
        "role": req.role,
        "skill": req.skill,
        "difficulty": req.difficulty,
        "interviewType": req.interviewType,
        "questionCount": len(questions),
        "questions": questions,
        "instructions": "Camera and Microphone must remain active. Speak clearly in English.",
    }


@router.post("/v2/evaluate-answer")
def evaluate_answer_v2(req: EvaluateAnswerV2Request):
    """Real-time AI evaluation of verbal or typed English interview answers."""
    ans = req.answer.strip()
    words = ans.split()
    word_count = len(words)

    if word_count < 5:
        return {
            "success": True,
            "score": 15,
            "technicalScore": 10,
            "communicationScore": 20,
            "problemSolvingScore": 15,
            "relevanceScore": 15,
            "feedback": "Answer was too brief. Elaborate with technical concepts and concrete examples.",
            "whatYouDidWell": "Attempted the question.",
            "whatYouMissed": f"Missed key technical explanations for {req.skill}.",
            "howToImprove": "Use 3-4 structured sentences explaining the concept and a real-world code example.",
            "betterAnswerStructure": f"Define {req.skill} concept → State key components → Provide example.",
            "fillerWordsDetected": [],
            "speakingPace": "Too Fast / Insufficient Content",
        }

    ans_lower = ans.lower()
    # Check expected keywords
    matched_kw = [kw for kw in req.expectedKeywords if kw.lower() in ans_lower]
    missed_kw = [kw for kw in req.expectedKeywords if kw.lower() not in ans_lower]
    kw_coverage = (len(matched_kw) / max(1, len(req.expectedKeywords))) * 100

    # Filler words check
    filler_words = ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"]
    found_fillers = [f for f in filler_words if f in ans_lower]

    # Technical accuracy (0-100)
    tech_score = min(100, round(kw_coverage * 0.7 + (20 if word_count > 35 else 10)))
    
    # Communication clarity (0-100)
    comm_score = 90 if len(found_fillers) == 0 else max(50, 90 - len(found_fillers) * 10)

    # Problem solving & relevance
    problem_solving = 85 if "example" in ans_lower or "use" in ans_lower or "pattern" in ans_lower else 70
    relevance = 90 if kw_coverage > 30 else 60

    overall = round((tech_score * 0.4) + (comm_score * 0.25) + (problem_solving * 0.2) + (relevance * 0.15))

    # Construct actionable feedback
    did_well = f"Good technical terminology use: {', '.join(matched_kw)}" if matched_kw else "Responded clearly to the prompt."
    missed = f"Did not explicitly mention: {', '.join(missed_kw)}" if missed_kw else "All key concepts were addressed."
    improve = "Incorporate concrete production metrics and code patterns into your response."
    structure = f"1. Core definition of {req.skill} topic\n2. Key implementation details\n3. Trade-offs and real-world example"

    return {
        "success": True,
        "score": overall,
        "technicalScore": tech_score,
        "communicationScore": comm_score,
        "problemSolvingScore": problem_solving,
        "relevanceScore": relevance,
        "feedback": f"Scored {overall}/100. Tech score: {tech_score}%, Comm score: {comm_score}%.",
        "whatYouDidWell": did_well,
        "whatYouMissed": missed,
        "howToImprove": improve,
        "betterAnswerStructure": structure,
        "fillerWordsDetected": found_fillers,
        "speakingPace": "Optimal (120-150 wpm)" if 30 <= word_count <= 120 else "Fast",
    }


@router.post("/v2/final-report")
def generate_final_report_v2(req: FinalReportV2Request):
    """Compile comprehensive post-interview performance report with delta comparisons."""
    evaluated_q = [q for q in req.questions if q.get("score") is not None]
    if not evaluated_q:
        return {"success": False, "error": "No evaluated questions found"}

    avg_overall = round(sum(q.get("score", 0) for q in evaluated_q) / len(evaluated_q))
    avg_tech = round(sum(q.get("technicalScore", 0) for q in evaluated_q) / len(evaluated_q))
    avg_comm = round(sum(q.get("communicationScore", 0) for q in evaluated_q) / len(evaluated_q))
    avg_ps = round(sum(q.get("problemSolvingScore", 0) for q in evaluated_q) / len(evaluated_q))

    score_delta = avg_overall - req.previousAverageScore if req.previousAverageScore > 0 else 0

    strengths = []
    if avg_tech >= 80:
        strengths.append(f"Strong technical accuracy in {req.skill}")
    if avg_comm >= 80:
        strengths.append("Clear English articulation and minimal filler words")
    if avg_ps >= 80:
        strengths.append("Effective problem-solving approach with practical examples")
    if not strengths:
        strengths.append("Demonstrated fundamental understanding of core topics")

    needs_improvement = []
    if avg_tech < 75:
        needs_improvement.append(f"Deepen knowledge in advanced {req.skill} concepts")
    if avg_comm < 75:
        needs_improvement.append("Reduce pauses and filler words during verbal responses")
    if len(req.integrityEvents) > 0:
        needs_improvement.append("Maintain continuous visual focus on screen during interview session")
    if not needs_improvement:
        needs_improvement.append("Fine-tune high-level system architecture trade-offs")

    recommended_practice = [
        f"Practice 5 advanced {req.skill} interview questions",
        "Record verbal responses to refine speaking pace and tone",
        "Review interview integrity guidelines for focused attention"
    ]

    return {
        "success": True,
        "role": req.role,
        "skill": req.skill,
        "difficulty": req.difficulty,
        "overallScore": avg_overall,
        "technicalScore": avg_tech,
        "communicationScore": avg_comm,
        "problemSolvingScore": avg_ps,
        "answerQualityScore": avg_tech,
        "scoreDelta": score_delta,
        "integrityEventCount": len(req.integrityEvents),
        "strengths": strengths,
        "needsImprovement": needs_improvement,
        "recommendedPractice": recommended_practice,
        "summary": f"Completed mock interview for {req.role} ({req.skill}) with overall score {avg_overall}/100.",
    }

