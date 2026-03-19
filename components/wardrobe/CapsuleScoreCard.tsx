/**
 * CapsuleScoreCard — Compact summary strip showing capsule cohesion score.
 * Keeps all data + actions but in a tight, scannable layout that doesn't
 * dominate the page — leaving room for the Smart Action carousel below.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import type { CapsuleScoreResponse } from '../../types';

interface Props {
  data: CapsuleScoreResponse | null;
  loading: boolean;
  onPressEvolution: () => void;
  onPressMissing: () => void;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  versatility:        'Versatility',
  colour_cohesion:    'Colour',
  occasion_coverage:  'Occasions',
  season_balance:     'Seasons',
};

const RING = 64;

function GradeRing({ score, grade }: { score: number; grade: string }) {
  const gradeColor =
    grade === 'S' || grade === 'A' ? Colors.success :
    grade === 'B' ? '#FF8800' :
    grade === 'C' ? Colors.accentWarm :
    Colors.error;

  return (
    <View style={styles.ringWrap}>
      <View style={styles.ringTrack} />
      <View style={styles.ringCenter}>
        <Text style={[styles.scoreNum, { color: gradeColor }]}>{Math.round(score)}</Text>
        <Text style={styles.scoreUnit}>/100</Text>
      </View>
      <View style={[styles.gradeBadge, { borderColor: gradeColor }]}>
        <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
      </View>
    </View>
  );
}

export default function CapsuleScoreCard({ data, loading, onPressEvolution, onPressMissing }: Props) {
  const cardOpacity = useSharedValue(0);
  const cardScale   = useSharedValue(0.98);

  useEffect(() => {
    if (!loading && data) {
      cardOpacity.value = withTiming(1, { duration: 350 });
      cardScale.value   = withSpring(1, { damping: 14 });
    }
  }, [loading, data]);

  const animatedCard = useAnimatedStyle(() => ({
    opacity:   cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (loading) {
    return (
      <View style={[styles.card, styles.skeleton]}>
        <View style={styles.skeletonRing} />
        <View style={styles.skeletonLines}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '55%' }]} />
          <View style={[styles.skeletonLine, { width: '75%' }]} />
        </View>
      </View>
    );
  }

  if (!data) return null;

  const breakdown = Object.entries(data.breakdown) as [string, number][];

  return (
    <Animated.View style={animatedCard}>
      <View style={styles.card}>

        {/* ── Top row: ring · breakdown bars · CTA buttons ── */}
        <View style={styles.topRow}>

          {/* Score ring */}
          <GradeRing score={data.score} grade={data.grade} />

          {/* Breakdown bars — compact, 2-column feel */}
          <View style={styles.breakdownCol}>
            {breakdown.map(([key, val]) => (
              <View key={key} style={styles.barRow}>
                <Text style={styles.barLabel}>{BREAKDOWN_LABELS[key] || key}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${val}%` as any }]} />
                </View>
                <Text style={styles.barVal}>{Math.round(val)}</Text>
              </View>
            ))}
          </View>

          {/* CTA buttons — vertical stack on the right */}
          <View style={styles.ctaStack}>
            <TouchableOpacity style={styles.ctaPrimary} onPress={onPressMissing} activeOpacity={0.8}
              accessibilityLabel="See missing pieces">
              <Ionicons name="add-circle-outline" size={13} color="#FFF" />
              <Text style={styles.ctaPrimaryLabel}>Missing{'\n'}Pieces</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaSecondary} onPress={onPressEvolution} activeOpacity={0.8}
              accessibilityLabel="View my capsule journey">
              <Ionicons name="analytics-outline" size={13} color={Colors.textPrimary} />
              <Text style={styles.ctaSecondaryLabel}>My{'\n'}Journey</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Meta row: item count · grade label · tip (1 line) ── */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {data.total_items} items · {data.grade_label}
          </Text>
          {data.tip ? (
            <>
              <View style={styles.metaDot} />
              <Ionicons name="bulb-outline" size={11} color={Colors.accentWarm} />
              <Text style={styles.metaTip} numberOfLines={1}>{data.tip}</Text>
            </>
          ) : null}
        </View>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ── Card shell ───────────────────────────────────────────────────────
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom:     Spacing.sm,
    backgroundColor:  Colors.surface,
    borderWidth:      1,
    borderColor:      Colors.border,
    borderRadius:     BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm + 2,
    ...Shadow.md,
  },
  skeleton:     { minHeight: 80, flexDirection: 'row', gap: Spacing.md },
  skeletonRing: { width: RING, height: RING, borderRadius: RING / 2, backgroundColor: Colors.border },
  skeletonLines:{ flex: 1, gap: Spacing.sm, justifyContent: 'center' },
  skeletonLine: { height: 8, backgroundColor: Colors.border, borderRadius: 4, width: '90%' },

  // ── Top row: ring | bars | cta stack ────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
  },

  // ── Score ring ───────────────────────────────────────────────────────
  ringWrap:   { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  ringTrack:  { width: RING, height: RING, borderRadius: RING / 2, borderWidth: 4, borderColor: Colors.border, position: 'absolute' },
  ringCenter: { alignItems: 'center' },
  scoreNum:   { fontSize: FontSize.xl, fontWeight: FontWeight.black, lineHeight: 24 },
  scoreUnit:  { fontSize: 9, color: Colors.textMuted, fontWeight: FontWeight.medium },
  gradeBadge: {
    position:        'absolute',
    bottom:          -2,
    right:           -2,
    width:           20,
    height:          20,
    borderRadius:    10,
    borderWidth:     2,
    backgroundColor: Colors.surface,
    alignItems:      'center',
    justifyContent:  'center',
  },
  gradeText: { fontSize: 9, fontWeight: FontWeight.black },

  // ── Breakdown bars ───────────────────────────────────────────────────
  breakdownCol: { flex: 1, gap: 6 },
  barRow:       { flexDirection: 'row', alignItems: 'center', gap: 5 },
  barLabel:     { width: 66, fontSize: 10, color: Colors.textMuted, fontWeight: FontWeight.medium },
  barTrack:     { flex: 1, height: 3, backgroundColor: Colors.border, overflow: 'hidden', borderRadius: 2 },
  barFill:      { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  barVal:       { width: 22, fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.bold, textAlign: 'right' },

  // ── CTA vertical stack ───────────────────────────────────────────────
  ctaStack: { gap: Spacing.xs },
  ctaPrimary: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             4,
    backgroundColor: Colors.accent,
    paddingVertical:   7,
    paddingHorizontal: 8,
    borderRadius:    BorderRadius.sm,
    minWidth:        72,
  },
  ctaPrimaryLabel: {
    color:      '#FFF',
    fontSize:   9,
    fontWeight: FontWeight.black,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign:  'center',
    lineHeight: 12,
  },
  ctaSecondary: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             4,
    borderWidth:     1,
    borderColor:     Colors.accent,
    paddingVertical:   7,
    paddingHorizontal: 8,
    borderRadius:    BorderRadius.sm,
    backgroundColor: Colors.surface,
    minWidth:        72,
  },
  ctaSecondaryLabel: {
    color:      Colors.textPrimary,
    fontSize:   9,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign:  'center',
    lineHeight: 12,
  },

  // ── Meta / tip row ───────────────────────────────────────────────────
  metaRow: {
    flexDirection:  'row',
    alignItems:     'center',
    marginTop:      Spacing.sm,
    gap:            5,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop:     Spacing.xs + 2,
  },
  metaText: {
    fontSize:   10,
    color:      Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  metaDot: {
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 2,
  },
  metaTip: {
    flex:       1,
    fontSize:   10,
    color:      Colors.textSecondary,
    fontWeight: FontWeight.medium,
    lineHeight: 14,
  },

  // ── Legacy style names kept so nothing outside breaks ────────────────
  header:              {},
  title:               {},
  subtitle:            {},
  historyBtn:          {},
  historyLabel:        {},
  body:                {},
  tipRow:              {},
  tipText:             {},
  oppsRow:             {},
  oppChip:             {},
  oppLabel:            {},
  oppImpact:           {},
  ctaRow:              {},
  ctaBtnPrimary:       {},
  ctaBtnTextPrimary:   {},
  ctaBtnPrimaryText:   {},
  ctaBtnSecondary:     {},
  ctaBtnTextSecondary: {},
  ctaBtnSecondaryText: {},
});
