/**
 * Chip / Tag component — ASOS-style: black selected, clean borders
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  size?: 'sm' | 'md';
}

export function Chip({ label, selected = false, onPress, color, size = 'md' }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        size === 'sm' && styles.chipSm,
        selected && styles.chipSelected,
        selected && color ? { backgroundColor: color, borderColor: color } : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          size === 'sm' && styles.labelSm,
          selected && styles.labelSelected,
          selected && color ? { color: '#FFF' } : null,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSm: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
  },
  chipSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  labelSm: {
    fontSize: FontSize.xs,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
});
