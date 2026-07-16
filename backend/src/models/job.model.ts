import mongoose, { Schema, Model } from 'mongoose';
import type { IJob } from '../types/models.js';

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    requirements: {
      type: String,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    // Wage period for the salary amount. Blue-collar work is paid daily,
    // hourly, or per-job far more often than annually — 'yearly' is kept
    // only for backward compatibility with legacy LPA data.
    wageType: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'fixed'],
      default: 'monthly',
    },
    // GeoJSON point [longitude, latitude] for proximity ("jobs near me")
    // search. Derived from the location string when the job is created.
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
    },
    experienceLevel: {
      type: Number,
      required: [true, 'Experience level is required'],
      min: [0, 'Experience cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      trim: true,
    },
    // Optional: a credential the worker must hold to apply (e.g. a driver job
    // requires a driving licence). Enforced in application.service.applyToJob.
    requiredCredential: {
      type: String,
      enum: ['driving_license', 'certificate'],
    },
    position: {
      type: Number,
      required: [true, 'Number of positions is required'],
      min: [1, 'At least 1 position is required'],
    },
    // Optional: business jobs are posted under a company; individual jobs
    // (someone hiring a driver for their own car) have no company and show the
    // poster's own name instead.
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    created_By: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Application',
      },
    ],
    // Trust: set true once a job accrues enough worker reports. Flagged jobs
    // are hidden from public listings pending review.
    flagged: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
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
// Text index for full-text search across title and description
jobSchema.index({ title: 'text', description: 'text' });
// Compound indexes for filtered queries
jobSchema.index({ location: 1, jobType: 1 });
jobSchema.index({ created_By: 1, createdAt: -1 });
jobSchema.index({ salary: 1 });
jobSchema.index({ createdAt: -1 }); // Default sort order
jobSchema.index({ geo: '2dsphere' }); // Proximity search

export const Job: Model<IJob> = mongoose.model<IJob>('Job', jobSchema);
