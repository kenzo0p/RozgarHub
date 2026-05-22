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
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'],
        message: 'Status must be pending, accepted, or rejected',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
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
