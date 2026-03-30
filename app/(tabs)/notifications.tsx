/**
 * Notifications Screen — lists follow & like notifications
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import { api } from '../../services/api/index';
import { useAppStore } from '../../store/useAppStore';
import type { Notification } from '../../types';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  new_follower: 'person-add',
  follow_request: 'person-add-outline',
  outfit_liked: 'heart',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { userId, notifications, unreadCount, setNotifications, markAllRead, markRead } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.notification.list(userId);
      const mapped: Notification[] = res.notifications.map((n) => ({
        notification_id: n.id,
        user_id: userId,
        type: n.type as Notification['type'],
        actor_id: n.actor_id ?? '',
        actor_name: n.actor_name ?? '',
        outfit_id: n.outfit_id ?? undefined,
        content: n.content,
        is_read: n.is_read,
        created_at: n.created_at ?? new Date().toISOString(),
      }));
      setNotifications(mapped, res.unread_count);
    } catch {
      // silently fail
    }
  }, [userId, setNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    markAllRead();
    try { await api.notification.markAllRead(userId); } catch { /* */ }
  };

  const handlePress = async (item: Notification) => {
    if (!item.is_read && userId) {
      markRead(item.notification_id);
      try { await api.notification.markRead(userId, item.notification_id); } catch { /* */ }
    }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.row, !item.is_read && styles.rowUnread]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.type === 'outfit_liked' ? '#FDECEA' : '#E8F0FE' }]}>
        <Ionicons
          name={ICON_MAP[item.type] ?? 'notifications'}
          size={18}
          color={item.type === 'outfit_liked' ? '#D32F2F' : Colors.accent}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
        <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
      </View>
      {!item.is_read && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar title="Notifications" hideNotifications hideFavorites hideCart />

      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.notification_id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} colors={[Colors.accent]} />
        }
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>NO NOTIFICATIONS</Text>
            <Text style={styles.emptyDesc}>When someone follows you or likes your outfit, it will show up here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  markAllBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  markAllText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowUnread: {
    backgroundColor: Colors.surfaceLight,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { flex: 1 },
  content: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },

  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  emptyDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
