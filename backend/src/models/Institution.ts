import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInstitution extends Document {
  user: mongoose.Types.ObjectId;
  institutionName: string;
  code?: string;
  aicteCode?: string;
  nirfRank?: number;
  location?: string;
  website?: string;
  tpoContactName?: string;
  tpoContactEmail?: string;
}

const institutionSchema = new Schema<IInstitution>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    institutionName: { type: String, required: true },
    code: { type: String, default: '' },
    aicteCode: { type: String, default: '' },
    nirfRank: { type: Number, default: 0 },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    tpoContactName: { type: String, default: '' },
    tpoContactEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Institution: Model<IInstitution> = mongoose.models.Institution || mongoose.model<IInstitution>('Institution', institutionSchema);
