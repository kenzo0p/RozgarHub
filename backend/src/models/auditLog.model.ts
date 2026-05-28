import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Audit Log Model
 *
 * Immutable log of all mutating operations for:
 * - Compliance & security auditing
 * - Debugging production issues ("what changed and when?")
 * - User activity tracking
 *
 * Design: Append-only — logs are never updated or deleted.
 * In production, you'd ship these to an external system (ELK, DataDog)
 * and set a TTL to control storage costs.
 *
 * Interview note: Audit logging is a compliance requirement at FAANG companies.
 * GDPR, SOC2, and HIPAA all require tracking who accessed/modified what data.
 */

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  actor: Types.ObjectId;
  action: string;        // e.g., 'CREATE', 'UPDATE', 'DELETE'
  resource: string;      // e.g., 'Job', 'Application', 'User'
  resourceId: string;
  changes?: Record<string, unknown>;
  metadata: {
    ip: string;
    userAgent: string;
    method: string;
    path: string;
  };
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET'],
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
      default: '',
    },
    changes: {
      type: Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      ip: { type: String, default: 'unknown' },
      userAgent: { type: String, default: 'unknown' },
      method: { type: String, default: '' },
      path: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

// Query patterns: "all actions by user X" and "all actions on resource Y"
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });

// Auto-delete after 90 days (configurable for compliance needs)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
