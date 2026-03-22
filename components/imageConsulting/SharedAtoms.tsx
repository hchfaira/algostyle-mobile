/**
 * Shared UI atoms for Style DNA dashboard
 * Quiet luxury — black, white, nude palette with refined styling
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Spacing, FontSize, FontWeight, BorderRadius, Shadow, Colors } from '../../constants/theme';
import { colorHex } from './constants';

// ─── Refined nude accent colors (harmonious, muted) ───
export const SECTION_COLORS = {
  identity : '#C4B5A4',   // warm greige
  palette  : '#D4C4B0',   // soft taupe
  body     : '#B4A594',   // dusty nude
  face     : '#C4B0A4',   // warm beige
  skin     : '#D0C0B0',   // light sand
  sizing   : '#B4A4A0',   // muted stone
  summary  : '#C8B8A8',   // warm linen
};

// ─── Dashboard section card ──────────────────────────────────
export function DashSection({
  title, accent = Colors.textPrimary, icon, children, style,
}: {
  title: string;
  accent?: string;
  icon?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        {icon && (
          <View style={[styles.iconBadge, { backgroundColor: accent + '15' }]}>
            <Ionicons name={icon as any} size={18} color={accent} />
          </View>
        )}
        <Text style={[styles.cardTitle, { color: accent }]}>{title}</Text>
        <View style={[styles.accentLine, { backgroundColor: accent + '25' }]} />
      </View>
      {children}
    </View>
  );
}

// ─── Colour swatch circle ─────────────────────────────────────
export function ColorOrb({
  name, size = 40, strikethrough = false, index = 0,
}: {
  name: string; size?: number; strikethrough?: boolean; index?: number;
}) {
  const hex = colorHex(name);
  const isLight = ['#FFFFFF','#FFFFF0','#FFFDD0','#F8F8F0','#F8F8F8'].includes(hex);
  return (
    <Animated.View
      entering={ZoomIn.delay(index * 40).springify().damping(14)}
      style={{ alignItems: 'center', gap: 6 }}
    >
      <View
        style={[
          styles.orb,
          {
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: hex,
            borderColor: isLight ? Colors.border : hex,
            borderWidth: isLight ? 1.5 : 0,
            opacity: strikethrough ? 0.35 : 1,
          },
          !strikethrough && styles.orbShadow,
        ]}
      >
        {strikethrough && (
          <View style={[styles.strikeH, { width: size * 0.75 }]} />
        )}
      </View>
      <Text style={styles.orbLabel} numberOfLines={1}>
        {name.replace(/_/g, ' ')}
      </Text>
    </Animated.View>
  );
}

// ─── Small pill chip ─────────────────────────────────────────
export function Chip({
  label, variant = 'default', accent,
}: {
  label: string; variant?: 'default' | 'avoid' | 'good'; accent?: string;
}) {
  const bg =
    variant === 'avoid' ? Colors.surfaceLight :
    variant === 'good'  ? '#F8FAF8' :
    accent ? accent + '12' :
    Colors.surfaceLight;
  const tc =
    variant === 'avoid' ? Colors.error :
    variant === 'good'  ? Colors.success :
    accent ? accent : Colors.textPrimary;
  const bc =
    variant === 'avoid' ? Colors.error + '30' :
    variant === 'good'  ? Colors.success + '30' :
    accent ? accent + '25' :
    Colors.border;
  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: bc }]}>
      <Text style={[styles.chipText, { color: tc }]} numberOfLines={1}>
        {label.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

// ─── Check tip row ───────────────────────────────────────────
export function TipRow({ tip, accent = SECTION_COLORS.body }: { tip: string; accent?: string }) {
  return (
    <View style={styles.tipRow}>
      <View style={[styles.tipDot, { backgroundColor: accent }]} />
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────
export function Divider({ accent }: { accent?: string }) {
  return (
    <View style={styles.dividerWrap}>
      <View style={[styles.divider, accent ? { backgroundColor: accent + '20' } : null]} />
    </View>
  );
}

// ─── Metric cell ─────────────────────────────────────────────
export function MetricCell({
  value, label, accent = Colors.textPrimary, last = false,
}: {
  value: string | number; label: string; accent?: string; last?: boolean;
}) {
  return (
    <View style={[styles.metricCell, !last && styles.metricCellBorder]}>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

// ─── Attribute row ───────────────────────────────────────────
export function AttrRow({
  label, value, accent = Colors.textPrimary, index = 0,
}: {
  label: string; value: string; accent?: string; index?: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={styles.attrRow}
    >
      <Text style={styles.attrLabel}>{label}</Text>
      <View style={[styles.attrValueBadge, { backgroundColor: accent + '12', borderColor: accent + '25' }]}>
        <Text style={[styles.attrValue, { color: accent }]}>{value}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Group label ─────────────────────────────────────────────
export function GroupLabel({ text, accent = Colors.textSecondary }: { text: string; accent?: string }) {
  return (
    <Text style={[styles.groupLabel, { color: accent }]}>{text}</Text>
  );
}

// ─── Legacy aliases (back-compat) ────────────────────────────
export function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return <DashSection title={title} icon={icon}>{children}</DashSection>;
}
export function ColorChip({ name }: { name: string }) {
  return <ColorOrb name={name} size={32} />;
}
export function PillList({ items, color }: { items: string[]; color?: string }) {
  return (
    <View style={styles.chipRow}>
      {items.map((item, i) => (
        <Chip key={i} label={item} variant={color === '#FDEAEA' ? 'avoid' : 'default'} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  iconBadge: {
    width: 36, height: 36,
    borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },
  accentLine: {
    flex: 1, height: 1,
    borderRadius: 1,
    marginLeft: Spacing.xs,
  },

  // Orbs
  orb: { alignItems: 'center', justifyContent: 'center' },
  orbShadow: {
    shadowColor: '#B8A799',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  strikeH: { height: 1.5, backgroundColor: Colors.textMuted, position: 'absolute', opacity: 0.5 },
  orbLabel: {
    fontSize: 9, color: Colors.textMuted,
    textTransform: 'capitalize',
    maxWidth: 54, textAlign: 'center',
    lineHeight: 12,
    fontWeight: FontWeight.medium,
  },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },

  // Tips
  tipRow: { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'flex-start' },
  tipDot: { width: 5, height: 5, borderRadius: BorderRadius.full, marginTop: 7 },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 21,
    fontWeight: FontWeight.regular,
  },

  // Divider
  dividerWrap: { marginVertical: Spacing.md },
  divider: { height: 1, backgroundColor: Colors.border },

  // Metric cells
  metricCell: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, gap: 5 },
  metricCellBorder: { borderRightWidth: 1, borderRightColor: Colors.border },
  metricValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
    color: Colors.textMuted,
  },

  // Attr rows
  attrRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  attrLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.1,
  },
  attrValueBadge: {
    borderRadius: BorderRadius.full, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  attrValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
    letterSpacing: 0.1,
  },

  // Group label
  groupLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
});
