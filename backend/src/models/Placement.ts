import mongoose, { Schema, Document, Model } from 'mongoose';

export type JoiningStatus = 'PENDING' | 'JOINED' | 'DECLINED';

export interface IPlacementHistoryItem {
  status: string;
  updatedBy?: mongoose.Types.ObjectId;
  notes?: string;
  timestamp: Date;
}

export interface IPlacement extends Document {
  student: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  application: mongoose.Types.ObjectId;
  role: string;
  salary?: string;
  ctcLpa?: number;
  ctcBreakdown?: {
    baseSalary?: number;
    bonuses?: number;
    stockOptions?: number;
  };
  offerLetterUrl?: string;
  selectionDate: Date;
  joiningDate?: Date;
  joiningStatus: JoiningStatus;
  placementStatus: string;
  history: IPlacementHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const placementHistorySchema = new Schema<IPlacementHistoryItem>(
  {
    status: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const placementSchema = new Schema<IPlacement>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
    },
    ctcLpa: {
      type: Number,
      default: 0,
    },
    ctcBreakdown: {
      baseSalary: { type: Number, default: 0 },
      bonuses: { type: Number, default: 0 },
      stockOptions: { type: Number, default: 0 },
    },
    offerLetterUrl: {
      type: String,
      default: '',
    },
    selectionDate: {
      type: Date,
      default: Date.now,
    },
    joiningDate: {
      type: Date,
    },
    joiningStatus: {
      type: String,
      enum: ['PENDING', 'JOINED', 'DECLINED'],
      default: 'PENDING',
    },
    placementStatus: {
      type: String,
      default: 'SELECTED',
    },
    history: [placementHistorySchema],
  },
  { timestamps: true }
);

// Prevent duplicate placement records per student-job pair
placementSchema.index({ student: 1, job: 1 }, { unique: true });

export const Placement: Model<IPlacement> =
  mongoose.models.Placement || mongoose.model<IPlacement>('Placement', placementSchema);
