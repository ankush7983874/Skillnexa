import mongoose, { Schema, Document, Model } from 'mongoose';

export type FacultyApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';

export interface IFacultyApplication extends Document {
  opportunity: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: FacultyApplicationStatus;
  proposal: string;
  cvUrl?: string;
  notes?: string;
}

const facultyApplicationSchema = new Schema<IFacultyApplication>(
  {
    opportunity: { type: Schema.Types.ObjectId, ref: 'FacultyOpportunity', required: true, index: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'],
      default: 'APPLIED',
    },
    proposal: { type: String, default: '' },
    cvUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const FacultyApplication: Model<IFacultyApplication> =
  mongoose.models.FacultyApplication ||
  mongoose.model<IFacultyApplication>('FacultyApplication', facultyApplicationSchema);
