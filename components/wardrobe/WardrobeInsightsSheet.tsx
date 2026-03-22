/**
 * WardrobeInsightsSheet
 * ─────────────────────
 * Full-screen bottom sheet showing all 5 wardrobe intelligence features:
 *   1. Capsule Gap Analysis
 *   2. Cost-Per-Wear Rankings
 *   3. Duplicate Detection
 *   4. Occasion Coverage Heatmap
 *   5. Versatility Ranking
 *
 * Opened from the Smart Action Carousel tile "Insights".
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import type {
  WardrobeInsightsResponse,
  GapItem,
  CostPerWearItem,
  DuplicateGroup,
  OccasionCoverageItem,
  VersatilityItem,
} from '../../types';
import { api } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

// ─── Tab definitions ─────────────────────────────────────────────────────────
type Tab = 'gaps' | 'cost' | 'duplicates' | 'occasions' | 'versatility';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'gaps',        label: 'Gaps',       icon: 'alert-circle-outline'   },
  { key: 'cost',        label: 'Value',      icon: 'pricetag-outline'        },
  { key: 'duplicates',  label: 'Dupes',      icon: 'copy-outline'            },
  { key: 'occasions',   label: 'Occasions',  icon: 'calendar-outline'        },
  { key: 'versatility', label: 'Versatility',icon: 'shuffle-outline'         },
];

const SEVERITY_COLOR: Record<string, string> = {
  high:   '#D01345',
  medium: '#FF8800',
  low:    '#018849',
};

const TIER_COLOR: Record<string, string> = {
  excellent: '#018849',
  good:      '#66BB6A',
  fair:      '#FF8800',
  poor:      '#D01345',
  unworn:    '#9E9E9E',
};

const COVERAGE_COLOR = (score: number) =>
  score >= 0.7 ? '#018849' : score >= 0.4 ? '#FF8800' : '#D01345';

// ─── Component ───────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
}

export default function WardrobeInsightsSheet({ onClose }: Props) {
  const userId = useAppStore(s => s.userId);
  const [data, setData] = useState<WardrobeInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('gaps');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!userId) return;
    try {
      setError(null);
      const result = await api.getWardrobeInsights(userId, refresh);
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load insights');
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    load(false).finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.sheet}>
        <SheetHeader onClose={onClose} />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Analysing your wardrobe…</Text>
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.sheet}>
        <SheetHeader onClose={onClose} />
        <View style={styles.centerFill}>
          <Ionicons name="cloud-offline-outline" size={40} color={Colors.textSecondary} />
          <Text style={styles.errorText}>{error || 'No data'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load(true)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sheet}>
      <SheetHeader onClose={onClose} cached={data.cached} />

      {/* Summary bar */}
      {!!data.summary && (
        <View style={styles.summaryBar}>
          <Ionicons name="sparkles-outline" size={14} color={Colors.accent} />
          <Text style={styles.summaryText} numberOfLines={2}>{data.summary}</Text>
        </View>
      )}

      {/* Tab strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabStrip} contentContainerStyle={styles.tabStripContent}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Ionicons name={t.icon as any} size={14} color={activeTab === t.key ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'gaps'        && <GapsTab        gaps={data.gaps} />}
        {activeTab === 'cost'        && <CostTab        items={data.cost_per_wear} hasData={data.has_price_data} />}
        {activeTab === 'duplicates'  && <DuplicatesTab  groups={data.duplicate_groups} total={data.total_duplicates} />}
        {activeTab === 'occasions'   && <OccasionsTab   items={data.occasion_coverage} score={data.overall_coverage_score} />}
        {activeTab === 'versatility' && <VersatilityTab items={data.versatility_ranking} />}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function SheetHeader({ onClose, cached }: { onClose: () => void; cached?: boolean }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Wardrobe Insights</Text>
        {cached && <Text style={styles.cachedBadge}>cached</Text>}
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

// ─── 1. Gaps Tab ─────────────────────────────────────────────────────────────
function GapsTab({ gaps }: { gaps: GapItem[] }) {
  if (!gaps.length) {
    return <EmptyState icon="checkmark-circle-outline" message="No gaps detected — your wardrobe looks well-rounded!" />;
  }
  return (
    <View style={styles.tabContent}>
      <SectionTitle icon="alert-circle-outline" title="Missing Foundation Pieces" />
      {gaps.map((g, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLOR[g.severity] }]} />
            <Text style={styles.cardTitle}>{g.description}</Text>
          </View>
          <Text style={styles.cardSub}>{g.recommendation}</Text>
          <Text style={[styles.badge, { backgroundColor: SEVERITY_COLOR[g.severity] + '22', color: SEVERITY_COLOR[g.severity] }]}>
            {g.severity.toUpperCase()} PRIORITY
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── 2. Cost-Per-Wear Tab ────────────────────────────────────────────────────
function CostTab({ items, hasData }: { items: CostPerWearItem[]; hasData: boolean }) {
  if (!hasData) {
    return (
      <EmptyState
        icon="pricetag-outline"
        message="No price data yet. Add a purchase price when uploading garments to track your cost-per-wear."
      />
    );
  }
  return (
    <View style={styles.tabContent}>
      <SectionTitle icon="pricetag-outline" title="Cost-Per-Wear Rankings" />
      <Text style={styles.hint}>Lower is better — best value items appear first</Text>
      {items.map((item, i) => (
        <View key={item.garment_id} style={styles.card}>
          <View style={styles.cardRowBetween}>
            <Text style={styles.rankNum}>#{i + 1}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.garment_description}</Text>
            <View style={[styles.tierBadge, { backgroundColor: TIER_COLOR[item.value_tier] + '22' }]}>
              <Text style={[styles.tierText, { color: TIER_COLOR[item.value_tier] }]}>{item.value_tier}</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <StatPill label="Paid" value={`€${item.purchase_price}`} />
            <StatPill label="Worn" value={`${item.worn_count}×`} />
            <StatPill label="Cost/wear" value={`€${item.cost_per_wear}`} highlight />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── 3. Duplicates Tab ───────────────────────────────────────────────────────
function DuplicatesTab({ groups, total }: { groups: DuplicateGroup[]; total: number }) {
  if (!groups.length) {
    return <EmptyState icon="copy-outline" message="No near-duplicate items detected in your wardrobe." />;
  }
  return (
    <View style={styles.tabContent}>
      <SectionTitle icon="copy-outline" title={`${total} Similar Items Detected`} />
      {groups.map((g, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{g.shared_category} · {g.shared_color} · {g.shared_pattern}</Text>
          <View style={styles.dupList}>
            {g.descriptions.map((desc, j) => (
              <Text key={j} style={styles.dupItem}>• {desc}</Text>
            ))}
          </View>
          <View style={styles.similarityRow}>
            <Text style={styles.cardSub}>Similarity</Text>
            <SimilarityBar value={g.similarity_score} />
            <Text style={styles.simPct}>{Math.round(g.similarity_score * 100)}%</Text>
          </View>
          <Text style={styles.cardSub}>{g.recommendation}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── 4. Occasions Tab ────────────────────────────────────────────────────────
function OccasionsTab({ items, score }: { items: OccasionCoverageItem[]; score: number }) {
  return (
    <View style={styles.tabContent}>
      <SectionTitle icon="calendar-outline" title="Occasion Coverage" />
      <View style={styles.overallRow}>
        <Text style={styles.overallLabel}>Overall coverage</Text>
        <Text style={[styles.overallScore, { color: COVERAGE_COLOR(score) }]}>{Math.round(score * 100)}%</Text>
      </View>
      {items.map((occ, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardRowBetween}>
            <Text style={styles.cardTitle}>{occ.occasion}</Text>
            <Text style={[styles.coveragePct, { color: COVERAGE_COLOR(occ.coverage_score) }]}>
              {Math.round(occ.coverage_score * 100)}%
            </Text>
          </View>
          <CoverageBar value={occ.coverage_score} />
          <Text style={styles.cardSub}>{occ.suitable_items_count} suitable items</Text>
          {occ.missing_categories.length > 0 && (
            <Text style={styles.missing}>Missing: {occ.missing_categories.join(', ')}</Text>
          )}
          {!!occ.suggestion && <Text style={styles.suggestion}>💡 {occ.suggestion}</Text>}
        </View>
      ))}
    </View>
  );
}

// ─── 5. Versatility Tab ──────────────────────────────────────────────────────
function VersatilityTab({ items }: { items: VersatilityItem[] }) {
  if (!items.length) {
    return <EmptyState icon="shuffle-outline" message="Add more garments to see versatility rankings." />;
  }
  const max = items[0]?.versatility_score || 1;
  return (
    <View style={styles.tabContent}>
      <SectionTitle icon="shuffle-outline" title="Versatility Ranking" />
      <Text style={styles.hint}>Most outfit-pairable pieces in your wardrobe</Text>
      {items.slice(0, 15).map((item, i) => (
        <View key={item.garment_id} style={styles.card}>
          <View style={styles.cardRowBetween}>
            <Text style={styles.rankNum}>#{i + 1}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.garment_description}</Text>
            <Text style={styles.outfitCount}>{item.compatible_outfit_count} outfits</Text>
          </View>
          <VersatilityBar value={item.versatility_score} max={max} />
          {item.compatible_categories.length > 0 && (
            <Text style={styles.cardSub}>Pairs with: {item.compatible_categories.join(', ')}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// ─── Reusable sub-components ─────────────────────────────────────────────────
function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Ionicons name={icon as any} size={16} color={Colors.accent} />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon as any} size={36} color={Colors.textSecondary} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.statPill, highlight && styles.statPillHighlight]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
    </View>
  );
}

function SimilarityBar({ value }: { value: number }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${value * 100}%` as any, backgroundColor: '#FF8800' }]} />
    </View>
  );
}

function CoverageBar({ value }: { value: number }) {
  return (
    <View style={[styles.barTrack, { marginVertical: 4 }]}>
      <View style={[styles.barFill, { width: `${value * 100}%` as any, backgroundColor: COVERAGE_COLOR(value) }]} />
    </View>
  );
}

function VersatilityBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={[styles.barTrack, { marginVertical: 4 }]}>
      <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: Colors.accent }]} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cachedBadge: {
    fontSize: 10,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  closeBtn: { padding: 4 },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.accent + '11',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 18 },
  tabStrip: { flexGrow: 0 },
  tabStripContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tabLabel: { fontSize: 12, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  tabLabelActive: { color: '#fff' },
  content: { flex: 1 },
  tabContent: { padding: Spacing.md, gap: Spacing.sm },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  errorText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
  },
  retryText: { color: '#fff', fontWeight: FontWeight.semibold },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitleText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  hint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 4,
    marginBottom: Spacing.xs,
    ...Shadow.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardRowBetween: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  cardSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: FontWeight.bold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankNum: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary, minWidth: 24 },
  tierBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tierText: { fontSize: 10, fontWeight: FontWeight.bold },
  statPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  statPillHighlight: { backgroundColor: Colors.accent + '15' },
  statLabel: { fontSize: 10, color: Colors.textSecondary },
  statValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  statValueHighlight: { color: Colors.accent },
  dupList: { gap: 2, paddingLeft: 4 },
  dupItem: { fontSize: FontSize.xs, color: Colors.textSecondary },
  similarityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  simPct: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: '#FF8800', minWidth: 32, textAlign: 'right' },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overallLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  overallScore: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  coveragePct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, minWidth: 36, textAlign: 'right' },
  missing: { fontSize: FontSize.xs, color: '#D01345' },
  suggestion: { fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: 'italic' },
  outfitCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },
});
