import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFaculty extends Document {
  user: mongoose.Types.ObjectId;
  institution?: string;
  department?: string;
  designation?: string;
  specialization?: string[];
  researchAreas?: string[];
  publications?: any[];
  bio?: string;
  education?: string;
  experienceYears?: number;
  skills?: string[];
  certifications?: string[];
  projects?: string[];
  contactEmail?: string;
  phone?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
}

const facultySchema = new Schema<IFaculty>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    institution: { type: String, default: '' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    specialization: [{ type: String }],
    researchAreas: [{ type: String }],
    publications: [{ type: Schema.Types.Mixed }],
    bio: { type: String, default: '' },
    education: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    skills: [{ type: String }],
    certifications: [{ type: String }],
    projects: [{ type: String }],
    contactEmail: { type: String, default: '' },
    phone: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

export const Faculty: Model<IFaculty> =
  mongoose.models.Faculty || mongoose.model<IFaculty>('Faculty', facultySchema);
