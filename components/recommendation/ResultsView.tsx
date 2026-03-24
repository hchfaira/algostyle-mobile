/**
 * ResultsView — Displays generated outfits with planning form & agenda.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { TopBar } from '../ui';
import AnimatedOutfitCard from './AnimatedOutfitCard';
import type { AgendaEntry } from './constants';
import type { OutfitResult } from '../../types';

interface Props {
  outfits: OutfitResult[];
  agendaEntries: AgendaEntry[];
  selectedOutfitForPlanning: string | null;
  planningDate: string;
  planningLocation: string;
  planningOccasion: string;
  onBack: () => void;
  onSelectOutfit: (id: string) => void;
  onSchedule: () => void;
  onRemoveEntry: (id: string) => void;
  onChangePlanningDate: (v: string) => void;
  onChangePlanningLocation: (v: string) => void;
  onChangePlanningOccasion: (v: string) => void;
  onShareOutfit?: (outfit: OutfitResult, markShared: () => void) => void;
}

export default function ResultsView({
  outfits, agendaEntries, selectedOutfitForPlanning,
  planningDate, planningLocation, planningOccasion,
  onBack, onSelectOutfit, onSchedule, onRemoveEntry,
  onChangePlanningDate, onChangePlanningLocation, onChangePlanningOccasion,
  onShareOutfit,
}: Props) {
  const [sharedIds, setSharedIds] = useState<Set<string>>(new Set());

  const handleShare = useCallback(
    (item: OutfitResult) => {
      if (!onShareOutfit) return;
      onShareOutfit(item, () => setSharedIds(prev => new Set(prev).add(item.id)));
    },
    [onShareOutfit],
  );

  return (
    <View style={styles.container}>
      <TopBar title="Your Outfits" subtitle={`${outfits.length} curated look${outfits.length !== 1 ? 's' : ''}`} />

      <Animated.View entering={FadeInRight} layout={Layout.springify()}>
        <TouchableOpacity onPress={onBack} style={styles.backRow} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.backText}>NEW SEARCH</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* Planning Form */}
        <View style={styles.planningSection}>
          <View style={styles.planningHeader}>
            <Ionicons name="calendar-outline" size={20} color={Colors.textPrimary} />
            <Text style={styles.planningTitle}>SCHEDULE OUTFIT</Text>
          </View>

          <InputGroup label="Date (e.g., Mar 15)" placeholder="Enter date..." value={planningDate} onChange={onChangePlanningDate} />
          <InputGroup label="Location" placeholder="Where will you wear this?" value={planningLocation} onChange={onChangePlanningLocation} />
          <InputGroup label="Occasion (Optional)" placeholder="e.g., Work, Dinner, Shopping" value={planningOccasion} onChange={onChangePlanningOccasion} />

          {selectedOutfitForPlanning && (
            <TouchableOpacity style={styles.scheduleBtn} onPress={onSchedule}>
              <Ionicons name="checkmark-done" size={18} color="#FFF" />
              <Text style={styles.scheduleBtnText}>CONFIRM & SCHEDULE</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Agenda */}
        <View style={styles.agendaSection}>
          <View style={styles.agendaHeader}>
            <Ionicons name="time-outline" size={20} color={Colors.textPrimary} />
            <Text style={styles.agendaTitle}>OUTFIT AGENDA ({agendaEntries.length})</Text>
          </View>

          {agendaEntries.map((entry) => (
            <View key={entry.id} style={styles.agendaItem}>
              <View style={styles.agendaDateBadge}>
                <Ionicons name="calendar" size={16} color={Colors.accent} />
                <Text style={styles.agendaDateText}>{entry.date}</Text>
              </View>
              <View style={styles.agendaContent}>
                <Text style={styles.agendaOutfitName}>{entry.outfitName}</Text>
                <View style={styles.agendaRow}>
                  <Ionicons name="location" size={14} color={Colors.accentWarm} />
                  <Text style={styles.agendaLocation}>{entry.location}</Text>
                </View>
                <View style={styles.agendaRow}>
                  <Ionicons name="pricetag" size={14} color={Colors.textMuted} />
                  <Text style={styles.agendaOccasion}>{entry.occasion}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.agendaRemoveBtn} onPress={() => onRemoveEntry(entry.id)}>
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Generated Outfits */}
        <View style={styles.generatedLabel}>
          <Text style={styles.generatedTitle}>GENERATED OUTFITS</Text>
        </View>

        <View style={styles.outfitsContainer}>
          {outfits.map((item, index) => (
            <View
              key={item.id}
              style={[styles.cardWrapper, selectedOutfitForPlanning === item.id && styles.cardSelected]}
            >
              <AnimatedOutfitCard
                item={item}
                index={index}
                onShare={onShareOutfit ? handleShare : undefined}
                isShared={sharedIds.has(item.id)}
                onSelect={() => onSelectOutfit(item.id)}
                isSelected={selectedOutfitForPlanning === item.id}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Tiny helper ──────────────────────────────────────────────
function InputGroup({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, letterSpacing: 0.3 },
  list: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, paddingBottom: 120, gap: Spacing.xl },

  // Planning
  planningSection: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadow.soft },
  planningHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  planningTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.2 },
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 0.3 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm, color: Colors.textPrimary, height: 44 },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.accent, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, marginTop: Spacing.lg },
  scheduleBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#FFF', letterSpacing: 0.3 },

  // Agenda
  agendaSection: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadow.soft },
  agendaHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, paddingBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  agendaTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.2 },
  agendaItem: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'center' },
  agendaDateBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, minWidth: 100, borderWidth: 1, borderColor: Colors.border },
  agendaDateText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  agendaContent: { flex: 1, gap: Spacing.sm },
  agendaOutfitName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.2 },
  agendaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  agendaLocation: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  agendaOccasion: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  agendaRemoveBtn: { padding: Spacing.sm },

  // Generated outfits
  generatedLabel: { marginTop: Spacing.xl },
  generatedTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.2 },
  outfitsContainer: { gap: Spacing.xl, paddingBottom: Spacing.xl },
  cardWrapper: { marginBottom: Spacing.xl },
  cardSelected: { opacity: 0.85, borderColor: Colors.accent, borderWidth: 2, borderRadius: BorderRadius.xl },
});
