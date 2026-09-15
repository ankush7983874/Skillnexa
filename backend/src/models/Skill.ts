import mongoose, { Schema, Document, Model } from 'mongoose';

export type SkillCategory =
  | 'Programming'
  | 'Web Development'
  | 'Mobile Development'
  | 'Database'
  | 'Cloud'
  | 'DevOps'
  | 'AI/ML'
  | 'Data Science'
  | 'Cybersecurity'
  | 'Networking'
  | 'Soft Skills'
  | 'Management';

export interface ISkill extends Document {
  name: string;
  category: SkillCategory;
  description: string;
  industryDemand: number; // Score 1 to 100
}

const skillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Programming',
        'Web Development',
        'Mobile Development',
        'Database',
        'Cloud',
        'DevOps',
        'AI/ML',
        'Data Science',
        'Cybersecurity',
        'Networking',
        'Soft Skills',
        'Management',
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    industryDemand: {
      type: Number,
      default: 50,
      min: 1,
      max: 100,
    },
  },
  { timestamps: true }
);

export const Skill: Model<ISkill> = mongoose.models.Skill || mongoose.model<ISkill>('Skill', skillSchema);
