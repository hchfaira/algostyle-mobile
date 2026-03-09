/**
 * OutfitHistoryModal — Slide-up modal showing past / planned outfits.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import type { AgendaEntry } from './constants';

interface Props {
  visible: boolean;
  entries: AgendaEntry[];
  onClose: () => void;
  onSelectEntry: (entry: AgendaEntry) => void;
}

export default function OutfitHistoryModal({ visible, entries, onClose, onSelectEntry }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>OUTFIT HISTORY</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {entries.length > 0 ? (
              entries.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.historyItem}
                  onPress={() => onSelectEntry(entry)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.itemBadge, { backgroundColor: entry.color }]}>
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{entry.outfitName}</Text>
                    <View style={styles.itemRow}>
                      <Ionicons name="calendar" size={13} color={Colors.accentWarm} />
                      <Text style={styles.itemText}>{entry.fullDate}</Text>
                    </View>
                    <View style={styles.itemRow}>
                      <Ionicons name="location" size={13} color={Colors.accentWarm} />
                      <Text style={styles.itemText}>{entry.location}</Text>
                    </View>
                    <View style={styles.itemRow}>
                      <Ionicons name="pricetag" size={13} color={Colors.textMuted} />
                      <Text style={styles.itemText}>{entry.occasion}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No outfit history yet</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.background, maxHeight: '90%', borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 1.5, textTransform: 'uppercase' },
  content: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  historyItem: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'flex-start' },
  itemBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  itemContent: { flex: 1, gap: Spacing.xs },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  itemText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginVertical: Spacing.xl, fontStyle: 'italic' },
});
