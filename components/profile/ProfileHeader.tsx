import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { StatPill } from './StatPill';
import { MOCK_SOCIAL } from './constants';

interface ProfileHeaderProps {
  displayName: string;
  handle: string;
  bio: string;
  outfitsShared: number;
  likesReceived: number;
  pendingRequestsCount: number;
  onEditBio: () => void;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
  onRequestsPress: () => void;
}

export function ProfileHeader({
  displayName,
  handle,
  bio,
  outfitsShared,
  likesReceived,
  pendingRequestsCount,
  onEditBio,
  onFollowersPress,
  onFollowingPress,
  onRequestsPress,
}: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#FFF" />
        </View>
        <TouchableOpacity style={styles.avatarEditBtn} onPress={() => {}}>
          <Ionicons name="camera-outline" size={14} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Name + handle */}
      <View style={styles.nameRow}>
        <Text style={styles.nameText}>{displayName}</Text>
      </View>
      <Text style={styles.handleText}>@{handle}</Text>

      {/* Bio */}
      <TouchableOpacity style={styles.bioRow} onPress={onEditBio}>
        <Text style={styles.bioText} numberOfLines={2}>{bio || 'Add a bio…'}</Text>
        <Ionicons name="pencil-outline" size={13} color={Colors.textMuted} style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {/* Social stats */}
      <View style={styles.socialStats}>
        <StatPill value={outfitsShared} label="Outfits" />
        <View style={styles.statDivider} />
        <StatPill value={MOCK_SOCIAL.followers_count} label="Followers" onPress={onFollowersPress} />
        <View style={styles.statDivider} />
        <StatPill value={MOCK_SOCIAL.following_count} label="Following" onPress={onFollowingPress} />
        <View style={styles.statDivider} />
        <StatPill value={likesReceived} label="Likes" />
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editProfileBtn} onPress={onEditBio}>
          <Text style={styles.editProfileText}>EDIT PROFILE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.requestsBtn} onPress={onRequestsPress}>
          <Ionicons name="people-outline" size={16} color={Colors.textPrimary} />
          {pendingRequestsCount > 0 && (
            <View style={styles.requestBadge}>
              <Text style={styles.requestBadgeText}>{pendingRequestsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  avatarWrap: { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 84, height: 84,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  avatarEditBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  nameText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.3 },
  handleText: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 3, letterSpacing: 0.3 },
  bioRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.md },
  bioText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, flexShrink: 1 },
  socialStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, width: '100%' },
  editProfileBtn: {
    flex: 1, height: 40, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.textPrimary, borderRadius: BorderRadius.full,
  },
  editProfileText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textPrimary, letterSpacing: 0.5 },
  requestsBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full, position: 'relative',
  },
  requestBadge: {
    position: 'absolute', top: -6, right: -6,
    width: 18, height: 18, borderRadius: BorderRadius.full,
    backgroundColor: Colors.error,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFF',
  },
  requestBadgeText: { fontSize: 9, fontWeight: FontWeight.bold, color: '#FFF' },
});
