/**
 * Hook that polls the notification unread count periodically
 */
import { useEffect, useRef } from 'react';
import { api } from '../services/api/index';
import { useAppStore } from '../store/useAppStore';

const POLL_INTERVAL = 30_000; // 30 seconds

export function useNotificationPoller() {
  const userId = useAppStore((s) => s.userId);
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const poll = async () => {
      try {
        const res = await api.notification.unreadCount(userId);
        setUnreadCount(res.unread_count);
      } catch {
        // silently fail
      }
    };

    poll(); // immediate first fetch
    intervalRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, setUnreadCount]);
}
