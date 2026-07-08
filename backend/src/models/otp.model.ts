import mongoose, { Schema, Model, Document, Types } from 'mongoose';

/**
 * One-time password for phone login.
 *
 * Stored in its own collection (not on the user) so the same flow works for
 * both existing users and brand-new signups — at request time there may be
 * no user yet. Only a hash of the code is stored, never the code itself.
 *
 * A TTL index on `expiresAt` lets MongoDB auto-delete expired OTPs.
 */
export interface IOtp extends Document {
  _id: Types.ObjectId;
  phoneNumber: number;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    phoneNumber: { type: Number, required: true, unique: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Auto-expire documents at expiresAt (MongoDB TTL monitor).
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp: Model<IOtp> = mongoose.model<IOtp>('Otp', otpSchema);
