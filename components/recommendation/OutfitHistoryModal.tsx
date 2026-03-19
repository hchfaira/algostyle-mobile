/**
 * OutfitHistoryModal — Slide-up modal showing past / planned outfits with tab toggle.
 */
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import type { AgendaEntry } from './constants';
import { t } from '../../i18n';

interface Props {
  visible: boolean;
  entries: AgendaEntry[];
  onClose: () => void;
  onSelectEntry: (entry: AgendaEntry) => void;
}

type Tab = 'upcoming' | 'past';

export default function OutfitHistoryModal({ visible, entries, onClose, onSelectEntry }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const now = new Date();

  const { upcoming, past } = useMemo(() => {
    const up: AgendaEntry[] = [];
    const pa: AgendaEntry[] = [];
    entries.forEach(e => {
      const d = e.plannedDate ? new Date(e.plannedDate) : null;
      if (d && d < now) pa.push(e);
      else up.push(e);
    });
    // upcoming: soonest first; past: most-recent first
    up.sort((a, b) => {
      if (!a.plannedDate) return 1;
      if (!b.plannedDate) return -1;
      return new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime();
    });
    pa.sort((a, b) => {
      if (!a.plannedDate) return 1;
      if (!b.plannedDate) return -1;
      return new Date(b.plannedDate).getTime() - new Date(a.plannedDate).getTime();
    });
    return { upcoming: up, past: pa };
  }, [entries]);

  const displayed = activeTab === 'upcoming' ? upcoming : past;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('outfitHistory')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Tab toggle */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
              onPress={() => setActiveTab('upcoming')}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={activeTab === 'upcoming' ? Colors.success : Colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
                {t('upcoming')}
              </Text>
              {upcoming.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: Colors.success + '20' }]}>
                  <Text style={[styles.tabBadgeText, { color: Colors.success }]}>{upcoming.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'past' && styles.tabActive]}
              onPress={() => setActiveTab('past')}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={14}
                color={activeTab === 'past' ? Colors.textSecondary : Colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
                {t('past')}
              </Text>
              {past.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{past.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {displayed.length > 0 ? (
              displayed.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.historyItem}
                  onPress={() => onSelectEntry(entry)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.itemBadge, { backgroundColor: activeTab === 'past' ? Colors.textMuted : entry.color }]}>
                    <Ionicons name={activeTab === 'past' ? 'checkmark' : 'calendar'} size={16} color="#FFF" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{entry.outfitName}</Text>
                    {entry.source ? (
                      <View style={styles.sourceRow}>
                        <Text style={styles.sourceTag}>
                        {entry.source === 'ai' ? t('sourceAI') : entry.source === 'score' ? t('sourceScore') : entry.source === 'prompt' ? t('sourcePrompt') : t('sourceBuild')}
                        </Text>
                        {entry.aiGrade ? (
                          <Text style={styles.gradeTag}>{entry.aiGrade}</Text>
                        ) : null}
                      </View>
                    ) : null}
                    <View style={styles.itemRow}>
                      <Ionicons name="calendar" size={13} color={Colors.accentWarm} />
                      <Text style={styles.itemText}>{entry.fullDate || entry.date}</Text>
                    </View>
                    <View style={styles.itemRow}>
                      <Ionicons name="location" size={13} color={Colors.accentWarm} />
                      <Text style={styles.itemText}>{entry.location}</Text>
                    </View>
                    <View style={styles.itemRow}>
                      <Ionicons name="pricetag" size={13} color={Colors.textMuted} />
                      <Text style={styles.itemText}>{entry.occasion}</Text>
                    </View>
                    {entry.reminder && entry.reminder.type !== 'none' ? (
                      <View style={styles.itemRow}>
                        <Ionicons name="notifications-outline" size={13} color={Colors.textMuted} />
                        <Text style={styles.itemText}>
                          {entry.reminder.minutes_before >= 60
                            ? `${entry.reminder.minutes_before / 60}h ${t('reminderBefore')}`
                            : `${entry.reminder.minutes_before}min ${t('reminderBefore')}`}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
                  size={32}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyText}>
                  {activeTab === 'upcoming' ? t('noUpcoming') : t('noPast')}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.background, maxHeight: '92%', borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 1.5, textTransform: 'uppercase' },

  // Tabs
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.accent },
  tabText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  tabTextActive: { color: Colors.textPrimary },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.full, backgroundColor: Colors.border },
  tabBadgeText: { fontSize: 9, fontWeight: FontWeight.black, color: Colors.textSecondary },

  // List
  content: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  historyItem: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'flex-start' },
  itemBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  itemContent: { flex: 1, gap: Spacing.xs },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sourceTag: { fontSize: 10, color: Colors.textMuted, fontWeight: FontWeight.medium },
  gradeTag: { fontSize: 10, fontWeight: FontWeight.black, color: Colors.accentWarm, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: Colors.accentWarm + '60', borderRadius: 3 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  itemText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },

  // Empty
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.md },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
});
