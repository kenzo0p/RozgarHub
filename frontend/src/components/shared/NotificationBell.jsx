import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import useNotifications from "../../hooks/useNotifications";

/**
 * NotificationBell — bell icon with unread count badge.
 *
 * Shows a red dot/count when there are unread notifications.
 * Pulse animation on the badge draws attention to new notifications.
 */
function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9 rounded-full"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Button>
  );
}

export default NotificationBell;
