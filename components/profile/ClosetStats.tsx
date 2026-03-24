import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';

interface ClosetStatsProps {
  wardrobeCount: number;
  outfitsCount: number;
  likesReceived: number;
}

export function ClosetStats({ wardrobeCount, outfitsCount, likesReceived }: ClosetStatsProps) {
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
        <Text style={styles.closetValue}>{likesReceived}</Text>
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
    borderRadius: BorderRadius.xl,
  },
  closetValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  closetLabel: { fontSize: 10, fontWeight: FontWeight.medium, color: Colors.textMuted, letterSpacing: 0.3 },
});
