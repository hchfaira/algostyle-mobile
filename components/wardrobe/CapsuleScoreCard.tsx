/**
 * CapsuleScoreCard — Animated compact score card.
 *
 * Layout (single card, two rows):
 *   Row 1: [Animated ring] [Animated breakdown bars] [CTA stack]
 *   Row 2: meta strip — item count · grade label · tip (1 line)
 *
 * Animations:
 *   • Card slides up + fades in on mount
 *   • Score ring bounces in
 *   • Each bar fills from 0 → value with staggered colour delay
 *   • CTA buttons fade + slide up slightly after the bars
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import type { CapsuleScoreResponse } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────
const RING = 80;

const BREAKDOWN_LABELS: Record<string, string> = {
  versatility:       'Versatility',
  colour_cohesion:   'Colour',
  occasion_coverage: 'Occasions',
  season_balance:    'Seasons',
};

const BAR_COLORS: Record<string, string> = {
  versatility:       '#2D2D2D',  // Black
  colour_cohesion:   '#8B7355',  // Warm espresso
  occasion_coverage: '#A89E94',  // Soft taupe
  season_balance:    '#C9B8A8',  // Warm cashmere
};

interface Props {
  data: CapsuleScoreResponse | null;
  loading: boolean;
  onPressEvolution: () => void;
  onPressMissing: () => void;
}

// ─── Animated bar fill ────────────────────────────────────────────────────────
function AnimatedBar({ value, color, delay }: { value: number; color: string; delay: number }) {
  const widthPct = useSharedValue(0);

  useEffect(() => {
    widthPct.value = withDelay(
      delay,
      withTiming(value, { duration: 800, easing: Easing.out(Easing.cubic) }),
    );
  }, [value]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%` as any,
    backgroundColor: color,
  }));

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, barStyle]} />
    </View>
  );
}

// ─── Grade ring with bounce ───────────────────────────────────────────────────
function GradeRing({ score, grade }: { score: number; grade: string }) {
  const ringScale   = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0);

  // Quiet luxury tones — warm nudes and soft neutrals
  const gradeColor =
    grade === 'S' || grade === 'A' ? '#2D2D2D' :  // black for excellent
    grade === 'B' ? '#6E6358' :                    // walnut for good
    grade === 'C' ? '#A89E94' :                    // taupe for average
    '#999999';                                     // grey for poor

  useEffect(() => {
    ringOpacity.value = withTiming(1, { duration: 400 });
    ringScale.value   = withSequence(
      withSpring(1.08, { damping: 10, stiffness: 200 }),
      withSpring(1.0, { damping: 16, stiffness: 300 }),
    );
  }, [score]);

  const ringAnim = useAnimatedStyle(() => ({
    opacity:   ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <Animated.View style={[styles.ringWrap, ringAnim]}>
      {/* Outer soft halo */}
      <View style={[styles.ringTrack, { borderColor: gradeColor + '18' }]} />
      {/* Inner accent arc */}
      <View style={[styles.ringInner, { borderColor: gradeColor + '40' }]} />
      <View style={styles.ringCenter}>
        <Text style={[styles.scoreNum, { color: gradeColor }]}>{Math.round(score)}</Text>
        <Text style={[styles.scoreUnit, { color: gradeColor + 'AA' }]}>/100</Text>
      </View>
      <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
        <Text style={styles.gradeText}>{grade}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────
