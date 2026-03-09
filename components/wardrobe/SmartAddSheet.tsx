/**
 * SmartAddSheet — Bottom-sheet showing AI wardrobe suggestions
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

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import type { SmartSuggestion } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  suggestions: SmartSuggestion[];
  insight: string | null;
}

export default function SmartAddSheet({ visible, onClose, loading, suggestions, insight }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SMART ADD</Text>
              <Text style={styles.subtitle}>AI picks that maximise your outfit count</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>Analysing your wardrobe...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Info banner */}
              <View style={styles.infoBanner}>
                <Ionicons name="sparkles" size={18} color={Colors.accent} />
                <Text style={styles.infoText}>
                  We analyze your wardrobe to suggest pieces that unlock more outfit combinations. Add these to grow your collection smarter.
                </Text>
              </View>

              {/* Insight */}
              {insight && (
                <View style={styles.insightBanner}>
                  <Ionicons name="bulb-outline" size={16} color={Colors.accentWarm} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              )}

              {/* Suggestion cards */}
              {suggestions.map((sug) => (
                <View key={sug.id} style={styles.sugCard}>
                  <View style={styles.sugLeft}>
                    <View style={[styles.sugSwatch, { backgroundColor: sug.color_hex }]} />
                  </View>
                  <View style={styles.sugBody}>
                    <View style={styles.sugHeaderRow}>
                      <Text style={styles.sugTitle}>{sug.description}</Text>
                      <View style={styles.comboBadge}>
                        <Text style={styles.comboText}>+{sug.new_combinations} outfits</Text>
                      </View>
                    </View>
                    <Text style={styles.sugReason}>{sug.reason}</Text>
                    <View style={styles.sugTags}>
                      {sug.tags.map((t) => (
                        <View key={t} style={styles.sugTag}>
                          <Text style={styles.sugTagText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.sugScores}>
                      {[
                        { label: 'Quality', val: sug.quality_score },
                        { label: 'Trend', val: sug.trend_score },
                        { label: 'Durability', val: sug.durability_score },
                      ].map((s) => (
                        <View key={s.label} style={styles.sugScoreItem}>
                          <Text style={styles.sugScoreLabel}>{s.label}</Text>
                          <View style={styles.sugScoreTrack}>
                            <View style={[styles.sugScoreFill, { width: `${Math.round(s.val * 100)}%` as any }]} />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
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
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, marginBottom: 4, letterSpacing: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.lg, lineHeight: 20 },
  loading: { paddingVertical: 60, alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.sm },

  infoBanner: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: 'rgba(255,193,7,0.08)', borderRadius: BorderRadius.md, gap: Spacing.md, marginBottom: Spacing.md },
  infoText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: FontSize.sm + 4 },
  insightBanner: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.accentWarm + '15', borderLeftWidth: 3, borderLeftColor: Colors.accentWarm, padding: Spacing.md, marginBottom: Spacing.md },
  insightText: { flex: 1, color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 },

  sugCard: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sugLeft: { alignItems: 'center' },
  sugSwatch: { width: 44, height: 56, borderWidth: 1, borderColor: Colors.border },
  sugBody: { flex: 1, gap: 6 },
  sugHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  sugTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  comboBadge: { backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 3 },
  comboText: { fontSize: 10, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: 0.5 },
  sugReason: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  sugTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  sugTag: { paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.border },
  sugTagText: { fontSize: 10, color: Colors.textMuted, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  sugScores: { gap: 4 },
  sugScoreItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sugScoreLabel: { width: 62, fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  sugScoreTrack: { flex: 1, height: 3, backgroundColor: Colors.surfaceLight, overflow: 'hidden' },
  sugScoreFill: { height: '100%', backgroundColor: Colors.accent },
});
