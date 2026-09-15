import mongoose, { Schema, Document, Model } from 'mongoose';

export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'ELIGIBLE' | 'SHORTLISTED' | 'INTERVIEW' | 'INTERVIEW_COMPLETED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';

export interface IApplicationAnswer {
  questionId: string;
  questionText: string;
  answer: string;
}

export interface IApplicantDetails {
  fullName: string;
  email: string;
  mobileNumber?: string;
  college?: string;
  branch?: string;
  degree?: string;
  graduationYear?: number;
  cgpa?: number;
  technicalSkills?: string[];
  programmingLanguages?: string[];
  resumeUrl?: string;
}

export interface IApplicationHistory {
  status: ApplicationStatus;
  changedAt: Date;
  remarks?: string;
}

export interface IApplication extends Document {
  student: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  matchScore?: number;
  matchBreakdown?: any;
  applicantDetails?: IApplicantDetails;
  coverLetter?: string;
  answers?: IApplicationAnswer[];
  history: IApplicationHistory[];
  appliedAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['APPLIED', 'UNDER_REVIEW', 'ELIGIBLE', 'SHORTLISTED', 'INTERVIEW', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED', 'WITHDRAWN'],
      default: 'APPLIED',
      index: true,
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    matchBreakdown: {
      type: Schema.Types.Mixed,
    },
    applicantDetails: {
      fullName: { type: String },
      email: { type: String },
      mobileNumber: { type: String },
      college: { type: String },
      branch: { type: String },
      degree: { type: String },
      graduationYear: { type: Number },
      cgpa: { type: Number },
      technicalSkills: [{ type: String }],
      programmingLanguages: [{ type: String }],
      resumeUrl: { type: String },
    },
    coverLetter: {
      type: String,
      default: '',
    },
    answers: [
      {
        questionId: { type: String },
        questionText: { type: String },
        answer: { type: String },
      },
    ],
    history: [
      {
        status: {
          type: String,
          enum: ['APPLIED', 'UNDER_REVIEW', 'ELIGIBLE', 'SHORTLISTED', 'INTERVIEW', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED', 'WITHDRAWN'],
        },
        changedAt: { type: Date, default: Date.now },
        remarks: { type: String },
      },
    ],
  },
  { timestamps: { createdAt: 'appliedAt', updatedAt: 'updatedAt' } }
);

// Prevent duplicate applications
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

export const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);
