import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

export function TypingIndicator() {
  return (
    <View style={styles.typing}>
      <View style={styles.avatar}>
        <Ionicons name="sparkles" size={14} color="#FFF" />
      </View>
      <View style={styles.typingDots}>
        <View style={styles.dot} />
        <View style={[styles.dot, { opacity: 0.6 }]} />
        <View style={[styles.dot, { opacity: 0.3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  typing: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 0,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
});
