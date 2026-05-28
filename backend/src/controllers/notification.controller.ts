import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { notificationService } from '../services/notification.service.js';
import type { AuthRequest } from '../types/express.js';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const unreadOnly = req.query.unreadOnly === 'true';

  const { notifications, total, unreadCount } = await notificationService.getByUser(
    req.user!.id,
    { page, limit, unreadOnly },
  );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Notifications retrieved',
    data: notifications,
    meta: { total, unreadCount, page, limit },
  });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationService.markAsRead(req.params.id as string, req.user!.id);

  res.status(200).json(
    ApiResponse.message('Notification marked as read'),
  );
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const count = await notificationService.markAllAsRead(req.user!.id);

  res.status(200).json(
    ApiResponse.success({ markedCount: count }, 'All notifications marked as read'),
  );
});

export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationService.delete(req.params.id as string, req.user!.id);

  res.status(200).json(
    ApiResponse.message('Notification deleted'),
  );
});

export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.id);

  res.status(200).json(
    ApiResponse.success({ unreadCount: count }, 'Unread count retrieved'),
  );
});
