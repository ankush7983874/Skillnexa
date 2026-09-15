import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailLog extends Document {
  recipient: string;
  subject: string;
  template: string;
  applicationId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  status: 'SENT' | 'FAILED';
  error?: string;
  sentAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
  {
    recipient: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['SENT', 'FAILED'],
      required: true,
    },
    error: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export const EmailLog: Model<IEmailLog> = mongoose.models.EmailLog || mongoose.model<IEmailLog>('EmailLog', emailLogSchema);
