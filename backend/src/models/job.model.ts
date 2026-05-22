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
    position: {
      type: Number,
      required: [true, 'Number of positions is required'],
      min: [1, 'At least 1 position is required'],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
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
// Text index for full-text search across title and description
jobSchema.index({ title: 'text', description: 'text' });
// Compound indexes for filtered queries
jobSchema.index({ location: 1, jobType: 1 });
jobSchema.index({ created_By: 1, createdAt: -1 });
jobSchema.index({ salary: 1 });
jobSchema.index({ createdAt: -1 }); // Default sort order

export const Job: Model<IJob> = mongoose.model<IJob>('Job', jobSchema);
