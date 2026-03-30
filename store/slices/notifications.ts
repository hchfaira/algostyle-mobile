/**
 * Notifications state slice
 */
import type { Notification } from '../../types';

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;

  setNotifications: (list: Notification[], unread: number) => void;
  setUnreadCount: (count: number) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;
}

export const createNotificationsSlice = (set: any): NotificationsState => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (list, unread) =>
    set({ notifications: list, unreadCount: unread }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  markAllRead: () =>
    set((s: any) => ({
      unreadCount: 0,
      notifications: s.notifications.map((n: Notification) => ({ ...n, is_read: true })),
    })),

  markRead: (id) =>
    set((s: any) => ({
      unreadCount: Math.max(0, s.unreadCount - (s.notifications.find((n: Notification) => n.notification_id === id && !n.is_read) ? 1 : 0)),
      notifications: s.notifications.map((n: Notification) =>
        n.notification_id === id ? { ...n, is_read: true } : n,
      ),
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
});
