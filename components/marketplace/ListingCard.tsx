/**
 * ListingCard — Marketplace product card component.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { ListingItem, CATEGORIES, BADGE_COLORS, CONDITION_LABELS, formatPrice } from './constants';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 12;
const NUM_COLUMNS = SCREEN_W > 600 ? 3 : 2;
export const CARD_W = (SCREEN_W - Spacing.lg * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
export { NUM_COLUMNS, CARD_GAP };

interface Props {
  item: ListingItem;
  index: number;
  onToggleFav: (id: string) => void;
  onPress: (item: ListingItem) => void;
}

function ListingCard({ item, index, onToggleFav, onPress }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify().damping(15)}
      layout={Layout.springify()}
      style={{ width: CARD_W }}
    >
      <TouchableOpacity activeOpacity={0.88} onPress={() => onPress(item)} style={styles.card}>
        {/* Colour swatch acting as "product image" */}
        <View style={[styles.cardImg, { backgroundColor: item.colorHex }]}>
          {item.badge && (
            <View style={[styles.badge, { backgroundColor: BADGE_COLORS[item.badge] ?? Colors.accent }]}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          {item.source === 'user' && (
            <View style={styles.userBadge}>
              <Ionicons name="person" size={10} color="#FFF" />
            </View>
          )}
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => onToggleFav(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={item.isFavorited ? 'heart' : 'heart-outline'}
              size={16}
              color={item.isFavorited ? Colors.error : Colors.textPrimary}
            />
          </TouchableOpacity>
          <View style={styles.categoryIconWrap}>
            <Ionicons
              name={CATEGORIES.find((c) => c.key === item.category)?.icon ?? 'pricetag-outline'}
              size={28}
              color="rgba(255,255,255,0.5)"
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.cardBody}>
          <Text style={styles.cardBrand} numberOfLines={1}>{item.brand}</Text>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardFooter}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
              {item.originalPrice && (
                <Text style={styles.cardOriginal}>{formatPrice(item.originalPrice)}</Text>
              )}
            </View>
            <Text style={styles.sizeText}>{item.size}</Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.conditionDot, item.condition === 'new' && styles.conditionDotNew]} />
            <Text style={styles.metaText}>{CONDITION_LABELS[item.condition]}</Text>
            {item.sellerName && (
              <Text style={styles.sellerText} numberOfLines={1}> · {item.sellerName}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default React.memo(ListingCard);

const styles = StyleSheet.create({
  card: { backgroundColor: 'transparent' },
  cardImg: {
    width: '100%',
    height: CARD_W * 1.35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomRightRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
  },
  badgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.5 },
  userBadge: {
    position: 'absolute',
    top: 10,
    right: 44,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B8A799',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryIconWrap: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    opacity: 0.8,
  },
  cardBody: { gap: 4 },
  cardBrand: { fontSize: 11, fontWeight: FontWeight.semibold, color: Colors.textSecondary, letterSpacing: 0.5 },
  cardTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.regular, color: Colors.textPrimary, lineHeight: 20, marginBottom: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPrice: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cardOriginal: { fontSize: 11, color: Colors.textMuted, textDecorationLine: 'line-through', marginLeft: 6 },
  sizeText: { fontSize: 11, fontWeight: FontWeight.regular, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  conditionDot: { width: 8, height: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.textMuted },
  conditionDotNew: { backgroundColor: Colors.success },
  metaText: { fontSize: 10, color: Colors.textSecondary, letterSpacing: 0.3, fontWeight: FontWeight.medium },
  sellerText: { fontSize: 10, color: Colors.textMuted, flex: 1 },
});
