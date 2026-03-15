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
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { ROW_CARD_WIDTH, ROW_CARD_GAP, CATEGORY_ICONS } from './constants';
import GarmentCard from './GarmentCard';
import type { GarmentItem } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');

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
}

function EmptySlot() {
  return (
    <View style={[styles.card, styles.emptySlot]}>
      <Ionicons name="add-outline" size={22} color={Colors.border} />
    </View>
  );
}

const CategoryRow = memo(function CategoryRow({
  categoryKey,
  label,
  emoji,
  items,
  sectionIndex,
  sortScores,
  onPressItem,
  onDeleteItem,
  onToggleFavorite,
}: Props) {
  const icon = CATEGORY_ICONS[categoryKey] || 'cube-outline';

  return (
    <Animated.View
      entering={FadeInDown.delay(sectionIndex * 60).springify().damping(16)}
      style={styles.section}
    >
      {/* Section header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLabel}>{label}</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{items.length}</Text>
          </View>
        </View>
      </View>

      {/* Horizontal item strip */}
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
          snapToInterval={ROW_CARD_WIDTH + ROW_CARD_GAP}
          decelerationRate="fast"
          renderItem={({ item, index }) => (
            <View style={[styles.card, { marginRight: ROW_CARD_GAP }]}>
              <GarmentCard
                item={item}
                index={sectionIndex * 10 + index}
                onDelete={onDeleteItem}
                onToggleFavorite={onToggleFavorite}
                onPress={onPressItem}
                versatilityScore={sortScores?.[item.id]?.versatility_score}
              />
            </View>
          )}
        />
      )}

      <View style={styles.divider} />
    </Animated.View>
  );
});

export default CategoryRow;

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  countPill: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  rowContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  card: {
    width: ROW_CARD_WIDTH,
  },
  emptySlot: {
    height: ROW_CARD_WIDTH * 1.4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
  },
});
