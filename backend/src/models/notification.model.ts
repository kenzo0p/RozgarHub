import mongoose, { Schema, Document, Types } from 'mongoose';
import type { NotificationType } from '../utils/constants.js';

/**
 * Notification Model
 *
 * Stores in-app notifications for users. Key design decisions:
 * - Separate from real-time delivery (Socket.io) — notifications persist even if user is offline
 * - TTL index deletes read notifications after 30 days (prevents unbounded growth)
 * - Polymorphic `relatedEntity` pattern allows linking to any resource type
 */

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity?: {
    kind: 'Job' | 'Application' | 'Company' | 'User';
    id: Types.ObjectId;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'application_received',
        'application_accepted',
        'application_rejected',
        'new_job_match',
        'system',
      ],
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    relatedEntity: {
      kind: {
        type: String,
        enum: ['Job', 'Application', 'Company', 'User'],
      },
      id: {
        type: Schema.Types.ObjectId,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Query for unread notifications by user (most common query)
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Auto-delete read notifications after 30 days
notificationSchema.index(
  { readAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { isRead: true } },
);

export const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema,
);
