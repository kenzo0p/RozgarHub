import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../lib/api";

/**
 * useNotifications — fetch notifications and unread count.
 *
 * Only fetches when user is authenticated.
 * Polls every 60 seconds for new notifications.
 */
function useNotifications() {
  const { user } = useSelector((store) => store.auth);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications/unread-count");
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch {
      // Silently fail — notification count is not critical
    }
  }, [user]);

  const fetchNotifications = useCallback(async (page = 1) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/notifications?page=${page}&limit=20`);
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.meta.unreadCount);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch unread count on mount and poll every 60 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

export default useNotifications;
