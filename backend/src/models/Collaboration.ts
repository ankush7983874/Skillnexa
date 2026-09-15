import mongoose, { Schema, Document, Model } from 'mongoose';

export type CollaborationType =
  | 'JOINT_RESEARCH'
  | 'WORKSHOP'
  | 'HACKATHON'
  | 'LIVE_PROJECT'
  | 'GUEST_LECTURE'
  | 'INDUSTRIAL_VISIT'
  | 'MENTORSHIP'
  | 'CONSULTANCY';

export type CollaborationStatus =
  | 'PROPOSED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED';

export interface ICollaboration extends Document {
  title: string;
  type: CollaborationType;
  company: mongoose.Types.ObjectId;
  companyName: string;
  institution?: mongoose.Types.ObjectId;
  institutionName: string;
  department?: string;
  facultyLead?: mongoose.Types.ObjectId;
  description: string;
  proposedBy: 'COMPANY' | 'INSTITUTION' | 'FACULTY';
  status: CollaborationStatus;
  startDate?: Date;
  endDate?: Date;
  outcomes?: string[];
  documents?: string[];
}

const collaborationSchema = new Schema<ICollaboration>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'JOINT_RESEARCH',
        'WORKSHOP',
        'HACKATHON',
        'LIVE_PROJECT',
        'GUEST_LECTURE',
        'INDUSTRIAL_VISIT',
        'MENTORSHIP',
        'CONSULTANCY',
      ],
      required: true,
    },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    companyName: { type: String, required: true },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    institutionName: { type: String, default: 'Partner Institution' },
    department: { type: String, default: 'Computer Science' },
    facultyLead: { type: Schema.Types.ObjectId, ref: 'Faculty' },
    description: { type: String, required: true },
    proposedBy: { type: String, enum: ['COMPANY', 'INSTITUTION', 'FACULTY'], default: 'COMPANY' },
    status: {
      type: String,
      enum: ['PROPOSED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED'],
      default: 'PROPOSED',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    outcomes: [{ type: String }],
    documents: [{ type: String }],
  },
  { timestamps: true }
);

export const Collaboration: Model<ICollaboration> =
  mongoose.models.Collaboration || mongoose.model<ICollaboration>('Collaboration', collaborationSchema);
