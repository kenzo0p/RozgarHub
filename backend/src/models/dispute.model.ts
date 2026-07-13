import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import type { UserRole } from '../types/models.js';

/**
 * A grievance raised on a real engagement (an accepted-or-later application).
 * The report model covers scam *job posts*; this covers what goes wrong
 * *after* hiring — "didn't get paid", "didn't show up", "unsafe site". Either
 * party can raise one, the other party is notified, and it's on record.
 */
export type DisputeReason =
  | 'not_paid'
  | 'underpaid'
  | 'no_show'
  | 'incomplete_work'
  | 'unsafe'
  | 'other';

export interface IDispute extends Document {
  _id: Types.ObjectId;
  application: Types.ObjectId;
  job: Types.ObjectId;
  raisedBy: Types.ObjectId;
  raisedByRole: UserRole;
  against: Types.ObjectId;
  reason: DisputeReason;
  description?: string;
  status: 'open' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    raisedByRole: { type: String, enum: ['employee', 'employer'], required: true },
    against: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: {
      type: String,
      enum: ['not_paid', 'underpaid', 'no_show', 'incomplete_work', 'unsafe', 'other'],
      required: true,
    },
    description: { type: String, maxlength: [1000, 'Description cannot exceed 1000 characters'], trim: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// One dispute per party per engagement — keeps it from being spammed.
disputeSchema.index({ application: 1, raisedBy: 1 }, { unique: true });
disputeSchema.index({ raisedBy: 1, createdAt: -1 });

export const Dispute: Model<IDispute> = mongoose.model<IDispute>('Dispute', disputeSchema);
