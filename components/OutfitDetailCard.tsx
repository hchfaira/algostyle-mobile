/**
 * OutfitDetailCard — Reusable outfit detail component
 *
 * Shows:
 * - Context (occasion, style mood)
 * - Place & Time (location, date)
 * - Used wardrobe items (list + visual grid)
 * - Composite image with all items
 * - Try On button (or Show My Try-On if already done)
 * - Share button
 *
 * Used in: Outfit History, Agenda, People Tab
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';
import type { CustomOutfit, GarmentItem } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_W - Spacing.lg * 2;

interface OutfitDetailCardProps {
  outfit: CustomOutfit;
  index?: number;
  hasVirtualTryOn?: boolean;
  tryOnImageUrl?: string;
  onTryOn?: (outfitId: string) => void;
  onShowTryOn?: (imageUrl: string) => void;
  onShare?: (outfit: CustomOutfit) => void;
  showFullCard?: boolean; // If true, display all details; if false, compact view
}

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  top: 'shirt-outline',
  bottom: 'cut-outline',
  dress: 'rose-outline',
  outerwear: 'layers-outline',
  shoes: 'footsteps-outline',
  accessory: 'watch-outline',
};

const CATEGORY_LABELS: Record<string, string> = {
  top: 'Top',
  bottom: 'Bottom',
  dress: 'Dress',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessory: 'Accessory',
};

export function OutfitDetailCard({
  outfit,
  index = 0,
  hasVirtualTryOn = false,
  tryOnImageUrl,
  onTryOn,
  onShowTryOn,
  onShare,
  showFullCard = true,
}: OutfitDetailCardProps) {
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleTryOnPress = async () => {
    if (hasVirtualTryOn && tryOnImageUrl) {
      // Show existing try-on
      onShowTryOn?.(tryOnImageUrl);
    } else {
      // Start virtual try-on generation
      setIsGeneratingTryOn(true);
      try {
        // Call the try-on handler
        onTryOn?.(outfit.id);
        // Note: Actual diffusion model integration happens in recommend.tsx
      } catch (err) {
        Alert.alert('Error', 'Failed to generate try-on');
      } finally {
        setIsGeneratingTryOn(false);
      }
    }
  };

  const handleShare = () => {
    onShare?.(outfit);
  };

  if (!showFullCard) {
    // Compact card view (for agenda/history list)
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify().damping(14)}
        style={[styles.compactCardWrapper, animatedStyle]}
      >
        <Pressable
          onPressIn={() => (scale.value = withSpring(0.96))}
          onPressOut={() => (scale.value = withSpring(1))}
          style={styles.compactCard}
        >
          {/* Header: Name + Occasion */}
          <View style={styles.compactHeader}>
            <View>
              <Text style={styles.compactOutfitName}>{outfit.name}</Text>
              {outfit.occasion && (
                <Text style={styles.compactOccasion}>{outfit.occasion}</Text>
              )}
            </View>
          </View>

          {/* Meta: Date & Location */}
          {(outfit.date || outfit.location) && (
            <View style={styles.compactMeta}>
              {outfit.date && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar" size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{outfit.date}</Text>
                </View>
              )}
              {outfit.location && (
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {outfit.location}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Garment swatches */}
          <View style={styles.compactSwatches}>
            {outfit.garments.slice(0, 5).map((item: GarmentItem) => (
              <View
                key={item.id}
                style={[
                  styles.compactSwatch,
                  { backgroundColor: item.attributes.color_hex || '#DDD' },
                ]}
              >
                <Ionicons
                  name={CATEGORY_ICONS[item.attributes.category] ?? 'pricetag-outline'}
                  size={20}
                  color="rgba(0,0,0,0.55)"
                />
              </View>
            ))}
            {outfit.garments.length > 5 && (
              <View style={[styles.compactSwatch, styles.compactSwatchMore]}>
                <Text style={styles.swatchMoreText}>+{outfit.garments.length - 5}</Text>
              </View>
            )}
          </View>

          {/* Try On / Show My Try-On Button */}
          <TouchableOpacity
            style={[styles.tryOnBtn, hasVirtualTryOn && styles.tryOnBtnSuccess]}
            onPress={handleTryOnPress}
            disabled={isGeneratingTryOn}
          >
            {isGeneratingTryOn ? (
              <>
                <ActivityIndicator size="small" color={Colors.accent} />
                <Text style={styles.tryOnText}>Generating...</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name={hasVirtualTryOn ? 'eye' : 'sparkles'}
                  size={16}
                  color={Colors.accent}
                />
                <Text style={styles.tryOnText}>
                  {hasVirtualTryOn ? 'SHOW MY TRY-ON' : 'TRY ON'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Pressable>
      </Animated.View>
    );
  }

  // Full detail card view (for detail screens)
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(14)}
      style={[styles.fullCardWrapper, animatedStyle]}
    >
      <View style={styles.fullCard}>
        {/* Header */}
        <View style={styles.fullHeader}>
          <Text style={styles.fullOutfitName}>{outfit.name}</Text>
          {outfit.styleMood && (
            <Text style={styles.fullStyleMood}>{outfit.styleMood}</Text>
          )}
        </View>

        {/* Context & Location Row */}
        <View style={styles.contextRow}>
          {outfit.occasion && (
            <View style={styles.contextTag}>
              <Ionicons name="bookmark" size={14} color={Colors.accent} />
              <Text style={styles.contextText}>{outfit.occasion}</Text>
            </View>
          )}
          {outfit.location && (
            <View style={styles.contextTag}>
              <Ionicons name="location" size={14} color={Colors.accent} />
              <Text style={styles.contextText} numberOfLines={1}>
                {outfit.location}
              </Text>
            </View>
          )}
        </View>

        {/* Date & Time */}
        {outfit.date && (
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={16} color={Colors.textMuted} />
            <Text style={styles.dateText}>{outfit.date}</Text>
          </View>
        )}

        {/* Garments Section */}
        <Text style={styles.sectionTitle}>WARDROBE ITEMS</Text>
        <View style={styles.garmentsList}>
          {outfit.garments.map((item: GarmentItem, idx: number) => (
            <View key={item.id} style={styles.garmentRow}>
              <View
                style={[
                  styles.garmentSwatch,
                  { backgroundColor: item.attributes.color_hex || '#DDD' },
                ]}
              >
                <Ionicons
                  name={CATEGORY_ICONS[item.attributes.category] ?? 'pricetag-outline'}
                  size={18}
                  color="rgba(0,0,0,0.55)"
                />
              </View>
              <View style={styles.garmentInfo}>
                <Text style={styles.garmentCategory}>
                  {CATEGORY_LABELS[item.attributes.category] || item.attributes.category}
                </Text>
                <Text style={styles.garmentDetails} numberOfLines={2}>
                  {item.attributes.color_primary} • {item.attributes.pattern}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Composite Image Placeholder (will be generated by diffusion model) */}
        <View style={styles.compositeImageSection}>
          <View style={styles.compositeImagePlaceholder}>
            <Ionicons name="image" size={48} color={Colors.textMuted} />
            <Text style={styles.compositeImageText}>Outfit visualization</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.fullActionsRow}>
          <TouchableOpacity
            style={[styles.fullActionBtn, hasVirtualTryOn && styles.fullActionBtnActive]}
            onPress={handleTryOnPress}
            disabled={isGeneratingTryOn}
          >
            {isGeneratingTryOn ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <>
                <Ionicons
                  name={hasVirtualTryOn ? 'eye' : 'sparkles'}
                  size={18}
                  color={hasVirtualTryOn ? Colors.accent : Colors.textPrimary}
                />
                <Text
                  style={[
                    styles.fullActionBtnText,
                    hasVirtualTryOn && styles.fullActionBtnTextActive,
                  ]}
                >
                  {hasVirtualTryOn ? 'SHOW MY TRY-ON' : 'TRY ON'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.fullActionBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={18} color={Colors.textPrimary} />
            <Text style={styles.fullActionBtnText}>SHARE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ─── COMPACT CARD ─────────────────────────────────────────
  compactCardWrapper: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  compactCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  compactHeader: {
    marginBottom: Spacing.md,
  },
  compactOutfitName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  compactOccasion: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },
  compactMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  compactSwatches: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  compactSwatch: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  compactSwatchMore: {
    backgroundColor: Colors.background,
  },
  swatchMoreText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  tryOnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
  },
  tryOnBtnSuccess: {
    backgroundColor: 'rgba(13, 110, 253, 0.05)',
    borderColor: Colors.textSecondary,
  },
  tryOnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
    letterSpacing: 0.5,
  },

  // ─── FULL CARD ────────────────────────────────────────────
  fullCardWrapper: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  fullCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  fullHeader: {
    marginBottom: Spacing.lg,
  },
  fullOutfitName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  fullStyleMood: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  contextRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  contextTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    borderRadius: BorderRadius.sm,
  },
  contextText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.accent,
    letterSpacing: 0.3,
    maxWidth: 150,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  garmentsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  garmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
  },
  garmentSwatch: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  garmentInfo: {
    flex: 1,
  },
  garmentCategory: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  garmentDetails: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  compositeImageSection: {
    marginBottom: Spacing.lg,
  },
  compositeImagePlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  compositeImageText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  fullActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  fullActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
  },
  fullActionBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
  },
  fullActionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  fullActionBtnTextActive: {
    color: Colors.accent,
  },
});
