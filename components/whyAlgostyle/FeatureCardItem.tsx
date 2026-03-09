import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import type { FeatureCard } from './constants';

interface FeatureCardItemProps {
  feature: FeatureCard;
  index: number;
  onExpand: () => void;
}

export function FeatureCardItem({ feature, index, onExpand }: FeatureCardItemProps) {
  const bgColor = index % 2 === 0 ? Colors.surface : Colors.background;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor }]}
      onPress={onExpand}
      activeOpacity={0.8}
    >
      {/* Icon + Badge */}
      <View style={styles.cardIconArea}>
        <View style={styles.cardIcon}>
          <Ionicons name={feature.icon} size={28} color={Colors.textPrimary} />
        </View>
        {feature.badge && <Text style={styles.cardBadge}>{feature.badge}</Text>}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{feature.title}</Text>
        <Text style={styles.cardCopy}>{feature.copy}</Text>

        {/* Tap to expand indicator */}
        <View style={styles.cardFooter}>
          <Text style={styles.expandText}>TAP FOR DETAILS</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },
  cardIconArea: { position: 'relative', alignItems: 'center' },
  cardIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
  },
  cardBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 12,
    fontWeight: FontWeight.bold,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  cardCopy: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});
