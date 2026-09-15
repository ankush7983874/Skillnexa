import { Response } from 'express';
import axios from 'axios';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Assessment } from '../models/Assessment';
import { Question } from '../models/Question';
import { Student } from '../models/Student';
import { AssessmentResult } from '../models/AssessmentResult';
import { ProctoredAssessmentAttempt } from '../models/ProctoredAssessmentAttempt';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Configurable risk points
const RISK_WEIGHTS: Record<string, number> = {
  TAB_SWITCH: 10,
  WINDOW_BLUR: 5,
  FULLSCREEN_EXIT: 8,
  CAMERA_DISABLED: 20,
  CAMERA_DISCONNECTED: 20,
  NO_FACE: 5,
  FACE_NOT_VISIBLE: 5,
  MULTIPLE_FACES: 25,
  LOOKING_AWAY: 5,
  SUSPICIOUS_MOVEMENT: 5,
  AUDIO_ACTIVITY: 10,
  SUSPICIOUS_AUDIO: 10,
  COPY_ATTEMPT: 10,
  PASTE_ATTEMPT: 10,
  CONTEXT_MENU_ATTEMPT: 5,
  ASSESSMENT_RELOAD: 15,
};

export const startProctoredAttempt = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { assessmentId } = req.body;

  if (!assessmentId) {
    throw ApiError.badRequest('Assessment ID is required');
  }

  const student = await Student.findOne({ user: userId });
  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment || !assessment.isActive) {
    throw ApiError.notFound('Assessment not found or inactive');
  }

  // Check if there is an in-progress attempt to resume
  let attempt = await ProctoredAssessmentAttempt.findOne({
    student: student._id,
    assessment: assessment._id,
    status: 'IN_PROGRESS',
  });

  const questions = await Question.find({ assessment: assessmentId }).select('-correctOptionIndex');

  if (attempt) {
    // Record reload event if resuming existing attempt
    attempt.reloadAttempts += 1;
    attempt.proctoringEvents.push({
      type: 'ASSESSMENT_RELOAD',
      severity: 'MEDIUM',
      timestamp: new Date(),
      riskPoints: 15,
      description: 'Assessment session reloaded / refreshed by student',
    });
    attempt.riskScore = Math.min(100, (attempt.riskScore || 0) + 15);
    await attempt.save();

    return res.status(200).json(
      ApiResponse.success('Resumed active proctored assessment attempt', {
        attemptId: attempt._id,
        assessment,
        questions,
        currentQuestion: attempt.currentQuestion,
        answers: attempt.questionStates.reduce((acc, q) => {
          if (q.selectedOptionIndex !== undefined) {
            acc[q.questionId.toString()] = q.selectedOptionIndex;
          }
          return acc;
        }, {} as Record<string, number>),
        tabSwitchCount: attempt.tabSwitchCount,
        fullscreenExitCount: attempt.fullscreenExitCount,
        riskScore: attempt.riskScore || 0,
        timePerQuestion: 60,
        minTimePerQuestion: 10,
      })
    );
  }

  // Create new attempt
  attempt = await ProctoredAssessmentAttempt.create({
    student: student._id,
    user: userId,
    assessment: assessment._id,
    assessmentTitle: assessment.title,
    skillName: assessment.skillName,
    startedAt: new Date(),
    currentQuestion: 0,
    questionStates: [],
    status: 'IN_PROGRESS',
    tabSwitchCount: 0,
    fullscreenExitCount: 0,
    cameraInterruptions: 0,
    faceViolations: 0,
    multipleFaceViolations: 0,
    audioViolations: 0,
    copyAttempts: 0,
    reloadAttempts: 0,
    proctoringEvents: [],
  });

  return res.status(201).json(
    ApiResponse.success('Proctored assessment attempt started', {
      attemptId: attempt._id,
      assessment,
      questions,
      currentQuestion: 0,
      answers: {},
      tabSwitchCount: 0,
      fullscreenExitCount: 0,
      riskScore: 0,
      timePerQuestion: 60,
      minTimePerQuestion: 10,
    })
  );
};

export const recordProctoringEvent = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { attemptId, type, severity = 'LOW', description = '', metadata = {} } = req.body;

  if (!attemptId || !type) {
    throw ApiError.badRequest('Attempt ID and event type are required');
  }

  const attempt = await ProctoredAssessmentAttempt.findOne({
    _id: attemptId,
    user: userId,
  });

  if (!attempt) {
    throw ApiError.notFound('Assessment attempt not found or unauthorized');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    throw ApiError.badRequest('Assessment attempt is already submitted');
  }

  const riskPoints = RISK_WEIGHTS[type] || 5;

  // Track counters
  if (type === 'TAB_SWITCH') attempt.tabSwitchCount += 1;
  else if (type === 'FULLSCREEN_EXIT') attempt.fullscreenExitCount += 1;
  else if (type.startsWith('CAMERA')) attempt.cameraInterruptions += 1;
  else if (type === 'NO_FACE' || type === 'FACE_NOT_VISIBLE' || type === 'LOOKING_AWAY') attempt.faceViolations += 1;
  else if (type === 'MULTIPLE_FACES') attempt.multipleFaceViolations += 1;
  else if (type.includes('AUDIO')) attempt.audioViolations += 1;
  else if (type.includes('COPY') || type.includes('PASTE') || type.includes('CONTEXT_MENU')) attempt.copyAttempts += 1;
  else if (type === 'ASSESSMENT_RELOAD') attempt.reloadAttempts += 1;

  attempt.proctoringEvents.push({
    type,
    severity,
    timestamp: new Date(),
    riskPoints,
    description: description || `Anomaly recorded: ${type}`,
    metadata,
  });

  attempt.riskScore = Math.min(100, (attempt.riskScore || 0) + riskPoints);
  await attempt.save();

  return res.status(200).json(
    ApiResponse.success('Proctoring event logged', {
      eventCount: attempt.proctoringEvents.length,
      currentRiskScore: attempt.riskScore,
      tabSwitchCount: attempt.tabSwitchCount,
      fullscreenExitCount: attempt.fullscreenExitCount,
    })
  );
};

