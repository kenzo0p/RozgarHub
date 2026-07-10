import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import type { UserRole } from '../types/models.js';

/**
 * A review left after a real engagement (an accepted application). Both
 * directions are supported: a worker rates the employer they worked for, and
 * an employer rates the worker they hired. Reputation is the currency of
 * repeat blue-collar hiring, so this is tied to a specific application to keep
 * it honest — you can only review someone you were actually matched with, once.
 */
export interface IReview extends Document {
  _id: Types.ObjectId;
  rater: Types.ObjectId; // who wrote the review
  ratee: Types.ObjectId; // who is being reviewed
  job: Types.ObjectId;
  application: Types.ObjectId;
  raterRole: UserRole; // 'employee' rating an employer, or vice versa
  rating: number; // 1–5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    rater: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ratee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    raterRole: {
      type: String,
      enum: ['employee', 'employer'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: { type: String, maxlength: [1000, 'Comment cannot exceed 1000 characters'], trim: true },
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

// One review per rater per engagement — a party rates the other side once.
reviewSchema.index({ application: 1, rater: 1 }, { unique: true });
// "reviews received by user X, newest first"
reviewSchema.index({ ratee: 1, createdAt: -1 });

export const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);
