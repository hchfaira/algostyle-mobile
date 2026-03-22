/**
 * OutfitScreen — Minimalist, quiet-luxury editorial style
 * - White background, near-black typography, nude accents
 * - Compact action tiles, refined context cards, improved history & agenda layout
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
// Context helpers (unchanged)
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
  apiStatus: 'loading' | 'success' | 'error';
}

function useContextData(): { ctx: ContextData; loading: boolean } {
  const s = seasonInfo();
  const [ctx, setCtx] = React.useState<ContextData>({
    temp: '--°', conditionEmoji: '🌡️', condition: 'Loading…', city: '…',
    timeEmoji: '⏰', timeLabel: '…', occasionHint: '…',
    season: s.season, seasonEmoji: s.emoji, seasonTip: s.tip,
    apiStatus: 'loading',
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
          apiStatus:      'success',
        });
      })
      .catch(() => {
        setCtx((prev) => ({ ...prev, apiStatus: 'error' }));
      })
      .finally(() => setLoading(false));
  }, []);

  return { ctx, loading };
}

// ── Refined quiet-luxury tints (softer nude palette) ───────────────────────
const CTX_TINTS = [
  { bg: '#FBF8F6', border: '#ECE5DE', text: '#4A443E' },
  { bg: '#FBFBFB', border: '#EDEBE8', text: '#3F3B38' },
  { bg: '#FCFAF8', border: '#EDE3D9', text: '#5A524A' },
  { bg: '#FCFCFB', border: '#EFEEEA', text: '#4E4844' },
] as const;

interface CtxCardProps {
  tint: typeof CTX_TINTS[number];
  emoji: string; mainValue: string; labelTop: string; labelBottom: string; delay: number;
}

function CtxCard({ tint, emoji, mainValue, labelTop, labelBottom, delay }: CtxCardProps) {
  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify().damping(18)}
      style={[styles.ctxCard, { backgroundColor: tint.bg, borderColor: tint.border }]}
    >
      <View style={styles.ctxRow}>
        <Text style={[styles.ctxEmoji, { color: tint.text }]}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.ctxMainValue, { color: tint.text }]} numberOfLines={1} adjustsFontSizeToFit>
            {mainValue}
          </Text>
          <Text style={[styles.ctxLabelTop, { color: tint.text }]} numberOfLines={1}>{labelTop}</Text>
        </View>
      </View>
      <Text style={styles.ctxLabelBottom} numberOfLines={1}>{labelBottom}</Text>
    </Animated.View>
  );
}

function ContextStrip() {
  const { ctx } = useContextData();
  
  return (
    <View>
      {ctx.apiStatus !== 'loading' && (
        <Animated.View 
          entering={FadeIn.duration(240)}
          style={[
            styles.apiStatusBanner,
            ctx.apiStatus === 'success' ? styles.apiStatusSuccess : styles.apiStatusError
          ]}
        >
          <Ionicons 
            name={ctx.apiStatus === 'success' ? 'checkmark-circle' : 'alert-circle'} 
            size={14} 
            color={ctx.apiStatus === 'success' ? '#2E7D32' : '#C62828'} 
          />
          <Text style={[
            styles.apiStatusText,
            { color: ctx.apiStatus === 'success' ? '#2E7D32' : '#C62828' }
          ]}>
            {ctx.apiStatus === 'success' 
              ? 'Context loaded • Personalised suggestions'
              : 'Context unavailable • Using general suggestions'
            }
          </Text>
        </Animated.View>
      )}
      <View style={styles.ctxStrip}>
        <CtxCard tint={CTX_TINTS[0]} delay={0}   emoji={ctx.conditionEmoji} mainValue={ctx.temp}      labelTop={ctx.condition}     labelBottom="Right now" />
        <CtxCard tint={CTX_TINTS[1]} delay={60}  emoji="📍"                 mainValue={ctx.city}      labelTop="Location"          labelBottom="Your area" />
        <CtxCard tint={CTX_TINTS[2]} delay={120} emoji={ctx.timeEmoji}      mainValue={ctx.timeLabel}  labelTop={ctx.occasionHint}  labelBottom="Vibe"      />
        <CtxCard tint={CTX_TINTS[3]} delay={180} emoji={ctx.seasonEmoji}    mainValue={ctx.season}     labelTop={ctx.seasonTip}     labelBottom="Season"    />
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Action tiles — compact horizontal cards for faster scanning
// ══════════════════════════════════════════════════════════════════════════════

const ACTION_CARDS = [
  { 
    key: 'build' as const, 
    title: 'Build Outfit', 
    subtitle: 'Choose from wardrobe', 
    icon: 'shirt-outline' as const,
    iconColor: '#FF6B6B',      // Coral red
    bgColor: 'rgba(255, 107, 107, 0.08)',
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  { 
    key: 'ai' as const, 
    title: 'AI Stylist', 
    subtitle: 'Complete looks instantly', 
    icon: 'sparkles-outline' as const,
    iconColor: '#9B59B6',      // Purple
    bgColor: 'rgba(155, 89, 182, 0.08)',
    borderColor: 'rgba(155, 89, 182, 0.2)',
  },
  { 
    key: 'score' as const, 
    title: 'Score My Look', 
    subtitle: 'AI rating & tips', 
    icon: 'star-outline' as const,
    iconColor: '#F39C12',      // Orange gold
    bgColor: 'rgba(243, 156, 18, 0.08)',
    borderColor: 'rgba(243, 156, 18, 0.2)',
  },
  { 
    key: 'prompt' as const, 
    title: 'Describe a Vibe', 
    subtitle: 'From mood to outfit', 
    icon: 'chatbubble-ellipses-outline' as const,
    iconColor: '#3498DB',      // Bright blue
    bgColor: 'rgba(52, 152, 219, 0.08)',
    borderColor: 'rgba(52, 152, 219, 0.2)',
  },
] as const;

type ActionKey = typeof ACTION_CARDS[number]['key'];

interface TileProps { card: typeof ACTION_CARDS[number]; onPress: () => void; tileW: number; delay: number; }

function ActionTile({ card, onPress, tileW, delay }: TileProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify().damping(18)} style={{ width: tileW }}>
      <TouchableOpacity
        style={[styles.tile, { backgroundColor: card.bgColor, borderColor: card.borderColor }]}
        onPress={onPress}
        activeOpacity={0.78}
      >
        <View style={[styles.tileLeft, { backgroundColor: 'transparent' }]}>
          <View style={[styles.tileIconWrap, { backgroundColor: 'transparent' }]}>
            <Ionicons name={card.icon} size={28} color={card.iconColor} />
          </View>
          <View style={styles.tileText}>
            <Text style={styles.tileTitle}>{card.title}</Text>
            <Text style={styles.tileSubtitle}>{card.subtitle}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={card.iconColor} style={{ opacity: 0.6 }} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// StatPill — lighter, minimal
// ══════════════════════════════════════════════════════════════════════════════

interface StatPillProps { icon: React.ComponentProps<typeof Ionicons>['name']; value: number | string; label: string; onPress?: () => void; }

function StatPill({ icon, value, label, onPress }: StatPillProps) {
  return (
    <TouchableOpacity
      style={[styles.statPill, onPress ? Shadow.sm : undefined]}
      onPress={onPress}
      activeOpacity={onPress ? 0.78 : 1}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={16} color="#8A857E" />
      <View style={{ marginLeft: 8 }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OutfitScreen — layout adjustments, clearer hierarchy
// ══════════════════════════════════════════════════════════════════════════════

export default function OutfitScreen() {
  const planner              = useOutfitPlanner();
  const { wardrobe }         = useAppStore();
  const { width: W }         = useWindowDimensions();
  const [showScore,  setShowScore]  = React.useState(false);
  const [showPrompt, setShowPrompt] = React.useState(false);

  // Responsive tile width: two columns on wide screens, single column on narrow
  const PAD    = Spacing.md * 2;   // 32
  const GAP    = Spacing.sm;       // 8
  const col    = W > 680 ? 2 : 1;
  const tileW  = Math.min((W - PAD - GAP * (col - 1)) / col, 420);

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

      {/* TopBar — keeps existing behavior but looks cleaner */}
      <TopBar title="Your Style" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: Spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero row */}
        <Animated.View entering={FadeInUp.delay(40)} style={styles.heroRow}>
          <View style={styles.statsWrap}>
            <StatPill icon="albums-outline"  value={itemCount}      label="items" />
            <StatPill icon="calendar-outline" value={scheduledCount} label="scheduled" onPress={() => planner.setShowOutfitHistory(true)} />
          </View>
          <TouchableOpacity
            style={styles.planWeekBtn}
            onPress={() => planner.setShowWeekPlanner(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="calendar" size={14} color="#FFFFFF" />
            <Text style={styles.planWeekText}>Plan week</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Right Now */}
        <Animated.View entering={FadeInUp.delay(80)} style={styles.section}>
          <Text style={styles.sectionTitle}>Right now</Text>
          <ContextStrip />
        </Animated.View>

        {/* Recent Outfits */}
        <Animated.View entering={FadeInUp.delay(160)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent outfits</Text>
            <TouchableOpacity onPress={() => planner.setShowOutfitHistory(true)} hitSlop={{top:8,bottom:8,left:12,right:4}}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {planner.agendaEntries.length === 0 ? (
            <View style={[styles.historyEmpty, Shadow.sm]}>
              <Text style={styles.historyEmptyEmoji}>👗</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyEmptyTitle}>Nothing scheduled yet</Text>
                <Text style={styles.historyEmptySubtitle}>Create a look with the tools below</Text>
              </View>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyStrip}>
              {planner.agendaEntries.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={[styles.historyChip, Shadow.sm]}
                  onPress={() => planner.openOutfitDetail(entry)}
                  activeOpacity={0.78}
                >
                  <View style={[styles.historyColorBar, { backgroundColor: entry.color || '#D0C6B6' }]} />
                  <View style={styles.historyChipContent}>
                    <Text style={styles.historyChipName} numberOfLines={1}>{entry.outfitName}</Text>
                    <View style={styles.historyMetaRow}>
                      <Text style={styles.historyChipDate}>{entry.date}</Text>
                      <Text style={styles.historyChipOccasion}>{entry.occasion}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Style Tools */}
        <Animated.View entering={FadeInUp.delay(220)} style={styles.section}>
          <Text style={styles.sectionTitle}>Style tools</Text>
          <View style={[styles.grid, { gap: GAP }]}>
            {ACTION_CARDS.map((card, i) => (
              <ActionTile
                key={card.key}
                card={card}
                tileW={tileW}
                delay={240 + i * 40}
                onPress={() => handleTilePress(card.key)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Agenda */}
        <Animated.View entering={FadeInUp.delay(380)} style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Agenda</Text>
          <View style={styles.agendaWrap}>
            <AgendaSection
              entries={planner.agendaEntries}
              selectedId={planner.selectedAgendaId}
              onSelect={(id) => planner.setSelectedAgendaId(id)}
              onRemove={planner.removeAgendaEntry}
              onOpenWeekPlanner={() => planner.setShowWeekPlanner(true)}
            />
          </View>
        </Animated.View>

      </ScrollView>

      {/* Modals (unchanged behavior) */}
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
// Styles — tuned to minimal, quiet-luxury look
// ══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({

  container: {
    flex:            1,
    backgroundColor: '#FFFFFF',  // clean white canvas
  },

  scroll: {
    paddingTop:    Spacing.md,
    paddingBottom: 140,
    gap:           Spacing.lg,
  },

  // Hero row
  heroRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
  },
  statsWrap: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   8,
    paddingHorizontal: 12,
    backgroundColor:   '#FFF',
    borderRadius:      BorderRadius.full,
    borderWidth:       1,
    borderColor:       '#F1ECE8',
    minWidth:          98,
  },
  statValue: {
    fontSize:   FontSize.md,
    fontWeight: FontWeight.semibold,
    color:      '#121212',
  },
  statLabel: {
    fontSize:   FontSize.xs,
    color:      '#8A857E',
    fontWeight: FontWeight.regular,
    textTransform: 'lowercase',
  },
  planWeekBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    marginLeft:        'auto',
    paddingVertical:   10,
    paddingHorizontal: 14,
    borderRadius:      BorderRadius.full,
    backgroundColor:   '#111111',
  },
  planWeekText: {
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.semibold,
    color:      '#FFFFFF',
    letterSpacing: 0.2,
    textTransform: 'lowercase',
  },

  // Section
  section: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F0ED',
  },
  sectionHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize:      FontSize.md,
    fontWeight:    FontWeight.semibold,
    color:         '#111111',
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  sectionLink: {
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.medium,
    color:      '#8A857E',
  },

  // Context strip
  ctxStrip: {
    flexDirection: 'row',
    gap:           Spacing.sm,
  },
  ctxCard: {
    flex:              1,
    paddingVertical:   10,
    paddingHorizontal: 12,
    borderRadius:      BorderRadius.xl,
    borderWidth:       1,
    minWidth:          88,
    justifyContent:    'center',
  },
  ctxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctxEmoji: {
    fontSize:     18,
    lineHeight:   22,
  },
  ctxMainValue: {
    fontSize:      FontSize.md,
    fontWeight:    FontWeight.bold,
    letterSpacing: -0.2,
    lineHeight:    20,
  },
  ctxLabelTop: {
    fontSize:   11,
    fontWeight: FontWeight.medium,
    marginTop:  2,
    color: '#6F675F',
  },
  ctxLabelBottom: {
    fontSize:   10,
    fontWeight: FontWeight.regular,
    color:      '#8A857E',
    marginTop:  6,
  },

  // API status
  apiStatusBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius:    BorderRadius.md,
    marginBottom:    Spacing.sm,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F2F0EE',
  },
  apiStatusSuccess: {},
  apiStatusError: {},
  apiStatusText: {
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.medium,
    flex:       1,
    color: '#6F675F',
  },

  // History strip
  historyStrip: {
    gap:            Spacing.sm,
    paddingBottom:  4,
    paddingRight:   Spacing.md,
  },
  historyChip: {
    flexDirection:   'row',
    width:           220,
    backgroundColor: '#FFFFFF',
    borderRadius:    BorderRadius.xl,
    borderWidth:     1,
    borderColor:     '#F1ECE8',
    overflow:        'hidden',
    alignItems:      'center',
  },
  historyColorBar: {
    width:        6,
    alignSelf:    'stretch',
  },
  historyChipContent: {
    flex:              1,
    paddingVertical:   12,
    paddingHorizontal: 12,
    gap:               6,
  },
  historyChipName: {
    fontSize:      FontSize.sm,
    fontWeight:    FontWeight.semibold,
    color:         '#111111',
    letterSpacing: -0.1,
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  historyChipDate: {
    fontSize:   11,
    color:      '#8A857E',
    fontWeight: FontWeight.medium,
  },
  historyChipOccasion: {
    fontSize:      11,
    color:         '#B7B0A7',
    textTransform: 'capitalize',
    fontWeight:    FontWeight.regular,
  },
  historyEmpty: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.md,
    padding:         Spacing.lg,
    backgroundColor: '#FFF',
    borderRadius:    BorderRadius.xl,
    borderWidth:     1,
    borderColor:     '#F1ECE8',
  },
  historyEmptyEmoji: {
    fontSize: 28,
  },
  historyEmptyTitle: {
    fontSize:   FontSize.sm,
    fontWeight: FontWeight.semibold,
    color:      '#111111',
  },
  historyEmptySubtitle: {
    fontSize:   FontSize.xs,
    color:      '#8A857E',
    marginTop:  2,
    lineHeight: 16,
  },

  // Grid & tiles
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
  },
  tile: {
    height:          96,
    borderRadius:    BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    justifyContent:  'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F2F0ED',
  },
  tileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tileIconWrap: {
    width:           44,
    height:          44,
    borderRadius:    BorderRadius.md,
    alignItems:      'center',
    justifyContent:  'center',
  },
  tileText: {
    flex: 1,
  },
  tileTitle: {
    fontSize:      FontSize.md,
    fontWeight:    FontWeight.semibold,
    color:         '#111111',
    marginBottom:  2,
  },
  tileSubtitle: {
    fontSize:   FontSize.xs,
    lineHeight: 16,
    color:      '#8A857E',
  },
  tileCTA: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingVertical:   6,
    paddingHorizontal: 12,
    borderRadius:      BorderRadius.full,
  },
  tileCTAText: {
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.semibold,
    color:         '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Agenda
  agendaWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#F3F0ED',
    padding: Spacing.sm,
  },

});