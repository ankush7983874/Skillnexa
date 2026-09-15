import mongoose, { Schema, Document, Model } from 'mongoose';

export type AssessmentType = 'Technical' | 'Aptitude' | 'Soft Skills' | 'Coding';
export type AssessmentDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface IAssessment extends Document {
  title: string;
  type: AssessmentType;
  skillName: string;
  category: string;
  difficulty: AssessmentDifficulty;
  durationMinutes: number;
  passingScore: number; // e.g. 60%
  totalQuestions: number;
  description: string;
  isActive: boolean;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Technical', 'Aptitude', 'Soft Skills', 'Coding'],
      required: true,
    },
    skillName: { type: String, required: true, index: true },
    category: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    durationMinutes: { type: Number, default: 20 },
    passingScore: { type: Number, default: 60 },
    totalQuestions: { type: Number, default: 5 },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Assessment: Model<IAssessment> =
  mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', assessmentSchema);
