import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Refresh Token Model
 *
 * Stores active refresh tokens in the database for:
 * 1. Token rotation — old tokens are invalidated when a new one is issued
 * 2. Device tracking — know which devices have active sessions
 * 3. Revocation — logout invalidates the specific refresh token
 * 4. Security — if a token is reused after rotation, all sessions are revoked
 *
 * The TTL index automatically deletes expired tokens (MongoDB handles cleanup).
 *
 * Interview note: This is the standard approach at companies like Auth0 and Okta.
 * Storing refresh tokens in the DB (vs. stateless JWTs) enables:
 * - Immediate revocation (logout everywhere)
 * - Token rotation (detect theft via reuse)
 * - Session management (list active devices)
 */

export interface IRefreshToken extends Document {
  _id: Types.ObjectId;
  token: string;
  userId: Types.ObjectId;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  isRevoked: boolean;
  replacedByToken?: string; // Points to the new token if this one was rotated
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    ipAddress: {
      type: String,
      default: 'unknown',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    replacedByToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// TTL index — MongoDB automatically deletes expired tokens
// This runs every 60 seconds by default
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for finding active tokens by user
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

export const RefreshToken = mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema,
);
