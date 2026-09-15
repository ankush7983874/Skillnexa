import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  user: mongoose.Types.ObjectId;
  companyName: string;
  registrationNumber?: string;
  officialEmail?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  description?: string;
  location?: string;
  hrContactName?: string;
  hrContactPhone?: string;
  verificationDocuments: string[];
}

const companySchema = new Schema<ICompany>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: { type: String, required: true },
    registrationNumber: { type: String, default: '' },
    officialEmail: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
    companySize: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    hrContactName: { type: String, default: '' },
    hrContactPhone: { type: String, default: '' },
    verificationDocuments: [{ type: String }],
  },
  { timestamps: true }
);

export const Company: Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>('Company', companySchema);
