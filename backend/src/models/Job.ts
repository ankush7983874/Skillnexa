import mongoose, { Schema, Document, Model } from 'mongoose';

export type JobEmploymentType = 'Full-time' | 'Part-time' | 'Contract';
export type JobStatus = 'Draft' | 'Published' | 'Paused' | 'Closed';

export interface IJobQuestion {
  id: string;
  questionText: string;
  required: boolean;
}

export interface IJob extends Document {
  company: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  companyName: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minCgpa: number;
  allowedBranches: string[];
  allowedGraduationYears: number[];
  experience: string;
  location: string;
  salary: string;
  employmentType: JobEmploymentType;
  deadline: Date;
  status: JobStatus;
  questions?: IJobQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: { type: String, required: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String, required: true }],
    preferredSkills: [{ type: String }],
    minCgpa: { type: Number, default: 0, min: 0, max: 10 },
    allowedBranches: [{ type: String }],
    allowedGraduationYears: [{ type: Number }],
    experience: { type: String, default: 'Fresher / 0-2 years' },
    location: { type: String, default: 'Remote / Hybrid' },
    salary: { type: String, default: 'Competitive' },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract'],
      default: 'Full-time',
    },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Paused', 'Closed'],
      default: 'Published',
      index: true,
    },
    questions: [
      {
        id: { type: String, required: true },
        questionText: { type: String, required: true },
        required: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);
