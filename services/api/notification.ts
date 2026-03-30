/**
 * Notifications API endpoints
 */
import { BaseApiClient } from './base';

/** Shape returned by the backend NotificationItem schema */
export interface NotificationApiItem {
  id: string;
  type: string;
  actor_id: string | null;
  actor_name: string | null;
  outfit_id?: string | null;
  content: string;
  is_read: boolean;
  created_at: string | null;
}

export interface NotificationListResponse {
  notifications: NotificationApiItem[];
  total: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export class NotificationApiClient extends BaseApiClient {
  async list(userId: string, limit = 50, offset = 0): Promise<NotificationListResponse> {
    return this.request(
      `/api/v1/notifications?user_id=${encodeURIComponent(userId)}&limit=${limit}&offset=${offset}`,
    );
  }

  async unreadCount(userId: string): Promise<UnreadCountResponse> {
    return this.request(
      `/api/v1/notifications/unread-count?user_id=${encodeURIComponent(userId)}`,
    );
  }

  async markAllRead(userId: string): Promise<void> {
    return this.request(
      `/api/v1/notifications/mark-all-read?user_id=${encodeURIComponent(userId)}`,
      { method: 'POST' },
    );
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    return this.request(
      `/api/v1/notifications/${encodeURIComponent(notificationId)}/read?user_id=${encodeURIComponent(userId)}`,
      { method: 'POST' },
    );
  }
}
