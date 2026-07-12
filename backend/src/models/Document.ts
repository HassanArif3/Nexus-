import mongoose, { Document, Schema } from 'mongoose';

export interface ISignature {
  signedBy: mongoose.Types.ObjectId;
  signatureImageUrl: string;
  signedAt: Date;
  ipAddress?: string;
}

export interface IDocument extends Document {
  title: string;
  description?: string;
  uploadedBy: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  relatedStartupId?: mongoose.Types.ObjectId;
  visibleTo: mongoose.Types.ObjectId[];
  fileUrl: string;
  fileKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  extension: string;
  version: number;
  status: 'draft' | 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'archived';
  category: 'pitch_deck' | 'business_plan' | 'financials' | 'legal' | 'contract' | 'other';
  signatures: ISignature[];
  createdAt: Date;
  updatedAt: Date;
}

const signatureSchema = new Schema<ISignature>({
  signedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  signatureImageUrl: { type: String, required: true },
  signedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
}, { _id: false });

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relatedStartupId: { type: Schema.Types.ObjectId },
    visibleTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },
    originalFileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    extension: { type: String, required: true },
    version: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['draft', 'uploaded', 'under_review', 'approved', 'rejected', 'archived'],
      default: 'uploaded',
    },
    category: {
      type: String,
      enum: ['pitch_deck', 'business_plan', 'financials', 'legal', 'contract', 'other'],
      required: true,
    },
    signatures: [signatureSchema],
  },
  { timestamps: true }
);

// Indexes
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ ownerId: 1 });
documentSchema.index({ visibleTo: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ createdAt: 1 });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
