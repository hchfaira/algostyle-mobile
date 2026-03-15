/**
 * VersatilityBadge — Small overlay badge showing garment versatility tier.
 * Displayed on GarmentCard top-left corner.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSize, FontWeight } from '../../constants/theme';

interface Props {
  score: number; // 0–100
}

function getTier(score: number): { label: string; bg: string; color: string } {
  if (score >= 80) return { label: 'CORE', bg: '#018849', color: '#FFF' };
  if (score >= 55) return { label: 'GOOD', bg: '#FF8800', color: '#FFF' };
  return { label: 'LOW', bg: '#D01345', color: '#FFF' };
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
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
  },
});
