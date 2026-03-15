/**
 * CapsuleEvolutionChart — Timeline view of capsule score progress.
 * Shows score over time with trend indicator and improvement delta.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import type { CapsuleEvolutionResponse, EvolutionSnapshot } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - Spacing.lg * 2 - Spacing.md * 2;
const CHART_H = 120;

interface Props {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  data: CapsuleEvolutionResponse | null;
}

function BarChart({ snapshots }: { snapshots: EvolutionSnapshot[] }) {
  if (!snapshots.length) return null;
  const maxScore = Math.max(...snapshots.map((s) => s.score), 100);
  const barW = Math.floor((CHART_W - (snapshots.length - 1) * 4) / snapshots.length);

  return (
    <View style={{ width: CHART_W, height: CHART_H, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
      {snapshots.map((snap, i) => {
        const barH = Math.max(8, (snap.score / maxScore) * CHART_H);
        const isLast = i === snapshots.length - 1;
        return (
          <View key={i} style={{ alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: barW,
                height: barH,
                backgroundColor: isLast ? Colors.accent : Colors.border,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
              }}
            />
            {i % 2 === 0 && (
              <Text style={{ fontSize: 8, color: Colors.textMuted }}>
                {snap.days_ago === 0 ? 'now' : `-${snap.days_ago}d`}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving') return <Ionicons name="trending-up" size={18} color={Colors.success} />;
  if (trend === 'declining') return <Ionicons name="trending-down" size={18} color={Colors.error} />;
  return <Ionicons name="remove" size={18} color={Colors.textMuted} />;
}

export default function CapsuleEvolutionChart({ visible, onClose, loading, data }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>MY CAPSULE JOURNEY</Text>
              <Text style={styles.subtitle}>Score evolution over time</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>Loading your journey...</Text>
            </View>
          ) : data ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Trend summary row */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryVal}>{data.current_score}</Text>
                  <Text style={styles.summaryLabel}>Current</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <View style={styles.trendRow}>
                    <TrendIcon trend={data.trend} />
                    <Text style={[
                      styles.summaryVal,
                      { color: data.improvement > 0 ? Colors.success : data.improvement < 0 ? Colors.error : Colors.textMuted }
                    ]}>
                      {data.improvement > 0 ? '+' : ''}{data.improvement}
                    </Text>
                  </View>
                  <Text style={styles.summaryLabel}>{data.period_days}d change</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[
                    styles.summaryVal,
                    { color: data.trend === 'improving' ? Colors.success : data.trend === 'declining' ? Colors.error : Colors.textMuted }
                  ]}>
                    {data.trend.toUpperCase()}
                  </Text>
                  <Text style={styles.summaryLabel}>Trend</Text>
                </View>
              </View>

              {/* Bar chart */}
              <View style={styles.chartWrap}>
                <BarChart snapshots={data.snapshots} />
              </View>

              {/* Snapshot list */}
              <Text style={styles.listTitle}>TIMELINE</Text>
              {[...data.snapshots].reverse().map((snap, i) => (
                <View key={i} style={styles.snapRow}>
                  <View style={[styles.snapDot, { backgroundColor: snap.days_ago === 0 ? Colors.accent : Colors.border }]} />
                  <View style={styles.snapInfo}>
                    <Text style={styles.snapDate}>
                      {snap.days_ago === 0 ? 'Today' : `${snap.days_ago} days ago`}
                    </Text>
                    <Text style={styles.snapItems}>{snap.items_count} items</Text>
                  </View>
                  <Text style={[styles.snapScore, snap.days_ago === 0 && styles.snapScoreActive]}>
                    {snap.score}
                  </Text>
                </View>
              ))}

              <View style={{ height: 20 }} />
            </ScrollView>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, marginBottom: 4, letterSpacing: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
  loading: { paddingVertical: 60, alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.sm },

  summaryRow: { flexDirection: 'row', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, gap: 4 },
  summaryDivider: { width: 1, backgroundColor: Colors.border },
  summaryVal: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary },
  summaryLabel: { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  chartWrap: {
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },

  listTitle: { fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: Spacing.sm },
  snapRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  snapDot: { width: 8, height: 8, borderRadius: 4 },
  snapInfo: { flex: 1 },
  snapDate: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  snapItems: { fontSize: FontSize.xs, color: Colors.textMuted },
  snapScore: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textSecondary },
  snapScoreActive: { color: Colors.accent, fontSize: FontSize.lg },
});
