/**
 * AI Outfit Results Modal
 * ─────────────────────────────────────────────────────────────
 * Opens after "Generate" — shows all AI-generated outfits with:
 *   • Overall score circle
 *   • Per-dimension score bars (Color Harmony, Formality, Occasion,
 *     Pattern Mixing, Proportion, Season Fit, Creativity)
 *   • LLM brief explanation
 *   • Expandable LLM detailed explanation with style notes
 *   • Garment colour / category strip
 *   • WEAR THIS + Share actions
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';
import type { OutfitResult, Occasion, ScoringProfile, GarmentItem } from '../types';
import { OutfitDatePickerModal } from './OutfitDatePickerModal';
import type { ReminderSetting } from './recommendation/constants';
import GarmentDetailModal from './wardrobe/GarmentDetailModal';
import { t } from '../i18n';
import { CATEGORY_ICONS } from './wardrobe/constants';

// ─── Helpers ─────────────────────────────────────────────────

function pct(v: number) {
  return Math.round(v * 100);
}

function scoreColor(v: number): string {
  if (v >= 0.85) return Colors.success;
  if (v >= 0.65) return Colors.accentWarm;
  return Colors.error;
}

function occasionEmoji(occ: Occasion): string {
  const map: Record<Occasion, string> = {
    casual: '😎', business: '💼', formal: '🎩', date: '💕',
    party: '🎉', wedding: '💒', interview: '📋',
    sport: '⚽', travel: '✈️', beach: '🏖️',
  };
  return map[occ] ?? '👔';
}

// ─── Score Bar ────────────────────────────────────────────────

const ScoreBar = ({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) => {
  const width = useSharedValue(0);
  React.useEffect(() => {
    width.value = withTiming(value, { duration: 600 + delay });
  }, [value, width, delay]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${interpolate(width.value, [0, 1], [0, 100])}%`,
    backgroundColor: scoreColor(width.value),
  }));
  return (
    <View style={sbStyles.row}>
      <Text style={sbStyles.label}>{label}</Text>
      <View style={sbStyles.track}>
        <Animated.View style={[sbStyles.fill, barStyle]} />
      </View>
      <Text style={[sbStyles.pct, { color: scoreColor(value) }]}>{pct(value)}%</Text>
    </View>
  );
};

const sbStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  label: { fontSize: 11, color: Colors.textSecondary, width: 90, fontWeight: FontWeight.medium },
  track: { flex: 1, height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  pct: { fontSize: 11, fontWeight: FontWeight.bold, width: 32, textAlign: 'right' },
});

// ─── LLM Explanation Box ──────────────────────────────────────

interface ExplanationBoxProps {
  brief?: string;
  detailed?: string;
  styleNotes?: string[];
  colorNote?: string;
  occasionNote?: string;
  stylingTips?: string[];
  isLoadingDetailed?: boolean;
  onRequestDetailed?: () => void;
}

const ExplanationBox: React.FC<ExplanationBoxProps> = ({
  brief,
  detailed,
  styleNotes,
  colorNote,
  occasionNote,
  stylingTips,
  isLoadingDetailed,
  onRequestDetailed,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Parse ✦ sections from detailed text (real AI output format)
  const strengthLines: string[] = [];
  const improveLines: string[] = [];
  if (detailed) {
    const parts = detailed.split('\n\n');
    let inStrengths = false, inImprove = false;
    for (const part of parts) {
      for (const line of part.split('\n')) {
        if (line.startsWith('✦ STRENGTHS')) { inStrengths = true; inImprove = false; continue; }
        if (line.startsWith('✦ TO ELEVATE')) { inImprove = true; inStrengths = false; continue; }
        if (line.startsWith('• ')) {
          if (inStrengths) strengthLines.push(line.slice(2));
          else if (inImprove) improveLines.push(line.slice(2));
        }
      }
    }
  }

  const hasAISections = strengthLines.length > 0 || improveLines.length > 0;

  return (
    <View style={exStyles.container}>
      {/* Brief */}
      {brief ? (
        <View style={exStyles.briefRow}>
          <Ionicons name="sparkles" size={14} color={Colors.accentWarm} />
          <Text style={exStyles.briefText}>{brief}</Text>
        </View>
      ) : null}

      {/* Expand / Collapse */}
      <TouchableOpacity
        style={exStyles.expandBtn}
        onPress={() => {
          if (!expanded && !detailed && onRequestDetailed) onRequestDetailed();
          setExpanded(e => !e);
        }}
        activeOpacity={0.7}
      >
        <Text style={exStyles.expandBtnText}>
          {expanded ? 'HIDE DETAILS' : 'SEE AI ANALYSIS'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <Animated.View entering={FadeInDown.springify()} style={exStyles.details}>
          {isLoadingDetailed ? (
            <View style={exStyles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.accent} />
              <Text style={exStyles.loadingText}>Analysing with AI…</Text>
            </View>
          ) : (
            <>
              {/* Structured strengths / improvements from real AI */}
              {hasAISections ? (
                <>
                  {strengthLines.length > 0 && (
                    <View style={exStyles.aiSection}>
                      <View style={exStyles.aiSectionHeader}>
                        <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
                        <Text style={[exStyles.aiSectionTitle, { color: Colors.success }]}>STRENGTHS</Text>
                      </View>
                      {strengthLines.map((s, i) => (
                        <View key={i} style={exStyles.bulletRow}>
                          <View style={[exStyles.bullet, { backgroundColor: Colors.success }]} />
                          <Text style={exStyles.bulletText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {improveLines.length > 0 && (
                    <View style={[exStyles.aiSection, { marginTop: Spacing.sm }]}>
                      <View style={exStyles.aiSectionHeader}>
                        <Ionicons name="arrow-up-circle" size={13} color={Colors.accentWarm} />
                        <Text style={[exStyles.aiSectionTitle, { color: Colors.accentWarm }]}>TO ELEVATE</Text>
                      </View>
                      {improveLines.map((s, i) => (
                        <View key={i} style={exStyles.bulletRow}>
                          <View style={[exStyles.bullet, { backgroundColor: Colors.accentWarm }]} />
                          <Text style={exStyles.bulletText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              ) : detailed ? (
                <Text style={exStyles.detailedText}>{detailed}</Text>
              ) : null}

              {colorNote ? (
                <View style={exStyles.noteRow}>
                  <View style={[exStyles.noteIcon, { backgroundColor: '#5B8FA820' }]}>
                    <Ionicons name="color-palette-outline" size={14} color="#5B8FA8" />
                  </View>
                  <Text style={exStyles.noteText}>{colorNote}</Text>
                </View>
              ) : null}

              {occasionNote ? (
                <View style={exStyles.noteRow}>
                  <View style={[exStyles.noteIcon, { backgroundColor: Colors.accentWarm + '20' }]}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.accentWarm} />
                  </View>
                  <Text style={exStyles.noteText}>{occasionNote}</Text>
                </View>
              ) : null}

              {styleNotes && styleNotes.length > 0 ? (
                <View style={exStyles.bulletSection}>
                  <Text style={exStyles.bulletTitle}>STYLE NOTES</Text>
                  {styleNotes.map((n, i) => (
                    <View key={i} style={exStyles.bulletRow}>
                      <View style={exStyles.bullet} />
                      <Text style={exStyles.bulletText}>{n}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {stylingTips && stylingTips.length > 0 ? (
                <View style={exStyles.bulletSection}>
                  <Text style={exStyles.bulletTitle}>STYLING TIPS</Text>
                  {stylingTips.map((t, i) => (
                    <View key={i} style={exStyles.bulletRow}>
                      <Ionicons name="bulb-outline" size={12} color={Colors.success} style={{ marginTop: 2 }} />
                      <Text style={exStyles.bulletText}>{t}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const exStyles = StyleSheet.create({
  container: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, marginTop: Spacing.md },
  briefRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', marginBottom: Spacing.sm },
  briefText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  expandBtnText: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textSecondary, letterSpacing: 0.8, flex: 1 },
  details: { marginTop: Spacing.md, gap: Spacing.sm },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  loadingText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontStyle: 'italic' },
  detailedText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
  aiSection: { gap: 6 },
  aiSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  aiSectionTitle: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1.5, textTransform: 'uppercase' },
  noteRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  noteIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  noteText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  bulletSection: { marginTop: Spacing.sm },
  bulletTitle: { fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  bulletRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 6, alignItems: 'flex-start' },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.accent, marginTop: 7 },
  bulletText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});

// ─── Single Outfit Card ───────────────────────────────────────

interface OutfitCardProps {
  item: OutfitResult;
  index: number;
  occasion: Occasion;
  onWear: (item: OutfitResult, plannedDate: string | null, reminder: ReminderSetting, displayLabel: string) => void;
  onShare: (item: OutfitResult) => void;
  onLike: (item: OutfitResult) => void;
  likedIds: Set<string>;
  onRequestDetailed: (item: OutfitResult) => void;
  isLoadingDetailed: boolean;
  llmData?: LLMDetailedData;
}

interface LLMDetailedData {
  detailed?: string;
  styleNotes?: string[];
  colorNote?: string;
  occasionNote?: string;
  stylingTips?: string[];
}

const OutfitCard: React.FC<OutfitCardProps> = ({
  item,
  index,
  occasion,
  onWear,
  onShare,
  onLike,
  likedIds,
  onRequestDetailed,
  isLoadingDetailed,
  llmData,
}) => {
  const scale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const overallPct = pct(item.score.overall);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState<GarmentItem | null>(null);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify().damping(14)}
      layout={Layout.springify()}
      style={cardStyles.wrapper}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.985); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <Animated.View style={[
          cardStyles.card,
          index === 0 && cardStyles.cardTop,
          cardStyle,
        ]}>
          {/* Rank badge */}
          <View style={[cardStyles.rankBadge, { backgroundColor: index === 0 ? Colors.accentWarm : Colors.accent }]}>
            <Text style={cardStyles.rankText}>
              {index === 0 ? '★ ' : ''}#{item.rank}
            </Text>
          </View>

          {/* Garment photo strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={cardStyles.garmentStrip}
            style={{ marginBottom: Spacing.md, marginTop: Spacing.sm }}
          >
            {item.garments.map((g, gi) => {
              const icon = CATEGORY_ICONS[g.attributes.category] || 'cube-outline';
              return (
                <TouchableOpacity
                  key={gi}
                  style={cardStyles.garmentPhotoCard}
                  onPress={() => setSelectedGarment(g)}
                  activeOpacity={0.75}
                >
                  {/* Photo or colour swatch fallback */}
                  <View style={[cardStyles.garmentPhotoArea, { backgroundColor: g.attributes.color_hex || '#D0C8BE' }]}>
                    {g.image_url ? (
                      <Image
                        source={{ uri: g.image_url }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name={icon as any} size={22} color="rgba(255,255,255,0.75)" />
                    )}
                    {/* Tap hint overlay */}
                    <View style={cardStyles.garmentPhotoHint}>
                      <Ionicons name="eye-outline" size={11} color="rgba(255,255,255,0.9)" />
                    </View>
                  </View>
                  {/* Label */}
                  <Text style={cardStyles.garmentLabel} numberOfLines={1}>
                    {g.attributes.subcategory ?? g.attributes.category}
                  </Text>
                  <Text style={cardStyles.garmentMeta} numberOfLines={1}>
                    {g.attributes.color_primary}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Outfit name + grade pill */}
          <View style={cardStyles.nameRow}>
            <Text style={cardStyles.outfitName} numberOfLines={2}>{item.name}</Text>
            {item.grade ? (
              <View style={[cardStyles.gradePill, { borderColor: scoreColor(item.score.overall) }]}>
                <Text style={[cardStyles.gradeText, { color: scoreColor(item.score.overall) }]}>
                  {item.grade}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Occasion tag */}
          <View style={cardStyles.occasionRow}>
            <Text style={cardStyles.occasionText}>
              {occasionEmoji(occasion)} {occasion.toUpperCase()}
            </Text>
            <Text style={cardStyles.pieceCount}>{item.garments.length} pieces</Text>
          </View>

          {/* Score section */}
          <View style={cardStyles.scoreSection}>
            {/* Big circle with grade inside */}
            <View style={[
              cardStyles.scoreCircle,
              { borderColor: scoreColor(item.score.overall) },
            ]}>
              <View style={cardStyles.scoreInner}>
                <Text style={[cardStyles.scoreValue, { color: scoreColor(item.score.overall) }]}>
                  {overallPct}
                </Text>
                <Text style={cardStyles.scoreUnit}>%</Text>
              </View>
              {item.grade ? (
                <Text style={[cardStyles.scoreGrade, { color: scoreColor(item.score.overall) }]}>
                  {item.grade}
                </Text>
              ) : null}
            </View>

            {/* Score bars */}
            <View style={cardStyles.scoreBars}>
              <ScoreBar label="Color" value={item.score.color_harmony} delay={0} />
              <ScoreBar label="Formality" value={item.score.formality_match} delay={50} />
              <ScoreBar label="Occasion" value={item.score.occasion_fit} delay={100} />
              <ScoreBar label="Pattern" value={item.score.pattern_mixing} delay={150} />
              <ScoreBar label="Proportion" value={item.score.proportion} delay={200} />
              <ScoreBar label="Season" value={item.score.season_fit} delay={250} />
              <ScoreBar label="Creativity" value={item.score.creativity} delay={300} />
            </View>
          </View>

          {/* LLM Explanation */}
          <ExplanationBox
            brief={item.explanation_brief}
            detailed={llmData?.detailed ?? item.explanation_detailed}
            styleNotes={llmData?.styleNotes}
            colorNote={llmData?.colorNote}
            occasionNote={llmData?.occasionNote}
            stylingTips={llmData?.stylingTips}
            isLoadingDetailed={isLoadingDetailed}
            onRequestDetailed={() => onRequestDetailed(item)}
          />

          {/* Actions */}
          <View style={cardStyles.actions}>
            <TouchableOpacity
              style={[cardStyles.iconBtn, likedIds.has(item.id) && cardStyles.iconBtnActive]}
              onPress={() => onLike(item)}
            >
              <Ionicons
                name={likedIds.has(item.id) ? 'heart' : 'heart-outline'}
                size={20}
                color={likedIds.has(item.id) ? Colors.error : Colors.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={cardStyles.iconBtn} onPress={() => onShare(item)}>
              <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={cardStyles.wearBtn}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={16} color="#FFF" />
              <Text style={cardStyles.wearBtnText}>WEAR THIS</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>

      {/* Date picker sub-modal */}
      <OutfitDatePickerModal
        isVisible={showDatePicker}
        outfitName={item.name}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(isoDate, reminder, displayLabel) => {
          setShowDatePicker(false);
          onWear(item, isoDate, reminder, displayLabel);
        }}
      />

      {/* Garment detail sub-modal (read-only, no delete) */}
      <GarmentDetailModal
        visible={!!selectedGarment}
        item={selectedGarment}
        analysis={null}
        loading={false}
        onClose={() => setSelectedGarment(null)}
        onDelete={() => {}}
        onToggleFavorite={() => {}}
        hideDelete
        readOnly
      />
    </Animated.View>
  );
};

const cardStyles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.md,
  },
  // Gold accent for #1 ranked card
  cardTop: {
    borderColor: Colors.accentWarm,
    borderWidth: 1.5,
    shadowColor: Colors.accentWarm,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  rankBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.md,
    zIndex: 1,
  },
  rankText: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: 0.5 },
  garmentStrip: { flexDirection: 'row', gap: Spacing.sm, paddingRight: Spacing.sm },
  // ── Photo card (Phase 9) ───────────────────────────────────────
  garmentPhotoCard: {
    width: 72,
    alignItems: 'center',
    gap: 4,
  },
  garmentPhotoArea: {
    width: 72,
    height: 88,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  garmentPhotoHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    maxWidth: 72,
  },
  garmentMeta: {
    fontSize: 8,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 72,
    textTransform: 'capitalize',
  },
  // Legacy dot style (kept for reference but no longer used)
  garmentDot: {
    width: 60,
    height: 72,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
  },
  // Name row: name + grade pill side-by-side
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  outfitName: {
    flex: 1,
    fontSize: 20,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    lineHeight: 26,
  },
  // Grade letter pill (e.g. "A", "B+")
  gradePill: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  gradeText: {
    fontSize: 16,
    fontWeight: FontWeight.black,
    letterSpacing: 0.5,
  },
  occasionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  occasionText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pieceCount: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scoreSection: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  // Score circle now stacks number on top, grade below
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: Colors.background,
    flexShrink: 0,
  },
  scoreInner: { flexDirection: 'row', alignItems: 'flex-end' },
  scoreValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, letterSpacing: -1 },
  scoreUnit: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 3, fontWeight: FontWeight.bold },
  // Tiny grade label at bottom of circle
  scoreGrade: {
    fontSize: 11,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  scoreBars: { flex: 1 },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBtnActive: { borderColor: Colors.error, backgroundColor: Colors.error + '10' },
  wearBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    marginLeft: 'auto',
  },
  wearBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: 1 },
});

// ─── Main Modal ───────────────────────────────────────────────

export interface AIOutfitResultsModalProps {
  isVisible: boolean;
  outfits: OutfitResult[];
  occasion: Occasion;
  scoringProfile: ScoringProfile;
  isLoading: boolean;
  onClose: () => void;
  /** Called after user picks WEAR THIS + optional date/reminder */
  onWearOutfit: (outfit: OutfitResult, plannedDate: string | null, reminder: ReminderSetting, displayLabel: string) => void;
  onShareOutfit: (outfit: OutfitResult) => void;
  onRegeneratePress: () => void;
  /** Fetch LLM detailed explanation for one outfit */
  onRequestDetailedExplanation?: (outfitId: string) => Promise<LLMDetailedData>;
}

export const AIOutfitResultsModal: React.FC<AIOutfitResultsModalProps> = ({
  isVisible,
  outfits,
  occasion,
  scoringProfile,
  isLoading,
  onClose,
  onWearOutfit,
  onShareOutfit,
  onRegeneratePress,
  onRequestDetailedExplanation,
}) => {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loadingDetailedId, setLoadingDetailedId] = useState<string | null>(null);
  const [llmDataMap, setLlmDataMap] = useState<Record<string, LLMDetailedData>>({});

  const handleLike = useCallback((item: OutfitResult) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }, []);

  const handleRequestDetailed = useCallback(async (item: OutfitResult) => {
    if (llmDataMap[item.id] || loadingDetailedId || !onRequestDetailedExplanation) return;
    setLoadingDetailedId(item.id);
    try {
      const data = await onRequestDetailedExplanation(item.id);
      setLlmDataMap(prev => ({ ...prev, [item.id]: data }));
    } catch {
      // silently fail — brief explanation still visible
    } finally {
      setLoadingDetailedId(null);
    }
  }, [llmDataMap, loadingDetailedId, onRequestDetailedExplanation]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        // Don't allow closing while loading
        if (!isLoading) onClose();
      }}
    >
      <View style={modalStyles.root}>
        {/* ── Header ── */}
        <View style={modalStyles.header}>
          <View style={modalStyles.headerLeft}>
            <Ionicons name="sparkles" size={20} color={Colors.accentWarm} />
            <View>
              <Text style={modalStyles.headerTitle}>AI OUTFITS</Text>
              <Text style={modalStyles.headerSubtitle}>
                {isLoading
                  ? 'Generating…'
                  : `${outfits.length} look${outfits.length !== 1 ? 's' : ''} · ${scoringProfile} · ${occasion}`}
              </Text>
            </View>
          </View>

          <View style={modalStyles.headerRight}>
            <TouchableOpacity
              style={modalStyles.regenBtn}
              onPress={onRegeneratePress}
              disabled={isLoading}
            >
              <Ionicons name="refresh" size={16} color={Colors.textPrimary} />
              <Text style={modalStyles.regenBtnText}>REDO</Text>
            </TouchableOpacity>

            <TouchableOpacity style={modalStyles.closeBtn} onPress={() => {
              if (isVisible) onClose();
            }}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Loading state ── */}
        {isLoading ? (
          <View style={modalStyles.loadingContainer}>
            <Animated.View entering={FadeInUp.springify()}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={modalStyles.loadingTitle}>AI is styling your outfits…</Text>
              <Text style={modalStyles.loadingSubtitle}>
                Analysing colour harmony, formality & occasion fit
              </Text>
              <View style={modalStyles.loadingSteps}>
                {[
                  '🔍 Scanning wardrobe items',
                  '🎨 Computing colour harmony',
                  '📐 Checking proportions',
                  '✨ Generating AI explanations',
                ].map((step, i) => (
                  <Animated.View
                    key={i}
                    entering={FadeInDown.delay(i * 350).springify()}
                    style={modalStyles.loadingStep}
                  >
                    <Text style={modalStyles.loadingStepText}>{step}</Text>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          </View>
        ) : outfits.length === 0 ? (
          <View style={modalStyles.emptyContainer}>
            <Ionicons name="sad-outline" size={48} color={Colors.textMuted} />
            <Text style={modalStyles.emptyTitle}>No outfits generated</Text>
            <Text style={modalStyles.emptySubtitle}>Try adding more items to your wardrobe or change the occasion.</Text>
            <TouchableOpacity style={modalStyles.emptyRetryBtn} onPress={onRegeneratePress}>
              <Text style={modalStyles.emptyRetryText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── Score Legend ── */}
            <View style={modalStyles.legend}>
              {[
                { color: Colors.success, label: 'Excellent (85%+)' },
                { color: Colors.accentWarm, label: 'Good (65–84%)' },
                { color: Colors.error, label: 'Low (<65%)' },
              ].map(({ color, label }) => (
                <View key={label} style={modalStyles.legendItem}>
                  <View style={[modalStyles.legendDot, { backgroundColor: color }]} />
                  <Text style={modalStyles.legendLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {/* ── Outfit Cards ── */}
            <ScrollView
              contentContainerStyle={modalStyles.list}
              showsVerticalScrollIndicator={false}
            >
              {outfits.map((outfit, idx) => (
                <OutfitCard
                  key={outfit.id}
                  item={outfit}
                  index={idx}
                  occasion={occasion}
                  onWear={onWearOutfit}
                  onShare={onShareOutfit}
                  onLike={handleLike}
                  likedIds={likedIds}
                  onRequestDetailed={handleRequestDetailed}
                  isLoadingDetailed={loadingDetailedId === outfit.id}
                  llmData={llmDataMap[outfit.id]}
                />
              ))}

              {/* Bottom padding */}
              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
};

// ─── Modal Styles ─────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
    marginTop: 1,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },
  regenBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: FontWeight.medium },

  // List
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 32,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  loadingTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  loadingSteps: { marginTop: Spacing.xl, gap: Spacing.md, alignSelf: 'stretch' },
  loadingStep: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingStepText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.textPrimary, textTransform: 'uppercase' },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyRetryBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
  },
  emptyRetryText: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: 1 },
});
