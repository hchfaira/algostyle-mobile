/**
 * VersatilityBadge — Small overlay badge showing garment versatility tier.
 * Displayed on GarmentCard top-left corner.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSize, FontWeight, BorderRadius } from '../../constants/theme';

interface Props {
  score: number; // 0–100
}

function getTier(score: number): { label: string; bg: string; color: string } {
  if (score >= 80) return { label: 'CORE', bg: '#2D2D2D', color: '#FFF' };
  if (score >= 55) return { label: 'GOOD', bg: '#8B7355', color: '#FFF' };
  return { label: 'LOW', bg: '#A89E94', color: '#FFF' };
}

export default function VersatilityBadge({ score }: Props) {
  const tier = getTier(score);
  return (
    <View style={[styles.badge, { backgroundColor: tier.bg }]}>
      <Text style={[styles.label, { color: tier.color }]}>{tier.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  label: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.6,
  },
});
