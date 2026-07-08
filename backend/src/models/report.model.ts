import mongoose, { Schema, Model, Document, Types } from 'mongoose';

/**
 * A worker's report of a suspicious job posting (fake, scam, asks for money,
 * misleading pay, etc.). Enough reports auto-flag the job for review.
 */
export interface IReport extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  reporter: Types.ObjectId;
  reason: 'fake' | 'asks_for_money' | 'misleading_pay' | 'offensive' | 'other';
  note?: string;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: ['fake', 'asks_for_money', 'misleading_pay', 'offensive', 'other'],
      required: true,
    },
    note: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

// One report per user per job — prevents a single user inflating the count.
reportSchema.index({ job: 1, reporter: 1 }, { unique: true });

export const Report: Model<IReport> = mongoose.model<IReport>('Report', reportSchema);
