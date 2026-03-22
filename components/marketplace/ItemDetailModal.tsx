/**
 * ItemDetailModal — Full-screen modal showing marketplace item details.
 */
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Pressable, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import {
  ListingItem, CATEGORIES, BADGE_COLORS,
  CONDITION_LABELS, formatPrice,
} from './constants';

interface Props {
  visible: boolean;
  item: ListingItem | null;
  onClose: () => void;
  onToggleFav: (id: string) => void;
}

export default function ItemDetailModal({ visible, item, onClose, onToggleFav }: Props) {
  const [localItem, setLocalItem] = React.useState(item);

  React.useEffect(() => {
    if (item) setLocalItem(item);
  }, [item]);

  if (!localItem) return null;

  const handleToggleFav = () => {
    onToggleFav(localItem.id);
    setLocalItem((prev) => prev ? { ...prev, isFavorited: !prev.isFavorited } : prev);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.detailSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          {/* Image area */}
          <View style={[styles.detailImg, { backgroundColor: localItem.colorHex }]}>
            {localItem.badge && (
              <View style={[styles.badge, { backgroundColor: BADGE_COLORS[localItem.badge] ?? Colors.accent }]}>
                <Text style={styles.badgeText}>{localItem.badge}</Text>
              </View>
            )}
            <Ionicons
              name={CATEGORIES.find((c) => c.key === localItem.category)?.icon ?? 'pricetag-outline'}
              size={64}
              color="rgba(255,255,255,0.35)"
            />
            <TouchableOpacity style={styles.detailFavBtn} onPress={handleToggleFav}>
              <Ionicons
                name={localItem.isFavorited ? 'heart' : 'heart-outline'}
                size={22}
                color={localItem.isFavorited ? Colors.error : Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.detailBrand}>{localItem.brand}</Text>
            <Text style={styles.detailTitle}>{localItem.title}</Text>

            <View style={styles.detailPriceRow}>
              <Text style={styles.detailPrice}>{formatPrice(localItem.price)}</Text>
              {localItem.originalPrice && (
                <Text style={styles.detailOriginal}>{formatPrice(localItem.originalPrice)}</Text>
              )}
              {localItem.originalPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    -{Math.round((1 - localItem.price / localItem.originalPrice) * 100)}%
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.detailMeta}>
              {[
                { icon: 'pricetag-outline' as const, label: 'Condition', value: CONDITION_LABELS[localItem.condition] },
                { icon: 'resize-outline' as const,   label: 'Size',      value: localItem.size },
                { icon: 'color-palette-outline' as const, label: 'Colour', value: localItem.colorName },
                {
                  icon: localItem.source === 'brand' ? 'storefront-outline' as const : 'person-outline' as const,
                  label: 'Source',
                  value: localItem.source === 'brand'
                    ? 'Partner Brand'
                    : `${localItem.sellerName} ★ ${localItem.sellerRating}`,
                },
              ].map((row) => (
                <View key={row.label} style={styles.detailMetaRow}>
                  <Ionicons name={row.icon} size={15} color={Colors.textMuted} />
                  <Text style={styles.detailMetaLabel}>{row.label}</Text>
                  <Text style={styles.detailMetaValue}>{row.value}</Text>
                </View>
              ))}
            </View>
            <View style={{ height: 16 }} />
          </ScrollView>

          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.detailSecondary} onPress={onClose}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.detailSecondaryText}>MESSAGE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailPrimary}>
              <Ionicons name="bag-outline" size={16} color="#FFF" />
              <Text style={styles.detailPrimaryText}>
                {localItem.source === 'brand' ? 'SHOP NOW' : 'BUY · ' + formatPrice(localItem.price)}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  handle: { width: 36, height: 4, borderRadius: BorderRadius.full, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  detailSheet: { backgroundColor: Colors.background, paddingHorizontal: 0, paddingTop: Spacing.md, maxHeight: '90%', borderTopLeftRadius: BorderRadius.xl + 4, borderTopRightRadius: BorderRadius.xl + 4, overflow: 'hidden' },
  detailImg: { width: '100%', height: 240, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 0, left: 0, paddingHorizontal: 10, paddingVertical: 6, borderBottomRightRadius: BorderRadius.md, backgroundColor: Colors.accent },
  badgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.5 },
  detailFavBtn: { position: 'absolute', top: 12, right: 16, width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  detailBody: { paddingHorizontal: Spacing.lg },
  detailBrand: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMuted, letterSpacing: 0.5, marginTop: Spacing.lg },
  detailTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 4, lineHeight: 28, letterSpacing: -0.3 },
  detailPriceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  detailPrice: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  detailOriginal: { fontSize: FontSize.md, color: Colors.textMuted, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: Colors.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  discountText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#FFF' },
  detailMeta: { marginTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  detailMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailMetaLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textMuted, letterSpacing: 0.2 },
  detailMetaValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  detailActions: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.border },
  detailSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, paddingHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full },
  detailSecondaryText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textPrimary, letterSpacing: 0.3 },
  detailPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, backgroundColor: Colors.accent, borderRadius: BorderRadius.full },
  detailPrimaryText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#FFF', letterSpacing: 0.5 },
});