export const saveProctoredAnswer = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { attemptId, questionId, selectedOptionIndex, timeSpentSeconds = 0, nextQuestionIndex } = req.body;

  if (!attemptId || !questionId) {
    throw ApiError.badRequest('Attempt ID and Question ID are required');
  }

  const attempt = await ProctoredAssessmentAttempt.findOne({
    _id: attemptId,
    user: userId,
  });

  if (!attempt) {
    throw ApiError.notFound('Assessment attempt not found or unauthorized');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    throw ApiError.badRequest('Assessment attempt is already submitted');
  }

  const stateIndex = attempt.questionStates.findIndex(
    (q) => q.questionId.toString() === questionId.toString()
  );

  if (stateIndex >= 0) {
    attempt.questionStates[stateIndex].selectedOptionIndex = selectedOptionIndex;
    attempt.questionStates[stateIndex].answeredAt = new Date();
    attempt.questionStates[stateIndex].timeSpentSeconds = timeSpentSeconds;
  } else {
    attempt.questionStates.push({
      questionId,
      selectedOptionIndex,
      answeredAt: new Date(),
      timeSpentSeconds,
    });
  }

  if (nextQuestionIndex !== undefined) {
    attempt.currentQuestion = nextQuestionIndex;
  }

  await attempt.save();

  return res.status(200).json(
    ApiResponse.success('Answer saved securely', {
      currentQuestion: attempt.currentQuestion,
      savedQuestionsCount: attempt.questionStates.length,
    })
  );
};

