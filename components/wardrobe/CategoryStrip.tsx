/**
 * CategoryStrip — Horizontal row of toggle chips to show/hide wardrobe sections.
 * Sits directly under the search bar. Tap a chip to toggle its section visibility.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { BROWSABLE_CATEGORIES } from './constants';

interface Props {
  visibleCategories: string[];
  onToggle: (key: string) => void;
  counts: Record<string, number>;
}

function Chip({
  cat,
  isActive,
  count,
  onPress,
}: {
  cat: (typeof BROWSABLE_CATEGORIES)[number];
  isActive: boolean;
  count: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[styles.chip, isActive && styles.chipActive]}
        activeOpacity={0.75}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.93, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      >
        <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
          {cat.label}
        </Text>
        {count > 0 ? (
          <View style={[styles.chipBadge, isActive && styles.chipBadgeActive]}>
            <Text style={[styles.chipBadgeText, isActive && styles.chipBadgeTextActive]}>
              {count}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CategoryStrip({ visibleCategories, onToggle, counts }: Props) {
  return (
    <FlatList
      data={BROWSABLE_CATEGORIES}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.list}
      renderItem={({ item: cat }) => (
        <Chip
          cat={cat}
          isActive={visibleCategories.includes(cat.key)}
          count={counts[cat.key] || 0}
          onPress={() => onToggle(cat.key)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chipLabelActive: {
    color: Colors.textOnAccent,
  },
  chipBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  chipBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.black,
    color: Colors.textSecondary,
  },
  chipBadgeTextActive: {
    color: Colors.textOnAccent,
  },
});
