/**
 * MissingPiecesSheet — Bottom-sheet showing missing capsule pieces ranked by ROI.
 * Each card shows the piece, outfits unlocked, price estimate, and ROI score.
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
import { CATEGORY_ICONS } from './constants';
import type { MissingPiecesResponse } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  data: MissingPiecesResponse | null;
}

function RoiBadge({ roi }: { roi: number }) {
  const level = roi >= 9 ? 'high' : roi >= 7.5 ? 'mid' : 'low';
  const colors = {
    high: { bg: Colors.success + '20', text: Colors.success },
    mid: { bg: Colors.accentWarm + '20', text: Colors.accentWarm },
    low: { bg: Colors.border, text: Colors.textMuted },
  };
  const c = colors[level];
  return (
    <View style={[roiStyles.badge, { backgroundColor: c.bg }]}>
      <Text style={[roiStyles.text, { color: c.text }]}>ROI {roi.toFixed(1)}</Text>
    </View>
  );
}

const roiStyles = StyleSheet.create({
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: BorderRadius.full },
  text: { fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.4 },
});

export default function MissingPiecesSheet({ visible, onClose, loading, data }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>MISSING PIECES</Text>
              <Text style={styles.subtitle}>Add these to maximise your capsule</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>Finding your gaps...</Text>
            </View>
          ) : data ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Insight banner */}
              <View style={styles.insightBanner}>
                <Ionicons name="sparkles" size={16} color={Colors.accent} />
                <Text style={styles.insightText}>{data.insight}</Text>
              </View>

              {data.missing_pieces.map((piece, i) => {
                const icon = CATEGORY_ICONS[piece.category] || 'cube-outline';
                return (
                  <View key={i} style={styles.pieceCard}>
                    {/* Rank */}
                    <Text style={styles.rank}>#{i + 1}</Text>

                    {/* Color swatch */}
                    <View style={[styles.swatch, { backgroundColor: piece.color_hex }]}>
                      <Ionicons name={icon as any} size={20} color="rgba(255,255,255,0.8)" />
                    </View>

                    {/* Info */}
                    <View style={styles.pieceInfo}>
                      <View style={styles.pieceHeaderRow}>
                        <Text style={styles.pieceName}>{piece.subcategory}</Text>
                        <RoiBadge roi={piece.roi} />
                      </View>
                      <Text style={styles.pieceReason}>{piece.reason}</Text>
                      <View style={styles.pieceMeta}>
                        <View style={styles.outfitsChip}>
                          <Ionicons name="shirt-outline" size={11} color={Colors.success} />
                          <Text style={styles.outfitsText}>+{piece.outfits_unlocked} outfits</Text>
                        </View>
                        <Text style={styles.priceText}>{piece.price_estimate}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}

              <View style={{ height: 20 }} />
            </ScrollView>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.40)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    maxHeight: '85%',
    borderTopLeftRadius: BorderRadius.xl + 4,
    borderTopRightRadius: BorderRadius.xl + 4,
  },
  handle: { width: 40, height: 4, borderRadius: BorderRadius.full, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4, letterSpacing: 1 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 20 },
  loading: { paddingVertical: 60, alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.sm },

  insightBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  insightText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },

  pieceCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rank: { width: 22, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textMuted, textAlign: 'center' },
  swatch: { width: 48, height: 60, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  pieceInfo: { flex: 1, gap: 5 },
  pieceHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  pieceName: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, letterSpacing: 0.3 },
  pieceReason: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 16 },
  pieceMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  outfitsChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  outfitsText: { fontSize: 10, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  priceText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
});
