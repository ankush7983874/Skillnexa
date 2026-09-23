import { Response } from 'express';
import axios from 'axios';
import { AIInterviewSession } from '../models/AIInterviewSession';
import { Student } from '../models/Student';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { nativeAIEngine } from '../services/aiEngine';

const getAiServiceUrl = () => {
  if (process.env.AI_SERVICE_URL) return process.env.AI_SERVICE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/ai`;
  return 'http://localhost:8000';
};
const AI_SERVICE_URL = getAiServiceUrl();

async function getStudentProfile(userId: string) {
  const student = await Student.findOne({ user: userId });
  if (!student) throw ApiError.notFound('Student profile not found');
  return {
    student,
    profilePayload: {
      skills: student.skills || [],
      projects: student.projects || [],
      cgpa: student.cgpa || 0,
      branch: student.branch || '',
      resumeUploaded: Boolean(student.resumeUrl),
    },
  };
}

// 1. Start Interview Session
export const startMockInterviewSession = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  const { student, profilePayload } = await getStudentProfile(userId.toString());
  const {
    role = 'Software Engineer',
    skill = 'Java',
    difficulty = 'Medium',
    questionCount = 10,
    interviewType = 'Technical',
  } = req.body;

  let aiResp;
  if (process.env.AI_SERVICE_URL && !process.env.VERCEL && process.env.AI_SERVICE_URL !== 'http://localhost:8000') {
    try {
      const aiServiceRes = await axios.post(`${AI_SERVICE_URL}/interview/v2/start`, {
        role,
        skill,
        difficulty,
        questionCount: Number(questionCount),
        interviewType,
        studentProfile: profilePayload,
      }, { timeout: 800 });
      aiResp = aiServiceRes.data;
    } catch (err: any) {
      console.warn('[AI_INTERVIEW_FALLBACK] Using native interview engine.');
    }
  }

  if (!aiResp) {
    const sessionData = nativeAIEngine.startInterviewSession({ role, skill, difficulty, interviewType });
    aiResp = {
      success: true,
      role,
      skill,
      difficulty,
      interviewType,
      questions: [
        { id: 1, question: sessionData.firstQuestion.questionText, skill, difficulty, expectedKeywords: sessionData.firstQuestion.expectedKeywords },
        { id: 2, question: `How do you handle memory management and optimization in ${skill}?`, skill, difficulty, expectedKeywords: ['memory', 'optimization', 'performance'] },
        { id: 3, question: `Describe a challenging bug you encountered in a ${skill} project and how you resolved it.`, skill, difficulty, expectedKeywords: ['debug', 'project', 'solution'] },
      ],
    };
  }

  const session = await AIInterviewSession.create({
    student: student._id,
    role,
    skill,
    difficulty,
    questionCount: aiResp.questions.length,
    interviewType,
    status: 'IN_PROGRESS',
    questions: aiResp.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      skill: q.skill || skill,
      difficulty: q.difficulty || difficulty,
      expectedKeywords: q.expectedKeywords || [skill.toLowerCase()],
      studentAnswer: '',
      score: 0,
    })),
    integrityEvents: [],
    currentQuestionIndex: 0,
  });

  return res.status(201).json(
    ApiResponse.success('AI Mock Interview 2.0 Session started', {
      sessionId: session._id,
      role: session.role,
      skill: session.skill,
      difficulty: session.difficulty,
      interviewType: session.interviewType,
      totalQuestions: session.questions.length,
      currentQuestion: session.questions[0],
    })
  );
};

// 2. Get Current / Next Question
export const getMockInterviewQuestion = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  const { sessionId, index } = req.body;
  const session = await AIInterviewSession.findById(sessionId);
  if (!session) throw ApiError.notFound('Interview session not found');

  const targetIndex = index !== undefined ? Number(index) : session.currentQuestionIndex;
  if (targetIndex >= session.questions.length) {
    return res.status(200).json(ApiResponse.success('Interview questions completed', { isFinished: true }));
  }

  session.currentQuestionIndex = targetIndex;
  await session.save();

  return res.status(200).json(
    ApiResponse.success('Question retrieved', {
      isFinished: false,
      questionIndex: targetIndex,
      totalQuestions: session.questions.length,
      question: session.questions[targetIndex],
    })
  );
};

// 3. Submit & Evaluate Single Answer
export const evaluateMockInterviewAnswer = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  const { sessionId, questionId, answer, timeSpentSeconds, answerMethod = 'speech' } = req.body;
  const session = await AIInterviewSession.findById(sessionId);
  if (!session) throw ApiError.notFound('Interview session not found');

  const qIndex = session.questions.findIndex((q) => q.id === Number(questionId));
  if (qIndex === -1) throw ApiError.notFound('Question not found in this session');

  const currentQ = session.questions[qIndex];
  currentQ.studentAnswer = answer || '(Skipped / Timeout)';
  currentQ.answerMethod = answerMethod;
  currentQ.timeSpentSeconds = Number(timeSpentSeconds || 30);

  let evalResp;
  if (process.env.AI_SERVICE_URL && !process.env.VERCEL && process.env.AI_SERVICE_URL !== 'http://localhost:8000') {
    try {
      const evalRes = await axios.post(`${AI_SERVICE_URL}/interview/v2/evaluate-answer`, {
        question: currentQ.question,
        answer: currentQ.studentAnswer,
        skill: session.skill,
        difficulty: session.difficulty,
        interviewType: session.interviewType,
        expectedKeywords: currentQ.expectedKeywords || [],
        timeSpentSeconds: currentQ.timeSpentSeconds,
        answerMethod,
      }, { timeout: 800 });
      evalResp = evalRes.data;
    } catch (err) {
      console.warn('[AI_EVALUATION_FALLBACK] Using native evaluation engine.');
    }
  }

  if (!evalResp) {
    const nativeEval = nativeAIEngine.evaluateAnswer({ answerText: currentQ.studentAnswer, questionText: currentQ.question });
    evalResp = {
      score: nativeEval.scores.overallScore,
      technicalScore: nativeEval.scores.technicalAccuracy,
      communicationScore: nativeEval.scores.clarity,
      problemSolvingScore: nativeEval.scores.completeness,
      relevanceScore: nativeEval.scores.relevance,
      feedback: 'Answer evaluated successfully.',
      whatYouDidWell: nativeEval.strengths[0] || 'Good technical vocabulary.',
      whatYouMissed: nativeEval.missedPoints[0] || 'Include more specific project examples.',
      howToImprove: nativeEval.improvementSuggestions[0] || 'Structure responses with STAR format.',
      betterAnswerStructure: '1. Core Definition → 2. Technical Mechanism → 3. Real-world Project Application.',
      fillerWordsDetected: [],
      speakingPace: 'Optimal',
    };
  }

  currentQ.score = evalResp.score;
  currentQ.technicalScore = evalResp.technicalScore;
  currentQ.communicationScore = evalResp.communicationScore;
  currentQ.problemSolvingScore = evalResp.problemSolvingScore;
  currentQ.relevanceScore = evalResp.relevanceScore;
  currentQ.feedback = evalResp.feedback;
  currentQ.whatYouDidWell = evalResp.whatYouDidWell;
  currentQ.whatYouMissed = evalResp.whatYouMissed;
  currentQ.howToImprove = evalResp.howToImprove;
  currentQ.betterAnswerStructure = evalResp.betterAnswerStructure;
  currentQ.speakingPace = evalResp.speakingPace;
  currentQ.fillerWordsDetected = evalResp.fillerWordsDetected || [];

  session.currentQuestionIndex = qIndex + 1;
  await session.save();

  return res.status(200).json(
    ApiResponse.success('Answer evaluated successfully', {
      questionId: currentQ.id,
      evaluation: evalResp,
      nextQuestionIndex: session.currentQuestionIndex,
      isFinished: session.currentQuestionIndex >= session.questions.length,
    })
  );
};

// 4. Log Integrity / Tab Switch / Vision Event
export const logMockInterviewIntegrityEvent = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  const { sessionId, eventType, durationSeconds = 0, questionNumber = 1, warningLevel = 'WARNING_1', description = '' } = req.body;
  const session = await AIInterviewSession.findById(sessionId);
  if (!session) throw ApiError.notFound('Interview session not found');

  session.integrityEvents.push({
    timestamp: new Date(),
    eventType,
    durationSeconds: Number(durationSeconds),
    questionNumber: Number(questionNumber),
    warningLevel,
    description: description || `Integrity monitoring notice: ${eventType}`,
  });

  await session.save();

  return res.status(200).json(
    ApiResponse.success('Integrity event logged', {
      totalWarnings: session.integrityEvents.length,
      warningLevel,
    })
  );
};

// 5. Finish Interview & Generate Comprehensive Post-Interview Report
export const finishMockInterviewSession = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  const { sessionId } = req.body;
  const session = await AIInterviewSession.findById(sessionId);
  if (!session) throw ApiError.notFound('Interview session not found');

  const { student } = await getStudentProfile(userId.toString());

  // Find previous completed session for comparison delta
  const previousSession = await AIInterviewSession.findOne({
    student: student._id,
    status: 'COMPLETED',
    _id: { $ne: session._id },
  }).sort({ createdAt: -1 });

  const previousAvg = previousSession ? previousSession.overallScore : 0;

  let reportResp;
  if (process.env.AI_SERVICE_URL && !process.env.VERCEL && process.env.AI_SERVICE_URL !== 'http://localhost:8000') {
    try {
      const reportRes = await axios.post(`${AI_SERVICE_URL}/interview/v2/final-report`, {
        role: session.role,
        skill: session.skill,
        difficulty: session.difficulty,
        questions: session.questions,
        integrityEvents: session.integrityEvents,
        previousAverageScore: previousAvg,
      }, { timeout: 800 });
      reportResp = reportRes.data;
    } catch (err) {
      console.warn('[AI_REPORT_FALLBACK] Using native report engine.');
    }
  }

  if (!reportResp) {
    const evaluated = session.questions.filter((q) => q.score !== undefined);
    const avgScore = evaluated.length
      ? Math.round(evaluated.reduce((acc, q) => acc + (q.score || 0), 0) / evaluated.length)
      : 84;
    const nativeReport = nativeAIEngine.getFinalReport({ integrityEventsCount: session.integrityEvents.length });

    reportResp = {
      overallScore: avgScore,
      technicalScore: nativeReport.scores.technicalAccuracy,
      communicationScore: nativeReport.scores.communication,
      problemSolvingScore: nativeReport.scores.problemSolving,
      answerQualityScore: nativeReport.scores.answerQuality,
      scoreDelta: previousAvg ? avgScore - previousAvg : 0,
      integrityEventCount: session.integrityEvents.length,
      strengths: nativeReport.strongTopics.map((t) => `Good understanding of ${t}`),
      needsImprovement: nativeReport.needsImprovementTopics.map((t) => `Needs more practice in ${t}`),
      recommendedPractice: nativeReport.recommendations,
      summary: `Completed interview for ${session.role} (${session.skill}) with overall score ${avgScore}/100.`,
    };
  }

  session.status = 'COMPLETED';
  session.overallScore = reportResp.overallScore || 75;
  session.technicalScore = reportResp.technicalScore || 75;
  session.communicationScore = reportResp.communicationScore || 80;
  session.problemSolvingScore = reportResp.problemSolvingScore || 70;
  session.answerQualityScore = reportResp.answerQualityScore || 75;
  session.strengths = reportResp.strengths || [];
  session.needsImprovement = reportResp.needsImprovement || [];
  session.recommendedPractice = reportResp.recommendedPractice || [];
  session.summary = reportResp.summary || '';
  session.durationSeconds = session.questions.reduce((acc, q) => acc + (q.timeSpentSeconds || 0), 0);

  await session.save();

  return res.status(200).json(
    ApiResponse.success('AI Mock Interview 2.0 Session completed', {
      session,
      report: reportResp,
    })
  );
};

// 6. Get Student Interview History & Real Chart Performance Metrics
export const getMockInterviewHistory = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  const { student } = await getStudentProfile(userId.toString());
  const sessions = await AIInterviewSession.find({ student: student._id, status: 'COMPLETED' })
    .sort({ createdAt: -1 })
    .limit(20);

  const totalInterviews = sessions.length;
  const avgScore = totalInterviews
    ? Math.round(sessions.reduce((acc, s) => acc + s.overallScore, 0) / totalInterviews)
    : 0;
  const avgTechScore = totalInterviews
    ? Math.round(sessions.reduce((acc, s) => acc + s.technicalScore, 0) / totalInterviews)
    : 0;
  const avgCommScore = totalInterviews
    ? Math.round(sessions.reduce((acc, s) => acc + s.communicationScore, 0) / totalInterviews)
    : 0;

  // Trend data for real charts
  const scoreTrend = [...sessions].reverse().map((s, idx) => ({
    interviewIndex: idx + 1,
    date: s.createdAt.toISOString().split('T')[0],
    overallScore: s.overallScore,
    technicalScore: s.technicalScore,
    communicationScore: s.communicationScore,
    skill: s.skill,
  }));

  return res.status(200).json(
    ApiResponse.success('Interview history retrieved', {
      summary: {
        totalInterviews,
        avgScore,
        avgTechScore,
        avgCommScore,
      },
      scoreTrend,
      sessions,
    })
  );
};

// 7. Get Specific Interview Report by ID
export const getMockInterviewReportById = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  const { id } = req.params;
  const session = await AIInterviewSession.findById(id);
  if (!session) throw ApiError.notFound('Interview session report not found');

  return res.status(200).json(
    ApiResponse.success('Interview report retrieved', {
      session,
    })
  );
};
