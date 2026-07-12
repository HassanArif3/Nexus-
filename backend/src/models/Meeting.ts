import mongoose, { Document, Schema } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description?: string;
  entrepreneurId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  rejectionReason?: string;
  meetingLink?: string;
  calendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true },
    description: { type: String },
    entrepreneurId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    meetingLink: { type: String },
    calendarEventId: { type: String },
  },
  { timestamps: true }
);

// Indexes
meetingSchema.index({ entrepreneurId: 1 });
meetingSchema.index({ investorId: 1 });
meetingSchema.index({ participants: 1 });
meetingSchema.index({ startTime: 1 });
meetingSchema.index({ endTime: 1 });
meetingSchema.index({ status: 1 });

export const Meeting = mongoose.model<IMeeting>('Meeting', meetingSchema);
