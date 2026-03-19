/**
 * OutfitScreen — ASOS-inspired editorial style
 * Matches wardrobe page: white background, near-black typography, theme tokens.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Alert,
} from 'react-native';
import Animated, { FadeInUp, FadeInRight, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { AgendaSection, OutfitHistoryModal, ResultsView } from '../../components/recommendation';
import { BuildOutfitModal }         from '../../components/BuildOutfitModal';
import { AIGenerateOutfitModal }    from '../../components/AIGenerateOutfitModal';
import { AIOutfitResultsModal }     from '../../components/AIOutfitResultsModal';
import { OutfitHistoryDetailModal } from '../../components/OutfitHistoryDetailModal';
import { ScoreOutfitModal }         from '../../components/ScoreOutfitModal';
import { PromptOutfitModal }        from '../../components/PromptOutfitModal';
import { WeekPlannerModal }         from '../../components/WeekPlannerModal';
import { useOutfitPlanner }         from '../../hooks/useOutfitPlanner';
import { useAppStore }              from '../../store/useAppStore';
import { api }                      from '../../services/api';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { TopBar } from '../../components/ui';

// ══════════════════════════════════════════════════════════════════════════════
// Context helpers
// ══════════════════════════════════════════════════════════════════════════════

function conditionToEmoji(code: number): string {
  if (code >= 200 && code < 300) return '⛈️';
  if (code >= 300 && code < 400) return '🌦️';
  if (code >= 500 && code < 600) return '🌧️';
  if (code >= 600 && code < 700) return '❄️';
  if (code >= 700 && code < 800) return '🌫️';
  if (code === 800)               return '☀️';
  if (code > 800)                 return '⛅';
  return '🌡️';
}

function timeOfDayInfo(tod: string): { emoji: string; label: string; hint: string } {
  switch (tod) {
    case 'morning':   return { emoji: '🌅', label: 'Morning',   hint: 'Fresh start' };
    case 'afternoon': return { emoji: '☀️', label: 'Afternoon', hint: 'Casual chic' };
    case 'evening':   return { emoji: '🌆', label: 'Evening',   hint: 'Smart casual' };
    case 'night':     return { emoji: '🌙', label: 'Night',     hint: 'Night out' };
    default:          return { emoji: '⏰', label: tod,          hint: 'Dress well' };
  }
}

function seasonInfo(): { season: string; emoji: string; tip: string } {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return { season: 'Spring', emoji: '🌸', tip: 'Light layers' };
  if (m >= 5 && m <= 7) return { season: 'Summer', emoji: '🌞', tip: 'Stay cool' };
  if (m >= 8 && m <= 10) return { season: 'Autumn', emoji: '🍂', tip: 'Cozy tones' };
  return { season: 'Winter', emoji: '❄️', tip: 'Bundle up' };
}

interface ContextData {
  temp: string; conditionEmoji: string; condition: string; city: string;
  timeEmoji: string; timeLabel: string; occasionHint: string;
  season: string; seasonEmoji: string; seasonTip: string;
}

function useContextData(): { ctx: ContextData; loading: boolean } {
  const s = seasonInfo();
  const [ctx, setCtx] = React.useState<ContextData>({
    temp: '--°', conditionEmoji: '🌡️', condition: 'Loading…', city: '…',
    timeEmoji: '⏰', timeLabel: '…', occasionHint: '…',
    season: s.season, seasonEmoji: s.emoji, seasonTip: s.tip,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.getContext()
      .then((data) => {
        const tod = timeOfDayInfo(data.time_of_day);
        const ss  = seasonInfo();
        setCtx({
          temp:           `${Math.round(data.temperature_celsius)}°`,
          conditionEmoji: conditionToEmoji(data.condition_code),
          condition:      data.condition,
          city:           data.city_name,
          timeEmoji:      tod.emoji,
          timeLabel:      tod.label,
          occasionHint:   tod.hint,
          season:         ss.season,
          seasonEmoji:    ss.emoji,
          seasonTip:      ss.tip,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { ctx, loading };
}

// ── Context strip cards ───────────────────────────────────────────────────────
const CTX_TINTS = [
  { bg: '#FFFAF2', border: '#EEE0C0', text: '#7A5500' },   // amber  – weather
  { bg: '#F2F6FF', border: '#D0DCFA', text: '#0C3D70' },   // blue   – location
  { bg: '#FFF2F4', border: '#F0C8D0', text: '#6B0F27' },   // rose   – moment
  { bg: '#F2FAF4', border: '#BCDEC5', text: '#145220' },   // green  – season
] as const;

interface CtxCardProps {
  tint: typeof CTX_TINTS[number];
  emoji: string; mainValue: string; labelTop: string; labelBottom: string; delay: number;
}

function CtxCard({ tint, emoji, mainValue, labelTop, labelBottom, delay }: CtxCardProps) {
  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify().damping(18)}
      style={[styles.ctxCard, { backgroundColor: tint.bg, borderColor: tint.border }, Shadow.sm]}
    >
      <Text style={styles.ctxEmoji}>{emoji}</Text>
      <Text style={[styles.ctxMainValue, { color: tint.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {mainValue}
      </Text>
      <Text style={[styles.ctxLabelTop, { color: tint.text }]} numberOfLines={1}>{labelTop}</Text>
      <Text style={styles.ctxLabelBottom} numberOfLines={1}>{labelBottom}</Text>
    </Animated.View>
  );
}

function ContextStrip() {
  const { ctx } = useContextData();
  return (
    <View style={styles.ctxStrip}>
      <CtxCard tint={CTX_TINTS[0]} delay={0}   emoji={ctx.conditionEmoji} mainValue={ctx.temp}      labelTop={ctx.condition}     labelBottom="Right now" />
      <CtxCard tint={CTX_TINTS[1]} delay={60}  emoji="📍"                 mainValue={ctx.city}      labelTop="Location"          labelBottom="Your area" />
      <CtxCard tint={CTX_TINTS[2]} delay={120} emoji={ctx.timeEmoji}      mainValue={ctx.timeLabel}  labelTop={ctx.occasionHint}  labelBottom="Vibe"      />
      <CtxCard tint={CTX_TINTS[3]} delay={180} emoji={ctx.seasonEmoji}    mainValue={ctx.season}     labelTop={ctx.seasonTip}     labelBottom="Season"    />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Action tiles
// ══════════════════════════════════════════════════════════════════════════════

const ACTION_CARDS = [
  { key: 'score'  as const, title: 'Score My Look',    subtitle: 'AI rating + tips',          emoji: '✨', borderColor: '#E8D9B0' },
  { key: 'build'  as const, title: 'Build Outfit',     subtitle: 'Pick from wardrobe',        emoji: '🧩', borderColor: '#DCDCDC' },
  { key: 'ai'     as const, title: 'AI Stylist',       subtitle: 'Occasion → complete look',  emoji: '🌿', borderColor: '#BFDCC9' },
  { key: 'prompt' as const, title: 'Describe a Vibe',  subtitle: 'Mood → outfit',             emoji: '💬', borderColor: '#C0CDE8' },
] as const;

type ActionKey = typeof ACTION_CARDS[number]['key'];

interface TileProps { card: typeof ACTION_CARDS[number]; onPress: () => void; tileW: number; delay: number; }

function ActionTile({ card, onPress, tileW, delay }: TileProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify().damping(18)} style={{ width: tileW }}>
      <TouchableOpacity
        style={[styles.tile, { borderColor: card.borderColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.tileEmoji}>{card.emoji}</Text>
        <Text style={styles.tileTitle}>{card.title}</Text>
        <Text style={styles.tileSubtitle}>{card.subtitle}</Text>
        <View style={styles.tileCTA}>
          <Text style={styles.tileCTAText}>Open</Text>
          <Ionicons name="arrow-forward" size={10} color={Colors.textPrimary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// StatPill
// ══════════════════════════════════════════════════════════════════════════════

interface StatPillProps { icon: React.ComponentProps<typeof Ionicons>['name']; value: number | string; label: string; onPress?: () => void; }

function StatPill({ icon, value, label, onPress }: StatPillProps) {
  return (
    <TouchableOpacity
      style={[styles.statPill, Shadow.sm]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OutfitScreen
// ══════════════════════════════════════════════════════════════════════════════

export default function OutfitScreen() {
  const planner              = useOutfitPlanner();
  const { wardrobe }         = useAppStore();
  const { width: W }         = useWindowDimensions();
  const [showScore,  setShowScore]  = React.useState(false);
  const [showPrompt, setShowPrompt] = React.useState(false);

  // Responsive tile width: 2 columns with gap, max 220px each
  const PAD    = Spacing.md * 2;   // 32
  const GAP    = Spacing.sm;       // 8
  const tileW  = Math.min((W - PAD - GAP) / 2, 220);

  const handleTilePress = useCallback((key: ActionKey) => {
    if (key === 'score')  setShowScore(true);
    if (key === 'build')  planner.setShowBuildOutfit(true);
    if (key === 'ai')     planner.setShowAIGenerateModal(true);
    if (key === 'prompt') setShowPrompt(true);
  }, [planner]);

  if (planner.showResults && !planner.showAIResultsModal && planner.outfits.length > 0) {
    return (
      <ResultsView
        outfits={planner.outfits}
        agendaEntries={planner.agendaEntries}
        selectedOutfitForPlanning={planner.selectedOutfitForPlanning}
        planningDate={planner.planningDate}
        planningLocation={planner.planningLocation}
        planningOccasion={planner.planningOccasion}
        onBack={() => planner.setShowResults(false)}
        onSelectOutfit={(id) => planner.setSelectedOutfitForPlanning(id)}
        onSchedule={planner.handleScheduleOutfit}
        onRemoveEntry={planner.removeAgendaEntry}
        onChangePlanningDate={planner.setPlanningDate}
        onChangePlanningLocation={planner.setPlanningLocation}
        onChangePlanningOccasion={planner.setPlanningOccasion}
      />
    );
  }

  const itemCount      = wardrobe.length;
  const scheduledCount = planner.agendaEntries.length;

  return (
    <View style={styles.container}>

      {/* ── TopBar — matches wardrobe ──────────────────────────────────────── */}
      <TopBar title="Your Style" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: Spacing.md }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero row: stat pills + Plan Week ─────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(40)} style={styles.heroRow}>
          <StatPill icon="albums-outline"  value={itemCount}      label="items" />
          <StatPill icon="calendar-outline" value={scheduledCount} label="scheduled" onPress={() => planner.setShowOutfitHistory(true)} />
          <TouchableOpacity
            style={styles.planWeekBtn}
            onPress={() => planner.setShowWeekPlanner(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="calendar-outline" size={14} color={Colors.textOnAccent} />
            <Text style={styles.planWeekText}>Plan Week</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Right Now ────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(80)} style={styles.section}>
          <Text style={styles.sectionTitle}>Right Now</Text>
          <ContextStrip />
        </Animated.View>

        {/* ── Recent Outfits ────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(160)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Outfits</Text>
            <TouchableOpacity onPress={() => planner.setShowOutfitHistory(true)} hitSlop={{ top: 8, bottom: 8, left: 12, right: 4 }}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {planner.agendaEntries.length === 0 ? (
            <View style={[styles.historyEmpty, Shadow.sm]}>
              <Text style={styles.historyEmptyEmoji}>👗</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyEmptyTitle}>Nothing scheduled yet</Text>
                <Text style={styles.historyEmptySubtitle}>Use a tool below to build your first look</Text>
              </View>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyStrip}>
              {planner.agendaEntries.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={[styles.historyChip, Shadow.sm]}
                  onPress={() => planner.openOutfitDetail(entry)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.historyColorBar, { backgroundColor: entry.color }]} />
                  <View style={styles.historyChipContent}>
                    <Text style={styles.historyChipName} numberOfLines={1}>{entry.outfitName}</Text>
                    <Text style={styles.historyChipDate}>{entry.date}</Text>
                    <Text style={styles.historyChipOccasion}>{entry.occasion}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* ── Style Tools ──────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(220)} style={styles.section}>
          <Text style={styles.sectionTitle}>Style Tools</Text>
          <View style={[styles.grid, { gap: GAP }]}>
            {ACTION_CARDS.map((card, i) => (
              <ActionTile
                key={card.key}
                card={card}
                tileW={tileW}
                delay={240 + i * 50}
                onPress={() => handleTilePress(card.key)}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Agenda ────────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(380)} style={styles.section}>
          <AgendaSection
            entries={planner.agendaEntries}
            selectedId={planner.selectedAgendaId}
            onSelect={(id) => planner.setSelectedAgendaId(id)}
            onRemove={planner.removeAgendaEntry}
            onOpenWeekPlanner={() => planner.setShowWeekPlanner(true)}
          />
        </Animated.View>

      </ScrollView>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <ScoreOutfitModal
        isVisible={showScore}
        onClose={() => setShowScore(false)}
        onPlanOutfit={(outfitName, plannedDate, reminder, displayLabel) => {
          planner.addAgendaEntry({ outfitName, date: displayLabel || outfitName, fullDate: displayLabel || '', plannedDate: plannedDate ?? undefined, reminder, location: 'À définir / TBD', occasion: 'casual', coordinate: { latitude: 48.8566, longitude: 2.3522 }, color: '#C8A96E', source: 'score' });
        }}
      />

      <PromptOutfitModal
        isVisible={showPrompt}
        onClose={() => setShowPrompt(false)}
        onPlanOutfit={(outfitName, plannedDate, reminder, displayLabel) => {
          planner.addAgendaEntry({ outfitName, date: displayLabel || outfitName, fullDate: displayLabel || '', plannedDate: plannedDate ?? undefined, reminder, location: 'À définir / TBD', occasion: 'casual', coordinate: { latitude: 48.8566, longitude: 2.3522 }, color: '#A8C8E8', source: 'prompt' });
        }}
      />

      <BuildOutfitModal isVisible={planner.showBuildOutfit} onClose={() => planner.setShowBuildOutfit(false)} />

      <OutfitHistoryModal
        visible={planner.showOutfitHistory}
        entries={planner.agendaEntries}
        onClose={() => planner.setShowOutfitHistory(false)}
        onSelectEntry={planner.openOutfitDetail}
      />

      <OutfitHistoryDetailModal
        visible={planner.showOutfitDetail}
        outfit={planner.selectedOutfitDetail}
        hasVirtualTryOn={planner.selectedOutfitDetail ? planner.virtualTryOns[planner.selectedOutfitDetail.id] !== undefined : false}
        tryOnImageUrl={planner.selectedOutfitDetail ? planner.virtualTryOns[planner.selectedOutfitDetail.id] : undefined}
        onClose={planner.closeOutfitDetail}
        onTryOn={() => Alert.alert('Virtual Try-On', 'Diffusion-model integration coming soon!')}
        onShare={(outfit) => Alert.alert('Share', `Sharing "${outfit.outfitName}" to People tab!`)}
      />

      <AIGenerateOutfitModal
        isVisible={planner.showAIGenerateModal}
        onClose={() => planner.setShowAIGenerateModal(false)}
        onGenerate={planner.handleAIGenerate}
        isLoading={planner.isLoadingOutfits}
      />

      <AIOutfitResultsModal
        isVisible={planner.showAIResultsModal}
        outfits={planner.outfits}
        occasion={planner.occasion}
        scoringProfile={planner.scoringProfile}
        isLoading={planner.isLoadingOutfits}
        onClose={() => planner.setShowAIResultsModal(false)}
        onWearOutfit={(outfit, plannedDate, reminder, displayLabel) => {
          planner.addAgendaEntry({ outfitName: outfit.name, date: displayLabel || outfit.name, fullDate: displayLabel || '', plannedDate: plannedDate ?? undefined, reminder, location: 'À définir / TBD', occasion: planner.occasion, coordinate: { latitude: 48.8566, longitude: 2.3522 }, color: outfit.garments?.[0]?.attributes?.color_hex || '#2D2D2D', source: 'ai', aiGrade: outfit.grade ?? undefined, aiScore: outfit.score?.overall });
          planner.setSelectedOutfitForPlanning(outfit.id);
          planner.setShowAIResultsModal(false);
        }}
        onShareOutfit={(outfit) => Alert.alert('Share', `Sharing "${outfit.name}" to the People tab!`)}
        onRegeneratePress={() => { planner.setShowAIResultsModal(false); planner.setShowAIGenerateModal(true); }}
        onRequestDetailedExplanation={async (outfitId) => {
          const target = planner.outfits.find((o) => o.id === outfitId);
          if (!target) return { outfit_id: outfitId, style_notes: [], styling_tips: [] };
          const resp = await api.explainOutfit(target, planner.occasion, planner.scoringProfile, 'detailed');
          return { detailed: resp.detailed, styleNotes: resp.style_notes, colorNote: resp.color_note, occasionNote: resp.occasion_note, stylingTips: resp.styling_tips };
        }}
      />

      <WeekPlannerModal
        visible={planner.showWeekPlanner}
        entries={planner.agendaEntries}
        onClose={() => planner.setShowWeekPlanner(false)}
        onAddEntry={planner.addAgendaEntry}
        onUpdateEntry={planner.updateAgendaEntryDate}
        onRemoveEntry={planner.removeAgendaEntry}
      />

    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Styles — aligned with wardrobe theme tokens
// ══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({

  container: {
    flex:            1,
    backgroundColor: Colors.background,  // pure white — matches wardrobe
  },

  scroll: {
    paddingTop:    Spacing.md,
    paddingBottom: 120,
    gap:           Spacing.lg,
  },

  // ── Hero row ─────────────────────────────────────────────────────────────
  heroRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  statPill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingVertical:   10,
    paddingHorizontal: 14,
    backgroundColor:   Colors.surface,
    borderRadius:      BorderRadius.full,
    borderWidth:       1,
    borderColor:       Colors.border,
  },
  statValue: {
    fontSize:   FontSize.md,
    fontWeight: FontWeight.black,
    color:      Colors.textPrimary,
  },
  statLabel: {
    fontSize:   FontSize.xs,
    color:      Colors.textMuted,
    fontWeight: FontWeight.regular,
  },
  planWeekBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    marginLeft:        'auto',
    paddingVertical:   10,
    paddingHorizontal: 14,
    borderRadius:      BorderRadius.full,
    backgroundColor:   Colors.accent,
  },
  planWeekText: {
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.bold,
    color:      Colors.textOnAccent,
  },

  // ── Section ──────────────────────────────────────────────────────────────
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize:      FontSize.lg,
    fontWeight:    FontWeight.bold,
    color:         Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontSize:   FontSize.sm,
    fontWeight: FontWeight.semibold,
    color:      Colors.textSecondary,
    textDecorationLine: 'underline',
  },

  // ── Context strip ────────────────────────────────────────────────────────
  ctxStrip: {
    flexDirection: 'row',
    gap:           Spacing.sm,
  },
  ctxCard: {
    flex:              1,
    paddingVertical:   12,
    paddingHorizontal: 10,
    borderRadius:      BorderRadius.lg,
    borderWidth:       1,
    gap:               2,
    minWidth:          0,
  },
  ctxEmoji: {
    fontSize:     15,
    marginBottom: 3,
    lineHeight:   20,
  },
  ctxMainValue: {
    fontSize:      FontSize.md,
    fontWeight:    FontWeight.bold,
    letterSpacing: -0.2,
    lineHeight:    20,
  },
  ctxLabelTop: {
    fontSize:   10,
    fontWeight: FontWeight.semibold,
    marginTop:  1,
  },
  ctxLabelBottom: {
    fontSize:   9,
    fontWeight: FontWeight.regular,
    color:      Colors.textMuted,
  },

  // ── History strip ────────────────────────────────────────────────────────
  historyStrip: {
    gap:         Spacing.sm,
    paddingBottom: 4,
    paddingRight:  Spacing.md,
  },
  historyChip: {
    flexDirection:   'row',
    width:           160,
    backgroundColor: Colors.surface,
    borderRadius:    BorderRadius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    overflow:        'hidden',
  },
  historyColorBar: {
    width:     3,
    alignSelf: 'stretch',
  },
  historyChipContent: {
    flex:              1,
    paddingVertical:   12,
    paddingHorizontal: 10,
    gap:               2,
  },
  historyChipName: {
    fontSize:      FontSize.sm,
    fontWeight:    FontWeight.bold,
    color:         Colors.textPrimary,
    letterSpacing: -0.1,
  },
  historyChipDate: {
    fontSize:   11,
    color:      Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginTop:  2,
  },
  historyChipOccasion: {
    fontSize:      10,
    color:         Colors.textMuted,
    textTransform: 'capitalize',
    fontWeight:    FontWeight.regular,
  },
  historyEmpty: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.md,
    padding:         Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius:    BorderRadius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  historyEmptyEmoji: {
    fontSize: 28,
  },
  historyEmptyTitle: {
    fontSize:   FontSize.sm,
    fontWeight: FontWeight.semibold,
    color:      Colors.textPrimary,
  },
  historyEmptySubtitle: {
    fontSize:   FontSize.xs,
    color:      Colors.textMuted,
    marginTop:  2,
    lineHeight: 16,
  },

  // ── 2×2 grid ─────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
  },

  // ── Action tile ───────────────────────────────────────────────────────────
  tile: {
    flex:            1,         // fills tileW passed via width style on Animated.View
    aspectRatio:     1,
    borderRadius:    BorderRadius.xl,
    padding:         Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth:     1,
    justifyContent:  'space-between',
    ...Shadow.sm,
  },
  tileEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  tileTitle: {
    fontSize:      FontSize.md,
    fontWeight:    FontWeight.bold,
    color:         Colors.textPrimary,
    letterSpacing: -0.2,
  },
  tileSubtitle: {
    fontSize:   FontSize.xs,
    lineHeight: 15,
    color:      Colors.textMuted,
    fontWeight: FontWeight.regular,
    marginTop:  3,
    flexShrink: 1,
  },
  tileCTA: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               3,
    alignSelf:         'flex-start',
    paddingVertical:   4,
    paddingHorizontal: 10,
    borderRadius:      BorderRadius.full,
    backgroundColor:   Colors.surfaceLight,
    borderWidth:       1,
    borderColor:       Colors.border,
    marginTop:         Spacing.sm,
  },
  tileCTAText: {
    fontSize:      11,
    fontWeight:    FontWeight.bold,
    color:         Colors.textPrimary,
    letterSpacing: 0.3,
  },
});
