import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAIInterviewQuestion {
  id: number;
  question: string;
  skill: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedKeywords: string[];
  studentAnswer?: string;
  answerMethod?: 'speech' | 'text';
  timeSpentSeconds?: number;
  isFollowUp?: boolean;
  score?: number;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  relevanceScore?: number;
  feedback?: string;
  whatYouDidWell?: string;
  whatYouMissed?: string;
  howToImprove?: string;
  betterAnswerStructure?: string;
  grammarFeedback?: string;
  speakingPace?: string;
  fillerWordsDetected?: string[];
}

export interface IAIInterviewIntegrityEvent {
  timestamp: Date;
  eventType: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'FULLSCREEN_EXIT' | 'FACE_MISSING' | 'MULTIPLE_FACES' | 'ATTENTION_AWAY' | 'CAMERA_INTERRUPTED';
  durationSeconds: number;
  questionNumber: number;
  warningLevel: 'WARNING_1' | 'WARNING_2' | 'INTEGRITY_CONCERN';
  description: string;
}

export interface IAIInterviewSession extends Document {
  student: mongoose.Types.ObjectId;
  role: string;
  skill: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive';
  questionCount: number;
  interviewType: 'Technical' | 'Coding' | 'DSA' | 'HR' | 'Behavioral' | 'Project' | 'Resume' | 'Mixed';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED';
  questions: IAIInterviewQuestion[];
  integrityEvents: IAIInterviewIntegrityEvent[];
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  answerQualityScore: number;
  strengths: string[];
  needsImprovement: string[];
  recommendedPractice: string[];
  summary: string;
  durationSeconds: number;
  currentQuestionIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const aiInterviewQuestionSchema = new Schema<IAIInterviewQuestion>({
  id: { type: Number, required: true },
  question: { type: String, required: true },
  skill: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  expectedKeywords: [{ type: String }],
  studentAnswer: { type: String, default: '' },
  answerMethod: { type: String, enum: ['speech', 'text'], default: 'speech' },
  timeSpentSeconds: { type: Number, default: 0 },
  isFollowUp: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  technicalScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  problemSolvingScore: { type: Number, default: 0 },
  relevanceScore: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  whatYouDidWell: { type: String, default: '' },
  whatYouMissed: { type: String, default: '' },
  howToImprove: { type: String, default: '' },
  betterAnswerStructure: { type: String, default: '' },
  grammarFeedback: { type: String, default: '' },
  speakingPace: { type: String, default: '' },
  fillerWordsDetected: [{ type: String }],
});

const aiInterviewIntegrityEventSchema = new Schema<IAIInterviewIntegrityEvent>({
  timestamp: { type: Date, default: Date.now },
  eventType: {
    type: String,
    enum: ['TAB_SWITCH', 'WINDOW_BLUR', 'FULLSCREEN_EXIT', 'FACE_MISSING', 'MULTIPLE_FACES', 'ATTENTION_AWAY', 'CAMERA_INTERRUPTED'],
    required: true,
  },
  durationSeconds: { type: Number, default: 0 },
  questionNumber: { type: Number, default: 1 },
  warningLevel: { type: String, enum: ['WARNING_1', 'WARNING_2', 'INTEGRITY_CONCERN'], default: 'WARNING_1' },
  description: { type: String, default: '' },
});

const aiInterviewSessionSchema = new Schema<IAIInterviewSession>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    role: { type: String, required: true },
    skill: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Adaptive'], default: 'Medium' },
    questionCount: { type: Number, default: 10 },
    interviewType: {
      type: String,
      enum: ['Technical', 'Coding', 'DSA', 'HR', 'Behavioral', 'Project', 'Resume', 'Mixed'],
      default: 'Technical',
    },
    status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'ABORTED'], default: 'IN_PROGRESS' },
    questions: [aiInterviewQuestionSchema],
    integrityEvents: [aiInterviewIntegrityEventSchema],
    overallScore: { type: Number, default: 0 },
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    problemSolvingScore: { type: Number, default: 0 },
    answerQualityScore: { type: Number, default: 0 },
    strengths: [{ type: String }],
    needsImprovement: [{ type: String }],
    recommendedPractice: [{ type: String }],
    summary: { type: String, default: '' },
    durationSeconds: { type: Number, default: 0 },
    currentQuestionIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AIInterviewSession: Model<IAIInterviewSession> =
  mongoose.models.AIInterviewSession || mongoose.model<IAIInterviewSession>('AIInterviewSession', aiInterviewSessionSchema);
