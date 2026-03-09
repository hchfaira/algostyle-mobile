/**
 * ResultsView — Displays generated outfits with planning form & agenda.
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
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
}

export default function ResultsView({
  outfits, agendaEntries, selectedOutfitForPlanning,
  planningDate, planningLocation, planningOccasion,
  onBack, onSelectOutfit, onSchedule, onRemoveEntry,
  onChangePlanningDate, onChangePlanningLocation, onChangePlanningOccasion,
}: Props) {
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
            <Pressable
              key={item.id}
              onPress={() => onSelectOutfit(item.id)}
              style={[styles.cardWrapper, selectedOutfitForPlanning === item.id && styles.cardSelected]}
            >
              <AnimatedOutfitCard item={item} index={index} />
            </Pressable>
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
  backText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 1 },
  list: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, paddingBottom: 120, gap: Spacing.xl },

  // Planning
  planningSection: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  planningHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  planningTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase' },
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm, color: Colors.textPrimary, height: 44 },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.accent, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, marginTop: Spacing.lg },
  scheduleBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: 1, textTransform: 'uppercase' },

  // Agenda
  agendaSection: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  agendaHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, paddingBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  agendaTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase' },
  agendaItem: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'center' },
  agendaDateBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.accent + '15', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, minWidth: 100 },
  agendaDateText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.accent, textTransform: 'uppercase' },
  agendaContent: { flex: 1, gap: Spacing.sm },
  agendaOutfitName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  agendaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  agendaLocation: { fontSize: FontSize.xs, color: Colors.accentWarm, fontWeight: FontWeight.semibold },
  agendaOccasion: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  agendaRemoveBtn: { padding: Spacing.sm },

  // Generated outfits
  generatedLabel: { marginTop: Spacing.xl },
  generatedTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase' },
  outfitsContainer: { gap: Spacing.xl, paddingBottom: Spacing.xl },
  cardWrapper: { marginBottom: Spacing.xl },
  cardSelected: { opacity: 0.8, borderColor: Colors.accent, borderWidth: 2, borderRadius: BorderRadius.md },
});
