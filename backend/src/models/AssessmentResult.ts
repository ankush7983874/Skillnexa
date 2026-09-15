import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssessmentResult extends Document {
  student: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  assessment: mongoose.Types.ObjectId;
  assessmentTitle: string;
  skillName: string;
  category: string;
  difficulty: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  attemptDate: Date;
  proctoring?: {
    riskScore: number;
    tabSwitches: number;
    fullscreenExits: number;
    events: Array<{ type: string; timestamp: Date; description: string }>;
  };
}

const assessmentResultSchema = new Schema<IAssessmentResult>(
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
    },
    assessmentTitle: { type: String, required: true },
    skillName: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, default: 'Intermediate' },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    attemptDate: { type: Date, default: Date.now },
    proctoring: {
      riskScore: { type: Number, default: 0 },
      tabSwitches: { type: Number, default: 0 },
      fullscreenExits: { type: Number, default: 0 },
      events: [
        {
          type: { type: String },
          timestamp: { type: Date, default: Date.now },
          description: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

export const AssessmentResult: Model<IAssessmentResult> =
  mongoose.models.AssessmentResult ||
  mongoose.model<IAssessmentResult>('AssessmentResult', assessmentResultSchema);
