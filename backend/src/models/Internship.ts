import mongoose, { Schema, Document, Model } from 'mongoose';

export type InternshipMode = 'Remote' | 'On-site' | 'Hybrid';

export interface IInternshipPosting extends Document {
  company: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  companyName: string;
  title: string;
  description: string;
  requiredSkills: string[];
  duration: string;
  stipend: string;
  mentor: string;
  mode: InternshipMode;
  startDate?: Date;
  endDate?: Date;
  status: 'Published' | 'Closed';
  createdAt: Date;
}

const internshipSchema = new Schema<IInternshipPosting>(
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
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String, required: true }],
    duration: { type: String, default: '3 Months' },
    stipend: { type: String, default: 'Stipend Provided' },
    mentor: { type: String, default: 'Assigned Engineering Lead' },
    mode: {
      type: String,
      enum: ['Remote', 'On-site', 'Hybrid'],
      default: 'Hybrid',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['Published', 'Closed'],
      default: 'Published',
    },
  },
  { timestamps: true }
);

export const InternshipPosting: Model<IInternshipPosting> =
  mongoose.models.InternshipPosting ||
  mongoose.model<IInternshipPosting>('InternshipPosting', internshipSchema);
