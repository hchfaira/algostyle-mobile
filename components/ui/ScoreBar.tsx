/**
 * Score bar / gauge component — ASOS-style: monochrome, clean
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface ScoreBarProps {
  label: string;
  value: number; // 0-1
  color?: string;
  showPercentage?: boolean;
}

export function ScoreBar({
  label,
  value,
  color = Colors.accent,
  showPercentage = true,
}: ScoreBarProps) {
  const pct = Math.round(value * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showPercentage && <Text style={styles.value}>{pct}%</Text>}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
