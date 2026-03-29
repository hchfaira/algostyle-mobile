import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import type { FollowUserSummary } from '../../services/api/social';

interface FollowListSheetProps {
  mode: 'followers' | 'following' | null;
  users: FollowUserSummary[];
  total: number;
  following: Set<string>;
  onToggleFollow: (id: string) => void;
  onClose: () => void;
}

export function FollowListSheet({ mode, users, total, following, onToggleFollow, onClose }: FollowListSheetProps) {
  return (
    <Modal visible={!!mode} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {mode === 'followers' ? 'FOLLOWERS' : 'FOLLOWING'}{' '}
              <Text style={{ color: Colors.textMuted, fontWeight: FontWeight.regular }}>
                {total}
              </Text>
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                {mode === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </Text>
            </View>
          ) : (
            users.map((u) => (
              <View key={u.user_id} style={styles.requestRow}>
                <View style={styles.personAvatar}>
                  <Ionicons name="person" size={18} color="#FFF" />
                </View>
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{u.name}</Text>
                  <Text style={styles.personHandle}>{u.handle}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.followBtn, following.has(u.user_id) && styles.followBtnActive]}
                  onPress={() => onToggleFollow(u.user_id)}
                >
                  <Text style={[styles.followBtnText, following.has(u.user_id) && styles.followBtnTextActive]}>
                    {following.has(u.user_id) ? 'FOLLOWING' : 'FOLLOW'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 32 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    maxHeight: '75%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  sheetTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 2 },
  requestRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  personAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  personInfo: { flex: 1 },
  personName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  personHandle: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  followBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.textPrimary,
  },
  followBtnActive: { backgroundColor: Colors.textPrimary },
  followBtnText: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase' },
  followBtnTextActive: { color: '#FFF' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
