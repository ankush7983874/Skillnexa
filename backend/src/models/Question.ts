import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion extends Document {
  assessment: mongoose.Types.ObjectId;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  skillName: string;
  difficulty: string;
}

const questionSchema = new Schema<IQuestion>(
  {
    assessment: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true, select: false }, // Hidden by default from student queries
    explanation: { type: String, default: '' },
    skillName: { type: String, required: true },
    difficulty: { type: String, default: 'Intermediate' },
  },
  { timestamps: true }
);

export const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema);
