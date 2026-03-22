/**
 * ActionCard — ASOS editorial smart-action card.
 *
 * Design language:
 *  • Pure white background, 1 px #EEEEEE border — clean fashion canvas
 *  • Near-black (#2D2D2D) text — maximum contrast, readable at a glance
 *  • Uppercase spaced title + readable subtitle in one card
 *  • Bold left accent bar (2 px) in the card's accent color
 *  • Active card gets a black bottom border — editorial underline treatment
 *  • Press: micro scale-down (0.97) — card itself is the affordance
 */
import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

const PEEK = 32;
export const CARD_WIDTH = SCREEN_W - Spacing.lg * 2 - PEEK;

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onPress: () => void;
  accentColor: string;
  variant: 'primary' | 'secondary';
  index?: number;
  isActive?: boolean;
  isEmoji?: boolean;  // true if icon is an emoji, false if Ionicons name
}

export default function ActionCard({ icon, title, subtitle, buttonLabel, accentColor, onPress, index = 0, isActive = false, isEmoji = false }: Props) {
  const scale    = useSharedValue(1);
  const cardAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn  = () => { scale.value = withSpring(0.97, { damping: 20, stiffness: 340 }); };
  const onPressOut = () => { scale.value = withSpring(1,    { damping: 16, stiffness: 300 }); };

  const ctaOpacity    = useSharedValue(0);
  const ctaTranslateY = useSharedValue(6);

  const triggerCta = () => {
    const easing = Easing.out(Easing.cubic);
    ctaOpacity.value    = 0;
    ctaTranslateY.value = 6;
    ctaOpacity.value    = withTiming(1, { duration: 320, easing });
    ctaTranslateY.value = withTiming(0, { duration: 300, easing });
  };

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    const delay  = 200 + index * 100;
    ctaOpacity.value    = withDelay(delay, withTiming(1, { duration: 320, easing }));
    ctaTranslateY.value = withDelay(delay, withTiming(0, { duration: 300, easing }));
  }, []);

  useEffect(() => {
    if (isActive) triggerCta();
  }, [isActive]);

  const ctaAnim = useAnimatedStyle(() => ({
    opacity:   ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, cardAnim]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={{ color: 'rgba(0,0,0,0.04)', borderless: false }}
        style={[styles.card, isActive && styles.cardActive]}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

        <View style={styles.content}>
          {/* Icon + title row */}
          <View style={styles.titleRow}>
            {isEmoji ? (
              <Text style={styles.emojiIcon}>{icon}</Text>
            ) : (
              <Ionicons name={icon as any} size={16} color={Colors.textPrimary} />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {title.toUpperCase()}
            </Text>
          </View>

          {/* Subtitle — full sentence, readable */}
          <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>

          {/* CTA label */}
          <Animated.View style={[styles.ctaRow, ctaAnim]}>
            <Text style={[styles.cta, { color: accentColor }]}>{buttonLabel}</Text>
            <Ionicons name="arrow-forward" size={10} color={accentColor} />
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width:       CARD_WIDTH,
    marginRight: Spacing.sm,
  },
  card: {
    flexDirection:    'row',
    alignItems:       'stretch',
    backgroundColor:  Colors.surface,
    borderWidth:      1,
    borderColor:      Colors.border,
    minHeight:        88,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 1 },
    shadowOpacity:    0.05,
    shadowRadius:     4,
    elevation:        2,
  },
  cardActive: {
    borderColor:       Colors.accent,
    borderBottomWidth: 2,
  },
  accentBar: {
    width: 3,
  },
  content: {
    flex:              1,
    paddingVertical:   12,
    paddingHorizontal: 14,
    gap:               4,
    justifyContent:    'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginBottom:  2,
  },
  emojiIcon: {
    fontSize: 18,
    lineHeight: 18,
  },
  title: {
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.black,
    letterSpacing: 1.8,
    color:         Colors.textPrimary,
  },
  subtitle: {
    fontSize:   FontSize.sm,
    color:      Colors.textSecondary,
    lineHeight: 18,
    fontWeight: FontWeight.regular,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginTop:     4,
  },
  cta: {
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});


