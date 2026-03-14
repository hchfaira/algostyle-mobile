/**
 * GarmentCard — Animated wardrobe item card with fav / delete
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { CARD_WIDTH, CATEGORY_ICONS, formatFormality } from './constants';
import type { GarmentItem } from '../../types';

interface Props {
  item: GarmentItem;
  index: number;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function GarmentCard({ item, index, onDelete, onToggleFavorite }: Props) {
  const cat = item.attributes.category;
  const icon = CATEGORY_ICONS[cat] || 'cube-outline';
  const confidence = Math.round(item.attributes.confidence * 100);
  const isFavorite = item.is_favorite;

  const scale = useSharedValue(1);
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify().damping(14)}
      layout={Layout.springify().damping(14)}
      style={[styles.cardWrapper, { width: CARD_WIDTH }]}
    >
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.96))}
        onPressOut={() => (scale.value = withSpring(1))}
        onLongPress={() => onDelete(item.id)}
        delayLongPress={400}
      >
        <Animated.View style={[styles.card, animatedCardStyle]}>
          <View style={[styles.cardImage, { backgroundColor: item.attributes.color_hex || '#F5F5F5' }]}>
            <Ionicons name={icon as any} size={40} color="rgba(255,255,255,0.7)" style={styles.cardIconShadow} />
            <TouchableOpacity
              style={styles.favBtn}
              onPress={() => onToggleFavorite(item.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#D01345' : Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.attributes.subcategory || item.attributes.category}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              <Text style={{ color: item.attributes.color_hex || Colors.textMuted }}>●</Text>{' '}
              {item.attributes.color_primary} · {item.attributes.pattern}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.formalityTag}>{formatFormality(item.attributes.formality)}</Text>
              {confidence > 0 && <Text style={styles.confidenceText}>{confidence}% Match</Text>}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  card: {
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  cardIconShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 1.25,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { paddingVertical: Spacing.sm, gap: 3 },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardMeta: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  formalityTag: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted },
});
