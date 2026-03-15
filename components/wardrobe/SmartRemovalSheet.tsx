/**
 * SmartRemovalSheet — Enhanced smart declutter bottom-sheet.
 * Shows garments to consider removing with risk scores, reasons, and removal profiles.
 */
import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { CATEGORY_ICONS } from './constants';
import type { SmartRemovalResponse } from '../../types';

type Profile = 'minimalist' | 'balanced' | 'generous';

const PROFILE_INFO: Record<Profile, { label: string; desc: string; icon: string }> = {
  minimalist: { label: 'Minimalist', desc: '≤20 pieces', icon: 'leaf-outline' },
  balanced: { label: 'Balanced', desc: '≤35 pieces', icon: 'layers-outline' },
  generous: { label: 'Generous', desc: '≤50 pieces', icon: 'grid-outline' },
};

interface Props {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  data: SmartRemovalResponse | null;
  activeProfile: Profile;
  onChangeProfile: (p: Profile) => void;
}

function RiskBar({ score }: { score: number }) {
  const color = score >= 70 ? Colors.error : score >= 40 ? Colors.accentWarm : Colors.textMuted;
  return (
    <View style={riskStyles.wrap}>
      <View style={riskStyles.track}>
        <View style={[riskStyles.fill, { width: `${score}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[riskStyles.num, { color }]}>{score}%</Text>
    </View>
  );
}

const riskStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  track: { flex: 1, height: 3, backgroundColor: Colors.border, overflow: 'hidden' },
  fill: { height: '100%' },
  num: { width: 34, fontSize: 10, fontWeight: FontWeight.black },
});

function ImpactChip({ impact }: { impact: string }) {
  const cfg = {
    safe: { text: 'SAFE TO REMOVE', color: Colors.success },
    low: { text: 'LOW IMPACT', color: Colors.accentWarm },
    medium: { text: 'MEDIUM IMPACT', color: Colors.error },
    high: { text: 'HIGH IMPACT', color: Colors.error },
  } as Record<string, { text: string; color: string }>;
  const c = cfg[impact] || cfg.low;
  return (
    <View style={[impactStyles.chip, { borderColor: c.color + '50' }]}>
      <Text style={[impactStyles.text, { color: c.color }]}>{c.text}</Text>
    </View>
  );
}

const impactStyles = StyleSheet.create({
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  text: { fontSize: 9, fontWeight: FontWeight.black, letterSpacing: 0.5 },
});

export default function SmartRemovalSheet({
  visible,
  onClose,
  loading,
  data,
  activeProfile,
  onChangeProfile,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SMART REMOVAL</Text>
              <Text style={styles.subtitle}>Identify low-impact pieces</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Profile selector */}
          <View style={styles.profileRow}>
            {(Object.keys(PROFILE_INFO) as Profile[]).map((p) => {
              const isActive = p === activeProfile;
              const info = PROFILE_INFO[p];
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.profileBtn, isActive && styles.profileBtnActive]}
                  onPress={() => onChangeProfile(p)}
                  activeOpacity={0.75}
                >
                  <Ionicons name={info.icon as any} size={14} color={isActive ? Colors.textOnAccent : Colors.textMuted} />
                  <Text style={[styles.profileBtnLabel, isActive && styles.profileBtnLabelActive]}>
                    {info.label}
                  </Text>
                  <Text style={[styles.profileBtnDesc, isActive && { color: 'rgba(255,255,255,0.7)' }]}>
                    {info.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>Analysing your wardrobe...</Text>
            </View>
          ) : data ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Summary bar */}
              <View style={styles.summaryBar}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNum}>{data.current_count}</Text>
                  <Text style={styles.summaryLabel}>Current</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNum, { color: Colors.success }]}>{data.target_count}</Text>
                  <Text style={styles.summaryLabel}>Target</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNum, { color: Colors.error }]}>{data.total_candidates}</Text>
                  <Text style={styles.summaryLabel}>To review</Text>
                </View>
              </View>

              {data.summary ? (
                <View style={styles.insightBanner}>
                  <Ionicons name="information-circle-outline" size={14} color={Colors.info} />
                  <Text style={styles.insightText}>{data.summary}</Text>
                </View>
              ) : null}

              {data.candidates.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons name="checkmark-circle-outline" size={40} color={Colors.success} />
                  <Text style={styles.emptyTitle}>All good!</Text>
                  <Text style={styles.emptyDesc}>No low-impact items found with this profile.</Text>
                </View>
              ) : (
                data.candidates.map((c, i) => {
                  const g = c.garment;
                  const cat = g.attributes.category as string;
                  const icon = CATEGORY_ICONS[cat] || 'cube-outline';
                  const isExpanded = expandedId === g.id;
                  return (
                    <View key={g.id} style={styles.candidateCard}>
                      <TouchableOpacity
                        style={styles.cardHeader}
                        activeOpacity={0.8}
                        onPress={() => setExpandedId(isExpanded ? null : g.id)}
                      >
                        {/* Rank */}
                        <Text style={styles.rank}>#{i + 1}</Text>

                        {/* Swatch */}
                        <View style={[styles.swatch, { backgroundColor: g.attributes.color_hex || '#333' }]}>
                          <Ionicons name={icon as any} size={18} color="rgba(255,255,255,0.7)" />
                        </View>

                        {/* Info */}
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {g.attributes.subcategory || g.attributes.category}
                          </Text>
                          <RiskBar score={c.risk_score} />
                          <ImpactChip impact={c.removal_impact} />
                        </View>

                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={Colors.textMuted}
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.expanded}>
                          {/* Reasons */}
                          <Text style={styles.subLabel}>WHY FLAGGED</Text>
                          {c.reasons.map((r, ri) => (
                            <Text key={ri} style={styles.reason}>· {r}</Text>
                          ))}

                          {/* Outfit count */}
                          <Text style={styles.outfitCount}>
                            Removing loses {c.outfit_count} outfit combination{c.outfit_count !== 1 ? 's' : ''}
                          </Text>

                          {/* Restyle ideas */}
                          {c.restyle_ideas.length > 0 && (
                            <>
                              <Text style={styles.subLabel}>RESTYLE IDEAS</Text>
                              {c.restyle_ideas.map((idea, ri) => (
                                <Text key={ri} style={styles.idea}>· {idea}</Text>
                              ))}
                            </>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              )}

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
    maxHeight: '88%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, marginBottom: 4, letterSpacing: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
  loading: { paddingVertical: 60, alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.sm },

  profileRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  profileBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, gap: 2,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceLight,
  },
  profileBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  profileBtnLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  profileBtnLabelActive: { color: Colors.textOnAccent },
  profileBtnDesc: { fontSize: 9, color: Colors.textMuted },

  summaryBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  summaryItem: { alignItems: 'center', gap: 2 },
  summaryNum: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary },
  summaryLabel: { fontSize: 9, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryDivider: { flex: 1 },

  insightBanner: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.info + '10', borderLeftWidth: 3, borderLeftColor: Colors.info,
    padding: Spacing.sm, marginBottom: Spacing.md,
  },
  insightText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },

  empty: { alignItems: 'center', paddingVertical: 48, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },

  candidateCard: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  rank: { width: 20, fontSize: FontSize.xs, fontWeight: FontWeight.black, color: Colors.textMuted, textAlign: 'center' },
  swatch: { width: 44, height: 52, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },

  expanded: { paddingBottom: Spacing.md, paddingLeft: 72, gap: Spacing.sm },
  subLabel: { fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  reason: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  outfitCount: { fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: 'italic' },
  idea: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
});
