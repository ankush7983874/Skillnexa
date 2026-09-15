import mongoose, { Schema, Document, Model } from 'mongoose';

export type AIAnalysisType =
  | 'CAREER_READINESS'
  | 'SKILL_GAP'
  | 'LEARNING_ROADMAP'
  | 'RESUME_ANALYSIS'
  | 'PROFILE_IMPROVEMENT'
  | 'INTERVIEW_PREP'
  | 'MOCK_INTERVIEW'
  | 'CAREER_ROLES'
  | 'CAREER_ASSISTANT'
  | 'DEVELOPMENT_PLAN';

export interface IAIAnalysis extends Document {
  user: mongoose.Types.ObjectId;
  type: AIAnalysisType;
  subType?: string;
  data: Record<string, any>;
  jobId?: mongoose.Types.ObjectId;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'CAREER_READINESS',
        'SKILL_GAP',
        'LEARNING_ROADMAP',
        'RESUME_ANALYSIS',
        'PROFILE_IMPROVEMENT',
        'INTERVIEW_PREP',
        'MOCK_INTERVIEW',
        'CAREER_ROLES',
        'CAREER_ASSISTANT',
        'DEVELOPMENT_PLAN',
      ],
      required: true,
      index: true,
    },
    data: { type: Schema.Types.Mixed, required: true },
    subType: { type: String, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    sessionId: { type: String },
  },
  { timestamps: true }
);

// Compound index for efficient lookup: latest analysis per user per type per subType
AIAnalysisSchema.index({ user: 1, type: 1, subType: 1, createdAt: -1 });

export const AIAnalysis: Model<IAIAnalysis> =
  mongoose.models.AIAnalysis ||
  mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
