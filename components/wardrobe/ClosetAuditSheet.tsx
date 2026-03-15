/**
 * ClosetAuditSheet — Bottom-sheet showing underused / hard-to-combine items
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { CATEGORY_ICONS } from './constants';
import type { FlaggedItem } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  items: FlaggedItem[];
  summary: { total_flagged: number; never_worn: number; rarely_worn: number; hard_to_combine: number } | null;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}

export default function ClosetAuditSheet({
  visible,
  onClose,
  loading,
  items,
  summary,
  expandedId,
  onToggleExpand,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>CLOSET AUDIT</Text>
              <Text style={styles.subtitle}>Items that need attention</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>Scanning your wardrobe...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Summary pills */}
              {summary && (
                <View style={styles.auditSummary}>
                  {[
                    { label: 'FLAGGED', val: summary.total_flagged, color: Colors.accent },
                    { label: 'NEVER WORN', val: summary.never_worn, color: Colors.error },
                    { label: 'HARD TO MIX', val: summary.hard_to_combine, color: Colors.accentWarm },
                  ].map((s) => (
                    <View key={s.label} style={[styles.pill, { borderColor: s.color }]}>
                      <Text style={[styles.pillNum, { color: s.color }]}>{s.val}</Text>
                      <Text style={styles.pillLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              )}

              {items.length === 0 && !loading && (
                <View style={styles.empty}>
                  <Ionicons name="checkmark-circle-outline" size={40} color={Colors.success} />
                  <Text style={styles.emptyTitle}>Your wardrobe is in great shape!</Text>
                  <Text style={styles.emptyDesc}>No underused or hard-to-combine items found.</Text>
                </View>
              )}

              {/* Flagged item cards */}
              {items.map((f) => {
                const g = f.garment;
                const cat = g.attributes.category as string;
                const icon = CATEGORY_ICONS[cat] || 'cube-outline';
                const isExpanded = expandedId === g.id;
                return (
                  <View key={g.id} style={styles.auditCard}>
                    <TouchableOpacity
                      style={styles.cardHeader}
                      activeOpacity={0.8}
                      onPress={() => onToggleExpand(g.id)}
                    >
                      <View style={[styles.swatch, { backgroundColor: g.attributes.color_hex || '#333' }]}>
                        <Ionicons name={icon as any} size={18} color="rgba(255,255,255,0.7)" />
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {g.attributes.subcategory || g.attributes.category}
                        </Text>
                        <Text style={styles.itemMeta}>
                          {g.attributes.color_primary} · {f.last_worn_label}
                        </Text>
                        <View style={styles.verdictRow}>
                          {f.verdicts.map((v) => (
                            <View
                              key={v}
                              style={[
                                styles.verdictBadge,
                                v === 'never_worn' && styles.verdictRed,
                                v === 'hard_to_combine' && styles.verdictAmber,
                              ]}
                            >
                              <Text style={styles.verdictText}>{v.replace(/_/g, ' ').toUpperCase()}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.expanded}>
                        <Text style={styles.impact}>{f.impact_message}</Text>
                        {f.restyle_ideas.length > 0 && (
                          <>
                            <Text style={styles.subLabel}>✂ RESTYLE IDEAS</Text>
                            {f.restyle_ideas.map((idea, i) => (
                              <Text key={i} style={styles.idea}>· {idea}</Text>
                            ))}
                          </>
                        )}
                        <Text style={styles.subLabel}>OUTFIT COUNT: {f.outfit_count}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40, maxHeight: '85%' },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, marginBottom: 4, letterSpacing: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.lg, lineHeight: 20 },
  loading: { paddingVertical: 60, alignItems: 'center' },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.md },

  auditSummary: { flexDirection: 'row', marginBottom: Spacing.lg },
  pill: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderWidth: 1, marginRight: Spacing.sm },
  pillNum: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  pillLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: FontWeight.bold, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: Spacing.sm },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm },

  auditCard: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  swatch: { width: 48, height: 56, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  itemMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
  verdictRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  verdictBadge: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: Colors.surfaceLight, marginRight: 4, marginBottom: 4 },
  verdictRed: { backgroundColor: Colors.error + '20' },
  verdictAmber: { backgroundColor: Colors.accentWarm + '20' },
  verdictText: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.textSecondary, letterSpacing: 0.5 },

  expanded: { paddingBottom: Spacing.md, paddingLeft: 64 },
  impact: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18, fontStyle: 'italic', marginBottom: Spacing.sm },
  subLabel: { fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.sm },
  idea: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
});
