/**
 * Recommend Tab — Thin orchestrator.
 *
 * Heavy UI is split into:
 *   components/recommendation/  — AnimatedOutfitCard, AgendaSection, OutfitHistoryModal, ResultsView
 *   hooks/useOutfitPlanner.ts   — all state & handlers
 */
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import { AgendaSection, OutfitHistoryModal, ResultsView } from '../../components/recommendation';
import { BuildOutfitModal } from '../../components/BuildOutfitModal';
import { AIGenerateOutfitModal } from '../../components/AIGenerateOutfitModal';
import { AIOutfitResultsModal } from '../../components/AIOutfitResultsModal';
import { OutfitHistoryDetailModal } from '../../components/OutfitHistoryDetailModal';
import { useOutfitPlanner } from '../../hooks/useOutfitPlanner';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';

export default function RecommendScreen() {
  const planner = useOutfitPlanner();
  const { wardrobe } = useAppStore();

  // ─── Results View ──────────────────────────────────────────
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

  // ─── Main Recommend View ───────────────────────────────────
  return (
    <View style={styles.container}>
      <TopBar title="Recommend" subtitle="AI-powered editorial styling" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Outfit History */}
        <ActionRow icon="time" label="OUTFIT HISTORY" onPress={() => planner.setShowOutfitHistory(true)} />

        {/* Wardrobe Status */}
        <View style={styles.wardrobeStatus}>
          <Ionicons name="grid-outline" size={18} color={Colors.textPrimary} />
          <Text style={styles.wardrobeStatusText}>
            {wardrobe.length} item{wardrobe.length !== 1 ? 's' : ''} in wardrobe
          </Text>
        </View>

        {/* Build / AI buttons */}
        <ActionRow icon="eye-outline" label="BUILD CUSTOM OUTFIT" variant="accent" onPress={() => planner.setShowBuildOutfit(true)} />
        <ActionRow icon="sparkles" label="LET AI BUILD YOUR OUTFIT" variant="secondary" onPress={() => planner.setShowAIGenerateModal(true)} />

        {/* Agenda + Map */}
        <AgendaSection
          entries={planner.agendaEntries}
          selectedId={planner.selectedAgendaId}
          onSelect={(id) => planner.setSelectedAgendaId(id)}
          onRemove={planner.removeAgendaEntry}
        />
      </ScrollView>

      {/* ─── Modals ─── */}
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
        onTryOn={() => Alert.alert('Virtual Try-On', 'Starting virtual try-on generation...\n\nIntegration with diffusion models coming soon!')}
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
        onWearOutfit={(outfit) => {
          planner.setSelectedOutfitForPlanning(outfit.id);
          planner.setShowAIResultsModal(false);
          Alert.alert('Outfit Selected', `"${outfit.name}" selected! Fill in the date & location below to schedule it.`);
        }}
        onShareOutfit={(outfit) => Alert.alert('Share', `Sharing "${outfit.name}" to the People tab!`)}
        onRegeneratePress={() => { planner.setShowAIResultsModal(false); planner.setShowAIGenerateModal(true); }}
        onRequestDetailedExplanation={async (outfitId) => {
          const target = planner.outfits.find(o => o.id === outfitId);
          if (!target) return { outfit_id: outfitId, style_notes: [], styling_tips: [] };
          const resp = await api.explainOutfit(target, planner.occasion, planner.scoringProfile, 'detailed');
          return { detailed: resp.detailed, styleNotes: resp.style_notes, colorNote: resp.color_note, occasionNote: resp.occasion_note, stylingTips: resp.styling_tips };
        }}
      />
    </View>
  );
}

// ─── Reusable row button ──────────────────────────────────────
function ActionRow({ icon, label, variant, onPress }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  variant?: 'accent' | 'secondary';
  onPress: () => void;
}) {
  const bg = variant === 'accent' ? Colors.accent : variant === 'secondary' ? Colors.accentSecondary : Colors.surfaceLight;
  const fg = variant ? Colors.textOnAccent : Colors.textPrimary;
  const chevronColor = variant ? Colors.textOnAccent : Colors.textSecondary;
  return (
    <TouchableOpacity style={[styles.actionRow, { backgroundColor: bg, borderColor: variant ? bg : Colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={18} color={fg} />
      <Text style={[styles.actionRowText, { color: fg }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={chevronColor} />
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 120 },
  wardrobeStatus: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  wardrobeStatusText: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.lg,
  },
  actionRowText: {
    fontSize: FontSize.sm, fontWeight: FontWeight.bold,
    letterSpacing: 1, textTransform: 'uppercase', flex: 1, marginLeft: Spacing.md,
  },
});
