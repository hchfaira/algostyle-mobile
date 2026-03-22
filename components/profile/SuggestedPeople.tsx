import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { MOCK_SUGGESTIONS } from './constants';

interface SuggestedPeopleProps {
  following: Set<string>;
  onToggleFollow: (id: string) => void;
}

export function SuggestedPeople({ following, onToggleFollow }: SuggestedPeopleProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>SUGGESTED FOR YOU</Text>
      {MOCK_SUGGESTIONS.map((u) => (
        <View key={u.id} style={styles.personRow}>
          <View style={styles.personAvatar}>
            <Ionicons name="person" size={18} color="#FFF" />
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{u.name}</Text>
            <Text style={styles.personHandle}>
              {u.handle} · {u.mutuals} mutual{u.mutuals !== 1 ? 's' : ''}
            </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: 11, fontWeight: FontWeight.semibold, color: Colors.textSecondary,
    letterSpacing: 0.3, marginBottom: Spacing.md,
  },
  personRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  personAvatar: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  personInfo: { flex: 1 },
  personName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  personHandle: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  followBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.textPrimary,
    borderRadius: BorderRadius.full,
  },
  followBtnActive: { backgroundColor: Colors.textPrimary },
  followBtnText: { fontSize: 11, fontWeight: FontWeight.semibold, color: Colors.textPrimary, letterSpacing: 0.3 },
  followBtnTextActive: { color: '#FFF' },
});
