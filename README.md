# SkillNexa — AI-Powered Academia–Industry Collaboration Platform

> **SIH Problem Statement**: Portal for Academia–Industry Collaboration for Skill Mapping, Internships, and Placement.
> **Core USP**: *"Don't just find a job. Become ready for the right job."*

SkillNexa connects **Students**, **Industry**, **Institutions**, **Faculty**, and **Admins** through explainable AI capability mapping, skill-gap analysis, personalized learning roadmaps, real-time candidate matching, and automated recruitment workflows.

---

## 🏗️ Monorepo Architecture

```
SkillNexa/
├── backend/          # Node.js + Express + TypeScript + MongoDB (Mongoose) + Zod
├── frontend/         # React + TypeScript + Vite + Tailwind CSS
├── ai-service/       # Python + FastAPI + Scikit-learn + Pydantic
└── docs/             # Documentation & System Specifications
```

---

## 🚀 Quick Start (Phase 1)

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB (running locally on port 27017 or a MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend API server runs on: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

### 3. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
AI FastAPI server runs on: `http://localhost:8000`  
Health check endpoint: `http://localhost:8000/health`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Application runs on: `http://localhost:3000`

---

## 👥 Primary User Roles

- 🎓 **Student**: Skill capability profiles, real skill gap analysis, personalized roadmaps, assessments, job/internship recommendations, digital portfolio.
- 🏢 **Company**: Verification workflow, job & internship management, explainable candidate AI matching, shortlist, scheduling, final selection.
- 👨‍🏫 **Faculty**: Industry training, faculty internships, research collaboration, student mentorship.
- 🏛️ **Institution**: Skill analytics, placement intelligence, skill gaps, company participation.
- ⚙️ **Admin**: Verification management, user RBAC, audit logging, system settings.
# Skillnexa