export const submitProctoredAttempt = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { attemptId, answers } = req.body;

  if (!attemptId) {
    throw ApiError.badRequest('Attempt ID is required');
  }

  const attempt = await ProctoredAssessmentAttempt.findOne({
    _id: attemptId,
    user: userId,
  });

  if (!attempt) {
    throw ApiError.notFound('Assessment attempt not found or unauthorized');
  }

  // If already submitted, return report
  if (attempt.status !== 'IN_PROGRESS') {
    return res.status(200).json(
      ApiResponse.success('Assessment already submitted', {
        attempt,
      })
    );
  }

  // Merge client-submitted answers if provided
  if (Array.isArray(answers)) {
    for (const ans of answers) {
      const idx = attempt.questionStates.findIndex(
        (q) => q.questionId.toString() === ans.questionId.toString()
      );
      if (idx >= 0) {
        attempt.questionStates[idx].selectedOptionIndex = ans.selectedOptionIndex;
      } else {
        attempt.questionStates.push({
          questionId: ans.questionId,
          selectedOptionIndex: ans.selectedOptionIndex,
          answeredAt: new Date(),
        });
      }
    }
  }

  // Evaluate answers against Question documents
  const assessment = await Assessment.findById(attempt.assessment);
  if (!assessment) throw ApiError.notFound('Assessment not found');

  const questions = await Question.find({ assessment: attempt.assessment }).select('+correctOptionIndex');

  let correctCount = 0;
  const detailedFeedback = questions.map((q) => {
    const studentAnswerState = attempt.questionStates.find(
      (qs) => qs.questionId.toString() === q._id.toString()
    );
    const selected = studentAnswerState ? studentAnswerState.selectedOptionIndex : -1;
    const isCorrect = selected === q.correctOptionIndex;
    if (isCorrect) correctCount++;

    return {
      questionId: q._id,
      questionText: q.questionText,
      options: q.options,
      selectedOptionIndex: selected,
      correctOptionIndex: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation || 'Review question principles.',
    };
  });

  const totalQuestions = questions.length || 1;
  const skillScore = Math.round((correctCount / totalQuestions) * 100);
  const passed = skillScore >= assessment.passingScore;

  // Call AI Proctoring Microservice
  let aiProctoringResult: any;
  try {
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/proctoring/analyze`,
      {
        attemptDurationSeconds: Math.round((Date.now() - attempt.startedAt.getTime()) / 1000),
        totalQuestions,
        tabSwitches: attempt.tabSwitchCount,
        fullscreenExits: attempt.fullscreenExitCount,
        cameraInterruptions: attempt.cameraInterruptions,
        faceViolations: attempt.faceViolations,
        multipleFaceViolations: attempt.multipleFaceViolations,
        audioViolations: attempt.audioViolations,
        copyAttempts: attempt.copyAttempts,
        reloadAttempts: attempt.reloadAttempts,
        events: attempt.proctoringEvents,
      },
      { timeout: 10000 }
    );
    aiProctoringResult = aiResponse.data;
  } catch (err) {
    // Fallback deterministic evaluation if AI service times out
    const calculatedRisk = Math.min(100, attempt.riskScore || 0);
    aiProctoringResult = {
      riskScore: calculatedRisk,
      integrityScore: Math.max(0, 100 - calculatedRisk),
      riskLevel: calculatedRisk < 20 ? 'LOW' : calculatedRisk < 50 ? 'MEDIUM' : calculatedRisk < 80 ? 'HIGH' : 'CRITICAL',
      status: calculatedRisk < 50 ? 'VERIFIED' : calculatedRisk < 80 ? 'REVIEW_REQUIRED' : 'INVALIDATED_PENDING_REVIEW',
      explanation: 'Evaluated via deterministic rule-engine.',
      recommendation: calculatedRisk < 50 ? 'Accept score as verified' : 'Requires instructor review',
      anomaliesDetected: [],
    };
  }

  // Update Attempt Record
  attempt.submittedAt = new Date();
  attempt.skillScore = skillScore;
  attempt.integrityScore = aiProctoringResult.integrityScore;
  attempt.riskScore = aiProctoringResult.riskScore;
  attempt.riskLevel = aiProctoringResult.riskLevel;
  attempt.status = aiProctoringResult.status;
  attempt.explanation = aiProctoringResult.explanation;
  attempt.recommendation = aiProctoringResult.recommendation;
  attempt.anomaliesDetected = aiProctoringResult.anomaliesDetected;
  await attempt.save();

  // Update Student Capability Profile (Requirement 17: Trustworthy skill score)
  const student = await Student.findOne({ user: userId });
  if (student) {
    const isIntegrityVerified = attempt.status === 'VERIFIED';
    const skillIndex = student.skills.findIndex(
      (s) => s.name.toLowerCase() === assessment.skillName.toLowerCase()
    );

    if (skillIndex >= 0) {
      student.skills[skillIndex].score = Math.max(student.skills[skillIndex].score, skillScore);
      if (passed && isIntegrityVerified) {
        student.skills[skillIndex].verified = true;
      }
    } else {
      student.skills.push({
        name: assessment.skillName,
        category: assessment.category,
        score: skillScore,
        verified: passed && isIntegrityVerified,
      });
    }

    student.profileCompletionPercentage = student.calculateCompletionPercentage();
    await student.save();
  }

  // Also create AssessmentResult record for compatibility
  await AssessmentResult.create({
    student: attempt.student,
    user: userId,
    assessment: assessment._id,
    assessmentTitle: assessment.title,
    skillName: assessment.skillName,
    category: assessment.category,
    difficulty: assessment.difficulty,
    score: correctCount,
    totalMarks: totalQuestions,
    percentage: skillScore,
    passed,
    attemptDate: new Date(),
    proctoring: {
      riskScore: attempt.riskScore,
      tabSwitches: attempt.tabSwitchCount,
      fullscreenExits: attempt.fullscreenExitCount,
      events: attempt.proctoringEvents,
    },
  });

  return res.status(200).json(
    ApiResponse.success('Proctored assessment evaluated successfully', {
      attemptId: attempt._id,
      assessmentTitle: assessment.title,
      skillName: assessment.skillName,
      skillScore,
      totalMarks: totalQuestions,
      correctCount,
      passed,
      integrityScore: attempt.integrityScore,
      riskScore: attempt.riskScore,
      riskLevel: attempt.riskLevel,
      status: attempt.status,
      explanation: attempt.explanation,
      recommendation: attempt.recommendation,
      anomaliesDetected: attempt.anomaliesDetected,
      tabSwitchCount: attempt.tabSwitchCount,
      fullscreenExitCount: attempt.fullscreenExitCount,
      proctoringEvents: attempt.proctoringEvents,
      detailedFeedback,
    })
  );
};

export const getProctoredAttempt = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { attemptId } = req.params;

  const attempt = await ProctoredAssessmentAttempt.findOne({
    _id: attemptId,
    user: userId,
  });

  if (!attempt) {
    throw ApiError.notFound('Assessment attempt not found or unauthorized');
  }

  return res.status(200).json(ApiResponse.success('Attempt details retrieved', attempt));
};

export const getProctoredReport = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const { attemptId } = req.params;

  const query: any = { _id: attemptId };
  if (userRole === 'STUDENT') {
    query.user = userId;
  }

  const attempt = await ProctoredAssessmentAttempt.findOne(query)
    .populate('assessment', 'title difficulty passingScore totalQuestions description')
    .populate('student', 'name email college branch rollNumber');

  if (!attempt) {
    throw ApiError.notFound('Proctoring report not found or unauthorized');
  }

  return res.status(200).json(ApiResponse.success('Proctoring report retrieved', attempt));
};
