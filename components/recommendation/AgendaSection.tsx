/**
 * AgendaSection — Week strip, timeline list & outfit map.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import OutfitMap from '../ui/OutfitMap';
import type { AgendaEntry } from './constants';

interface Props {
  entries: AgendaEntry[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
}

export default function AgendaSection({ entries, selectedId, onSelect, onRemove }: Props) {
  return (
    <>
      {/* ─── OUTFIT AGENDA ─── */}
      <View style={styles.section}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar" size={22} color={Colors.textPrimary} />
            <Text style={styles.title}>OUTFIT AGENDA</Text>
          </View>
          <Text style={styles.badge}>{entries.length} planned</Text>
        </View>

        {/* Week Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll} contentContainerStyle={styles.weekScrollContent}>
          {entries.map((entry) => {
            const isSelected = selectedId === entry.id;
            return (
              <TouchableOpacity
                key={entry.id}
                onPress={() => onSelect(isSelected ? null : entry.id)}
                style={[styles.dayCard, isSelected && styles.dayCardSelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{entry.date}</Text>
                <View style={[styles.outfitDot, { backgroundColor: entry.color }]} />
                <Text style={[styles.outfitName, isSelected && styles.outfitNameSelected]} numberOfLines={1}>
                  {entry.outfitName}
                </Text>
                <View style={styles.locationChip}>
                  <Ionicons name="location-sharp" size={10} color={Colors.accentWarm} />
                  <Text style={styles.locationChipText} numberOfLines={1}>{entry.location.split(',')[0]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Agenda Timeline */}
        <View style={styles.timeline}>
          {entries.map((entry, idx) => {
            const isLast = idx === entries.length - 1;
            const isSelected = selectedId === entry.id;
            return (
              <TouchableOpacity
                key={entry.id}
                activeOpacity={0.7}
                onPress={() => onSelect(isSelected ? null : entry.id)}
              >
                <View style={[styles.timelineRow, isSelected && styles.timelineRowSelected]}>
                  {/* Left rail */}
                  <View style={styles.rail}>
                    <View style={[styles.railDot, { backgroundColor: entry.color }]} />
                    {!isLast && <View style={styles.railLine} />}
                  </View>

                  {/* Content */}
                  <View style={styles.rowContent}>
                    <View style={styles.rowTop}>
                      <Text style={styles.rowDate}>{entry.date}</Text>
                      <Text style={styles.rowOccasion}>{entry.occasion}</Text>
                    </View>
                    <Text style={styles.rowOutfit}>{entry.outfitName}</Text>
                    <View style={styles.rowLocation}>
                      <Ionicons name="location-sharp" size={13} color={Colors.accentWarm} />
                      <Text style={styles.rowLocationText}>{entry.location}</Text>
                    </View>
                  </View>

                  {/* Delete */}
                  <TouchableOpacity
                    style={styles.rowDelete}
                    onPress={() => onRemove(entry.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ─── OUTFIT MAP ─── */}
      <View style={styles.mapSection}>
        <View style={styles.mapHeader}>
          <Ionicons name="map" size={20} color={Colors.textPrimary} />
          <Text style={styles.mapTitle}>WHERE YOU'LL WEAR THEM</Text>
        </View>
        <OutfitMap
          entries={entries}
          selectedId={selectedId}
          onSelectEntry={(id) => onSelect(id === selectedId ? null : id)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Section wrapper
  section: { marginTop: Spacing.xl, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: Colors.surface },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surfaceLight },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 1.5, textTransform: 'uppercase' },
  badge: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, backgroundColor: Colors.accent + '12', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, letterSpacing: 0.5, textTransform: 'uppercase' },

  // Week horizontal strip
  weekScroll: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  weekScrollContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  dayCard: { width: 100, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center', gap: Spacing.xs },
  dayCardSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + '08' },
  dayLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.black, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  dayLabelSelected: { color: Colors.accent },
  outfitDot: { width: 12, height: 12, borderRadius: 6 },
  outfitName: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  outfitNameSelected: { color: Colors.accent },
  locationChip: { flexDirection: 'row', alignItems: 'center', gap: 2, maxWidth: 90 },
  locationChipText: { fontSize: 10, color: Colors.accentWarm, fontWeight: FontWeight.semibold },

  // Timeline list
  timeline: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  timelineRow: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, alignItems: 'flex-start' },
  timelineRowSelected: { backgroundColor: Colors.accent + '06', marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg, borderRadius: 0 },

  rail: { alignItems: 'center', width: 20, paddingTop: 3 },
  railDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  railLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: -1 },

  rowContent: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  rowDate: { fontSize: FontSize.xs, fontWeight: FontWeight.black, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  rowOccasion: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  rowOutfit: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowLocation: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  rowLocationText: { fontSize: FontSize.xs, color: Colors.accentWarm, fontWeight: FontWeight.semibold },

  rowDelete: { paddingTop: 4 },

  // Map
  mapSection: { marginTop: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: Colors.surface },
  mapHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surfaceLight },
  mapTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 1.5, textTransform: 'uppercase' },
});
