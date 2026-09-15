import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompanyFollow extends Document {
  student: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  createdAt: Date;
}

const companyFollowSchema = new Schema<ICompanyFollow>(
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
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// Prevent duplicate follows
companyFollowSchema.index({ student: 1, company: 1 }, { unique: true });

export const CompanyFollow: Model<ICompanyFollow> =
  mongoose.models.CompanyFollow || mongoose.model<ICompanyFollow>('CompanyFollow', companyFollowSchema);
