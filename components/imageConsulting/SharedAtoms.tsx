/**
 * Shared UI atoms for Style DNA dashboard
 * Quiet luxury — nude palette, black text, animated
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Spacing, FontSize, FontWeight, BorderRadius, Shadow, Colors } from '../../constants/theme';
import { colorHex } from './constants';

const BLACK    = '#1A1A1A';
const ESPRESSO = '#3B2A1A';
const GRAY     = '#7A7068';
const NUDE_BG  = '#FAF7F4';
const NUDE_ALT = '#F5F0EB';
const NUDE_BDR = '#E8DDD5';
const WHITE    = '#FFFFFF';

// ─── Quiet luxury section accents (warm tones, all harmonious) ───
export const SECTION_COLORS = {
  identity : '#8C7B6E',   // warm taupe
  palette  : '#B5907A',   // terracotta-nude
  body     : '#7A8C7E',   // sage
  face     : '#9C8C7A',   // warm stone
  skin     : '#A89080',   // dusty blush
  sizing   : '#7A8A8C',   // slate-sage
  summary  : '#8C7A5E',   // warm camel
};

// ─── Dashboard section card ──────────────────────────────────
export function DashSection({
  title, accent = BLACK, icon, children, style,
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
          <View style={[styles.iconBadge, { backgroundColor: accent + '18' }]}>
            <Ionicons name={icon as any} size={16} color={accent} />
          </View>
        )}
        <Text style={[styles.cardTitle, { color: accent }]}>{title.toUpperCase()}</Text>
        <View style={[styles.accentLine, { backgroundColor: accent }]} />
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
      entering={ZoomIn.delay(index * 50).springify().damping(12)}
      style={{ alignItems: 'center', gap: 5 }}
    >
      <View
        style={[
          styles.orb,
          {
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: hex,
            borderColor: isLight ? NUDE_BDR : hex,
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
    variant === 'avoid' ? '#F5E8E8' :
    variant === 'good'  ? '#E8EDE8' :
    accent ? accent + '18' :
    NUDE_ALT;
  const tc =
    variant === 'avoid' ? '#8B3A3A' :
    variant === 'good'  ? '#4A6B4A' :
    accent ? accent : ESPRESSO;
  const bc =
    variant === 'avoid' ? '#C4909040' :
    variant === 'good'  ? '#A0B8A040' :
    accent ? accent + '40' :
    NUDE_BDR;
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
      <View style={[styles.divider, accent ? { backgroundColor: accent + '30' } : null]} />
    </View>
  );
}

// ─── Metric cell ─────────────────────────────────────────────
export function MetricCell({
  value, label, accent = BLACK, last = false,
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
  label, value, accent = BLACK, index = 0,
}: {
  label: string; value: string; accent?: string; index?: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(300)}
      style={styles.attrRow}
    >
      <Text style={styles.attrLabel}>{label}</Text>
      <View style={[styles.attrValueBadge, { backgroundColor: accent + '15', borderColor: accent + '30' }]}>
        <Text style={[styles.attrValue, { color: accent }]}>{value}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Group label ─────────────────────────────────────────────
export function GroupLabel({ text, accent = GRAY }: { text: string; accent?: string }) {
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
    backgroundColor: WHITE,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: NUDE_BDR,
    shadowColor: ESPRESSO,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  iconBadge: {
    width: 34, height: 34,
    borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 2.5,
  },
  accentLine: {
    flex: 1, height: 1,
    borderRadius: 1,
    opacity: 0.3,
    marginLeft: Spacing.xs,
  },

  // Orbs
  orb: { alignItems: 'center', justifyContent: 'center' },
  orbShadow: {
    shadowColor: ESPRESSO,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  strikeH: { height: 1.5, backgroundColor: ESPRESSO, position: 'absolute', opacity: 0.5 },
  orbLabel: {
    fontSize: 9, color: GRAY,
    textTransform: 'capitalize',
    maxWidth: 52, textAlign: 'center',
    lineHeight: 12,
  },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 11, paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },

  // Tips
  tipRow: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'flex-start' },
  tipDot: { width: 4, height: 4, borderRadius: 2, marginTop: 8 },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: ESPRESSO,
    lineHeight: 20,
    fontWeight: FontWeight.regular,
  },

  // Divider
  dividerWrap: { marginVertical: Spacing.sm },
  divider: { height: 1, backgroundColor: NUDE_BDR },

  // Metric cells
  metricCell: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, gap: 4 },
  metricCellBorder: { borderRightWidth: 1, borderRightColor: NUDE_BDR },
  metricValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    letterSpacing: 1.2,
    color: GRAY,
    textTransform: 'uppercase',
  },

  // Attr rows
  attrRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: NUDE_BDR,
  },
  attrLabel: {
    fontSize: FontSize.sm,
    color: GRAY,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.1,
  },
  attrValueBadge: {
    borderRadius: BorderRadius.full, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  attrValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
    letterSpacing: 0.1,
  },

  // Group label
  groupLabel: {
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
});
