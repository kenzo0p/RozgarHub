import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Saved Job Model
 *
 * Allows employees to bookmark jobs for later.
 * Compound unique index prevents duplicate saves.
 */

export interface ISavedJob extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  createdAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate saves — one bookmark per user per job
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Efficient lookup: "all saved jobs for user X, newest first"
savedJobSchema.index({ userId: 1, createdAt: -1 });

export const SavedJob = mongoose.model<ISavedJob>('SavedJob', savedJobSchema);
