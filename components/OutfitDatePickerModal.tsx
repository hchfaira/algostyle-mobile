/**
 * OutfitDatePickerModal
 * ─────────────────────────────────────────────────────────────
 * Reusable bottom-sheet that lets the user:
 *   1. Pick a date for wearing the outfit (week navigation + day grid)
 *   2. Pick a time (hour chip row)
 *   3. Set a reminder (none / 30min / 1h / morning / evening before)
 *
 * i18n strings include French / English side-by-side following the
 * spec: "Planifier ses tenues pour toute la semaine en avance, avec rappels"
 *
 * Props:
 *   isVisible   – controls modal visibility
 *   outfitName  – shown in header for context
 *   initialDate – pre-fill (ISO string)
 *   onConfirm   – (isoDate, reminder) => void
 *   onClose
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import type { ReminderSetting, ReminderType } from './recommendation/constants';
import { REMINDER_OPTIONS } from './recommendation/constants';
import { t } from '../i18n';
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const DAY_NAMES_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Helpers ─────────────────────────────────────────────────
function startOfDay(d: Date): Date {
  const c = new Date(d); c.setHours(0, 0, 0, 0); return c;
}
function addDays(d: Date, n: number): Date {
  const c = new Date(d); c.setDate(c.getDate() + n); return c;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function formatDisplay(d: Date, hour: number): string {
  return `${DAY_NAMES_EN[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} · ${String(hour).padStart(2, '0')}h00`;
}
function toISO(d: Date, hour: number): string {
  const c = new Date(d);
  c.setHours(hour, 0, 0, 0);
  return c.toISOString();
}

// ─── Component ───────────────────────────────────────────────
interface Props {
  isVisible: boolean;
  outfitName?: string;
  initialDate?: string; // ISO string
  onConfirm: (isoDate: string | null, reminder: ReminderSetting, displayLabel: string) => void;
  onClose: () => void;
}

export function OutfitDatePickerModal({ isVisible, outfitName, initialDate, onConfirm, onClose }: Props) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [weekOffset, setWeekOffset] = useState(0);

  // Parse initialDate
  const initD = useMemo(() => {
    if (!initialDate) return null;
    try { return new Date(initialDate); } catch { return null; }
  }, [initialDate]);

  const [selectedDay, setSelectedDay] = useState<Date | null>(initD ? startOfDay(initD) : null);
  const [selectedHour, setSelectedHour] = useState(initD ? initD.getHours() : 9);
  const [reminderType, setReminderType] = useState<ReminderType>('push');
  const [reminderMinutes, setReminderMinutes] = useState(60);
  const [skipDate, setSkipDate] = useState(false);

  // Build 7-day grid for current week offset
  const weekDays = useMemo(() => {
    const start = addDays(today, weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [today, weekOffset]);

  const handleConfirm = useCallback(() => {
    if (skipDate) {
      onConfirm(null, { type: 'none', minutes_before: 0 }, 'Sans date');
      return;
    }
    if (!selectedDay) return;
    const iso = toISO(selectedDay, selectedHour);
    const label = formatDisplay(selectedDay, selectedHour);
    onConfirm(iso, { type: reminderType, minutes_before: reminderMinutes }, label);
  }, [skipDate, selectedDay, selectedHour, reminderType, reminderMinutes, onConfirm]);

  if (!isVisible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.sheet}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('planOutfit')}</Text>
              {outfitName ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {t('forOutfit')} «{outfitName}»
                </Text>
              ) : (
                <Text style={styles.subtitle}>{t('planSubtitle')}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

            {/* ── Skip date toggle ── */}
            <TouchableOpacity
              style={[styles.skipRow, skipDate && styles.skipRowActive]}
              onPress={() => setSkipDate(p => !p)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={skipDate ? 'checkbox' : 'square-outline'}
                size={20}
                color={skipDate ? Colors.accent : Colors.textMuted}
              />
              <Text style={[styles.skipText, skipDate && styles.skipTextActive]}>
                {t('noDate')}
              </Text>
            </TouchableOpacity>

            {!skipDate && (
              <>
                {/* ── Day picker ── */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('selectDay')}</Text>
                    <View style={styles.weekNav}>
                      <TouchableOpacity
                        onPress={() => setWeekOffset(p => p - 1)}
                        disabled={weekOffset <= 0}
                        style={[styles.navBtn, weekOffset <= 0 && { opacity: 0.3 }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="chevron-back" size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                      <Text style={styles.weekLabel}>
                        {MONTH_NAMES[weekDays[0].getMonth()]} {weekDays[0].getDate()} – {weekDays[6].getDate()}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setWeekOffset(p => p + 1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.navBtn}
                      >
                        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.dayGrid}>
                    {weekDays.map((day) => {
                      const isSel  = selectedDay !== null && sameDay(day, selectedDay);
                      const isToday = sameDay(day, today);
                      const isPast  = day < today;
                      return (
                        <TouchableOpacity
                          key={day.toISOString()}
                          onPress={() => !isPast && setSelectedDay(day)}
                          style={[
                            styles.dayCell,
                            isSel   && styles.dayCellSelected,
                            isPast  && styles.dayCellPast,
                            isToday && !isSel && styles.dayCellToday,
                          ]}
                          activeOpacity={isPast ? 1 : 0.75}
                        >
                          <Text style={[styles.dayName, isSel && styles.dayNameSelected, isPast && styles.dayNamePast]}>
                            {DAY_NAMES_FR[day.getDay()]}
                          </Text>
                          <Text style={[styles.dayNum, isSel && styles.dayNumSelected, isPast && styles.dayNumPast]}>
                            {day.getDate()}
                          </Text>
                          {isToday && <View style={[styles.todayDot, isSel && { backgroundColor: Colors.background }]} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* ── Time picker ── */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('selectTime')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourRow}>
                    {HOURS.map((h) => {
                      const isSel = selectedHour === h;
                      return (
                        <TouchableOpacity
                          key={h}
                          onPress={() => setSelectedHour(h)}
                          style={[styles.hourChip, isSel && styles.hourChipSelected]}
                          activeOpacity={0.75}
                        >
                          <Text style={[styles.hourText, isSel && styles.hourTextSelected]}>
                            {String(h).padStart(2, '0')}h
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* ── Reminder ── */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('reminder')}</Text>
                  <View style={styles.reminderGrid}>
                    {REMINDER_OPTIONS.map((opt) => {
                      const isSel = reminderType === opt.value && reminderMinutes === opt.minutes;
                      return (
                        <TouchableOpacity
                          key={`${opt.value}-${opt.minutes}`}
                          onPress={() => {
                            setReminderType(opt.value);
                            setReminderMinutes(opt.minutes);
                          }}
                          style={[styles.reminderChip, isSel && styles.reminderChipSelected]}
                          activeOpacity={0.75}
                        >
                          <Text style={[styles.reminderText, isSel && styles.reminderTextSelected]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* ── Preview ── */}
                {selectedDay && (
                  <View style={styles.previewRow}>
                    <Ionicons name="calendar" size={14} color={Colors.accentWarm} />
                    <Text style={styles.previewText}>
                      {formatDisplay(selectedDay, selectedHour)}
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* ── Actions ── */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.75}>
              <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !skipDate && !selectedDay && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!skipDate && !selectedDay}
              activeOpacity={0.82}
            >
              <Ionicons name="checkmark" size={16} color={Colors.background} style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>{t('confirm')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 32,
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
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  // Skip
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
  },
  skipRowActive: { backgroundColor: Colors.surfaceLight },
  skipText: { fontSize: FontSize.sm, color: Colors.textMuted },
  skipTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  // Section
  section: { marginTop: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: FontWeight.black,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // Week nav
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  weekLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  navBtn: { padding: 2 },
  // Day grid
  dayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dayCellPast: { opacity: 0.35 },
  dayCellToday: { borderColor: Colors.accentWarm },
  dayName: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  dayNameSelected: { color: Colors.background },
  dayNamePast: { color: Colors.textMuted },
  dayNum: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  dayNumSelected: { color: Colors.background },
  dayNumPast: { color: Colors.textMuted },
  todayDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: Colors.accentWarm,
    marginTop: 3,
  },
  // Hours
  hourRow: { gap: 8, paddingVertical: 4 },
  hourChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  hourChipSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  hourText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  hourTextSelected: { color: Colors.background },
  // Reminder
  reminderGrid: { gap: 8 },
  reminderChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  reminderChipSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  reminderText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reminderTextSelected: { color: Colors.background, fontWeight: FontWeight.semibold },
  // Preview
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewText: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  // Actions
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.background },
});
