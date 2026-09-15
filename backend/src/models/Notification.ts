import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'JOB_POSTED'
  | 'AI_JOB_MATCH'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'OFFER_LETTER'
  | 'APPLICATION_UPDATE'
  | 'GENERAL';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType | string;
  read: boolean;
  jobId?: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  relatedEntityId?: mongoose.Types.ObjectId;
  relatedEntityType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'GENERAL',
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    matchScore: {
      type: Number,
    },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    relatedEntityId: {
      type: Schema.Types.ObjectId,
    },
    relatedEntityType: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate notifications
notificationSchema.index({ user: 1, jobId: 1, type: 1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

