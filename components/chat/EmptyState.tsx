import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { QUICK_PROMPTS } from './constants';

interface EmptyStateProps {
  onSend: (text: string) => void;
}

export function EmptyState({ onSend }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={48} color={Colors.textMuted} />
      <Text style={styles.emptyTitle}>ASK ME ANYTHING</Text>
      <Text style={styles.emptyDesc}>
        I can help with outfit ideas, style tips, colour matching, and more.
      </Text>

      <View style={styles.quickPrompts}>
        {QUICK_PROMPTS.map((prompt, i) => (
          <TouchableOpacity key={i} style={styles.quickPrompt} onPress={() => onSend(prompt)}>
            <Ionicons name="arrow-forward" size={14} color={Colors.textPrimary} />
            <Text style={styles.quickPromptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.textPrimary, marginTop: Spacing.md, letterSpacing: 2 },
  emptyDesc: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  quickPrompts: { width: '100%', gap: Spacing.sm },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  quickPromptText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, flex: 1 },
});
