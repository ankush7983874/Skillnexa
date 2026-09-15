import { Request, Response } from 'express';
import { Assessment } from '../models/Assessment';
import { Question } from '../models/Question';
import { AssessmentResult } from '../models/AssessmentResult';
import { Student } from '../models/Student';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { TECHNICAL_ASSESSMENTS_SEED } from '../utils/questionBank';
import { z } from 'zod';

const submitAssessmentSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionIndex: z.number(),
    })
  ),
});

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const listAssessments = async (req: Request, res: Response) => {
  const { type, category } = req.query;
  const filter: any = { isActive: true };
  if (type) filter.type = type;
  if (category) filter.category = category;

  const assessments = await Assessment.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(ApiResponse.success('Assessments retrieved successfully', assessments));
};

export const getAssessmentQuestions = async (req: Request, res: Response) => {
  const { id } = req.params;

  const assessment = await Assessment.findById(id);
  if (!assessment) {
    throw ApiError.notFound('Assessment not found');
  }

  // Questions fetched without correctOptionIndex and randomized per attempt
  const allQuestions = await Question.find({ assessment: id }).select('-correctOptionIndex');
  const questions = shuffleArray(allQuestions);

  return res.status(200).json(
    ApiResponse.success('Assessment questions retrieved', {
      assessment,
      questions,
    })
  );
};

export const submitAssessment = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const validated = submitAssessmentSchema.parse(req.body);

  const assessment = await Assessment.findById(id);
  if (!assessment) {
    throw ApiError.notFound('Assessment not found');
  }

  const student = await Student.findOne({ user: userId });
  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  // Fetch all questions for this assessment INCLUDING correctOptionIndex
  const questions = await Question.find({ assessment: id }).select('+correctOptionIndex');

  let correctCount = 0;
  const detailedFeedback = questions.map((q) => {
    const userAnswer = validated.answers.find((a) => a.questionId === q._id.toString());
    const isCorrect = userAnswer !== undefined && userAnswer.selectedOptionIndex === q.correctOptionIndex;
    if (isCorrect) correctCount++;

    return {
      questionId: q._id,
      questionText: q.questionText,
      userSelected: userAnswer ? userAnswer.selectedOptionIndex : null,
      correctIndex: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const totalQuestions = questions.length || 1;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= assessment.passingScore;

  // Create assessment result record
  const result = await AssessmentResult.create({
    student: student._id,
    user: userId,
    assessment: assessment._id,
    assessmentTitle: assessment.title,
    skillName: assessment.skillName,
    category: assessment.category,
    difficulty: assessment.difficulty,
    score: correctCount,
    totalMarks: totalQuestions,
    percentage,
    passed,
    attemptDate: new Date(),
    proctoring: req.body.proctoring || undefined,
  });

  // Automatically update/verify student capability profile for this skill
  const skillIndex = student.skills.findIndex(
    (s) => s.name.toLowerCase() === assessment.skillName.toLowerCase()
  );

  if (skillIndex >= 0) {
    student.skills[skillIndex].score = Math.max(student.skills[skillIndex].score, percentage);
    if (passed) student.skills[skillIndex].verified = true;
  } else {
    student.skills.push({
      name: assessment.skillName,
      category: assessment.category,
      score: percentage,
      verified: passed,
    });
  }

  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  return res.status(200).json(
    ApiResponse.success('Assessment evaluated successfully', {
      result,
      detailedFeedback,
    })
  );
};

export const getStudentResults = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const results = await AssessmentResult.find({ user: userId }).sort({ attemptDate: -1 });

  return res.status(200).json(ApiResponse.success('Assessment history retrieved', results));
};

export const seedAssessments = async (req: Request, res: Response) => {
  let totalSeededAssessments = 0;
  let totalSeededQuestions = 0;

  for (const seed of TECHNICAL_ASSESSMENTS_SEED) {
    const assessment = await Assessment.findOneAndUpdate(
      { skillName: seed.skillName },
      {
        title: seed.title,
        type: seed.type,
        skillName: seed.skillName,
        category: seed.category,
        difficulty: seed.difficulty,
        durationMinutes: seed.durationMinutes,
        passingScore: seed.passingScore,
        totalQuestions: seed.questions.length,
        description: seed.description,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    await Question.deleteMany({ assessment: assessment._id });
    const questionDocs = seed.questions.map((q) => ({
      assessment: assessment._id,
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
      skillName: seed.skillName,
      difficulty: q.difficulty,
    }));

    await Question.create(questionDocs);
    totalSeededAssessments += 1;
    totalSeededQuestions += questionDocs.length;
  }

  return res.status(200).json(
    ApiResponse.success('Comprehensive 11-skill technical question bank successfully seeded', {
      seededAssessmentsCount: totalSeededAssessments,
      seededQuestionsCount: totalSeededQuestions,
    })
  );
};
