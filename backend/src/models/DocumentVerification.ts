import mongoose, { Schema, Document, Model } from 'mongoose';

export type DocumentType =
  | 'RESUME'
  | 'CERTIFICATE'
  | 'INTERNSHIP_CERTIFICATE'
  | 'PROJECT_CERTIFICATE'
  | 'OFFER_LETTER'
  | 'ACADEMIC_TRANSCRIPT';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IDocumentVerification extends Document {
  user: mongoose.Types.ObjectId;
  student?: mongoose.Types.ObjectId;
  faculty?: mongoose.Types.ObjectId;
  documentType: DocumentType;
  title: string;
  fileUrl: string;
  fileMetadata: {
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
  };
  status: VerificationStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
}

const documentVerificationSchema = new Schema<IDocumentVerification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', index: true },
    documentType: {
      type: String,
      enum: [
        'RESUME',
        'CERTIFICATE',
        'INTERNSHIP_CERTIFICATE',
        'PROJECT_CERTIFICATE',
        'OFFER_LETTER',
        'ACADEMIC_TRANSCRIPT',
      ],
      required: true,
    },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileMetadata: {
      originalName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      sizeBytes: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const DocumentVerification: Model<IDocumentVerification> =
  mongoose.models.DocumentVerification ||
  mongoose.model<IDocumentVerification>('DocumentVerification', documentVerificationSchema);
