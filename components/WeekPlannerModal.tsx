/**
 * WeekPlannerModal
 * ─────────────────────────────────────────────────────────────
 * "Planifier ses tenues pour toute la semaine en avance, avec rappels"
 * Shows a 7-day grid where the user can assign an outfit to each day
 * from their agenda entries or add a new date to an existing outfit.
 *
 * Features:
 *   • 7-column week grid (current + next week toggle)
 *   • Tap a day → OutfitDatePickerModal pre-filled for that day
 *   • Drag (or tap) an agenda entry from a list to a day slot
 *   • Visual reminder indicator on each occupied day
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { OutfitDatePickerModal } from './OutfitDatePickerModal';
import type { AgendaEntry, ReminderSetting } from './recommendation/constants';

// ─── i18n ─────────────────────────────────────────────────────
const I18N = {
  title:     'Semaine / Week Planner',
  subtitle:  'Planifier ses tenues pour toute la semaine en avance',
  prevWeek:  '← Sem. précédente',
  nextWeek:  'Sem. suivante →',
  close:     'Fermer / Close',
  addOutfit: '+ Ajouter',
  planned:   'tenues planifiées',
  noOutfit:  'Libre',
  reminder:  '🔔',
};

const DAY_NAMES_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function addDays(d: Date, n: number) { const c = new Date(d); c.setDate(c.getDate() + n); return c; }
function startOfWeek(d: Date) {
  const c = new Date(d); c.setHours(0, 0, 0, 0);
  c.setDate(c.getDate() - c.getDay()); // Sunday = day 0
  return c;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function dateLabel(d: Date) { return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`; }

interface Props {
  visible: boolean;
  entries: AgendaEntry[];
  onClose: () => void;
  onAddEntry: (entry: Omit<AgendaEntry, 'id'>) => void;
  onUpdateEntry: (id: string, plannedDate: string, reminder: ReminderSetting, displayLabel: string) => void;
  onRemoveEntry: (id: string) => void;
}

export function WeekPlannerModal({ visible, entries, onClose, onAddEntry, onUpdateEntry, onRemoveEntry }: Props) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDay, setPickerDay] = useState<Date | null>(null);
  const [pickerEntry, setPickerEntry] = useState<AgendaEntry | null>(null);

  const weekStart = useMemo(() => addDays(startOfWeek(today), weekOffset * 7), [today, weekOffset]);
  const weekDays  = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Map each day to the first agenda entry planned on it
  const dayEntryMap = useMemo(() => {
    const map: Record<string, AgendaEntry[]> = {};
    for (const e of entries) {
      if (!e.plannedDate) continue;
      const d = new Date(e.plannedDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [entries]);

  const entriesForDay = useCallback((day: Date): AgendaEntry[] => {
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    return dayEntryMap[key] || [];
  }, [dayEntryMap]);

  const handleDayPress = useCallback((day: Date) => {
    setPickerDay(day);
    setPickerEntry(null);
    setShowDatePicker(true);
  }, []);

  const handleEntryPress = useCallback((entry: AgendaEntry) => {
    setPickerDay(entry.plannedDate ? new Date(entry.plannedDate) : null);
    setPickerEntry(entry);
    setShowDatePicker(true);
  }, []);

  const handlePickerConfirm = useCallback((isoDate: string | null, reminder: ReminderSetting, displayLabel: string) => {
    setShowDatePicker(false);
    if (pickerEntry) {
      // Update existing entry's date
      if (isoDate) {
        onUpdateEntry(pickerEntry.id, isoDate, reminder, displayLabel);
      }
    } else if (pickerDay && isoDate) {
      // Create a new placeholder entry for this day
      const d = new Date(isoDate);
      onAddEntry({
        outfitName: `Tenue du ${dateLabel(d)}`,
        date: `${DAY_NAMES_FR[d.getDay()]} ${d.getDate()}`,
        fullDate: displayLabel,
        plannedDate: isoDate,
        location: '',
        occasion: 'Casual',
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        color: '#C8A96E',
        reminder,
        source: 'build',
      });
    }
  }, [pickerEntry, pickerDay, onAddEntry, onUpdateEntry]);

  const plannedCount = entries.filter(e => e.plannedDate).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{I18N.title}</Text>
              <Text style={styles.subtitle}>{I18N.subtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Stats bar */}
          <View style={styles.statsBar}>
            <Ionicons name="calendar" size={14} color={Colors.accentWarm} />
            <Text style={styles.statsText}>
              <Text style={styles.statsNum}>{plannedCount}</Text>
              {' '}{I18N.planned}
            </Text>
          </View>

          {/* Week nav */}
          <View style={styles.weekNav}>
            <TouchableOpacity
              onPress={() => setWeekOffset(p => p - 1)}
              disabled={weekOffset <= 0}
              style={[styles.navBtn, weekOffset <= 0 && { opacity: 0.3 }]}
            >
              <Ionicons name="chevron-back" size={16} color={Colors.textSecondary} />
              <Text style={styles.navText}>{I18N.prevWeek}</Text>
            </TouchableOpacity>
            <Text style={styles.weekRange}>
              {dateLabel(weekDays[0])} – {dateLabel(weekDays[6])}
            </Text>
            <TouchableOpacity onPress={() => setWeekOffset(p => p + 1)} style={styles.navBtn}>
              <Text style={styles.navText}>{I18N.nextWeek}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 7-day grid */}
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {weekDays.map((day) => {
                const isToday = sameDay(day, today);
                const isPast  = day < today;
                const dayEntries = entriesForDay(day);
                return (
                  <View key={day.toISOString()} style={[styles.dayColumn, isPast && { opacity: 0.5 }]}>
                    {/* Day header */}
                    <View style={[styles.dayHeader, isToday && styles.dayHeaderToday]}>
                      <Text style={[styles.dayFr, isToday && styles.dayFrToday]}>
                        {DAY_NAMES_FR[day.getDay()]}
                      </Text>
                      <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>
                        {day.getDate()}
                      </Text>
                    </View>

                    {/* Outfit slots */}
                    {dayEntries.map(e => (
                      <TouchableOpacity
                        key={e.id}
                        style={[styles.outfitSlot, { borderLeftColor: e.color }]}
                        onPress={() => handleEntryPress(e)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.slotName} numberOfLines={2}>{e.outfitName}</Text>
                        <View style={styles.slotMeta}>
                          {e.reminder && e.reminder.type !== 'none' && (
                            <Text style={styles.reminderIcon}>{I18N.reminder}</Text>
                          )}
                          {e.aiGrade && (
                            <Text style={styles.gradeTag}>{e.aiGrade}</Text>
                          )}
                        </View>
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => onRemoveEntry(e.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="close-circle" size={14} color={Colors.textMuted} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}

                    {/* Add button */}
                    {!isPast && (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleDayPress(day)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={14} color={Colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Colors.accentWarm }]} />
                <Text style={styles.legendText}>Aujourd'hui / Today</Text>
              </View>
              <View style={styles.legendRow}>
                <Text style={styles.legendIcon}>🔔</Text>
                <Text style={styles.legendText}>Rappel actif / Reminder set</Text>
              </View>
            </View>
          </ScrollView>

          {/* Close */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.75}>
              <Text style={styles.closeBtnText}>{I18N.close}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Sub-modal */}
      <OutfitDatePickerModal
        isVisible={showDatePicker}
        outfitName={pickerEntry?.outfitName}
        initialDate={pickerEntry?.plannedDate}
        onConfirm={handlePickerConfirm}
        onClose={() => setShowDatePicker(false)}
      />
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statsNum:  { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  navText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  weekRange: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: 6,
  },
  dayColumn: { flex: 1, gap: 6 },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayHeaderToday: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dayFr: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.textMuted, textTransform: 'uppercase' },
  dayFrToday: { color: Colors.background },
  dayNum: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  dayNumToday: { color: Colors.background },
  outfitSlot: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: 6,
    position: 'relative',
    minHeight: 56,
  },
  slotName: { fontSize: 9, fontWeight: FontWeight.semibold, color: Colors.textPrimary, lineHeight: 13 },
  slotMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  reminderIcon: { fontSize: 9 },
  gradeTag: {
    fontSize: 8,
    fontWeight: FontWeight.bold,
    color: Colors.accentWarm,
    backgroundColor: Colors.accentWarm + '22',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  removeBtn: { position: 'absolute', top: 3, right: 3 },
  addBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendIcon: { fontSize: 11 },
  legendText: { fontSize: 10, color: Colors.textMuted },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  closeBtn: {
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  closeBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
});
