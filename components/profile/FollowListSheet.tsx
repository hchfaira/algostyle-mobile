import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { MOCK_SOCIAL, MOCK_SUGGESTIONS } from './constants';

interface FollowListSheetProps {
  mode: 'followers' | 'following' | null;
  following: Set<string>;
  onToggleFollow: (id: string) => void;
  onClose: () => void;
}

export function FollowListSheet({ mode, following, onToggleFollow, onClose }: FollowListSheetProps) {
  return (
    <Modal visible={!!mode} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {mode === 'followers' ? 'FOLLOWERS' : 'FOLLOWING'}{' '}
              <Text style={{ color: Colors.textMuted, fontWeight: FontWeight.regular }}>
                {mode === 'followers' ? MOCK_SOCIAL.followers_count : MOCK_SOCIAL.following_count}
              </Text>
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          {MOCK_SUGGESTIONS.map((u) => (
            <View key={u.id} style={styles.requestRow}>
              <View style={styles.personAvatar}>
                <Ionicons name="person" size={18} color="#FFF" />
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{u.name}</Text>
                <Text style={styles.personHandle}>{u.handle}</Text>
              </View>
              <TouchableOpacity
                style={[styles.followBtn, following.has(u.id) && styles.followBtnActive]}
                onPress={() => onToggleFollow(u.id)}
              >
                <Text style={[styles.followBtnText, following.has(u.id) && styles.followBtnTextActive]}>
                  {following.has(u.id) ? 'FOLLOWING' : 'FOLLOW'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
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
});
