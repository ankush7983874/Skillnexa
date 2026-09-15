import mongoose, { Schema, Document, Model } from 'mongoose';

export type AuditActionResult = 'SUCCESS' | 'FAILURE';

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  role?: string;
  action: string;
  result: AuditActionResult;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    role: { type: String, default: 'GUEST' },
    action: { type: String, required: true, index: true },
    result: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    resourceId: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
