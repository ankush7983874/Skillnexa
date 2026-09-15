from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])

# ─────────────────────────────────────────────────────────────────────────────
# Role-Skill Mapping (shared with career.py)
# ─────────────────────────────────────────────────────────────────────────────
ROLE_SKILL_MAP: Dict[str, List[str]] = {
    "Software Engineer": ["Data Structures", "Algorithms", "Python", "Java", "System Design", "SQL", "Git"],
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Next.js", "Redux", "Testing"],
    "Backend Developer": ["Python", "Node.js", "Java", "Go", "SQL", "NoSQL", "REST APIs", "Docker", "System Design"],
    "Full Stack Developer": ["React", "Node.js", "Python", "SQL", "NoSQL", "REST APIs", "TypeScript", "Docker", "Git"],
    "Data Scientist": ["Python", "Machine Learning", "SQL", "Pandas", "NumPy", "Statistics", "TensorFlow", "Data Visualization"],
    "ML Engineer": ["Python", "TensorFlow", "PyTorch", "MLOps", "Docker", "Kubernetes", "Statistics", "Data Pipelines"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Ansible", "Networking", "Shell Scripting"],
    "Data Engineer": ["Python", "SQL", "Spark", "Kafka", "Airflow", "Data Warehousing", "ETL", "Cloud Platforms"],
    "Mobile Developer": ["React Native", "Flutter", "Swift", "Kotlin", "REST APIs", "Firebase", "Git"],
    "Cloud Engineer": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Networking", "Security"],
}

DSA_STAGES = [
    {
        "stage": 1, "topic": "Programming Fundamentals",
        "concepts": ["Variables & Data Types", "Control Flow", "Functions", "Recursion Basics", "I/O Operations"],
        "practiceLevel": "Beginner",
        "recommendedProblems": ["Hello World", "FizzBuzz", "Fibonacci", "Factorial", "Prime Check"],
        "prerequisite": "None"
    },
    {
        "stage": 2, "topic": "Complexity Analysis",
        "concepts": ["Big-O Notation", "Time Complexity", "Space Complexity", "Best/Worst/Average Cases", "Amortized Analysis"],
        "practiceLevel": "Beginner",
        "recommendedProblems": ["Analyze Fibonacci Recursion", "Compare Sort Algorithms", "Nested Loop Analysis"],
        "prerequisite": "Programming Fundamentals"
    },
    {
        "stage": 3, "topic": "Arrays",
        "concepts": ["1D/2D Arrays", "Sliding Window", "Two Pointers", "Prefix Sum", "Kadane's Algorithm"],
        "practiceLevel": "Beginner",
        "recommendedProblems": ["Two Sum", "Maximum Subarray", "Best Time to Buy Stock", "Product of Array Except Self", "Rotate Array"],
        "prerequisite": "Complexity Analysis"
    },
    {
        "stage": 4, "topic": "Strings",
        "concepts": ["String Manipulation", "Pattern Matching", "KMP Algorithm", "Anagrams", "Palindromes"],
        "practiceLevel": "Beginner",
        "recommendedProblems": ["Valid Anagram", "Longest Palindromic Substring", "Valid Parentheses", "String Compression", "Count Vowels"],
        "prerequisite": "Arrays"
    },
    {
        "stage": 5, "topic": "Searching",
        "concepts": ["Linear Search", "Binary Search", "Search in Rotated Array", "Search in 2D Matrix", "Order-agnostic Search"],
        "practiceLevel": "Beginner-Intermediate",
        "recommendedProblems": ["Binary Search", "Find First/Last Occurrence", "Search Insert Position", "Sqrt(x)", "Guess Number"],
        "prerequisite": "Arrays"
    },
    {
        "stage": 6, "topic": "Sorting",
        "concepts": ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort", "Counting Sort"],
        "practiceLevel": "Intermediate",
        "recommendedProblems": ["Sort Colors", "Merge Intervals", "Kth Largest Element", "Sort Array by Parity", "Meeting Rooms"],
        "prerequisite": "Arrays, Complexity Analysis"
    },
    {
        "stage": 7, "topic": "Linked List",
        "concepts": ["Singly Linked List", "Doubly Linked List", "Cycle Detection", "Reverse", "Merge Two Sorted Lists"],
        "practiceLevel": "Intermediate",
        "recommendedProblems": ["Reverse Linked List", "Detect Cycle", "Merge Two Sorted Lists", "Remove Nth Node", "Palindrome Linked List"],
        "prerequisite": "Arrays"
    },
    {
        "stage": 8, "topic": "Stack",
        "concepts": ["Stack Operations", "Monotonic Stack", "Expression Evaluation", "Min Stack", "Stack using Queues"],
        "practiceLevel": "Intermediate",
        "recommendedProblems": ["Valid Parentheses", "Min Stack", "Next Greater Element", "Daily Temperatures", "Evaluate RPN"],
        "prerequisite": "Arrays, Linked List"
    },
    {
        "stage": 9, "topic": "Queue",
        "concepts": ["Queue Operations", "Circular Queue", "Deque", "Priority Queue", "Queue using Stacks"],
        "practiceLevel": "Intermediate",
        "recommendedProblems": ["Implement Queue using Stacks", "Sliding Window Maximum", "Design Circular Queue", "Number of Recent Calls"],
        "prerequisite": "Stack"
    },
    {
        "stage": 10, "topic": "Recursion",
        "concepts": ["Base Cases", "Recursive Tree", "Tail Recursion", "Memoization", "Backtracking Intro"],
        "practiceLevel": "Intermediate",
        "recommendedProblems": ["Tower of Hanoi", "Generate Parentheses", "Subsets", "Letter Combinations", "Climbing Stairs"],
        "prerequisite": "Programming Fundamentals"
    },
    {
        "stage": 11, "topic": "Hashing",
        "concepts": ["Hash Maps", "Hash Sets", "Collision Resolution", "Two Sum using Hashing", "Frequency Counting"],
        "practiceLevel": "Intermediate",
        "recommendedProblems": ["Two Sum", "Group Anagrams", "Top K Frequent Elements", "LRU Cache", "Subarray Sum Equals K"],
        "prerequisite": "Arrays"
    },
    {
        "stage": 12, "topic": "Trees",
        "concepts": ["Binary Tree", "Tree Traversals", "Height/Depth", "Level Order", "Diameter", "LCA"],
        "practiceLevel": "Intermediate-Advanced",
        "recommendedProblems": ["Invert Binary Tree", "Max Depth", "Level Order Traversal", "Diameter", "Path Sum"],
        "prerequisite": "Recursion, Linked List"
    },
    {
        "stage": 13, "topic": "BST",
        "concepts": ["BST Properties", "Insert/Delete/Search", "Inorder Traversal gives Sorted Order", "Balanced BST", "AVL Trees"],
        "practiceLevel": "Advanced",
        "recommendedProblems": ["Validate BST", "Kth Smallest in BST", "Convert BST to Sorted Array", "BST Iterator", "Delete Node in BST"],
        "prerequisite": "Trees"
    },
    {
        "stage": 14, "topic": "Heap",
        "concepts": ["Min Heap", "Max Heap", "Heapify", "Priority Queue", "K-Way Merge", "Top K Elements"],
        "practiceLevel": "Advanced",
        "recommendedProblems": ["Kth Largest Element", "Top K Frequent Elements", "Merge K Sorted Lists", "Find Median from Stream"],
        "prerequisite": "Trees"
    },
    {
        "stage": 15, "topic": "Graph",
        "concepts": ["Representation (Adj List/Matrix)", "BFS", "DFS", "Topological Sort", "Connected Components", "Cycle Detection"],
        "practiceLevel": "Advanced",
        "recommendedProblems": ["Number of Islands", "Course Schedule", "Clone Graph", "Shortest Path", "Word Ladder"],
        "prerequisite": "Trees, Queue"
    },
    {
        "stage": 16, "topic": "Greedy",
        "concepts": ["Greedy Choice Property", "Interval Scheduling", "Huffman Coding", "Activity Selection", "Jump Game"],
        "practiceLevel": "Advanced",
        "recommendedProblems": ["Jump Game", "Meeting Rooms II", "Task Scheduler", "Gas Station", "Minimum Platforms"],
        "prerequisite": "Sorting"
    },
    {
        "stage": 17, "topic": "Backtracking",
        "concepts": ["State Space Tree", "Pruning", "N-Queens", "Sudoku Solver", "Permutations & Combinations"],
        "practiceLevel": "Advanced",
        "recommendedProblems": ["N-Queens", "Sudoku Solver", "Permutations", "Combination Sum", "Word Search"],
        "prerequisite": "Recursion, Graph"
    },
    {
        "stage": 18, "topic": "Dynamic Programming",
        "concepts": ["Memoization", "Tabulation", "State Definition", "Transition", "Classic DP: LCS, LIS, Knapsack, Coin Change"],
        "practiceLevel": "Expert",
        "recommendedProblems": ["Climbing Stairs", "Coin Change", "Longest Common Subsequence", "0/1 Knapsack", "Edit Distance", "House Robber"],
        "prerequisite": "Recursion, Greedy"
    },
]

LEARNING_RESOURCES: Dict[str, List[Dict]] = {
    "Python": [
        {"type": "course", "title": "Python for Everybody", "description": "Comprehensive Python from scratch", "duration": "30h", "difficulty": "Beginner", "url": "https://www.coursera.org/specializations/python", "platform": "Coursera", "isFree": False},
        {"type": "article", "title": "Real Python Tutorials", "description": "In-depth Python tutorials", "duration": "Self-paced", "difficulty": "All", "url": "https://realpython.com", "platform": "Real Python", "isFree": True},
        {"type": "video", "title": "Python Full Course", "description": "6-hour Python bootcamp", "duration": "6h", "difficulty": "Beginner", "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc", "platform": "YouTube", "isFree": True},
        {"type": "practice", "title": "Python LeetCode Problems", "description": "Practice Python coding", "duration": "Ongoing", "difficulty": "All", "url": "https://leetcode.com/problemset/", "platform": "LeetCode", "isFree": True},
    ],
    "React": [
        {"type": "course", "title": "Complete React Developer", "description": "React with Hooks, Redux & TypeScript", "duration": "40h", "difficulty": "Intermediate", "url": "https://zerotomastery.io/courses/learn-react/", "platform": "Zero to Mastery", "isFree": False},
        {"type": "article", "title": "React Official Documentation", "description": "Official React docs with examples", "duration": "Self-paced", "difficulty": "All", "url": "https://react.dev", "platform": "React.dev", "isFree": True},
        {"type": "video", "title": "React Crash Course", "description": "Full React tutorial for beginners", "duration": "5h", "difficulty": "Beginner", "url": "https://www.youtube.com/watch?v=w7ejDZ8SWv8", "platform": "YouTube (Traversy)", "isFree": True},
    ],
    "JavaScript": [
        {"type": "course", "title": "JavaScript30 - 30 Day Challenge", "description": "Build 30 JS projects", "duration": "30 days", "difficulty": "Intermediate", "url": "https://javascript30.com", "platform": "Wes Bos", "isFree": True},
        {"type": "article", "title": "MDN JavaScript Guide", "description": "Comprehensive JS reference", "duration": "Self-paced", "difficulty": "All", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "platform": "MDN", "isFree": True},
        {"type": "practice", "title": "JavaScript Challenges", "description": "Practice JS on LeetCode", "duration": "Ongoing", "difficulty": "All", "url": "https://leetcode.com", "platform": "LeetCode", "isFree": True},
    ],
    "Data Structures": [
        {"type": "course", "title": "Data Structures & Algorithms", "description": "Complete DSA course", "duration": "60h", "difficulty": "Intermediate", "url": "https://www.geeksforgeeks.org/data-structures/", "platform": "GeeksForGeeks", "isFree": True},
        {"type": "practice", "title": "LeetCode DSA Practice", "description": "1000+ curated DSA problems", "duration": "Ongoing", "difficulty": "All", "url": "https://leetcode.com/study-plan/data-structure/", "platform": "LeetCode", "isFree": True},
        {"type": "video", "title": "DSA Playlist - Abdul Bari", "description": "Highly rated DSA video series", "duration": "50h", "difficulty": "Beginner-Advanced", "url": "https://www.youtube.com/c/AbdulBari", "platform": "YouTube", "isFree": True},
    ],
    "Machine Learning": [
        {"type": "course", "title": "Machine Learning Specialization", "description": "Andrew Ng's ML course", "duration": "90h", "difficulty": "Intermediate", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "platform": "Coursera (Stanford)", "isFree": False},
        {"type": "article", "title": "Scikit-learn Documentation", "description": "ML library official docs", "duration": "Self-paced", "difficulty": "Intermediate", "url": "https://scikit-learn.org/stable/user_guide.html", "platform": "Scikit-learn", "isFree": True},
    ],
}

DEFAULT_RESOURCES = [
    {"type": "article", "title": "GeeksForGeeks Tutorial", "description": "Comprehensive tutorial and examples", "duration": "Self-paced", "difficulty": "All", "url": "https://www.geeksforgeeks.org", "platform": "GeeksForGeeks", "isFree": True},
    {"type": "course", "title": "Official Documentation", "description": "Learn from the official source", "duration": "Self-paced", "difficulty": "All", "url": "https://developer.mozilla.org", "platform": "MDN", "isFree": True},
    {"type": "practice", "title": "LeetCode Practice", "description": "Solve algorithmic challenges", "duration": "Ongoing", "difficulty": "All", "url": "https://leetcode.com", "platform": "LeetCode", "isFree": True},
    {"type": "video", "title": "YouTube Tutorials", "description": "Visual learning resources", "duration": "Varies", "difficulty": "All", "url": "https://www.youtube.com", "platform": "YouTube", "isFree": True},
]

SKILL_MARKET_DATA = {
    "forecastPeriod": "2024–2025",
    "topRisingSkills": [
        {"skill": "AI / Machine Learning", "growthRate": 85, "demandScore": 95, "salaryImpact": "+$30k", "jobCount": 105000},
        {"skill": "LangChain / LLM Engineering", "growthRate": 120, "demandScore": 90, "salaryImpact": "+$40k", "jobCount": 18000},
        {"skill": "Rust", "growthRate": 60, "demandScore": 80, "salaryImpact": "+$25k", "jobCount": 28000},
        {"skill": "Go (Golang)", "growthRate": 55, "demandScore": 82, "salaryImpact": "+$22k", "jobCount": 48000},
        {"skill": "TypeScript", "growthRate": 48, "demandScore": 92, "salaryImpact": "+$18k", "jobCount": 130000},
        {"skill": "Kubernetes", "growthRate": 50, "demandScore": 85, "salaryImpact": "+$20k", "jobCount": 65000},
        {"skill": "FastAPI / Python", "growthRate": 70, "demandScore": 88, "salaryImpact": "+$20k", "jobCount": 38000},
        {"skill": "Next.js", "growthRate": 65, "demandScore": 86, "salaryImpact": "+$15k", "jobCount": 72000},
        {"skill": "Terraform / IaC", "growthRate": 55, "demandScore": 84, "salaryImpact": "+$22k", "jobCount": 45000},
        {"skill": "Vector Databases (Pinecone, Weaviate)", "growthRate": 200, "demandScore": 75, "salaryImpact": "+$35k", "jobCount": 12000},
    ],
    "decliningSkills": [
        {"skill": "jQuery", "reason": "Replaced by modern frameworks like React, Vue, and Angular"},
        {"skill": "ColdFusion", "reason": "Legacy enterprise technology with no modern adoption"},
        {"skill": "PHP (legacy)", "reason": "Declining relative to Node.js and Python for new projects"},
        {"skill": "Adobe Flash / ActionScript", "reason": "Fully deprecated by all browsers"},
        {"skill": "CVS / SVN", "reason": "Completely replaced by Git"},
    ],
    "emergingTechnologies": [
        "Agentic AI Systems", "WebAssembly (WASM)", "Serverless Edge Computing", "Quantum Computing (early)",
        "Retrieval-Augmented Generation (RAG)", "Multi-modal AI", "AI-Powered DevOps",
    ],
    "recommendedToLearn": [
        "Python (for AI/Data)", "TypeScript (for Web)", "Kubernetes (for DevOps)",
        "LangChain (for AI Apps)", "Next.js (for Full-Stack Web)", "Rust (for Systems)",
    ],
    "industryTrends": [
        "Integration of GenAI into standard software products",
        "Shift from monolith to microservices + AI-native architectures",
        "Explosion of AI-first startups requiring LLM expertise",
        "Cloud-native development as the default paradigm",
        "Security and compliance becoming mandatory for all engineers",
        "Platform engineering and Internal Developer Platforms gaining traction",
    ],
}


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────────────────────────────────────

class SkillEntry(BaseModel):
    name: str
    level: Optional[str] = "Beginner"
    score: Optional[int] = 0
    verified: Optional[bool] = False

class ProjectEntry(BaseModel):
    title: Optional[str] = ""
    techStack: Optional[List[str]] = []
    description: Optional[str] = ""

class ExperienceEntry(BaseModel):
    company: Optional[str] = ""
    role: Optional[str] = ""
    duration: Optional[str] = ""

class StudentProfilePayload(BaseModel):
    name: str = ""
    degree: Optional[str] = None
    major: Optional[str] = None
    cgpa: Optional[float] = None
    skills: Optional[List[Union[str, SkillEntry]]] = []
    projects: Optional[List[Union[str, ProjectEntry]]] = []
    experience: Optional[List[Union[str, ExperienceEntry]]] = []
    achievements: Optional[List[str]] = []
    careerGoals: Optional[List[str]] = []
    internships: Optional[int] = 0
    certifications: Optional[List[str]] = []
    resumeScore: Optional[int] = 0
    dsaScore: Optional[int] = 0
    assessmentAvgScore: Optional[int] = 0


def _extract_skill_names(skills_raw: Optional[List]) -> List[str]:
    """Extract skill name strings from either str list or SkillEntry list."""
    if not skills_raw:
        return []
    result = []
    for s in skills_raw:
        if isinstance(s, str):
            result.append(s.lower())
        elif isinstance(s, dict):
            result.append(str(s.get("name", "")).lower())
        elif hasattr(s, "name"):
            result.append(str(s.name).lower())
    return result


def _score_color(score: int) -> str:
    if score >= 75:
        return "green"
    if score >= 50:
        return "amber"
    return "red"


def _readiness_level(score: int) -> str:
    if score >= 80:
        return "Expert"
    if score >= 60:
        return "Advanced"
    if score >= 40:
        return "Intermediate"
    return "Beginner"


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

# 1. Career Predictor
class CareerPredictorReq(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"
    goals: List[str] = []

@router.post("/career-predictor")
async def career_predictor(req: CareerPredictorReq):
    profile_skills = _extract_skill_names(req.profile.skills)
    target_skills = [s.lower() for s in ROLE_SKILL_MAP.get(req.targetRole, [])]

    if not target_skills:
        target_skills = ["python", "sql", "git"]

    matched = [s for s in profile_skills if s in target_skills]
    missing = [s for s in target_skills if s not in profile_skills]
    confidence = int((len(matched) / len(target_skills)) * 100) if target_skills else 0
    confidence = max(confidence, 5)  # minimum 5% if student exists

    current_level = _readiness_level(confidence)
    timeline_months = max(1, int(len(missing) * 1.5))

    # Salary ranges per role
    salary_map = {
        "Software Engineer": "₹6L – ₹25L / year",
        "Full Stack Developer": "₹7L – ₹28L / year",
        "Backend Developer": "₹8L – ₹30L / year",
        "Frontend Developer": "₹5L – ₹22L / year",
        "Data Scientist": "₹8L – ₹35L / year",
        "ML Engineer": "₹10L – ₹40L / year",
        "DevOps Engineer": "₹9L – ₹32L / year",
        "Data Engineer": "₹9L – ₹30L / year",
        "Mobile Developer": "₹6L – ₹24L / year",
        "Cloud Engineer": "₹10L – ₹38L / year",
    }

    alt_roles = [r for r in ROLE_SKILL_MAP.keys() if r != req.targetRole][:3]
    required_steps = [f"Learn {s.title()}" for s in missing[:8]]
    if req.profile.projects is not None and len(req.profile.projects) == 0:
        required_steps.insert(0, "Build at least 2 portfolio projects")
    if not (req.profile.certifications or []):
        required_steps.append("Earn a relevant certification (e.g. AWS, GCP)")

    bottlenecks = []
    if confidence < 30:
        bottlenecks.append(f"Low skill overlap ({confidence}%) with {req.targetRole} requirements")
    if len(req.profile.projects or []) < 2:
        bottlenecks.append("Insufficient project portfolio (fewer than 2 projects)")
    if (req.profile.cgpa or 0) < 7.0:
        bottlenecks.append("CGPA below recommended threshold (7.0+)")
    if not (req.profile.internships or 0):
        bottlenecks.append("No internship experience")

    return {
        "predictedRole": req.targetRole,
        "confidenceScore": confidence,
        "timelineMonths": timeline_months,
        "currentLevel": current_level,
        "requiredSteps": required_steps,
        "matchedSkills": matched,
        "missingSkills": missing,
        "salaryRange": salary_map.get(req.targetRole, "₹6L – ₹25L / year"),
        "growthPotential": "High" if confidence >= 60 else ("Moderate" if confidence >= 30 else "Needs Work"),
        "alternativeRoles": alt_roles,
        "bottlenecks": bottlenecks,
    }


# 2. Skill Coach
class SkillCoachReq(BaseModel):
    profile: StudentProfilePayload
    targetSkill: str = ""
    currentLevel: str = "Beginner"

@router.post("/skill-coach")
async def skill_coach(req: SkillCoachReq):
    skill = req.targetSkill or "General Programming"
    level = req.currentLevel

    weeks_map = {"Beginner": 8, "Intermediate": 5, "Advanced": 3}
    estimated_weeks = weeks_map.get(level, 6)

    coaching_plan = []
    if level == "Beginner":
        coaching_plan = [
            {"week": 1, "topic": f"Introduction to {skill}", "exercises": ["Read official documentation", "Complete 3 beginner tutorials", "Set up development environment"], "milestone": "Understand core concepts"},
            {"week": 2, "topic": f"Core {skill} Concepts", "exercises": ["Build a small demo project", "Solve 5 practice problems", "Watch 2 video tutorials"], "milestone": "Complete first mini-project"},
            {"week": 3, "topic": f"Intermediate {skill} Patterns", "exercises": ["Build a medium-complexity project", "Study common design patterns", "Code review practice"], "milestone": "Apply skill in real project"},
            {"week": 4, "topic": f"Advanced {skill} Topics", "exercises": ["Deep dive into advanced features", "Optimize your mini-project", "Peer code review"], "milestone": "Achieve Intermediate level"},
            {"week": 5, "topic": "Real-world Application", "exercises": ["Contribute to open source", "Build a portfolio project", "Write a blog post about learning"], "milestone": "Portfolio-ready project"},
            {"week": 6, "topic": "Assessment & Refinement", "exercises": ["Take a skills assessment", "Identify remaining gaps", "Create a continued learning plan"], "milestone": "Certified or assessed competency"},
        ]
    elif level == "Intermediate":
        coaching_plan = [
            {"week": 1, "topic": f"Advanced {skill} Patterns", "exercises": ["Study design patterns", "Solve medium-hard practice problems"], "milestone": "Master advanced patterns"},
            {"week": 2, "topic": "Performance Optimization", "exercises": ["Profile and optimize code", "Study memory management", "Benchmark implementations"], "milestone": "Write optimized code"},
            {"week": 3, "topic": "Production Best Practices", "exercises": ["Add comprehensive tests", "Setup CI/CD pipeline", "Review and refactor codebase"], "milestone": "Production-ready code"},
            {"week": 4, "topic": "System Integration", "exercises": ["Integrate with other technologies", "Build a complete feature", "Deploy to cloud"], "milestone": "Full integration project"},
        ]
    else:  # Advanced
        coaching_plan = [
            {"week": 1, "topic": f"Expert {skill} Techniques", "exercises": ["Study internals & source code", "Contribute to open source"], "milestone": "Deep expertise"},
            {"week": 2, "topic": "Teaching & Mentoring", "exercises": ["Write technical articles", "Mentor juniors", "Lead a mini-project"], "milestone": "Teach others"},
            {"week": 3, "topic": "Specialization", "exercises": ["Pick a niche area", "Build a specialized tool", "Present at a meetup"], "milestone": "Expert-level specialization"},
        ]

    resources = LEARNING_RESOURCES.get(skill, DEFAULT_RESOURCES[:3])
    assessment_topics = [f"{skill} Fundamentals", f"Applied {skill}", f"{skill} Problem Solving", f"Best Practices in {skill}"]

    return {
        "skill": skill,
        "currentLevel": level,
        "targetLevel": "Advanced" if level in ["Beginner", "Intermediate"] else "Expert",
        "coachingPlan": coaching_plan[:estimated_weeks],
        "estimatedWeeks": estimated_weeks,
        "resources": [{"title": r["title"], "url": r["url"], "platform": r["platform"], "isFree": r["isFree"]} for r in resources],
        "assessmentTopics": assessment_topics,
    }


# 3. DSA Coach
class DSACoachReq(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"

@router.post("/dsa-coach")
async def dsa_coach(req: DSACoachReq):
    profile_skills = _extract_skill_names(req.profile.skills)
    dsa_score = req.profile.dsaScore or 0

    # Determine current DSA level from profile
    if dsa_score >= 80 or any(kw in profile_skills for kw in ["dynamic programming", "graphs", "advanced dsa"]):
        current_level = "Advanced"
        start_stage = 13
    elif dsa_score >= 50 or any(kw in profile_skills for kw in ["trees", "linked list", "stack", "queue"]):
        current_level = "Intermediate"
        start_stage = 7
    elif dsa_score >= 25 or any(kw in profile_skills for kw in ["arrays", "strings", "sorting"]):
        current_level = "Beginner-Intermediate"
        start_stage = 3
    else:
        current_level = "Beginner"
        start_stage = 1

    # Build roadmap with student status
    roadmap = []
    status_kws = {
        "Programming Fundamentals": ["programming", "python", "java", "c++", "javascript"],
        "Arrays": ["arrays", "array"],
        "Strings": ["strings", "string manipulation"],
        "Sorting": ["sorting", "algorithms"],
        "Linked List": ["linked list", "data structures"],
        "Trees": ["trees", "binary tree", "bst"],
        "Graph": ["graph", "graphs", "bfs", "dfs"],
        "Dynamic Programming": ["dynamic programming", "dp"],
    }

    for stage_data in DSA_STAGES:
        topic = stage_data["topic"]
        topic_kws = status_kws.get(topic, [topic.lower()])
        has_skill = any(kw in profile_skills for kw in topic_kws)
        if stage_data["stage"] < start_stage:
            student_status = "Strong" if has_skill else "Completed"
        elif stage_data["stage"] == start_stage:
            student_status = "In Progress"
        else:
            student_status = "Not Started"

        roadmap.append({
            "stage": stage_data["stage"],
            "topic": topic,
            "concepts": stage_data["concepts"],
            "practiceLevel": stage_data["practiceLevel"],
            "recommendedProblems": stage_data["recommendedProblems"],
            "prerequisite": stage_data["prerequisite"],
            "studentStatus": student_status,
            "nextTopic": DSA_STAGES[stage_data["stage"]]["topic"] if stage_data["stage"] < 18 else "Complete",
        })

    topic_wise_status = {r["topic"]: r["studentStatus"] for r in roadmap}
    next_topic = next((r["topic"] for r in roadmap if r["studentStatus"] in ["In Progress", "Not Started"]), "Dynamic Programming")
    remaining = len([r for r in roadmap if r["studentStatus"] == "Not Started"])
    estimated_weeks = max(4, remaining * 2)

    return {
        "currentLevel": current_level,
        "roadmap": roadmap,
        "topicWiseStatus": topic_wise_status,
        "nextRecommendedTopic": next_topic,
        "estimatedWeeks": estimated_weeks,
        "dsaScore": dsa_score,
        "totalStages": 18,
        "completedStages": 18 - remaining,
    }


# 4. Coding Debugger
class CodingDebuggerReq(BaseModel):
    code: str = ""
    language: str = "python"
    errorMessage: str = ""
    context: str = ""

@router.post("/coding-debugger")
async def coding_debugger(req: CodingDebuggerReq):
    code = req.code
    lang = req.language.lower()
    issues = []
    lines = code.split("\n")

    # Python-specific checks
    if lang == "python":
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith("def ") and not stripped.endswith(":"):
                issues.append({"line": i, "issue": "Function definition missing colon ':'", "severity": "HIGH", "fix": f"Add ':' at end: {stripped}:"})
            if stripped.startswith("class ") and not stripped.endswith(":"):
                issues.append({"line": i, "issue": "Class definition missing colon ':'", "severity": "HIGH", "fix": f"Add ':' at end: {stripped}:"})
            if "print " in stripped and not stripped.startswith("#") and "(" not in stripped:
                issues.append({"line": i, "issue": "Python 2 print syntax used", "severity": "HIGH", "fix": stripped.replace("print ", "print(") + ")"})
            if "==" in stripped and "if" not in stripped and "while" not in stripped and "assert" not in stripped and "return" not in stripped:
                if not stripped.startswith("#"):
                    issues.append({"line": i, "issue": "Possible comparison (==) instead of assignment (=)?", "severity": "MEDIUM", "fix": f"Check if you meant assignment '=' here"})
            if " = None" not in stripped and "is None" not in stripped and "== None" in stripped:
                issues.append({"line": i, "issue": "Use 'is None' instead of '== None'", "severity": "LOW", "fix": stripped.replace("== None", "is None")})

    # JavaScript/TypeScript checks
    elif lang in ["javascript", "typescript", "js", "ts"]:
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith("var "):
                issues.append({"line": i, "issue": "Avoid 'var', use 'const' or 'let'", "severity": "MEDIUM", "fix": stripped.replace("var ", "const ")})
            if "==" in stripped and "===" not in stripped and "!==" not in stripped and not stripped.startswith("//"):
                issues.append({"line": i, "issue": "Use strict equality '===' instead of '=='", "severity": "MEDIUM", "fix": stripped.replace("==", "===")})
            if "console.log" in stripped and not stripped.startswith("//"):
                issues.append({"line": i, "issue": "Remove debug console.log before production", "severity": "LOW", "fix": "Remove or comment out this line"})

    # Java checks
    elif lang == "java":
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if "System.out.println" in stripped:
                issues.append({"line": i, "issue": "Use a logging framework (SLF4J/Log4j) instead of System.out", "severity": "LOW", "fix": "Use logger.info() instead"})

    # Check for error message hints
    if req.errorMessage:
        err = req.errorMessage.lower()
        if "null pointer" in err or "nullpointerexception" in err:
            issues.append({"line": 0, "issue": "NullPointerException detected — add null checks", "severity": "HIGH", "fix": "Check if objects are null before calling methods"})
        elif "index out of range" in err or "indexerror" in err:
            issues.append({"line": 0, "issue": "Index out of bounds — check array/list bounds", "severity": "HIGH", "fix": "Ensure index is within range [0, len-1]"})
        elif "typerror" in err:
            issues.append({"line": 0, "issue": "Type mismatch detected", "severity": "HIGH", "fix": "Ensure you are using the correct data types"})
        elif "syntaxerror" in err:
            issues.append({"line": 0, "issue": "Syntax error in code", "severity": "HIGH", "fix": "Review code structure: missing brackets, colons, or semicolons"})

    corrected = code
    if issues:
        corrected = f"# Corrected Code — review the following fixes:\n\n{code}"

    best_practices = {
        "python": ["Follow PEP 8 style guide", "Use type hints for all functions", "Write docstrings for every function", "Use list comprehensions where readable", "Use context managers (with) for file handling"],
        "javascript": ["Always use 'use strict'", "Prefer const/let over var", "Use === for equality checks", "Handle Promise rejections", "Avoid global variables"],
        "java": ["Use meaningful variable names", "Follow SOLID principles", "Write unit tests (JUnit)", "Use interfaces for abstraction", "Close resources in finally blocks"],
    }

    return {
        "analysis": f"Analyzed {len(lines)} lines of {lang} code. Found {len(issues)} potential issue(s).",
        "detectedIssues": issues,
        "correctedCode": corrected,
        "explanation": "Issues were detected based on static analysis and best practice rules. Review each suggestion carefully.",
        "bestPractices": best_practices.get(lang, ["Write clean, readable code", "Add unit tests", "Use version control (git)"]),
        "issueCount": len(issues),
        "severity": "HIGH" if any(i["severity"] == "HIGH" for i in issues) else ("MEDIUM" if issues else "CLEAN"),
    }


# 5. Code Reviewer
class CodeReviewerReq(BaseModel):
    code: str = ""
    language: str = "python"
    reviewType: str = "general"

@router.post("/code-reviewer")
async def code_reviewer(req: CodeReviewerReq):
    code = req.code
    lines = code.split("\n")
    line_count = len(lines)
    char_count = len(code)

    issues = []
    positives = []

    # Readability scoring
    has_comments = any(l.strip().startswith("#") or l.strip().startswith("//") or '"""' in l or "'''" in l for l in lines)
    has_long_lines = any(len(l) > 120 for l in lines)
    has_blank_lines = any(l.strip() == "" for l in lines)
    short_var_names = len([l for l in lines if len([w for w in l.split() if len(w) == 1 and w.isalpha() and w not in ["x", "y", "i", "j", "n"]]) > 1]) > 3

    readability = 70
    if has_comments:
        readability += 10
        positives.append("Code has inline comments improving readability")
    if has_blank_lines:
        readability += 5
        positives.append("Good use of whitespace to separate logical sections")
    if has_long_lines:
        readability -= 10
        issues.append({"category": "Readability", "severity": "LOW", "line": 0, "message": "Some lines exceed 120 characters", "suggestion": "Break long lines for readability"})
    if short_var_names:
        readability -= 5
        issues.append({"category": "Readability", "severity": "LOW", "line": 0, "message": "Single-character variable names detected", "suggestion": "Use descriptive variable names"})

    # Efficiency scoring
    efficiency = 75
    if line_count > 200:
        efficiency -= 5
        issues.append({"category": "Efficiency", "severity": "MEDIUM", "line": 0, "message": "Large function/file detected", "suggestion": "Consider breaking into smaller modules/functions"})

    nested_depth = max(len(l) - len(l.lstrip()) for l in lines if l.strip()) // 4
    if nested_depth > 4:
        efficiency -= 10
        issues.append({"category": "Efficiency", "severity": "MEDIUM", "line": 0, "message": f"Deep nesting detected (depth ~{nested_depth})", "suggestion": "Refactor using early returns or extract methods"})

    # Maintainability scoring
    maintainability = 70
    has_functions = any("def " in l or "function " in l or "const " in l for l in lines)
    if has_functions:
        maintainability += 10
        positives.append("Code is organized into functions/methods")
    if has_comments:
        maintainability += 5

    # Security scoring
    security = 90
    lang = req.language.lower()
    if lang in ["python", "php"]:
        if "eval(" in code:
            security -= 30
            issues.append({"category": "Security", "severity": "HIGH", "line": 0, "message": "eval() usage detected — security risk", "suggestion": "Avoid eval() — use safer alternatives"})
        if "exec(" in code and lang == "python":
            security -= 20
            issues.append({"category": "Security", "severity": "HIGH", "line": 0, "message": "exec() usage detected", "suggestion": "Avoid exec() for security reasons"})
    if "password" in code.lower() and ("=" in code) and ("\"" in code or "'" in code):
        security -= 20
        issues.append({"category": "Security", "severity": "HIGH", "line": 0, "message": "Possible hardcoded password detected", "suggestion": "Use environment variables for secrets"})

    overall = int((readability + efficiency + maintainability + security) / 4)

    improvements = [
        "Add comprehensive unit tests (aim for 80%+ coverage)",
        "Add type hints / JSDoc annotations for all public functions",
        "Extract magic numbers into named constants",
    ]
    if not has_comments:
        improvements.insert(0, "Add inline comments to explain complex logic")

    return {
        "overallScore": overall,
        "readabilityScore": min(readability, 100),
        "efficiencyScore": min(efficiency, 100),
        "maintainabilityScore": min(maintainability, 100),
        "securityScore": max(security, 0),
        "issues": issues,
        "positives": positives if positives else ["Code is syntactically valid"],
        "improvements": improvements,
        "refactoredSnippets": [],
        "lineCount": line_count,
        "reviewType": req.reviewType,
    }


# 6. Interview Coach
class InterviewCoachReq(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"
    weakAreas: List[str] = []

@router.post("/interview-coach")
async def interview_coach(req: InterviewCoachReq):
    profile_skills = _extract_skill_names(req.profile.skills)
    weak = req.weakAreas or ["DSA", "System Design"]

    coaching_plan = []
    day = 1
    for area in weak:
        exercises = {
            "DSA": ["Solve 3 LeetCode medium problems", "Review Arrays & Strings", "Time yourself on whiteboard"],
            "System Design": ["Design a URL shortener", "Study load balancing concepts", "Draw system diagrams"],
            "Behavioral": ["Prepare 5 STAR stories", "Practice with a friend", "Record yourself answering"],
            "Technical": [f"Review {req.targetRole} core concepts", "Practice coding on whiteboard", "Study system internals"],
            "Communication": ["Practice talking through your thought process", "Do a mock interview", "Record your explanation style"],
            "OOP": ["Design 3 class diagrams", "Implement SOLID principles", "Study design patterns"],
        }.get(area, [f"Practice {area}", "Mock Q&A session"])

        coaching_plan.append({
            "day": day,
            "topic": area,
            "exercises": exercises,
            "focusArea": area,
        })
        day += 1

    # Fill remaining days with general prep
    general_topics = ["Resume Review", "Company Research", "Salary Negotiation", "Portfolio Walkthrough"]
    for gt in general_topics:
        if day > 14:
            break
        coaching_plan.append({
            "day": day,
            "topic": gt,
            "exercises": [f"Prepare {gt} talking points", "Research target company culture"],
            "focusArea": "General",
        })
        day += 1

    tips_by_category = {
        "DSA": ["Draw before coding", "Start with brute force, optimize later", "Communicate your thought process out loud"],
        "System Design": ["Clarify requirements first", "Start with high-level architecture", "Discuss trade-offs explicitly"],
        "Behavioral": ["Use the STAR framework (Situation, Task, Action, Result)", "Be specific with numbers and outcomes", "Always end with lessons learned"],
        "General": ["Research the company before the interview", "Ask thoughtful questions", "Send a follow-up thank you email"],
    }

    return {
        "coachingPlan": coaching_plan,
        "keyAreasToImprove": weak,
        "strengthsToHighlight": profile_skills[:5] if profile_skills else ["Eagerness to learn", "Communication"],
        "tipsByCategory": tips_by_category,
        "estimatedReadinessDays": max(7, len(weak) * 5 + 3),
        "targetRole": req.targetRole,
    }


# 7. Resume Optimizer
class ResumeOptimizerReq(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"
    currentResumeScore: int = 0

@router.post("/resume-optimizer")
async def resume_optimizer(req: ResumeOptimizerReq):
    profile_skills = _extract_skill_names(req.profile.skills)
    target_skills = [s.lower() for s in ROLE_SKILL_MAP.get(req.targetRole, [])]
    missing_keywords = [s.title() for s in target_skills if s not in profile_skills]

    base_score = req.currentResumeScore or 30
    score_gain = min(len(req.profile.projects or []) * 5, 15) + min(len(req.profile.skills or []) * 3, 20)
    estimated_after = min(base_score + score_gain + 10, 95)

    action_items = []
    if missing_keywords:
        action_items.append({"priority": "HIGH", "action": f"Add these keywords to Skills section: {', '.join(missing_keywords[:5])}", "impact": "High ATS score improvement"})
    if len(req.profile.projects or []) < 2:
        action_items.append({"priority": "HIGH", "action": "Add at least 2 portfolio projects with tech stacks", "impact": "Major employer appeal increase"})
    if not (req.profile.certifications or []):
        action_items.append({"priority": "MEDIUM", "action": "Add relevant certifications to boost credibility", "impact": "Medium credibility boost"})
    action_items.append({"priority": "MEDIUM", "action": "Quantify all achievements (e.g. 'Improved performance by 30%')", "impact": "High readability and impact"})
    action_items.append({"priority": "LOW", "action": "Tailor your Summary section specifically for this role", "impact": "Better recruiter engagement"})
    action_items.append({"priority": "LOW", "action": "Remove 'References available upon request' and Objective section", "impact": "Space savings for more content"})

    return {
        "optimizedSections": {
            "Summary": f"Results-driven {req.targetRole} with skills in {', '.join(profile_skills[:3])}. Passionate about building scalable solutions.",
            "Skills": f"Add: {', '.join(missing_keywords[:5])}",
            "Projects": "Include 2–3 projects with GitHub links and measurable impact",
            "Education": "Place after Experience once you have work/internship experience",
        },
        "keywordsToAdd": missing_keywords[:10],
        "keywordsToRemove": ["Hardworking", "Team player", "References available upon request", "Objective", "Seasoned professional"],
        "formattingTips": [
            "Keep to one page (until 5+ years of experience)",
            "Use consistent font (Calibri, Arial, or Google's resume template)",
            "Bold your key achievements and metrics",
            "Use bullet points — no paragraphs",
            "Save as PDF, not .docx",
        ],
        "contentImprovements": [
            "Quantify everything — 'Built a web app' → 'Built a web app handling 10K+ users'",
            "Lead each bullet with a strong action verb (Built, Led, Optimized, Designed)",
            "Show impact: tools used + what you built + result achieved",
            "Tailor resume per job description — ATS filters are keyword-sensitive",
        ],
        "estimatedScoreAfter": estimated_after,
        "scoreDelta": estimated_after - base_score,
        "actionItems": action_items,
    }


# 8. Project Advisor
class ProjectAdvisorReq(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"
    timeAvailableWeeks: int = 8

@router.post("/project-advisor")
async def project_advisor(req: ProjectAdvisorReq):
    profile_skills = _extract_skill_names(req.profile.skills)
    role_skills = ROLE_SKILL_MAP.get(req.targetRole, ["Python", "SQL", "Git"])
    missing_skills = [s for s in role_skills if s.lower() not in profile_skills]

    weeks = req.timeAvailableWeeks
    project_ideas = {
        "Full Stack Developer": [
            {"title": "E-Commerce Platform", "description": "Build a full-stack e-commerce site with authentication, product listings, cart, and checkout", "techStack": ["React", "Node.js", "MongoDB", "Stripe API"], "difficulty": "Medium", "estimatedWeeks": min(8, weeks), "githubIdea": "e-commerce-mern", "learningOutcomes": ["Full-stack architecture", "Payment integration", "State management", "Responsive design"], "impact": "High"},
            {"title": "Real-time Chat Application", "description": "WebSocket-based chat with rooms, user auth, and message history", "techStack": ["React", "Socket.io", "Node.js", "Redis"], "difficulty": "Medium", "estimatedWeeks": min(5, weeks), "githubIdea": "realtime-chat-app", "learningOutcomes": ["WebSockets", "Redis caching", "Real-time UX"], "impact": "High"},
        ],
        "Data Scientist": [
            {"title": "Salary Prediction ML Model", "description": "Predict job salaries using LinkedIn/Glassdoor data with feature engineering", "techStack": ["Python", "Scikit-learn", "Pandas", "Streamlit"], "difficulty": "Medium", "estimatedWeeks": min(6, weeks), "githubIdea": "salary-prediction-ml", "learningOutcomes": ["Data cleaning", "Regression models", "Model evaluation", "Deployment"], "impact": "High"},
            {"title": "Sentiment Analysis Dashboard", "description": "Analyze product reviews and display insights on a live dashboard", "techStack": ["Python", "NLTK", "Flask", "Plotly"], "difficulty": "Medium", "estimatedWeeks": min(4, weeks), "githubIdea": "sentiment-dashboard", "learningOutcomes": ["NLP basics", "Data visualization", "API creation"], "impact": "Medium"},
        ],
        "DevOps Engineer": [
            {"title": "Kubernetes CI/CD Pipeline", "description": "Build end-to-end automated deployment pipeline with monitoring", "techStack": ["Docker", "Kubernetes", "GitHub Actions", "Prometheus", "Grafana"], "difficulty": "Advanced", "estimatedWeeks": min(8, weeks), "githubIdea": "k8s-cicd-pipeline", "learningOutcomes": ["Container orchestration", "GitOps", "Observability", "IaC"], "impact": "Very High"},
        ],
        "default": [
            {"title": "Personal Portfolio Website", "description": "Showcase your skills, projects, and experience with a modern, responsive design", "techStack": ["React", "TypeScript", "Tailwind CSS", "GitHub Pages"], "difficulty": "Easy", "estimatedWeeks": min(2, weeks), "githubIdea": "my-portfolio-2024", "learningOutcomes": ["React basics", "Responsive design", "Deployment", "CI/CD"], "impact": "Medium"},
            {"title": "Job Application Tracker", "description": "Track your job applications with status, interviews, and notes", "techStack": ["React", "Node.js", "MongoDB"], "difficulty": "Easy", "estimatedWeeks": min(3, weeks), "githubIdea": "job-tracker-app", "learningOutcomes": ["CRUD operations", "Authentication", "Data management"], "impact": "Medium"},
            {"title": "Open Source Contribution", "description": "Contribute to a popular open source project in your target stack", "techStack": role_skills[:3], "difficulty": "Varies", "estimatedWeeks": min(4, weeks), "githubIdea": "open-source-contribution", "learningOutcomes": ["Collaborative development", "Code review", "PR workflow", "Large codebases"], "impact": "Very High"},
        ],
    }

    projects = project_ideas.get(req.targetRole, project_ideas["default"])
    if req.targetRole not in project_ideas:
        projects = project_ideas["default"]

    return {
        "recommendedProjects": projects,
        "skillGapProjects": [f"Build a {s} mini-project" for s in missing_skills[:4]],
        "portfolioAdvice": (
            f"For {req.targetRole}, your portfolio should include at least 3 projects demonstrating "
            f"core skills: {', '.join(role_skills[:4])}. "
            "Deploy every project and write a clear README. "
            "Host on GitHub with live demos on Vercel, Netlify, or Railway. "
            "Quality > quantity — 2 excellent projects beat 10 mediocre ones."
        ),
        "weeklyTimeAvailable": weeks,
        "timelineRecommendation": f"Given {weeks} weeks, focus on 1-2 high-impact projects rather than many small ones.",
    }


# 9. Learning Materials
class LearningMaterialsReq(BaseModel):
    skill: str = ""
    level: str = "Beginner"
    format: str = "all"

@router.post("/learning-materials")
async def learning_materials(req: LearningMaterialsReq):
    skill = req.skill or "Programming"
    materials = LEARNING_RESOURCES.get(skill, DEFAULT_RESOURCES)

    # Filter by format
    if req.format != "all":
        materials = [m for m in materials if m["type"].lower() == req.format.lower()]
        if not materials:
            materials = DEFAULT_RESOURCES

    # Build a learning path
    learning_path = [
        f"1. Understand {skill} fundamentals",
        f"2. Complete a beginner tutorial or course",
        f"3. Build a mini-project using {skill}",
        f"4. Solve practice problems to reinforce learning",
        f"5. Integrate {skill} into a larger project",
        f"6. Learn advanced {skill} concepts",
        f"7. Contribute to open source or teach others",
    ]

    return {
        "skill": skill,
        "materials": materials,
        "learningPath": learning_path,
        "estimatedHours": len(materials) * 8,
        "level": req.level,
        "format": req.format,
    }


# 10. Performance Predictor
class PerformancePredictorReq(BaseModel):
    profile: StudentProfilePayload
    currentPerformance: Dict[str, Any] = {}
    targetScore: int = 80
    timelineWeeks: int = 12

@router.post("/performance-predictor")
async def performance_predictor(req: PerformancePredictorReq):
    perf = req.currentPerformance
    recent_scores = perf.get("recentScores", [])
    skill_count = len(req.profile.skills or [])
    project_count = len(req.profile.projects or [])
    assessment_avg = req.profile.assessmentAvgScore or 0

    current_est = assessment_avg or (sum(recent_scores) // len(recent_scores) if recent_scores else 40)
    target = req.targetScore
    weeks = req.timelineWeeks

    # Realistic projection: improvement per week based on effort
    max_weekly_gain = 2.5  # realistic max improvement per week
    possible_gain = min(max_weekly_gain * weeks, target - current_est)
    predicted = min(int(current_est + possible_gain), 100)

    confidence = 85 if skill_count > 5 else (70 if skill_count > 2 else 55)

    key_factors = []
    if skill_count > 5:
        key_factors.append(f"Strong skill base ({skill_count} skills) enables faster learning")
    if project_count > 1:
        key_factors.append(f"Practical experience ({project_count} projects) accelerates understanding")
    if recent_scores:
        trend = recent_scores[-1] - recent_scores[0] if len(recent_scores) > 1 else 0
        if trend > 0:
            key_factors.append(f"Positive performance trend (+{trend}% over last {len(recent_scores)} assessments)")
    if not key_factors:
        key_factors = ["Consistent daily practice is the #1 factor", "Completing assessments builds foundational knowledge"]

    improvement_areas = [
        {"area": "DSA Practice", "currentScore": req.profile.dsaScore or current_est, "predictedScore": min(int((req.profile.dsaScore or current_est) + possible_gain * 0.4), 100), "actions": ["Solve 2 LeetCode problems daily", "Study algorithm patterns weekly"]},
        {"area": "Assessment Performance", "currentScore": assessment_avg or current_est, "predictedScore": min(int(assessment_avg + possible_gain * 0.6), 100), "actions": ["Take 1 practice assessment per week", "Review wrong answers thoroughly"]},
    ]

    weekly_milestones = []
    score_so_far = current_est
    for w in range(1, weeks + 1):
        gain_this_week = possible_gain / weeks
        score_so_far = min(score_so_far + gain_this_week, target)
        weekly_milestones.append({
            "week": w,
            "expectedScore": int(score_so_far),
            "keyActions": [f"Complete module {w}", "Review previous topics"] if w % 2 == 0 else ["Practice problems", "Take mini quiz"],
        })

    risk_factors = []
    if weeks < 4:
        risk_factors.append("Very short timeline — results may be limited")
    if skill_count < 3:
        risk_factors.append("Low number of skills — prioritize core skills immediately")
    if assessment_avg < 40:
        risk_factors.append("Low assessment average — foundational gaps need addressing first")
    if not risk_factors:
        risk_factors = ["Inconsistent practice schedule is the biggest risk to prediction accuracy"]

    return {
        "currentScore": current_est,
        "predictedScore": predicted,
        "confidenceLevel": confidence,
        "targetScore": target,
        "timelineWeeks": weeks,
        "keyFactors": key_factors,
        "improvementAreas": improvement_areas,
        "weeklyMilestones": weekly_milestones,
        "riskFactors": risk_factors,
    }


# 11. Placement Readiness
class PlacementReadinessReq(BaseModel):
    profile: StudentProfilePayload
    targetCompanyType: str = "Product"

@router.post("/placement-readiness")
async def placement_readiness(req: PlacementReadinessReq):
    profile = req.profile
    skills = _extract_skill_names(profile.skills)
    skill_count = len(skills)
    project_count = len(profile.projects or [])
    cgpa = profile.cgpa or 0.0
    dsa_score = profile.dsaScore or 0
    resume_score = profile.resumeScore or 0
    internships = profile.internships or 0
    certs = len(profile.certifications or [])

    # Category scores
    technical_score = min(skill_count * 8, 100)
    academic_score = min(int(cgpa * 12.5), 100) if cgpa else 40
    dsa_s = dsa_score
    project_score = min(project_count * 25, 100)
    communication_score = 70  # Base
    resume_s = resume_score or 50
    internship_score = min(internships * 50, 100)
    certification_score = min(certs * 30, 100)

    cat_scores = {
        "Technical Skills": technical_score,
        "Academic Performance": academic_score,
        "DSA & Algorithms": dsa_s,
        "Projects": project_score,
        "Communication": communication_score,
        "Resume Quality": resume_s,
        "Internship Experience": internship_score,
        "Certifications": certification_score,
    }

    # Company-type weights
    company_weights = {
        "Product": {"Technical Skills": 0.25, "DSA & Algorithms": 0.25, "Projects": 0.20, "Communication": 0.10, "Academic Performance": 0.10, "Resume Quality": 0.10},
        "Service": {"Technical Skills": 0.20, "Academic Performance": 0.25, "Communication": 0.20, "Resume Quality": 0.15, "DSA & Algorithms": 0.10, "Projects": 0.10},
        "Startup": {"Projects": 0.30, "Technical Skills": 0.25, "Communication": 0.20, "DSA & Algorithms": 0.10, "Academic Performance": 0.08, "Resume Quality": 0.07},
        "MAANG": {"DSA & Algorithms": 0.30, "Technical Skills": 0.25, "Projects": 0.20, "Communication": 0.10, "Academic Performance": 0.10, "Resume Quality": 0.05},
    }
    weights = company_weights.get(req.targetCompanyType, company_weights["Product"])
    overall = int(sum(cat_scores.get(cat, 0) * w for cat, w in weights.items()))

    readiness_level = "High" if overall >= 75 else ("Medium" if overall >= 50 else "Low")
    placement_chance = "High (>75%)" if overall >= 75 else ("Moderate (40-75%)" if overall >= 50 else "Low (<40%)")

    critical_gaps = []
    strength_areas = []
    for cat, score in cat_scores.items():
        if score < 40:
            critical_gaps.append(f"{cat} ({score}%)")
        elif score >= 70:
            strength_areas.append(f"{cat} ({score}%)")

    action_plan = []
    if dsa_s < 60:
        action_plan.append({"priority": "HIGH", "action": "Practice DSA on LeetCode daily", "timelineWeeks": 4, "impact": "Critical for product companies"})
    if project_count < 2:
        action_plan.append({"priority": "HIGH", "action": "Build 2 portfolio projects", "timelineWeeks": 6, "impact": "Demonstrates practical skills"})
    if resume_s < 60:
        action_plan.append({"priority": "MEDIUM", "action": "Improve resume with keywords & quantified achievements", "timelineWeeks": 1, "impact": "Better screening pass rate"})
    if not certs:
        action_plan.append({"priority": "MEDIUM", "action": "Complete one relevant certification", "timelineWeeks": 4, "impact": "Adds credibility"})

    company_type_alignment = {}
    for ctype, cweights in company_weights.items():
        company_type_alignment[ctype] = int(sum(cat_scores.get(cat, 0) * w for cat, w in cweights.items()))

    return {
        "overallReadinessScore": overall,
        "readinessLevel": readiness_level,
        "categoryScores": cat_scores,
        "placementChance": placement_chance,
        "criticalGaps": critical_gaps,
        "strengthAreas": strength_areas,
        "actionPlan": action_plan,
        "companyTypeAlignment": company_type_alignment,
        "interviewReadiness": dsa_s,
        "resumeReadiness": resume_s,
        "targetCompanyType": req.targetCompanyType,
    }


# 12. Job Explainability
class JobExplainabilityReq(BaseModel):
    profile: StudentProfilePayload
    job: Dict[str, Any]

@router.post("/job-explainability")
async def job_explainability(req: JobExplainabilityReq):
    profile_skills = _extract_skill_names(req.profile.skills)
    job = req.job
    required_skills = [s.lower() for s in job.get("requiredSkills", [])]
    preferred_skills = [s.lower() for s in job.get("preferredSkills", [])]
    min_cgpa = job.get("minCgpa", 0)
    cgpa = req.profile.cgpa or 0

    matched_required = [s for s in required_skills if s in profile_skills]
    missing_required = [s for s in required_skills if s not in profile_skills]
    matched_preferred = [s for s in preferred_skills if s in profile_skills]

    skill_score = int((len(matched_required) / len(required_skills)) * 100) if required_skills else 50
    cgpa_score = 100 if cgpa >= min_cgpa else int((cgpa / min_cgpa) * 100) if min_cgpa > 0 else 80
    project_score = min(len(req.profile.projects or []) * 25, 100)

    match_score = int(skill_score * 0.5 + cgpa_score * 0.2 + project_score * 0.3)

    matched_factors = []
    for s in matched_required:
        matched_factors.append({"factor": f"Required Skill: {s.title()}", "weight": "High", "studentValue": s.title(), "required": s.title(), "score": 100})
    for s in matched_preferred:
        matched_factors.append({"factor": f"Preferred Skill: {s.title()}", "weight": "Medium", "studentValue": s.title(), "required": s.title(), "score": 80})
    if cgpa >= min_cgpa:
        matched_factors.append({"factor": "CGPA", "weight": "Medium", "studentValue": str(cgpa), "required": str(min_cgpa), "score": 100})

    improvement_steps = []
    for s in missing_required:
        improvement_steps.append(f"Learn {s.title()} — required skill for this role")
    if cgpa < min_cgpa:
        improvement_steps.append(f"CGPA {cgpa} is below requirement of {min_cgpa}")
    if not improvement_steps:
        improvement_steps = ["Keep building projects to strengthen your portfolio"]

    return {
        "matchScore": match_score,
        "explanation": (
            f"You match {len(matched_required)}/{len(required_skills)} required skills and "
            f"{len(matched_preferred)}/{len(preferred_skills)} preferred skills for this role. "
            f"Your overall compatibility score is {match_score}%."
        ),
        "matchedFactors": matched_factors,
        "unmatchedFactors": [f"Missing: {s.title()}" for s in missing_required],
        "improvementToQualify": improvement_steps,
        "strengthsForRole": [s.title() for s in matched_required + matched_preferred],
        "applicationAdvice": (
            "Apply even if your match score is below 100% — companies often hire for potential. "
            "Highlight your matched skills prominently and address skill gaps in your cover letter."
            if match_score >= 50 else
            "Build the missing skills before applying. Focus on the top required skills listed above."
        ),
    }


# 13. What-If Simulator
class WhatIfChange(BaseModel):
    type: str = "skill"
    skill: Optional[str] = None
    level: Optional[str] = None
    value: Optional[Any] = None

class WhatIfReq(BaseModel):
    profile: StudentProfilePayload
    scenario: str = ""
    changes: List[Dict[str, Any]] = []

@router.post("/what-if")
async def what_if(req: WhatIfReq):
    profile_skills = _extract_skill_names(req.profile.skills)
    skill_count = len(profile_skills)
    project_count = len(req.profile.projects or [])
    current_score = min(skill_count * 8 + project_count * 10 + (req.profile.dsaScore or 0) * 0.3, 100)
    current_score = int(current_score)

    impact_breakdown = []
    delta_total = 0

    for change in req.changes:
        change_type = change.get("type", "skill")
        if change_type == "skill":
            skill_name = change.get("skill", "New Skill")
            delta = 8  # adding a skill adds ~8 points
            impact_breakdown.append({
                "change": f"Add skill: {skill_name}",
                "before": current_score,
                "after": min(current_score + delta, 100),
                "delta": delta,
                "explanation": f"Adding {skill_name} increases your technical score and job match percentage",
            })
            delta_total += delta
        elif change_type == "project":
            delta = 10
            impact_breakdown.append({
                "change": "Add a portfolio project",
                "before": current_score,
                "after": min(current_score + delta, 100),
                "delta": delta,
                "explanation": "Projects directly demonstrate practical skills to employers",
            })
            delta_total += delta
        elif change_type == "cgpa":
            new_val = float(change.get("value", 8.0))
            old_cgpa = req.profile.cgpa or 6.5
            cgpa_delta = int((new_val - old_cgpa) * 5)
            impact_breakdown.append({
                "change": f"Improve CGPA to {new_val}",
                "before": current_score,
                "after": min(current_score + cgpa_delta, 100),
                "delta": cgpa_delta,
                "explanation": "CGPA improvement unlocks eligibility for more companies with minimum CGPA requirements",
            })
            delta_total += cgpa_delta
        elif change_type == "certification":
            delta = 7
            impact_breakdown.append({
                "change": f"Earn {change.get('skill', 'a')} certification",
                "before": current_score,
                "after": min(current_score + delta, 100),
                "delta": delta,
                "explanation": "Certifications add credibility and are valued by recruiting teams",
            })
            delta_total += delta
        elif change_type == "internship":
            delta = 15
            impact_breakdown.append({
                "change": "Complete an internship",
                "before": current_score,
                "after": min(current_score + delta, 100),
                "delta": delta,
                "explanation": "Industry experience is one of the highest-valued factors by recruiters",
            })
            delta_total += delta

    # Scenario-based improvements
    scenario_lower = req.scenario.lower()
    if not impact_breakdown:
        if "react" in scenario_lower or "typescript" in scenario_lower:
            delta_total += 14
            impact_breakdown.append({"change": "Learn React + TypeScript", "before": current_score, "after": min(current_score + 14, 100), "delta": 14, "explanation": "High-demand full-stack skills"})
        elif "project" in scenario_lower:
            delta_total += 10
            impact_breakdown.append({"change": "Complete 2 more projects", "before": current_score, "after": min(current_score + 10, 100), "delta": 10, "explanation": "Portfolio depth is critical"})
        elif "internship" in scenario_lower:
            delta_total += 15
            impact_breakdown.append({"change": "Internship experience", "before": current_score, "after": min(current_score + 15, 100), "delta": 15, "explanation": "Real industry experience valued highly"})
        elif "aws" in scenario_lower or "certification" in scenario_lower:
            delta_total += 7
            impact_breakdown.append({"change": "AWS / Cloud Certification", "before": current_score, "after": min(current_score + 7, 100), "delta": 7, "explanation": "Cloud skills are highly sought after"})
        elif "cgpa" in scenario_lower:
            delta_total += 8
            impact_breakdown.append({"change": "Improve CGPA to 8.0", "before": current_score, "after": min(current_score + 8, 100), "delta": 8, "explanation": "Higher CGPA unlocks more company eligibility"})

    projected = min(current_score + delta_total, 100)
    feasibility = 90 if delta_total <= 15 else (75 if delta_total <= 30 else 55)
    estimated_weeks = max(2, len(req.changes) * 3 + 2)

    return {
        "currentScore": current_score,
        "projectedScore": projected,
        "scoreDelta": delta_total,
        "impactBreakdown": impact_breakdown,
        "recommendation": (
            "These changes are highly recommended and achievable. Start with the highest-impact items first."
            if delta_total > 0 else
            "Add specific changes to simulate their impact on your profile score."
        ),
        "feasibilityScore": feasibility,
        "estimatedTimeWeeks": estimated_weeks,
    }


# 14. Skill Forecast (GET — no auth data needed)
@router.get("/skill-forecast")
async def skill_forecast():
    return SKILL_MARKET_DATA


# 15. Weekly Plan
class WeeklyPlanReq(BaseModel):
    profile: StudentProfilePayload
    targetRole: str = "Software Engineer"
    hoursPerDay: int = 2
    focusAreas: List[str] = []

@router.post("/weekly-plan")
async def weekly_plan(req: WeeklyPlanReq):
    focus = req.focusAreas or ["DSA", "Core Skills"]
    hours = max(1, req.hoursPerDay)
    role_skills = ROLE_SKILL_MAP.get(req.targetRole, ["Python", "SQL", "Git"])

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    focus_rotation = focus * ((len(days) // len(focus)) + 1)

    daily_plan = []
    for i, day in enumerate(days):
        area = focus_rotation[i]
        if day == "Sunday":
            tasks = [{"time": "Morning", "activity": "Review", "topic": "Weekly revision", "resources": ["Notes review", "Past mistakes"]}]
        elif day == "Saturday":
            tasks = [{"time": "All day", "activity": "Project / Coding", "topic": "Apply this week's learning", "resources": ["GitHub", "Build something real"]}]
        else:
            tasks = [
                {"time": "Evening", "activity": "Learning", "topic": area, "resources": LEARNING_RESOURCES.get(area, DEFAULT_RESOURCES[:1])[0]["url"] if LEARNING_RESOURCES.get(area) else "GeeksForGeeks"},
                {"time": "Night", "activity": "Practice", "topic": f"{area} problems", "resources": ["LeetCode", "HackerRank"]},
            ]

        daily_plan.append({
            "day": day,
            "tasks": tasks,
            "focusArea": area,
            "totalHours": hours,
        })

    milestones = [
        f"Complete 1 tutorial on {focus[0] if focus else 'DSA'}",
        "Solve 5 practice problems",
        "Build or update a portfolio project",
        f"Review core {req.targetRole} concepts",
    ]

    return {
        "weekNumber": 1,
        "hoursPerDay": hours,
        "weeklyGoal": f"Make measurable progress toward {req.targetRole} readiness",
        "dailyPlan": daily_plan,
        "weeklyMilestones": milestones,
        "successMetrics": [
            "Complete all planned tasks (aim for 80%+)",
            f"Solve at least 7 coding problems this week",
            "Commit code to GitHub at least 3 times",
            "Track time spent vs planned",
        ],
        "targetRole": req.targetRole,
        "focusAreas": focus,
    }


# 16. Student 360
class Student360Req(BaseModel):
    profile: StudentProfilePayload
    performance: Dict[str, Any] = {}

@router.post("/student-360")
async def student_360(req: Student360Req):
    profile = req.profile
    perf = req.performance
    skills = _extract_skill_names(profile.skills)
    skill_count = len(skills)
    project_count = len(profile.projects or [])
    cgpa = profile.cgpa or 0.0
    dsa_score = profile.dsaScore or 0
    resume_score = profile.resumeScore or 0
    internships = profile.internships or 0
    certs = len(profile.certifications or [])
    assessment_avg = profile.assessmentAvgScore or perf.get("avgScore", 0)

    # Calculate dimension scores
    tech_score = min(skill_count * 8, 100)
    academic_score = min(int(cgpa * 12.5), 100) if cgpa else 40
    project_score = min(project_count * 25, 100)
    exp_score = min(internships * 50, 100)
    soft_score = 65  # base
    dsa_s = dsa_score
    comm_score = 70
    leadership_score = min((len(profile.achievements or [])) * 15 + internships * 20, 100)
    problem_solving = min(int(dsa_score * 0.6 + tech_score * 0.4), 100)
    career_clarity_score = 80 if profile.careerGoals else 40

    dimensions = {
        "Technical Skills": {"score": tech_score, "level": _readiness_level(tech_score), "details": f"{skill_count} skills in profile", "recommendations": [] if tech_score >= 70 else ["Add more technical skills", "Get certified in core technologies"]},
        "Academic Performance": {"score": academic_score, "level": _readiness_level(academic_score), "details": f"CGPA: {cgpa}", "recommendations": [] if academic_score >= 70 else ["Focus on improving CGPA", "Seek academic support"]},
        "Projects": {"score": project_score, "level": _readiness_level(project_score), "details": f"{project_count} projects", "recommendations": ["Build more projects"] if project_score < 70 else []},
        "Industry Experience": {"score": exp_score, "level": _readiness_level(exp_score), "details": f"{internships} internships", "recommendations": ["Apply for internships"] if exp_score < 50 else []},
        "Soft Skills": {"score": soft_score, "level": _readiness_level(soft_score), "details": "Based on profile completeness and experience", "recommendations": ["Join student clubs", "Participate in hackathons"]},
        "DSA & Algorithms": {"score": dsa_s, "level": _readiness_level(dsa_s), "details": f"DSA Score: {dsa_s}%", "recommendations": ["Practice LeetCode daily"] if dsa_s < 60 else []},
        "Communication": {"score": comm_score, "level": _readiness_level(comm_score), "details": "Estimated from profile activity", "recommendations": ["Practice mock interviews", "Write technical blogs"]},
        "Leadership": {"score": leadership_score, "level": _readiness_level(leadership_score), "details": f"{len(profile.achievements or [])} achievements, {internships} internships", "recommendations": ["Lead a project team", "Volunteer at events"]},
        "Problem Solving": {"score": problem_solving, "level": _readiness_level(problem_solving), "details": "Derived from DSA + Technical scores", "recommendations": ["Practice competitive programming"] if problem_solving < 60 else []},
        "Career Clarity": {"score": career_clarity_score, "level": _readiness_level(career_clarity_score), "details": "Based on goals and targeted role", "recommendations": ["Define your target role and company type"] if career_clarity_score < 70 else []},
    }

    all_scores = [v["score"] for v in dimensions.values()]
    overall = int(sum(all_scores) / len(all_scores))
    career_readiness = int((tech_score + dsa_s + project_score) / 3)
    placement_readiness = int((tech_score * 0.3 + academic_score * 0.2 + project_score * 0.25 + exp_score * 0.15 + resume_score * 0.1))

    top_strengths = [k for k, v in dimensions.items() if v["score"] >= 70]
    critical_gaps = [f"{k} ({v['score']}%)" for k, v in dimensions.items() if v["score"] < 40]

    badges = [
        {"name": "Skill Collector", "earned": skill_count >= 5, "criteria": "Add 5+ skills to your profile"},
        {"name": "Project Builder", "earned": project_count >= 2, "criteria": "Complete 2+ portfolio projects"},
        {"name": "DSA Warrior", "earned": dsa_s >= 70, "criteria": "Achieve 70%+ DSA score"},
        {"name": "Internship Ready", "earned": internships >= 1, "criteria": "Complete at least 1 internship"},
        {"name": "Certified Pro", "earned": certs >= 1, "criteria": "Earn at least 1 certification"},
        {"name": "Academic Excellence", "earned": cgpa >= 8.5, "criteria": "Maintain CGPA 8.5+"},
        {"name": "Full Profile", "earned": skill_count >= 5 and project_count >= 2, "criteria": "Complete your profile with skills and projects"},
    ]

    return {
        "overallScore": overall,
        "dimensions": dimensions,
        "topStrengths": top_strengths,
        "criticalGaps": critical_gaps,
        "careerReadiness": career_readiness,
        "placementReadiness": placement_readiness,
        "summary": (
            f"You have a {_readiness_level(overall).lower()} overall profile with {skill_count} skills and {project_count} projects. "
            f"Your strongest areas are {', '.join(top_strengths[:2]) if top_strengths else 'still developing'}. "
            f"Focus on {'improving ' + critical_gaps[0].split(' ')[0] if critical_gaps else 'maintaining your momentum and expanding your portfolio'}."
        ),
        "badges": badges,
    }


# 17. Action Center
class ActionCenterReq(BaseModel):
    profile: StudentProfilePayload
    performance: Dict[str, Any] = {}

@router.post("/action-center")
async def action_center(req: ActionCenterReq):
    profile = req.profile
    perf = req.performance
    skills = _extract_skill_names(profile.skills)
    skill_count = len(skills)
    project_count = len(profile.projects or [])
    dsa_score = profile.dsaScore or 0
    resume_score = profile.resumeScore or 0
    cgpa = profile.cgpa or 0
    internships = profile.internships or 0
    certs = len(profile.certifications or [])

    actions = []
    action_id = 1

    # HIGH priority actions
    if dsa_score < 40:
        actions.append({
            "id": f"act-{action_id}", "priority": "HIGH", "category": "DSA",
            "title": "Start DSA Practice Immediately",
            "description": f"Your DSA score is {dsa_score}% — below the threshold needed for most tech companies.",
            "impact": "Critical for product company placements",
            "estimatedTime": "4–8 weeks",
            "dueIn": "Start today",
            "steps": ["Sign up on LeetCode", "Complete 'Blind 75' problems", "Solve 2 problems daily", "Review time complexity for each solution"],
            "relatedFeature": "/ai/dsa-coach",
        })
        action_id += 1

    if project_count == 0:
        actions.append({
            "id": f"act-{action_id}", "priority": "HIGH", "category": "PROJECTS",
            "title": "Build Your First Portfolio Project",
            "description": "You have no projects on your profile. Projects are the #1 differentiator for freshers.",
            "impact": "Critical — recruiters expect at least 2 projects",
            "estimatedTime": "2–4 weeks",
            "dueIn": "This week",
            "steps": ["Pick a project idea from Project Advisor", "Set up GitHub repository", "Build incrementally with daily commits", "Deploy and add to your resume"],
            "relatedFeature": "/ai/project-advisor",
        })
        action_id += 1

    if skill_count < 3:
        actions.append({
            "id": f"act-{action_id}", "priority": "HIGH", "category": "SKILLS",
            "title": "Add Core Technical Skills",
            "description": f"Only {skill_count} skills on your profile. Add at least 5–8 core skills.",
            "impact": "High — improves job match score significantly",
            "estimatedTime": "Ongoing",
            "dueIn": "Today",
            "steps": ["Go to Profile settings", "Add your known programming languages", "Add frameworks you've used", "Add tools (Git, Docker, etc.)"],
            "relatedFeature": "/ai/skill-coach",
        })
        action_id += 1

    # MEDIUM priority actions
    if resume_score < 50:
        actions.append({
            "id": f"act-{action_id}", "priority": "MEDIUM", "category": "RESUME",
            "title": "Improve Your Resume",
            "description": f"Resume score is {resume_score}%. Optimize it for ATS and recruiters.",
            "impact": "Directly affects recruiter screening pass rate",
            "estimatedTime": "1–2 days",
            "dueIn": "This week",
            "steps": ["Run Resume Analyzer", "Add missing keywords", "Quantify achievements", "Get peer review"],
            "relatedFeature": "/ai/resume-optimizer",
        })
        action_id += 1

    if internships == 0 and skill_count > 3:
        actions.append({
            "id": f"act-{action_id}", "priority": "MEDIUM", "category": "INTERNSHIP",
            "title": "Apply for an Internship",
            "description": "You have skills but no internship experience. Industry exposure is highly valued.",
            "impact": "Significant boost to placement readiness",
            "estimatedTime": "1–3 months",
            "dueIn": "This month",
            "steps": ["Update LinkedIn profile", "Apply on Internshala, LinkedIn, Glassdoor", "Target 5 applications per week", "Prepare for technical interviews"],
            "relatedFeature": "/ai/interview-coach",
        })
        action_id += 1

    if dsa_score >= 40 and dsa_score < 70:
        actions.append({
            "id": f"act-{action_id}", "priority": "MEDIUM", "category": "DSA",
            "title": "Improve DSA Score to 70%+",
            "description": f"Good start! Improve from {dsa_score}% to 70%+ for product company eligibility.",
            "impact": "Opens doors to product companies",
            "estimatedTime": "4 weeks",
            "dueIn": "Within 4 weeks",
            "steps": ["Focus on Trees and Graphs (most asked)", "Study Dynamic Programming basics", "Practice Sliding Window patterns", "Timed problem-solving sessions"],
            "relatedFeature": "/ai/dsa-coach",
        })
        action_id += 1

    if not certs:
        actions.append({
            "id": f"act-{action_id}", "priority": "MEDIUM", "category": "CERTIFICATION",
            "title": "Earn a Relevant Certification",
            "description": "No certifications found. Certifications validate your skills to employers.",
            "impact": "Adds credibility to your profile",
            "estimatedTime": "2–6 weeks",
            "dueIn": "Next month",
            "steps": ["Choose: AWS, Google Cloud, Meta React, or Microsoft Azure", "Use free study materials (official docs + YouTube)", "Schedule and take the exam", "Add certificate to LinkedIn and Resume"],
            "relatedFeature": "/ai/learning-materials",
        })
        action_id += 1

    # LOW priority actions
    actions.append({
        "id": f"act-{action_id}", "priority": "LOW", "category": "INTERVIEW",
        "title": "Practice Mock Interviews",
        "description": "Regular mock interview practice builds confidence and reduces anxiety.",
        "impact": "Improves interview performance",
        "estimatedTime": "Ongoing",
        "dueIn": "Weekly",
        "steps": ["Use AI Mock Interview feature", "Record your answers", "Review feedback", "Improve weak areas"],
        "relatedFeature": "/ai/mock-interview",
    })
    action_id += 1

    if cgpa > 0 and cgpa < 7.5:
        actions.append({
            "id": f"act-{action_id}", "priority": "LOW", "category": "ACADEMIC",
            "title": "Improve CGPA for Better Eligibility",
            "description": f"CGPA {cgpa} — some companies require 7.5+. Focus on current semester.",
            "impact": "Unlocks more company eligibility",
            "estimatedTime": "This semester",
            "dueIn": "Ongoing",
            "steps": ["Attend all classes", "Form study groups", "Practice previous year papers", "Seek professor office hours"],
            "relatedFeature": "/ai/career-readiness",
        })
        action_id += 1

    urgent_count = len([a for a in actions if a["priority"] == "HIGH"])

    return {
        "totalActions": len(actions),
        "urgentCount": urgent_count,
        "actions": actions,
    }
