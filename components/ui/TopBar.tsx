/**
 * TopBar — Persistent top navigation bar
 *
 * Used across all main tab screens.
 * Left: Page title (editorial uppercase)
 * Right: Favorites · Cart · Profile — persistent quick-access icons
 *
 * Design principles:
 *  - ASOS-style: white bg, black icons, minimal chrome
 *  - Badge counts on Cart/Favorites when non-zero
 *  - Square icon buttons — consistent with the app's sharp aesthetic
 *  - No gradient, no shadow overdose — single 1px bottom border
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

interface TopBarProps {
  /** Main screen title — shown on the left */
  title: string;
  /** Optional subtitle under the title */
  subtitle?: string;
  /** Badge count for Favorites icon */
  favoriteCount?: number;
  /** Badge count for Cart icon */
  cartCount?: number;
  /** Badge count for Notification bell */
  notificationCount?: number;
  /** Hide one or more action icons */
  hideProfile?: boolean;
  hideFavorites?: boolean;
  hideCart?: boolean;
  hideNotifications?: boolean;
}

export function TopBar({
  title,
  subtitle,
  favoriteCount = 0,
  cartCount = 0,
  notificationCount = 0,
  hideProfile = false,
  hideFavorites = false,
  hideCart = false,
  hideNotifications = false,
}: TopBarProps) {
  const router = useRouter();
  const storeUnreadCount = useAppStore((s) => s.unreadCount);
  const effectiveNotificationCount = notificationCount || storeUnreadCount;

  return (
    <View style={styles.container}>
      {/* ── Left: Title block ── */}
      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {/* ── Right: Action icons ── */}
      <View style={styles.actions}>
        {!hideNotifications && (
          <ActionIcon
            icon="notifications-outline"
            badge={effectiveNotificationCount}
            onPress={() => router.push('/(tabs)/notifications' as any)}
            accessibilityLabel="Notifications"
          />
        )}
        {hideFavorites && (
          <ActionIcon
            icon="heart-outline"
            badge={favoriteCount}
            onPress={() => {/* TODO: favorites screen */}}
            accessibilityLabel="Favourites"
          />
        )}
        {hideCart && (
          <ActionIcon
            icon="bag-outline"
            badge={cartCount}
            onPress={() => {/* TODO: cart screen */}}
            accessibilityLabel="Cart"
          />
        )}
        {!hideProfile && (
          <ActionIcon
            icon="person-outline"
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityLabel="Profile"
          />
        )}
      </View>
    </View>
  );
}

/* ─── Small reusable icon button with optional badge ─── */
interface ActionIconProps {
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
  onPress: () => void;
  accessibilityLabel?: string;
}

function ActionIcon({ icon, badge = 0, onPress, accessibilityLabel }: ActionIconProps) {
  return (
    <TouchableOpacity
      style={styles.iconBtn}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={22} color={Colors.textPrimary} />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const TOP_PADDING = Platform.OS === 'ios' ? 52 : 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: TOP_PADDING,
    paddingBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  /* Title */
  titleBlock: { flex: 1, paddingRight: Spacing.md },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 1,
  },

  /* Actions */
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  /* Badge */
  badge: {
    position: 'absolute',
    top: 6,
    right: 5,
    minWidth: 14,
    height: 14,
    backgroundColor: Colors.accent,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#FFF',
    lineHeight: 14,
  },
});
