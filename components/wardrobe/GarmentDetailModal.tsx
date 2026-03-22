/**
 * GarmentDetailModal — Full-screen overlay shown when tapping a garment.
 * Shows AI analysis: versatility score, compatibility, seasons, impact, and tips.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { CATEGORY_ICONS } from './constants';
import type { GarmentItem, GarmentAnalysis } from '../../types';

interface Props {
  visible: boolean;
  item: GarmentItem | null;
  analysis: GarmentAnalysis | null;
  loading: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  /** When true the Delete action is hidden (e.g. opened from an outfit view) */
  hideDelete?: boolean;
  /** When true both Delete and Favourite actions are hidden */
  readOnly?: boolean;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${value}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[barStyles.val, { color }]}>{Math.round(value)}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { width: 100, fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: 0.4 },
  track: { flex: 1, height: 5, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: BorderRadius.full },
  val: { width: 28, fontSize: FontSize.xs, fontWeight: FontWeight.bold, textAlign: 'right' },
});

export default function GarmentDetailModal({
  visible,
  item,
  analysis,
  loading,
  onClose,
  onDelete,
  onToggleFavorite,
  hideDelete = false,
  readOnly = false,
}: Props) {
  if (!item) return null;

  const cat = item.attributes.category;
  const icon = CATEGORY_ICONS[cat] || 'cube-outline';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.springify().damping(16)}
          style={styles.sheet}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />

            {/* Garment hero */}
            <View style={styles.hero}>
              <View style={[styles.swatch, { backgroundColor: item.attributes.color_hex || '#F0F0F0' }]}>
                <Ionicons name={icon as any} size={36} color="rgba(255,255,255,0.7)" />
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.heroName}>
                  {item.attributes.subcategory || item.attributes.category}
                </Text>
                <Text style={styles.heroMeta}>
                  {item.attributes.color_primary} · {item.attributes.pattern}
                </Text>
                <Text style={styles.heroMeta}>{item.attributes.formality} · {item.attributes.material}</Text>
                <View style={styles.heroTagRow}>
                  {item.attributes.seasons.map((s) => (
                    <View key={s} style={styles.seasonChip}>
                      <Text style={styles.seasonChipText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.heroActions}>
                {!readOnly && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onToggleFavorite(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.is_favorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={item.is_favorite ? Colors.error : Colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
                {!readOnly && !hideDelete && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => { onDelete(item.id); onClose(); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* AI Analysis section */}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>AI ANALYSIS</Text>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={Colors.accent} />
                <Text style={styles.loadingText}>Analysing garment...</Text>
              </View>
            ) : analysis ? (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.analysisScroll}>
                {/* Verdict banner */}
                <View style={[styles.verdictBanner, { borderLeftColor: analysis.verdict_color }]}>
                  <View style={[styles.verdictDot, { backgroundColor: analysis.verdict_color }]} />
                  <View>
                    <Text style={[styles.verdictLabel, { color: analysis.verdict_color }]}>
                      {analysis.verdict}
                    </Text>
                    <Text style={styles.verdictSub}>
                      Unlocks ~{analysis.outfit_count} outfit{analysis.outfit_count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                {/* Score bars */}
                <View style={styles.barsWrap}>
                  <ScoreBar label="Versatility" value={analysis.versatility_score} color={Colors.accent} />
                  <ScoreBar label="Compatibility" value={analysis.compatibility_score} color="#0770CF" />
                  <ScoreBar label="Overall Impact" value={analysis.impact_score} color={analysis.verdict_color} />
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                  {[
                    { icon: 'calendar-outline', label: 'Seasons', val: `${analysis.season_count}/4` },
                    { icon: 'repeat-outline', label: 'Worn', val: `${analysis.times_worn}×` },
                    { icon: 'color-palette-outline', label: 'Neutral', val: analysis.is_neutral ? 'Yes' : 'No' },
                  ].map((s) => (
                    <View key={s.label} style={styles.statItem}>
                      <Ionicons name={s.icon as any} size={16} color={Colors.textMuted} />
                      <Text style={styles.statVal}>{s.val}</Text>
                      <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Tags */}
                {analysis.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {analysis.tags.map((t) => (
                      <View key={t} style={styles.tag}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={{ height: 24 }} />
              </ScrollView>
            ) : (
              <View style={styles.loadingWrap}>
                <Text style={styles.loadingText}>Analysis unavailable.</Text>
              </View>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 36,
    maxHeight: '88%',
    borderTopLeftRadius: BorderRadius.xl + 4,
    borderTopRightRadius: BorderRadius.xl + 4,
  },
  handle: { width: 40, height: 4, borderRadius: BorderRadius.full, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },

  hero: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md },
  swatch: { width: 76, height: 92, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1, gap: 5 },
  heroName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 0.3 },
  heroMeta: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'capitalize', lineHeight: 16 },
  heroTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  seasonChip: { paddingHorizontal: 10, paddingVertical: 3, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  seasonChipText: { fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroActions: { gap: Spacing.sm },
  actionBtn: { width: 38, height: 38, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceLight },

  divider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md, borderRadius: 1 },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, letterSpacing: 2, marginBottom: Spacing.md },

  loadingWrap: { paddingVertical: 36, alignItems: 'center', gap: Spacing.sm },
  loadingText: { fontSize: FontSize.sm, color: Colors.textMuted },

  analysisScroll: { maxHeight: 320 },
  verdictBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderLeftWidth: 3, borderRadius: BorderRadius.md, paddingLeft: Spacing.md, paddingVertical: 12, backgroundColor: Colors.surfaceLight, marginBottom: Spacing.md },
  verdictDot: { width: 10, height: 10, borderRadius: BorderRadius.full },
  verdictLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 1 },
  verdictSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  barsWrap: { gap: 12, marginBottom: Spacing.md },

  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border, paddingVertical: Spacing.md + 2, marginBottom: Spacing.md, borderRadius: BorderRadius.sm },
  statItem: { flex: 1, alignItems: 'center', gap: 5 },
  statVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceLight },
  tagText: { fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },

  closeBtn: { backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, marginTop: Spacing.md, borderRadius: BorderRadius.full },
  closeBtnText: { color: '#FFF', fontSize: FontSize.sm, fontWeight: FontWeight.bold, letterSpacing: 1.5 },
});
