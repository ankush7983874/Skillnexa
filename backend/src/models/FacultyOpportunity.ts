import mongoose, { Schema, Document, Model } from 'mongoose';

export type FacultyOpportunityType =
  | 'FACULTY_INTERNSHIP'
  | 'INDUSTRIAL_TRAINING'
  | 'FDP'
  | 'WORKSHOP'
  | 'RESEARCH_COLLABORATION'
  | 'CONSULTANCY'
  | 'GUEST_LECTURE'
  | 'MENTORSHIP';

export interface IFacultyOpportunity extends Document {
  company: mongoose.Types.ObjectId;
  companyName: string;
  title: string;
  type: FacultyOpportunityType;
  description: string;
  requirements: string[];
  duration: string;
  compensation?: string;
  location: string;
  deadline?: Date;
  status: 'OPEN' | 'CLOSED';
}

const facultyOpportunitySchema = new Schema<IFacultyOpportunity>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    companyName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'FACULTY_INTERNSHIP',
        'INDUSTRIAL_TRAINING',
        'FDP',
        'WORKSHOP',
        'RESEARCH_COLLABORATION',
        'CONSULTANCY',
        'GUEST_LECTURE',
        'MENTORSHIP',
      ],
      required: true,
    },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    duration: { type: String, default: 'Flexible' },
    compensation: { type: String, default: 'Unpaid / Institutional Support' },
    location: { type: String, default: 'Remote / On-site' },
    deadline: { type: Date },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  },
  { timestamps: true }
);

export const FacultyOpportunity: Model<IFacultyOpportunity> =
  mongoose.models.FacultyOpportunity ||
  mongoose.model<IFacultyOpportunity>('FacultyOpportunity', facultyOpportunitySchema);
