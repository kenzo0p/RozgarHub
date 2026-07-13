import mongoose, { Schema, Model } from 'mongoose';
import type { IApplication } from '../types/models.js';

const applicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    // Lifecycle: pending → accepted → started → completed → paid
    // (or rejected). Blue-collar work doesn't end at "hired" — the states
    // that matter are showing up, finishing, and getting paid.
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'started', 'completed', 'paid'],
        message: 'Invalid application status',
      },
      default: 'pending',
    },
    // Payment record — set by the employer when they mark the work paid. We
    // don't move money (that needs a gateway); we record what was paid and
    // then let the *worker* confirm they received it. Wage disputes are the
    // #1 blue-collar complaint, so closing this loop matters.
    paidAmount: { type: Number, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'bank'] },
    paymentConfirmed: { type: Boolean, default: false },
    paymentConfirmedAt: { type: Date },
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

// ─── Indexes ───────────────────────────────────────────────────────────────────
// Compound unique index prevents duplicate applications (same user applying to same job twice)
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
// Index for "get my applications" queries
applicationSchema.index({ applicant: 1, createdAt: -1 });
// Index for "get applicants for this job" queries
applicationSchema.index({ job: 1, status: 1 });

export const Application: Model<IApplication> = mongoose.model<IApplication>(
  'Application',
  applicationSchema,
);
