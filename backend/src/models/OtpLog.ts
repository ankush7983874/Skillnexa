import mongoose, { Schema, Document, Model } from 'mongoose';

export type OtpPurpose = 'LOGIN' | 'REGISTRATION' | 'PASSWORD_RESET' | 'COMPANY_REGISTRATION' | 'COMPANY_LOGIN';

export interface IOtpLog extends Document {
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  resendAvailableAt: Date;
  lockedUntil?: Date;
  isVerified: boolean;
  verifiedAt?: Date;
  registrationPayload?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const otpLogSchema = new Schema<IOtpLog>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['LOGIN', 'REGISTRATION', 'PASSWORD_RESET', 'COMPANY_REGISTRATION', 'COMPANY_LOGIN'],
      default: 'LOGIN',
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    resendAvailableAt: {
      type: Date,
      default: Date.now,
    },
    lockedUntil: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    registrationPayload: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Compound index on email + purpose
otpLogSchema.index({ email: 1, purpose: 1 });

export const OtpLog: Model<IOtpLog> =
  mongoose.models.OtpLog || mongoose.model<IOtpLog>('OtpLog', otpLogSchema);
