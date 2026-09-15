import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProctoringRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProctoringStatus = 'IN_PROGRESS' | 'VERIFIED' | 'REVIEW_REQUIRED' | 'INVALIDATED_PENDING_REVIEW';

export interface IProctoringEvent {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
  riskPoints: number;
  description: string;
}

export interface IQuestionState {
  questionId: mongoose.Types.ObjectId;
  selectedOptionIndex?: number;
  answeredAt?: Date;
  timeSpentSeconds?: number;
}

export interface IProctoredAssessmentAttempt extends Document {
  student: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  assessment: mongoose.Types.ObjectId;
  assessmentTitle: string;
  skillName: string;
  startedAt: Date;
  submittedAt?: Date;
  currentQuestion: number;
  questionStates: IQuestionState[];
  skillScore?: number;
  integrityScore?: number;
  riskScore?: number;
  riskLevel?: ProctoringRiskLevel;
  status: ProctoringStatus;
  tabSwitchCount: number;
  fullscreenExitCount: number;
  cameraInterruptions: number;
  faceViolations: number;
  multipleFaceViolations: number;
  audioViolations: number;
  copyAttempts: number;
  reloadAttempts: number;
  proctoringEvents: IProctoringEvent[];
  explanation?: string;
  recommendation?: string;
  anomaliesDetected?: string[];
}

const proctoringEventSchema = new Schema<IProctoringEvent>(
  {
    type: { type: String, required: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
    timestamp: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    riskPoints: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const questionStateSchema = new Schema<IQuestionState>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOptionIndex: { type: Number },
    answeredAt: { type: Date },
    timeSpentSeconds: { type: Number, default: 0 },
  },
  { _id: false }
);

const proctoredAssessmentAttemptSchema = new Schema<IProctoredAssessmentAttempt>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assessment: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    assessmentTitle: { type: String, required: true },
    skillName: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    currentQuestion: { type: Number, default: 0 },
    questionStates: [questionStateSchema],
    skillScore: { type: Number },
    integrityScore: { type: Number },
    riskScore: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'VERIFIED', 'REVIEW_REQUIRED', 'INVALIDATED_PENDING_REVIEW'],
      default: 'IN_PROGRESS',
    },
    tabSwitchCount: { type: Number, default: 0 },
    fullscreenExitCount: { type: Number, default: 0 },
    cameraInterruptions: { type: Number, default: 0 },
    faceViolations: { type: Number, default: 0 },
    multipleFaceViolations: { type: Number, default: 0 },
    audioViolations: { type: Number, default: 0 },
    copyAttempts: { type: Number, default: 0 },
    reloadAttempts: { type: Number, default: 0 },
    proctoringEvents: [proctoringEventSchema],
    explanation: { type: String },
    recommendation: { type: String },
    anomaliesDetected: [{ type: String }],
  },
  { timestamps: true }
);

export const ProctoredAssessmentAttempt: Model<IProctoredAssessmentAttempt> =
  mongoose.models.ProctoredAssessmentAttempt ||
  mongoose.model<IProctoredAssessmentAttempt>('ProctoredAssessmentAttempt', proctoredAssessmentAttemptSchema);
