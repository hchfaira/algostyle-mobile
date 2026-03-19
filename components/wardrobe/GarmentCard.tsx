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
  /** Renders a checkmark overlay + accent border (selection mode) */
  selected?: boolean;
  /** Hides fav + delete action buttons (e.g. read-only / selection mode) */
  hideActions?: boolean;
}

export default function GarmentCard({ item, index, cardWidth, onDelete, onToggleFavorite, onPress, versatilityScore, selected, hideActions }: Props) {
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
        <Animated.View style={[styles.card, animatedCardStyle, selected && styles.cardSelected]}>

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
            {versatilityScore !== undefined && !selected && (
              <VersatilityBadge score={versatilityScore} />
            )}

            {/* Selection checkmark — replaces action buttons in selection mode */}
            {selected && (
              <View style={styles.selectionBadge}>
                <Ionicons name="checkmark" size={14} color="#FFF" />
              </View>
            )}

            {/* Favourite button top-right — hidden in hideActions mode */}
            {!hideActions && (
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
            )}

            {/* Delete button bottom-right — hidden in hideActions mode */}
            {!hideActions && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDelete(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={14} color={Colors.error} />
              </TouchableOpacity>
            )}
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
    overflow:        'hidden',
    backgroundColor: Colors.surface,
  },
  card: {
    backgroundColor: Colors.surface,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  selectionBadge: {
    position:        'absolute',
    top:             6,
    right:           6,
    width:           22,
    height:          22,
    borderRadius:    11,
    backgroundColor: Colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
  },
  cardImage: {
    width:           '100%',
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
    overflow:        'hidden',
  },
  // Fav — square, white bg, flush corner
  favBtn: {
    position:        'absolute',
    top:             0,
    right:           0,
    width:           30,
    height:          30,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  // Delete — square, white bg, bottom corner
  deleteBtn: {
    position:        'absolute',
    bottom:          0,
    right:           0,
    width:           28,
    height:          28,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  cardBody: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical:   Spacing.xs,
    gap:               2,
    backgroundColor:   Colors.surface,
  },
  cardTitle: {
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.bold,
    color:         Colors.textPrimary,
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },
  cardMeta: {
    fontSize:      10,
    color:         Colors.textMuted,
    textTransform: 'capitalize',
  },
  cardFooter: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginTop:      2,
  },
  formalityTag: {
    fontSize:      9,
    fontWeight:    FontWeight.black,
    color:         Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceText: {
    fontSize:   9,
    fontWeight: FontWeight.bold,
    color:      Colors.textMuted,
  },
});
