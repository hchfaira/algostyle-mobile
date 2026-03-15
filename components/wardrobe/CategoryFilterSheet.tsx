/**
 * CategoryFilterSheet — Bottom sheet to toggle visible wardrobe category sections.
 * Triggered by the filter icon in the SearchBar. Zero footprint when closed.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { BROWSABLE_CATEGORIES } from './constants';

const SHEET_HEIGHT = 320;

interface Props {
  visible: boolean;
  onClose: () => void;
  visibleCategories: string[];
  onToggle: (key: string) => void;
  counts: Record<string, number>;
}

export default function CategoryFilterSheet({
  visible,
  onClose,
  visibleCategories,
  onToggle,
  counts,
}: Props) {
  const slideY  = useSharedValue(SHEET_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    if (visible) {
      opacity.value = withTiming(1,  { duration: 180, easing });
      slideY.value  = withSpring(0,  { damping: 22, stiffness: 200 });
    } else {
      opacity.value = withTiming(0,  { duration: 180, easing });
      slideY.value  = withTiming(SHEET_HEIGHT, { duration: 200, easing });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: slideY.value }] }));

  const allVisible = visibleCategories.length === BROWSABLE_CATEGORIES.length;

  const handleSelectAll = () => {
    BROWSABLE_CATEGORIES.forEach((cat) => {
      if (!visibleCategories.includes(cat.key)) onToggle(cat.key);
    });
  };

  const handleClearAll = () => {
    // Keep at least one category visible
    BROWSABLE_CATEGORIES.forEach((cat, i) => {
      if (i > 0 && visibleCategories.includes(cat.key)) onToggle(cat.key);
    });
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SECTIONS</Text>
          <TouchableOpacity
            onPress={allVisible ? handleClearAll : handleSelectAll}
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          >
            <Text style={styles.toggleAll}>
              {allVisible ? 'Deselect all' : 'Select all'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category grid */}
        <View style={styles.grid}>
          {BROWSABLE_CATEGORIES.map((cat) => {
            const isActive = visibleCategories.includes(cat.key);
            const count    = counts[cat.key] || 0;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.cell, isActive && styles.cellActive]}
                activeOpacity={0.75}
                onPress={() => onToggle(cat.key)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={18}
                  color={isActive ? Colors.textOnAccent : Colors.textMuted}
                />
                <Text style={[styles.cellLabel, isActive && styles.cellLabelActive]}>
                  {cat.label}
                </Text>
                {count > 0 && (
                  <Text style={[styles.cellCount, isActive && styles.cellCountActive]}>
                    {count}
                  </Text>
                )}
                {isActive && (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={Colors.textOnAccent}
                    style={styles.check}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Done button */}
        <TouchableOpacity style={styles.doneBtn} activeOpacity={0.85} onPress={onClose}>
          <Text style={styles.doneBtnText}>DONE</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Spacing.xl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  toggleAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '47%',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
  },
  cellActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  cellLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  cellLabelActive: {
    color: Colors.textOnAccent,
  },
  cellCount: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  cellCountActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  check: {
    marginLeft: 2,
  },
  doneBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    height: 44,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: Colors.textOnAccent,
    letterSpacing: 2,
  },
});
