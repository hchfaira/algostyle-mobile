/**
 * Card component — ASOS-style: minimal, clean, light
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadow } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'accent';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'accent' && styles.accent,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    backgroundColor: Colors.surface,
    borderWidth: 0,
    ...Shadow.md,
  },
  accent: {
    backgroundColor: Colors.surface,
    borderColor: Colors.accent,
    borderWidth: 1,
  },
});
