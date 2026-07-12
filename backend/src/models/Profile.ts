import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  skills?: string[];
  roleSpecificData?: {
    // Entrepreneur specific
    startupName?: string;
    startupStage?: string;
    industry?: string;
    pitchSummary?: string;
    fundingNeeded?: number;
    fundingCurrency?: string;
    previousFunding?: string;
    teamSize?: number;
    businessModel?: string;
    traction?: string;
    documents?: string[];
    // Investor specific
    investorType?: string;
    investmentRangeMin?: number;
    investmentRangeMax?: number;
    preferredIndustries?: string[];
    preferredStages?: string[];
    portfolioCompanies?: string[];
    investmentHistory?: string;
    investmentLocationPreference?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    skills: [{ type: String }],
    roleSpecificData: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model<IProfile>('Profile', profileSchema);
