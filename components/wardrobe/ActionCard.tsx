/**
 * ActionCard — Quiet Luxury "nude palette" smart-action card.
 *
 * Design language:
 *  • 4 warm nude backgrounds — grège, argile, stone, blush — no white, no black fill
 *  • Espresso brown text (#3B2A1A) on all cards — soft, warm, high-contrast on nudes
 *  • Soft-rectangle shape: borderRadius 10 — rounded but structured
 *  • Cards are narrower than the viewport — next card peeks right (invites swipe)
 *  • Subtle inner-glow border (same hue, slightly darker) adds depth without hard lines
 *  • Fine shadow lifts each card like a swatch of fabric
 *  • Icon sits above spaced-uppercase title, CTA below in lighter weight
 *  • Press: micro scale-down (0.97) — card itself is the affordance
 */
import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { Spacing, FontSize, FontWeight } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

// Slightly narrower than the full width so the next card peeks — invites scrolling
const PEEK = 28;
export const CARD_WIDTH = SCREEN_W - Spacing.lg * 2 - PEEK;

// Espresso: warm dark brown — readable on all nude backgrounds
const ESPRESSO = '#3B2A1A';

// Per-card nude palette — near-white, barely-there warm tints
const CARD_THEMES = [
  { bg: '#FDFCFB', border: '#EDE9E4' }, // Blanc cassé pur — ivoire neutre
  { bg: '#FCF9F6', border: '#EDE6DF' }, // Blanc crème — touche de vanille
  { bg: '#FCF8F6', border: '#EDE5E0' }, // Blanc rosé — poudre de riz
  { bg: '#FBFAF7', border: '#ECEAE3' }, // Blanc lin — fil naturel
] as const;

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onPress: () => void;
  accentColor: string;   // kept for API compat — not used visually
  variant: 'primary' | 'secondary';
  index?: number;
  isActive?: boolean;    // true when this card is the snapped-to card in the carousel
}

export default function ActionCard({ icon, title, buttonLabel, onPress, index = 0, isActive = false }: Props) {
  // ── Card press animation ──────────────────────────────────────────────
  const scale    = useSharedValue(1);
  const cardAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn  = () => { scale.value = withSpring(0.97, { damping: 20, stiffness: 340 }); };
  const onPressOut = () => { scale.value = withSpring(1,    { damping: 16, stiffness: 300 }); };

  // ── CTA fade-in + slide-up — fires on mount AND each time card becomes active ──
  const ctaOpacity    = useSharedValue(0);
  const ctaTranslateY = useSharedValue(8);  // starts 8px below final position

  const triggerCta = () => {
    const easing = Easing.out(Easing.cubic);
    // Reset instantly, then animate in
    ctaOpacity.value    = 0;
    ctaTranslateY.value = 8;
    ctaOpacity.value    = withTiming(1, { duration: 400, easing });
    ctaTranslateY.value = withTiming(0, { duration: 380, easing });
  };

  // First appearance: slight delay so the card has time to settle into view
  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    const delay  = 300 + index * 120;
    ctaOpacity.value    = withDelay(delay, withTiming(1, { duration: 400, easing }));
    ctaTranslateY.value = withDelay(delay, withTiming(0, { duration: 380, easing }));
  }, []);

  // Re-trigger every time this card snaps into the active position
  useEffect(() => {
    if (isActive) triggerCta();
  }, [isActive]);

  const ctaAnim = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  const theme = CARD_THEMES[index % CARD_THEMES.length];

  return (
    <Animated.View style={[styles.wrapper, cardAnim]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={{ color: 'rgba(59,42,26,0.06)', borderless: false }}
        style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}
      >
        {/* Icon — fine, centred */}
        <Ionicons name={icon as any} size={18} color={ESPRESSO} style={styles.icon} />

        {/* Title — spaced uppercase */}
        <Text style={styles.title} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>

        {/* CTA — fade-in + slide-up on mount */}
        <Animated.Text style={[styles.cta, ctaAnim]} numberOfLines={1}>
          {buttonLabel}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    marginRight: Spacing.sm,   // gap between cards
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
    borderWidth: 1,
    borderRadius: 10,
    gap: 4,
    // Fabric-swatch shadow — soft and wide
    shadowColor: '#3B2A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  icon: {
    marginBottom: 1,
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: ESPRESSO,
  },
  cta: {
    fontSize: 10,
    fontWeight: FontWeight.regular,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: ESPRESSO + 'AA',   // 67% opacity — muted but warm
  },
});


