/**
 * AgendaSection — Week strip, timeline list (upcoming/past split) & outfit map.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import OutfitMap from '../ui/OutfitMap';
import type { AgendaEntry } from './constants';
import { t } from '../../i18n';

interface Props {
  entries: AgendaEntry[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onOpenWeekPlanner?: () => void;
}

export default function AgendaSection({ entries, selectedId, onSelect, onRemove, onOpenWeekPlanner }: Props) {
  const now = new Date();

  const { upcoming, past } = useMemo(() => {
    const up: AgendaEntry[] = [];
    const pa: AgendaEntry[] = [];
    entries.forEach(e => {
      const d = e.plannedDate ? new Date(e.plannedDate) : null;
      if (d && d < now) pa.push(e);
      else up.push(e);
    });
    return { upcoming: up, past: pa };
  }, [entries]);

  const renderTimeline = (list: AgendaEntry[], isPast: boolean) => (
    <View style={styles.timeline}>
      {list.map((entry, idx) => {
        const isLast = idx === list.length - 1;
        const isSelected = selectedId === entry.id;
        return (
          <TouchableOpacity
            key={entry.id}
            activeOpacity={0.7}
            onPress={() => onSelect(isSelected ? null : entry.id)}
          >
            <View style={[styles.timelineRow, isSelected && styles.timelineRowSelected, isPast && styles.timelineRowPast]}>
              {/* Left rail */}
              <View style={styles.rail}>
                <View style={[styles.railDot, { backgroundColor: isPast ? Colors.textMuted : entry.color }]} />
                {!isLast && <View style={styles.railLine} />}
              </View>

              {/* Content */}
              <View style={styles.rowContent}>
                <View style={styles.rowTop}>
                  <Text style={[styles.rowDate, isPast && styles.rowDatePast]}>{entry.date}</Text>
                  <Text style={styles.rowOccasion}>{entry.occasion}</Text>
                  {entry.aiGrade ? (
                    <View style={styles.gradePill}>
                      <Text style={styles.gradeText}>{entry.aiGrade}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.rowOutfit, isPast && styles.rowOutfitPast]}>{entry.outfitName}</Text>
                <View style={styles.rowLocation}>
                  <Ionicons name="location-sharp" size={13} color={isPast ? Colors.textMuted : Colors.accentWarm} />
                  <Text style={styles.rowLocationText}>{entry.location}</Text>
                </View>
                {entry.reminder && entry.reminder.type !== 'none' ? (
                  <View style={styles.reminderRow}>
                    <Ionicons name="notifications-outline" size={11} color={Colors.textMuted} />
                    <Text style={styles.reminderText}>
                      {entry.reminder.minutes_before >= 60
                        ? `${entry.reminder.minutes_before / 60}h ${t('reminderBefore')}`
                        : `${entry.reminder.minutes_before}min ${t('reminderBefore')}`}
                    </Text>
                  </View>
                ) : null}
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
  );

  return (
    <>
      {/* ─── OUTFIT AGENDA ─── */}
      <View style={styles.section}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar" size={22} color={Colors.textPrimary} />
            <Text style={styles.title}>{t('outfitAgenda')}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.badge}>{entries.length} {t('planned')}</Text>
            {onOpenWeekPlanner ? (
              <TouchableOpacity style={styles.planBtn} onPress={onOpenWeekPlanner}>
                <Ionicons name="grid-outline" size={12} color={Colors.accentWarm} />
                <Text style={styles.planBtnText}>{t('planWeek')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Week Strip — upcoming only */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll} contentContainerStyle={styles.weekScrollContent}>
          {upcoming.map((entry) => {
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
          {upcoming.length === 0 && (
            <View style={styles.emptyStrip}>
              <Text style={styles.emptyStripText}>{t('noUpcoming')}</Text>
            </View>
          )}
        </ScrollView>

        {/* Upcoming timeline */}
        {upcoming.length > 0 && (
          <>
            <View style={styles.subHeader}>
              <Ionicons name="time-outline" size={13} color={Colors.success} />
              <Text style={[styles.subHeaderText, { color: Colors.success }]}>{t('upcoming')}</Text>
              <Text style={styles.subHeaderCount}>{upcoming.length}</Text>
            </View>
            {renderTimeline(upcoming, false)}
          </>
        )}

        {/* Past timeline */}
        {past.length > 0 && (
          <>
            <View style={[styles.subHeader, styles.subHeaderPast]}>
              <Ionicons name="checkmark-done-outline" size={13} color={Colors.textMuted} />
              <Text style={[styles.subHeaderText, { color: Colors.textMuted }]}>{t('past')}</Text>
              <Text style={styles.subHeaderCount}>{past.length}</Text>
            </View>
            {renderTimeline(past, true)}
          </>
        )}

        {entries.length === 0 && (
          <View style={styles.emptyTimeline}>
            <Ionicons name="calendar-outline" size={28} color={Colors.textMuted} />
            <Text style={styles.emptyTimelineText}>{t('planOutfitsHere')}</Text>
          </View>
        )}
      </View>

      {/* ─── OUTFIT MAP ─── */}
      <View style={styles.mapSection}>
        <View style={styles.mapHeader}>
          <Ionicons name="map" size={20} color={Colors.textPrimary} />
          <Text style={styles.mapTitle}>WHERE YOU&apos;LL WEAR THEM</Text>
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 1.5, textTransform: 'uppercase' },
  badge: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, backgroundColor: Colors.accent + '12', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, letterSpacing: 0.5, textTransform: 'uppercase' },
  planBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.accentWarm + '60', borderRadius: BorderRadius.full, backgroundColor: Colors.accentWarm + '10' },
  planBtnText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.accentWarm, letterSpacing: 0.5 },

  // Sub-headers (upcoming / past)
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.success + '08' },
  subHeaderPast: { backgroundColor: Colors.surfaceLight },
  subHeaderText: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1.5, textTransform: 'uppercase', flex: 1 },
  subHeaderCount: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, paddingHorizontal: 6, paddingVertical: 1, backgroundColor: Colors.border, borderRadius: BorderRadius.full },

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
  emptyStrip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  emptyStripText: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },

  // Timeline list
  timeline: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  timelineRow: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, alignItems: 'flex-start' },
  timelineRowSelected: { backgroundColor: Colors.accent + '06', marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  timelineRowPast: { opacity: 0.6 },

  rail: { alignItems: 'center', width: 20, paddingTop: 3 },
  railDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  railLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: -1 },

  rowContent: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2, flexWrap: 'wrap' },
  rowDate: { fontSize: FontSize.xs, fontWeight: FontWeight.black, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  rowDatePast: { color: Colors.textMuted },
  rowOccasion: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  rowOutfit: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowOutfitPast: { color: Colors.textSecondary },
  rowLocation: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  rowLocationText: { fontSize: FontSize.xs, color: Colors.accentWarm, fontWeight: FontWeight.semibold },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  reminderText: { fontSize: 10, color: Colors.textMuted },
  gradePill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.accentWarm + '60', backgroundColor: Colors.accentWarm + '10' },
  gradeText: { fontSize: 10, fontWeight: FontWeight.black, color: Colors.accentWarm, letterSpacing: 0.5 },
  rowDelete: { paddingTop: 4 },

  // Empty states
  emptyTimeline: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  emptyTimelineText: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic', textAlign: 'center' },

  // Map
  mapSection: { marginTop: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: Colors.surface },
  mapHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surfaceLight },
  mapTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 1.5, textTransform: 'uppercase' },
});
