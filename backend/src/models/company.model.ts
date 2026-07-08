import mongoose, { Schema, Model } from 'mongoose';
import type { ICompany } from '../types/models.js';

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    website: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    // Business contact number shown to accepted applicants so they can
    // call/WhatsApp the employer. Kept separate from the owner's personal
    // login phone.
    contactPhone: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner user ID is required'],
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
companySchema.index({ userId: 1 });
companySchema.index({ name: 'text' });

export const Company: Model<ICompany> = mongoose.model<ICompany>('Company', companySchema);
