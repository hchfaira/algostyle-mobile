/**
 * EmptyState — shown when no analysis has been run yet
 * Quiet luxury — black, white, nude palette with enhanced animations
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn, FadeInDown, ZoomIn,
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { SECTION_COLORS } from './SharedAtoms';

const { width: SCREEN_W } = Dimensions.get('window');

// Orb data: colour + icon label
const PREVIEW_ORBS = [
  { color: SECTION_COLORS.palette,  icon: '🎨' },
  { color: SECTION_COLORS.body,     icon: '👗' },
  { color: SECTION_COLORS.face,     icon: '✨' },
  { color: SECTION_COLORS.skin,     icon: '💎' },
  { color: SECTION_COLORS.sizing,   icon: '📐' },
  { color: SECTION_COLORS.summary,  icon: '⭐' },
];

const TRUST_ITEMS = [
  { icon: 'time-outline',         label: '2 minutes' },
  { icon: 'sparkles-outline',     label: 'AI-powered' },
  { icon: 'lock-closed-outline',  label: 'Private' },
];

interface Props {
  onPress: () => void;
}

function PulseOrb({ color, icon, delay }: { color: string; icon: string; delay: number }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1,    { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      entering={ZoomIn.delay(delay).springify().damping(12)}
      style={[styles.orb, { backgroundColor: color }, style, Shadow.soft]}
    >
      <Text style={styles.orbIcon}>{icon}</Text>
    </Animated.View>
  );
}

export default function EmptyState({ onPress }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, { paddingBottom: insets.bottom + Spacing.xl }]}
    >
      {/* Floating orbs grid */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.orbGrid}>
        {PREVIEW_ORBS.map(({ color, icon }, i) => (
          <PulseOrb key={i} color={color} icon={icon} delay={i * 70} />
        ))}
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.textBlock}>
        <Text style={styles.title}>Your Style DNA{'\n'}Awaits ✦</Text>
        <Text style={styles.subtitle}>
          Get your personalised colour palette, body-shape
          guidance, and full style profile in under 2 minutes.
        </Text>
      </Animated.View>

      {/* Trust badges */}
      <Animated.View entering={FadeInDown.delay(320).duration(350)} style={styles.trustRow}>
        {TRUST_ITEMS.map(({ icon, label }) => (
          <View key={label} style={styles.trustItem}>
            <Ionicons name={icon as any} size={13} color={Colors.textSecondary} />
            <Text style={styles.trustLabel}>{label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* CTA */}
      <Animated.View entering={FadeInDown.delay(430).duration(350)} style={styles.ctaWrap}>
        <TouchableOpacity style={styles.ctaButton} onPress={onPress} activeOpacity={0.85}>
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.ctaLabel}>START ANALYSIS</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
    backgroundColor: Colors.background,
  },

  // Orb grid
  orbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
    width: SCREEN_W * 0.65,
  },
  orb: {
    width: 68, height: 68,
    borderRadius: 34,
    alignItems: 'center', justifyContent: 'center',
  },
  orbIcon: { fontSize: 28 },

  // Text
  textBlock: { alignItems: 'center', gap: 10 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    fontWeight: FontWeight.regular,
  },

  // Trust row
  trustRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trustLabel: { 
    fontSize: FontSize.xs, 
    color: Colors.textSecondary, 
    fontWeight: FontWeight.medium 
  },

  // CTA
  ctaWrap: { width: '100%' },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingVertical: 16,
    ...Shadow.soft,
  },
  ctaLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
});

