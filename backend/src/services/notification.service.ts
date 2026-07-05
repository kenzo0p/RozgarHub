import { Notification, INotification } from '../models/notification.model.js';
import type { NotificationType } from '../utils/constants.js';
import { Types } from 'mongoose';
import logger from '../utils/logger.js';

/**
 * Notification Service — manages in-app notifications.
 *
 * Notifications are created by event handlers (decoupled from the emitter)
 * and read by the notification controller (API endpoints).
 */
export class NotificationService {
  /**
   * Create a notification for a user.
   */
  async create(params: {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedEntity?: { kind: 'Job' | 'Application' | 'Company' | 'User'; id: string };
  }): Promise<INotification> {
    const notification = await Notification.create({
      recipient: new Types.ObjectId(params.recipientId),
      type: params.type,
      title: params.title,
      message: params.message,
      relatedEntity: params.relatedEntity
        ? { kind: params.relatedEntity.kind, id: new Types.ObjectId(params.relatedEntity.id) }
        : undefined,
    });

    logger.debug(`Notification created for user ${params.recipientId}: ${params.type}`);
    return notification;
  }

  /**
   * Get notifications for a user (newest first).
   */
  async getByUser(
    userId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const filter: Record<string, unknown> = { recipient: userId };
    if (unreadOnly) filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Notification.countDocuments(filter).exec(),
      Notification.countDocuments({ recipient: userId, isRead: false }).exec(),
    ]);

    return { notifications: notifications as unknown as INotification[], total, unreadCount };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.updateOne(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
    ).exec();
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() },
    ).exec();
    return result.modifiedCount;
  }

  /**
   * Delete a notification (user can dismiss).
   */
  async delete(notificationId: string, userId: string): Promise<boolean> {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId,
    }).exec();
    return result.deletedCount > 0;
  }

  /**
   * Get unread count for badge display.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ recipient: userId, isRead: false }).exec();
  }
}

export const notificationService = new NotificationService();
