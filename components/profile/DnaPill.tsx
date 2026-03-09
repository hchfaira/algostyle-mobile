import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';

interface DnaPillProps {
  label: string;
  value: string;
}

export function DnaPill({ label, value }: DnaPillProps) {
  return (
    <View style={styles.dnaPill}>
      <Text style={styles.dnaPillLabel}>{label}</Text>
      <Text style={styles.dnaPillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dnaPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  dnaPillLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dnaPillValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
});
