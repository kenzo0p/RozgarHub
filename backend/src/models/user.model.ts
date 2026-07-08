import mongoose, { Schema, Model } from 'mongoose';
import type { IUser } from '../types/models.js';

const userSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    // Optional: phone-only accounts (OTP signup) have no email. Sparse-unique
    // so multiple phone-only users without an email don't collide.
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    // Primary identifier for OTP login — unique across accounts.
    phoneNumber: {
      type: Number,
      required: [true, 'Phone number is required'],
      unique: true,
    },
    // Optional: phone-only accounts have no password (they log in by OTP).
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: {
        values: ['employee', 'employer'],
        message: 'Role must be either employee or employer',
      },
      required: [true, 'Role is required'],
    },
    profile: {
      bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
      skills: [{ type: String }],
      resume: { type: String },
      resumeOriginalName: { type: String },
      company: { type: Schema.Types.ObjectId, ref: 'Company' },
      profilePhoto: { type: String, default: '' },
    },
    // Password reset fields
    passwordResetToken: { type: String, default: undefined },
    passwordResetExpires: { type: Date, default: undefined },
  },
  {
    timestamps: true,
    toJSON: {
      // Strip sensitive fields when converting to JSON for API responses
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// email and username already have unique:true which creates indexes automatically.
// Additional indexes for common query patterns:
userSchema.index({ role: 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ fullname: 'text', 'profile.skills': 'text' });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
