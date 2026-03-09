import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';

interface SuggestionChipsProps {
  suggestions: string[];
  onSend: (text: string) => void;
}

export function SuggestionChips({ suggestions, onSend }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.suggestionsRow}>
      <FlatList
        data={suggestions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.suggestionChip} onPress={() => onSend(item)}>
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionsRow: { paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  suggestionText: { fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: FontWeight.semibold, letterSpacing: 0.5, textTransform: 'uppercase' },
});
