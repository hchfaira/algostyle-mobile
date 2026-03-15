/**
 * CapsuleScoreCard — Hero card showing capsule cohesion score at top of wardrobe.
 * Includes animated progress ring, grade badge, score breakdown bars, and tip.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  data: CapsuleScoreResponse | null;
  loading: boolean;
  onPressEvolution: () => void;
  onPressMissing: () => void;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  versatility: 'Versatility',
  colour_cohesion: 'Colour Mix',
  occasion_coverage: 'Occasions',
  season_balance: 'Seasons',
};

function GradeRing({ score, grade }: { score: number; grade: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [score]);

  const gradeColor =
    grade === 'S' || grade === 'A' ? Colors.success :
    grade === 'B' ? '#FF8800' :
    grade === 'C' ? Colors.accentWarm :
    Colors.error;

  return (
    <View style={styles.ringWrap}>
      {/* Outer circle (track) */}
      <View style={styles.ringTrack} />
      {/* Score number */}
      <View style={styles.ringCenter}>
        <Text style={[styles.scoreNum, { color: gradeColor }]}>{Math.round(score)}</Text>
        <Text style={styles.scoreUnit}>/100</Text>
      </View>
      {/* Grade badge */}
      <View style={[styles.gradeBadge, { borderColor: gradeColor }]}>
        <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
      </View>
    </View>
  );
}

export default function CapsuleScoreCard({ data, loading, onPressEvolution, onPressMissing }: Props) {
  const cardScale = useSharedValue(0.97);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (!loading && data) {
      cardOpacity.value = withTiming(1, { duration: 400 });
      cardScale.value = withSpring(1, { damping: 14 });
    }
  }, [loading, data]);

  const animatedCard = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (loading) {
    return (
      <View style={[styles.card, styles.skeleton]}>
        <View style={styles.skeletonRing} />
        <View style={styles.skeletonLines}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '60%' }]} />
          <View style={[styles.skeletonLine, { width: '80%' }]} />
        </View>
      </View>
    );
  }

  if (!data) return null;

  const breakdown = Object.entries(data.breakdown) as [string, number][];

  return (
    <Animated.View style={[animatedCard]}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>CAPSULE SCORE</Text>
            <Text style={styles.subtitle}>{data.total_items} items · {data.grade_label}</Text>
          </View>
          <TouchableOpacity style={styles.historyBtn} onPress={onPressEvolution} activeOpacity={0.75}>
            <Ionicons name="trending-up-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.historyLabel}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Main content: ring + breakdown */}
        <View style={styles.body}>
          <GradeRing score={data.score} grade={data.grade} />

          <View style={styles.breakdownCol}>
            {breakdown.map(([key, val]) => (
              <View key={key} style={styles.barRow}>
                <Text style={styles.barLabel}>{BREAKDOWN_LABELS[key] || key}</Text>
                <View style={styles.barTrack}>
                  <Animated.View
                    style={[styles.barFill, { width: `${val}%` as any }]}
                  />
                </View>
                <Text style={styles.barVal}>{Math.round(val)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tip */}
        {data.tip ? (
          <View style={styles.tipRow}>
            <Ionicons name="bulb-outline" size={14} color={Colors.accentWarm} />
            <Text style={styles.tipText}>{data.tip}</Text>
          </View>
        ) : null}

        {/* Opportunities */}
        {data.top_opportunities.length > 0 && (
          <View style={styles.oppsRow}>
            {data.top_opportunities.map((opp, i) => (
              <View key={i} style={styles.oppChip}>
                <Ionicons name="add" size={11} color={Colors.textSecondary} />
                <Text style={styles.oppLabel}>{opp.label}</Text>
                <Text style={styles.oppImpact}>{opp.impact}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA buttons */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaBtnPrimary} onPress={onPressMissing} activeOpacity={0.8}>
            <Ionicons name="add-circle-outline" size={15} color="#FFF" />
            <Text style={styles.ctaBtnTextPrimary}>Missing Pieces</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaBtnSecondary} onPress={onPressEvolution} activeOpacity={0.8}>
            <Ionicons name="analytics-outline" size={15} color={Colors.textPrimary} />
            <Text style={styles.ctaBtnTextSecondary}>My Journey</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  skeleton: { minHeight: 160 },
  skeletonRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.border, alignSelf: 'flex-start' },
  skeletonLines: { flex: 1, gap: Spacing.sm, paddingTop: Spacing.sm },
  skeletonLine: { height: 10, backgroundColor: Colors.border, width: '90%' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  title: { fontSize: FontSize.xs, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 2, textTransform: 'uppercase' },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: Colors.border },
  historyLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },

  body: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.md },

  ringWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringTrack: { width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: Colors.border, position: 'absolute' },
  ringCenter: { alignItems: 'center' },
  scoreNum: { fontSize: FontSize.xl, fontWeight: FontWeight.black, lineHeight: 28 },
  scoreUnit: { fontSize: 9, color: Colors.textMuted, fontWeight: FontWeight.medium },
  gradeBadge: { position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: 11, borderWidth: 2, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 10, fontWeight: FontWeight.black },

  breakdownCol: { flex: 1, gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { width: 68, fontSize: 10, color: Colors.textMuted, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: 0.3 },
  barTrack: { flex: 1, height: 3, backgroundColor: Colors.border, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.accent },
  barVal: { width: 24, fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.bold, textAlign: 'right' },

  tipRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', backgroundColor: Colors.accentWarm + '12', padding: Spacing.sm, marginBottom: Spacing.sm },
  tipText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },

  oppsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  oppChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  oppLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  oppImpact: { fontSize: 9, color: Colors.success, fontWeight: FontWeight.bold, marginLeft: 2 },

  ctaRow: { flexDirection: 'row', gap: Spacing.sm },
  ctaBtnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.accent, paddingVertical: 10 },
  ctaBtnPrimaryText: { color: '#FFF', fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 1, textTransform: 'uppercase' },
  ctaBtnTextPrimary: { color: '#FFF', fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 1, textTransform: 'uppercase' },
  ctaBtnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, paddingVertical: 10, backgroundColor: Colors.surface },
  ctaBtnSecondaryText: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, textTransform: 'uppercase' },
  ctaBtnTextSecondary: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, textTransform: 'uppercase' },
});
