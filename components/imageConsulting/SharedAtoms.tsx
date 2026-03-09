/**
 * Shared UI atoms for Image Consulting cards
 * ColorChip, SectionCard, PillList, TipRow
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { colorHex } from './constants';

// ─── Small swatch chip ───
export function ColorChip({ name }: { name: string }) {
  const hex = colorHex(name);
  const isLight = hex === '#FFFFFF' || hex === '#FFFFF0' || hex === '#FFFDD0';
  return (
    <View style={[styles.colorChip, { backgroundColor: hex, borderColor: isLight ? Colors.border : 'transparent' }]}>
      <Text style={[styles.colorChipText, { color: isLight ? Colors.textPrimary : '#FFF' }]} numberOfLines={1}>
        {name.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

// ─── Section card ───
export function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon as any} size={18} color={Colors.accent} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Pill list ───
export function PillList({ items, color }: { items: string[]; color?: string }) {
  return (
    <View style={styles.pillRow}>
      {items.map((item, i) => (
        <View key={i} style={[styles.pill, color ? { backgroundColor: color } : null]}>
          <Text style={styles.pillText}>{item.replace(/_/g, ' ')}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Tip row ───
export function TipRow({ tip }: { tip: string }) {
  return (
    <View style={styles.tipRow}>
      <Ionicons name="checkmark-circle" size={14} color={Colors.success} style={{ marginTop: 2 }} />
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 8,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  // Colour swatches
  colorChip: {
    borderRadius: BorderRadius.sm, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, maxWidth: 110,
  },
  colorChipText: { fontSize: 10, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  pill: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  pillText: { fontSize: FontSize.xs, color: Colors.textPrimary, textTransform: 'capitalize' },

  // Tips
  tipRow: { flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'flex-start' },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
