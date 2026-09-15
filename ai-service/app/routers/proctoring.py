"""
AI Proctoring and Anti-Cheating Analysis Router — Phase 10
Analyzes aggregated student telemetry during assessments.
Returns explainable integrity scores, risk levels, and audit summaries.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/proctoring", tags=["AI Proctoring"])

class ProctoringAnalysisRequest(BaseModel):
    attemptDurationSeconds: int = 0
    totalQuestions: int = 5
    tabSwitches: int = 0
    fullscreenExits: int = 0
    cameraInterruptions: int = 0
    faceViolations: int = 0
    multipleFaceViolations: int = 0
    audioViolations: int = 0
    copyAttempts: int = 0
    reloadAttempts: int = 0
    events: List[Dict[str, Any]] = []

@router.post("/analyze")
def analyze_proctoring_session(req: ProctoringAnalysisRequest):
    # Configurable risk weights
    tab_pts = req.tabSwitches * 10
    fs_pts = req.fullscreenExits * 8
    cam_pts = req.cameraInterruptions * 20
    face_pts = req.faceViolations * 5
    multi_face_pts = req.multipleFaceViolations * 25
    audio_pts = req.audioViolations * 10
    copy_pts = req.copyAttempts * 10
    reload_pts = req.reloadAttempts * 15

    # Multiplier for repeated violations
    repeat_penalty = 0
    if req.tabSwitches >= 3:
        repeat_penalty += 15
    if req.fullscreenExits >= 3:
        repeat_penalty += 12
    if req.faceViolations >= 5:
        repeat_penalty += 15
    if req.multipleFaceViolations >= 2:
        repeat_penalty += 25

    total_risk = tab_pts + fs_pts + cam_pts + face_pts + multi_face_pts + audio_pts + copy_pts + reload_pts + repeat_penalty
    risk_score = min(100, max(0, total_risk))
    integrity_score = max(0, 100 - risk_score)

    anomalies = []
    if req.tabSwitches > 0:
        anomalies.append(f"{req.tabSwitches} browser tab switch(es) detected")
    if req.fullscreenExits > 0:
        anomalies.append(f"{req.fullscreenExits} fullscreen exit(s) recorded")
    if req.multipleFaceViolations > 0:
        anomalies.append(f"{req.multipleFaceViolations} instance(s) of multiple faces detected in frame")
    if req.cameraInterruptions > 0:
        anomalies.append(f"{req.cameraInterruptions} camera stream interruption(s)")
    if req.audioViolations > 0:
        anomalies.append(f"{req.audioViolations} suspicious audio/voice spike(s) identified")
    if req.faceViolations > 0:
        anomalies.append(f"{req.faceViolations} head movement / absence warning(s)")
    if req.copyAttempts > 0:
        anomalies.append(f"{req.copyAttempts} clipboard / copy-paste attempt(s)")
    if req.reloadAttempts > 0:
        anomalies.append(f"{req.reloadAttempts} page reload attempt(s)")

    if risk_score < 20:
        risk_level = "LOW"
        status = "VERIFIED"
        explanation = "High integrity session. No significant anomalies or suspicious patterns detected."
        recommendation = "Accept score as verified without further manual review."
    elif risk_score < 50:
        risk_level = "MEDIUM"
        status = "VERIFIED"
        explanation = "Minor proctoring events recorded, consistent with normal examination environments."
        recommendation = "Accept score with logged telemetry audit record."
    elif risk_score < 80:
        risk_level = "HIGH"
        status = "REVIEW_REQUIRED"
        explanation = "Multiple or severe proctoring violations detected during the attempt, warranting manual institutional review."
        recommendation = "Flag for human instructor review before granting capability verification."
    else:
        risk_level = "CRITICAL"
        status = "INVALIDATED_PENDING_REVIEW"
        explanation = "Excessive violations recorded (repeated tab switches, multiple faces, or camera disconnects). Proctoring threshold exceeded."
        recommendation = "Invalidate attempt or mandate proctored retake pending audit review."

    return {
        "success": True,
        "riskScore": risk_score,
        "integrityScore": integrity_score,
        "riskLevel": risk_level,
        "status": status,
        "explanation": explanation,
        "recommendation": recommendation,
        "anomaliesDetected": anomalies,
        "breakdown": {
            "tabSwitchPoints": tab_pts,
            "fullscreenExitPoints": fs_pts,
            "cameraPoints": cam_pts,
            "facePoints": face_pts,
            "multipleFacePoints": multi_face_pts,
            "audioPoints": audio_pts,
            "copyPoints": copy_pts,
            "reloadPoints": reload_pts,
            "repeatPenaltyPoints": repeat_penalty
        }
    }