export default function CapsuleScoreCard({ data, loading, onPressEvolution, onPressMissing }: Props) {
  const cardOpacity    = useSharedValue(0);
  const cardTranslateY = useSharedValue(14);
  const ctaOpacity     = useSharedValue(0);
  const ctaTranslateY  = useSharedValue(10);

  useEffect(() => {
    if (!loading && data) {
      const easing = Easing.out(Easing.cubic);
      cardOpacity.value    = withTiming(1, { duration: 380, easing });
      cardTranslateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      ctaOpacity.value     = withDelay(320, withTiming(1, { duration: 320, easing }));
      ctaTranslateY.value  = withDelay(320, withSpring(0, { damping: 16, stiffness: 240 }));
    }
  }, [loading, data]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity:   cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const ctaAnim = useAnimatedStyle(() => ({
    opacity:   ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  // ── Skeleton ──
  if (loading) {
    return (
      <View style={styles.cardWrap}>
        <View style={[styles.card, styles.skeleton]}>
          <View style={styles.skeletonRing} />
          <View style={styles.skeletonLines}>
            {[1, 0.65, 0.85, 0.72].map((w, i) => (
              <View key={i} style={[styles.skeletonLine, { width: `${w * 100}%` as any }]} />
            ))}
          </View>
          <View style={styles.skeletonCta}>
            <View style={[styles.skeletonLine, { width: 72, height: 30, borderRadius: BorderRadius.md }]} />
            <View style={[styles.skeletonLine, { width: 72, height: 30, borderRadius: BorderRadius.md }]} />
          </View>
        </View>
      </View>
    );
  }

  if (!data) return null;

  const breakdown = Object.entries(data.breakdown) as [string, number][];

  return (
    <Animated.View style={[styles.cardWrap, cardAnim]}>
      <View style={styles.card}>

        {/* ── Row 1: ring · bars · CTAs ── */}
        <View style={styles.topRow}>

          {/* Bouncing grade ring */}
          <GradeRing score={data.score} grade={data.grade} />

          {/* Staggered animated bars */}
          <View style={styles.breakdownCol}>
            {breakdown.map(([key, val], i) => (
              <View key={key} style={styles.barRow}>
                <Text style={styles.barLabel}>{BREAKDOWN_LABELS[key] || key}</Text>
                <AnimatedBar
                  value={val}
                  color={BAR_COLORS[key] || Colors.accent}
                  delay={160 + i * 90}
                />
                <Text style={styles.barVal}>{Math.round(val)}</Text>
              </View>
            ))}
          </View>

          {/* CTA buttons — slide up after bars */}
          <Animated.View style={[styles.ctaStack, ctaAnim]}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={onPressMissing}
              activeOpacity={0.8}
              accessibilityLabel="See missing pieces"
            >
              <Ionicons name="sparkles-outline" size={14} color="#FFF" />
              <Text style={styles.ctaPrimaryLabel}>{'Missing\nPieces'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaSecondary}
              onPress={onPressEvolution}
              activeOpacity={0.8}
              accessibilityLabel="View my capsule journey"
            >
              <Ionicons name="trending-up-outline" size={14} color={Colors.textPrimary} />
              <Text style={styles.ctaSecondaryLabel}>{'My\nJourney'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ── Row 2: meta strip ── */}
        <View style={styles.metaRow}>
          <Text style={styles.metaCount}>{data.total_items} items</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaGrade}>{data.grade_label}</Text>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Wrapper + card ───────────────────────────────────────────────────
  cardWrap: {
    marginHorizontal: Spacing.lg,
    marginTop:        Spacing.md,
    marginBottom:     Spacing.lg,
  },
  card: {
    backgroundColor:   Colors.surface,
    borderWidth:       1,
    borderColor:       Colors.border,
    borderRadius:      BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop:        Spacing.lg + 2,
    paddingBottom:     Spacing.md,
    ...Shadow.md,
  },

  // ── Skeleton ─────────────────────────────────────────────────────────
  skeleton: {
    flexDirection: 'row',
    gap:           Spacing.md,
    minHeight:     100,
    alignItems:    'center',
  },
  skeletonRing:  { width: RING, height: RING, borderRadius: RING / 2, backgroundColor: Colors.border },
  skeletonLines: { flex: 1, gap: 10 },
  skeletonLine:  { height: 8, backgroundColor: Colors.border, borderRadius: BorderRadius.full },
  skeletonCta:   { gap: Spacing.sm },

  // ── Top row ───────────────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           Spacing.lg,
  },

  // ── Score ring ────────────────────────────────────────────────────────
  ringWrap: {
    width:          RING,
    height:         RING,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },
  ringTrack: {
    position:     'absolute',
    width:        RING,
    height:       RING,
    borderRadius: RING / 2,
    borderWidth:  6,
    shadowColor:  '#B8A799',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  ringInner: {
    position:     'absolute',
    width:        RING - 14,
    height:       RING - 14,
    borderRadius: (RING - 14) / 2,
    borderWidth:  1.5,
    opacity:      0.35,
  },
  ringCenter: { alignItems: 'center', gap: 1 },
  scoreNum: {
    fontSize:      FontSize.xxl,
    fontWeight:    FontWeight.black,
    lineHeight:    34,
    letterSpacing: -0.8,
    color:         Colors.textPrimary,
  },
  scoreUnit: {
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.semibold,
    lineHeight: 15,
    color:      Colors.textMuted,
    letterSpacing: 0.5,
  },
  gradeBadge: {
    position:       'absolute',
    bottom:         -3,
    right:          -3,
    width:          26,
    height:         26,
    borderRadius:   BorderRadius.full,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    2,
    borderColor:    Colors.surface,
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 2 },
    shadowOpacity:  0.10,
    shadowRadius:   4,
    elevation:      3,
  },
  gradeText: {
    fontSize:   11,
    fontWeight: FontWeight.black,
    color:      '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Breakdown bars ────────────────────────────────────────────────────
  breakdownCol: { flex: 1, gap: 14 },
  barRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  barLabel: {
    width:         70,
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.medium,
    color:         Colors.textSecondary,
    letterSpacing: 0.2,
  },
  barTrack: {
    flex:            1,
    height:          5,
    backgroundColor: Colors.surfaceLight,
    borderRadius:    BorderRadius.full,
    overflow:        'hidden',
  },
  barFill: {
    height:       '100%',
    borderRadius: BorderRadius.full,
  },
  barVal: {
    width:      28,
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.bold,
    color:      Colors.textPrimary,
    textAlign:  'right',
    letterSpacing: 0.1,
  },

  ctaStack: { gap: Spacing.sm, paddingLeft: Spacing.xs },
  ctaPrimary: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               5,
    backgroundColor:   Colors.accent,
    paddingVertical:   10,
    paddingHorizontal: Spacing.md,
    borderRadius:      BorderRadius.full,
    minWidth:          78,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.08,
    shadowRadius:      6,
    elevation:         2,
  },
  ctaPrimaryLabel: {
    color:         '#FFF',
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.bold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign:     'center',
    lineHeight:    14,
  },
  ctaSecondary: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               4,
    borderWidth:       1.5,
    borderColor:       Colors.border,
    paddingVertical:   9,
    paddingHorizontal: Spacing.sm,
    borderRadius:      BorderRadius.full,
    backgroundColor:   Colors.surface,
    minWidth:          74,
  },
  ctaSecondaryLabel: {
    color:         Colors.textPrimary,
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.bold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign:     'center',
    lineHeight:    13,
  },

  // ── Meta strip ────────────────────────────────────────────────────────
  metaRow: {
    flexDirection:  'row',
    alignItems:     'center',
    marginTop:      Spacing.md + 2,
    paddingTop:     Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap:            8,
  },
  metaCount: {
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.bold,
    color:         Colors.textPrimary,
    letterSpacing: 0.3,
  },
  metaGrade: {
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.medium,
    color:      Colors.textMuted,
    letterSpacing: 0.1,
  },
  metaDot: {
    width:           3,
    height:          3,
    borderRadius:    BorderRadius.full,
    backgroundColor: Colors.textMuted,
    opacity:         0.5,
  },
  metaTip: {
    flex:       1,
    fontSize:   FontSize.xs,
    color:      Colors.textSecondary,
    fontWeight: FontWeight.medium,
    lineHeight: 15,
  },

  // ── Legacy stubs ──────────────────────────────────────────────────────
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
  metaText:            {},
});
