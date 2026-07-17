import mongoose from 'mongoose';
import type { IJobTranslation } from '../types/models.js';

/**
 * Cached machine translation of a job's employer-typed content into one of
 * the app's languages. One document per (job, lang); `sourceHash` fingerprints
 * the English source so an edited job is re-translated instead of served stale.
 */
const jobTranslationSchema = new mongoose.Schema<IJobTranslation>(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    lang: {
      type: String,
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String },
    companyDescription: { type: String },
    sourceHash: { type: String, required: true },
  },
  { timestamps: true },
);

jobTranslationSchema.index({ job: 1, lang: 1 }, { unique: true });

export const JobTranslation = mongoose.model<IJobTranslation>(
  'JobTranslation',
  jobTranslationSchema,
);
