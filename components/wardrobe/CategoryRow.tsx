/**
 * CategoryRow — One wardrobe section: header + horizontal scroll of 3 cards per view.
 * Used inside the wardrobe tab for each visible category.
 */
import React, { memo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { CATEGORY_ICONS } from './constants';
import GarmentCard from './GarmentCard';
import type { GarmentItem } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');

// 3 cards visible + 12px peek of 4th to hint scrollability
const H_PAD   = Spacing.lg;          // horizontal padding on each side
const GAP     = 10;                   // gap between cards
const PEEK    = 12;                   // how much of the 4th card peeks
const CARD_W  = (SCREEN_W - H_PAD * 2 - GAP * 2 - PEEK) / 3;

interface Props {
  categoryKey: string;
  label: string;
  emoji: string;
  items: GarmentItem[];
  sectionIndex: number;
  sortScores?: Record<string, { versatility_score: number }>;
  onPressItem: (item: GarmentItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  /** Whether this category's items are currently expanded/visible */
  isVisible?: boolean;
  /** Called when user taps the eye icon to hide/show this category */
  onToggleVisibility?: () => void;
  /** When true, cards show selection overlay instead of fav/delete actions */
  selectionMode?: boolean;
  /** IDs of currently selected items (used in selectionMode) */
  selectedItems?: string[];
}

const CategoryRow = memo(function CategoryRow({
  categoryKey,
  label,
  items,
  sectionIndex,
  sortScores,
  onPressItem,
  onDeleteItem,
  onToggleFavorite,
  isVisible = true,
  onToggleVisibility,
  selectionMode,
  selectedItems,
}: Props) {
  const icon = CATEGORY_ICONS[categoryKey] || 'cube-outline';

  return (
    <Animated.View
      entering={FadeInDown.delay(sectionIndex * 60).springify().damping(16)}
      style={styles.section}
    >
      {/* Section header — always visible */}
      <View style={[styles.header, !isVisible && styles.headerCollapsed]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerLabel, !isVisible && styles.headerLabelMuted]}>{label}</Text>
          {isVisible && (
            <View style={styles.countPill}>
              <Text style={styles.countText}>{items.length}</Text>
            </View>
          )}
        </View>
        {onToggleVisibility && (
          <TouchableOpacity
            onPress={onToggleVisibility}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={isVisible ? `Hide ${label}` : `Show ${label}`}
            accessibilityRole="button"
          >
            <Ionicons
              name={isVisible ? 'eye-outline' : 'eye-off-outline'}
              size={17}
              color={isVisible ? Colors.textMuted : Colors.border}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal item strip — only when visible */}
      {isVisible && (
        <>
          {items.length === 0 ? (
            <View style={styles.emptyRow}>
              <Ionicons name={icon as any} size={28} color={Colors.border} />
              <Text style={styles.emptyText}>No {label.toLowerCase()} yet</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.rowContent}
              snapToInterval={CARD_W + GAP}
              snapToAlignment="start"
              decelerationRate="fast"
              renderItem={({ item, index }) => (
                <View style={{ marginRight: index < items.length - 1 ? GAP : 0 }}>
                  <GarmentCard
                    item={item}
                    index={sectionIndex * 10 + index}
                    cardWidth={CARD_W}
                    onDelete={onDeleteItem}
                    onToggleFavorite={onToggleFavorite}
                    onPress={onPressItem}
                    versatilityScore={selectionMode ? undefined : sortScores?.[item.id]?.versatility_score}
                    selected={selectionMode ? selectedItems?.includes(item.id) : undefined}
                    hideActions={selectionMode}
                  />
                </View>
              )}
            />
          )}
        </>
      )}

      <View style={styles.divider} />
    </Animated.View>
  );
});

export default CategoryRow;

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: H_PAD,
    paddingTop:        Spacing.md,
    paddingBottom:     10,
  },
  headerCollapsed: {
    paddingBottom: Spacing.md,
    opacity:       0.5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  headerLabel: {
    fontSize:      FontSize.sm,
    fontWeight:    FontWeight.black,
    color:         Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerLabelMuted: {
    color: Colors.textMuted,
  },
  countPill: {
    backgroundColor:  Colors.surfaceLight,
    borderWidth:      1,
    borderColor:      Colors.border,
    paddingHorizontal: 6,
    paddingVertical:  2,
  },
  countText: {
    fontSize:   10,
    fontWeight: FontWeight.bold,
    color:      Colors.textMuted,
  },
  rowContent: {
    paddingHorizontal: H_PAD,
    paddingBottom:     Spacing.sm,
  },
  emptyRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing.sm,
    paddingHorizontal: H_PAD,
    paddingVertical:   Spacing.md,
  },
  emptyText: {
    fontSize:   FontSize.sm,
    color:      Colors.textMuted,
    fontStyle:  'italic',
  },
  divider: {
    height:            1,
    backgroundColor:   Colors.border,
    marginHorizontal:  H_PAD,
    marginTop:         Spacing.xs,
  },
});
