/**
 * GarmentCard — Animated wardrobe item card with fav / delete / tap for detail
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { CATEGORY_ICONS, formatFormality } from './constants';
import VersatilityBadge from './VersatilityBadge';
import type { GarmentItem } from '../../types';

interface Props {
  item: GarmentItem;
  index: number;
  cardWidth: number;           // passed in from CategoryRow — no fixed width here
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onPress?: (item: GarmentItem) => void;
  versatilityScore?: number;
}

export default function GarmentCard({ item, index, cardWidth, onDelete, onToggleFavorite, onPress, versatilityScore }: Props) {
  const cat = item.attributes.category;
  const icon = CATEGORY_ICONS[cat] || 'cube-outline';
  const confidence = Math.round(item.attributes.confidence * 100);
  const isFavorite = item.is_favorite;
  const imageHeight = cardWidth * 1.3;

  const scale = useSharedValue(1);
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify().damping(14)}
      layout={Layout.springify().damping(14)}
      style={[styles.cardWrapper, { width: cardWidth }]}
    >
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.96))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={() => onPress?.(item)}
      >
        <Animated.View style={[styles.card, animatedCardStyle]}>

          {/* ── Image area ────────────────────────────── */}
          <View style={[styles.cardImage, { height: imageHeight, backgroundColor: item.attributes.color_hex || '#F0EDE8' }]}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name={icon as any} size={36} color="rgba(255,255,255,0.6)" />
            )}

            {/* Versatility badge top-left */}
            {versatilityScore !== undefined && (
              <VersatilityBadge score={versatilityScore} />
            )}

            {/* Favourite button top-right */}
            <TouchableOpacity
              style={styles.favBtn}
              onPress={() => onToggleFavorite(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={16}
                color={isFavorite ? '#D01345' : Colors.textPrimary}
              />
            </TouchableOpacity>

            {/* Delete button bottom-right */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color={Colors.error} />
            </TouchableOpacity>
          </View>

          {/* ── Info area ─────────────────────────────── */}
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.attributes.subcategory || item.attributes.category}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              <Text style={{ color: item.attributes.color_hex || Colors.textMuted }}>●</Text>{' '}
              {item.attributes.color_primary}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.formalityTag}>{formatFormality(item.attributes.formality)}</Text>
              {confidence > 0 && <Text style={styles.confidenceText}>{confidence}%</Text>}
            </View>
          </View>

        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  card: {
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  favBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  cardTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  cardMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 1,
  },
  formalityTag: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  confidenceText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
});
