import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { MOCK_SOCIAL } from './constants';

interface ClosetStatsProps {
  wardrobeCount: number;
  outfitsCount: number;
}

export function ClosetStats({ wardrobeCount, outfitsCount }: ClosetStatsProps) {
  return (
    <View style={styles.closetRow}>
      <View style={styles.closetCard}>
        <Ionicons name="grid-outline" size={20} color={Colors.textPrimary} />
        <Text style={styles.closetValue}>{wardrobeCount}</Text>
        <Text style={styles.closetLabel}>WARDROBE</Text>
      </View>
      <View style={styles.closetCard}>
        <Ionicons name="sparkles-outline" size={20} color={Colors.textPrimary} />
        <Text style={styles.closetValue}>{outfitsCount}</Text>
        <Text style={styles.closetLabel}>OUTFITS</Text>
      </View>
      <View style={styles.closetCard}>
        <Ionicons name="heart-outline" size={20} color={Colors.textPrimary} />
        <Text style={styles.closetValue}>{MOCK_SOCIAL.total_likes_received}</Text>
        <Text style={styles.closetLabel}>LIKES</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  closetRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  closetCard: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceLight, gap: 4,
  },
  closetValue: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary },
  closetLabel: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
});
