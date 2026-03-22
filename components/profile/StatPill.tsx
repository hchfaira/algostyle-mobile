import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight } from '../../constants/theme';

interface StatPillProps {
  value: number | string;
  label: string;
  onPress?: () => void;
}

export function StatPill({ value, label, onPress }: StatPillProps) {
  return (
    <TouchableOpacity style={styles.statPill} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  statPill: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
});
