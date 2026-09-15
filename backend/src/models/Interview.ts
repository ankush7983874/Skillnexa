import mongoose, { Schema, Document, Model } from 'mongoose';

export type InterviewType = 'ONLINE' | 'OFFLINE' | 'PHONE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface IInterview extends Document {
  student: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  application: mongoose.Types.ObjectId;
  type: InterviewType;
  date: Date;
  time: string; // HH:mm format usually
  locationLink?: string; // Meeting link or physical address
  interviewer?: string;
  instructions?: string;
  status: InterviewStatus;
  feedbackScore?: number;
  feedbackRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
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
      index: true,
    },
    type: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'PHONE'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    locationLink: {
      type: String,
    },
    interviewer: {
      type: String,
    },
    instructions: {
      type: String,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    feedbackScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedbackRemarks: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Interview: Model<IInterview> = mongoose.models.Interview || mongoose.model<IInterview>('Interview', interviewSchema);
