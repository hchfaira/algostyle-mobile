/**
 * ActionCard — Reusable smart-highlight card for wardrobe actions
 * (Smart Add, Closet Audit, Capsule Wardrobe)
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onPress: () => void;
  accentColor: string;
  variant: 'primary' | 'secondary';
}

export default function ActionCard({ icon, title, subtitle, buttonLabel, onPress, accentColor, variant }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === 'primary';
  const textColor = isPrimary ? Colors.textOnAccent : Colors.textPrimary;
  const subtitleColor = isPrimary ? 'rgba(255,255,255,0.85)' : Colors.textMuted;

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={[
          styles.card,
          isPrimary ? styles.cardPrimary : styles.cardSecondary,
          { borderColor: accentColor },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, isPrimary && styles.iconPrimary]}>
            <Ionicons name={icon as any} size={20} color={textColor} />
          </View>
          <View style={styles.headings}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.cta, { color: textColor }]}>{buttonLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={textColor} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: (SCREEN_W - Spacing.lg * 2 - Spacing.sm * 2) / 3,
  },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 136,
    justifyContent: 'space-between',
  },
  cardPrimary: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    ...Shadow.md,
  },
  cardSecondary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  iconPrimary: { backgroundColor: Colors.surface, borderColor: Colors.surface },
  headings: { flex: 1, gap: 2 },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  cta: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
