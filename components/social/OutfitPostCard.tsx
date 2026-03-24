import React from 'react';
import { View, Text, StyleSheet, Pressable, Share, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import type { UserOutfitPost } from './constants';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_PADDING = Spacing.lg * 2;       // horizontal list padding
const GALLERY_H = 280;                      // hero gallery height
const GAP = 2;                              // gap between tiles

interface Props {
  post: UserOutfitPost;
  index: number;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
}

const CATEGORY_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  top: 'shirt-outline',
  bottom: 'resize-outline',
  shoes: 'footsteps-outline',
  dress: 'woman-outline',
  outerwear: 'layers-outline',
  accessory: 'watch-outline',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function fmtCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

type GarmentItem = UserOutfitPost['items'][number];

/** Single garment image tile — shows the photo or a coloured fallback with icon. */
function GarmentPhoto({ item, style }: { item: GarmentItem; style?: any }) {
  return (
    <View style={[styles.photoTile, { backgroundColor: item.color || '#E8E4E0' }, style]}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      ) : (
        <View style={styles.photoFallback}>
          <Ionicons
            name={CATEGORY_ICON[item.category] ?? 'shirt-outline'}
            size={32}
            color="rgba(255,255,255,0.75)"
          />
          <Text style={styles.photoFallbackLabel}>{item.subcategory ?? item.category}</Text>
        </View>
      )}
    </View>
  );
}

/** Adaptive garment gallery — 1 photo full-bleed, 2 side-by-side, 3 = 1+2, 4+ = 2×2 grid with overflow. */
function GarmentGallery({ items }: { items: GarmentItem[] }) {
  if (items.length === 0) {
    return (
      <View style={[styles.gallery, styles.galleryEmpty]}>
        <Ionicons name="shirt-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyGalleryText}>No garments</Text>
      </View>
    );
  }

  if (items.length === 1) {
    return (
      <View style={styles.gallery}>
        <GarmentPhoto item={items[0]} style={styles.photoFull} />
      </View>
    );
  }

  if (items.length === 2) {
    return (
      <View style={[styles.gallery, styles.galleryRow]}>
        <GarmentPhoto item={items[0]} style={styles.photoHalf} />
        <GarmentPhoto item={items[1]} style={styles.photoHalf} />
      </View>
    );
  }

  if (items.length === 3) {
    return (
      <View style={[styles.gallery, styles.galleryRow]}>
        <GarmentPhoto item={items[0]} style={styles.photoHalf} />
        <View style={[styles.galleryCol, styles.photoHalf]}>
          <GarmentPhoto item={items[1]} style={styles.photoStackItem} />
          <GarmentPhoto item={items[2]} style={styles.photoStackItem} />
        </View>
      </View>
    );
  }

  // 4+ items: 2×2 grid, overflow badge on last cell
  const visible = items.slice(0, 4);
  const overflow = items.length - 4;
  return (
    <View style={[styles.gallery, styles.galleryGrid]}>
      {visible.map((item, i) => (
        <View key={`${item.id}-${i}`} style={styles.photoGridCell}>
          <GarmentPhoto item={item} style={StyleSheet.absoluteFillObject} />
          {i === 3 && overflow > 0 && (
            <View style={styles.overflowOverlay}>
              <Text style={styles.overflowText}>+{overflow}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

export default function OutfitPostCard({ post, index, onLike, onSave }: Props) {
  const scale = useSharedValue(1);
  const animatedCard = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleLike = () => onLike(post.id);
  const handleSave = () => onSave(post.id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${post.outfitName}" by ${post.userName} on AlgoStyle — AI-powered fashion ✨\nhttps://algostyle.app`,
        title: post.outfitName,
      });
    } catch {
    }
  };

  const isAI = post.source === 'ai';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).springify().damping(16)}
      layout={Layout.springify().damping(16)}
    >
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.975, { damping: 14 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 14 }))}
      >
        <Animated.View style={[styles.card, animatedCard]}>

          {/* ── Garment photo gallery ─────────────────────── */}
          <View style={styles.galleryContainer}>
            <GarmentGallery items={post.items} />

            <View style={styles.stripOverlayRow}>
              <View style={[styles.sourceBadge, isAI ? styles.sourceBadgeAI : styles.sourceBadgeUser]}>
                <Ionicons
                  name={isAI ? 'sparkles' : 'brush-outline'}
                  size={10}
                  color={isAI ? '#A07800' : Colors.textSecondary}
                />
                <Text style={[styles.sourceBadgeText, { color: isAI ? '#A07800' : Colors.textSecondary }]}>
                  {isAI ? 'AI Styled' : 'Curated'}
                </Text>
              </View>
              {post.aiGrade && (
                <View style={styles.gradeOverlay}>
                  <Text style={styles.gradeText}>{post.aiGrade}</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Garment summary chips ─────────────────────── */}
          {post.items.length > 0 && (
            <View style={styles.garmentChips}>
              {post.items.map((item, i) => (
                <View key={`${item.id}-chip-${i}`} style={styles.chip}>
                  <View style={[styles.chipDot, { backgroundColor: item.color || '#888' }]} />
                  <Text style={styles.chipText} numberOfLines={1}>
                    {item.subcategory ?? item.category}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.body}>
            <View style={styles.headerRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(post.userName)}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>
            </View>

            <Text style={styles.outfitName}>{post.outfitName}</Text>

            {!!post.description && (
              <Text style={styles.outfitDesc} numberOfLines={2}>{post.description}</Text>
            )}

            {post.aiScore != null && post.aiScore > 0 && (
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Style score</Text>
                <View style={styles.scoreTrack}>
                  <View style={[styles.scoreFill, { width: `${Math.round(post.aiScore * 100)}%` as any }]} />
                </View>
                <Text style={styles.scoreValue}>{Math.round(post.aiScore * 100)}</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={handleLike}
              style={styles.actionBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={post.liked ? 'heart' : 'heart-outline'}
                size={22}
                color={post.liked ? '#D01345' : Colors.textMuted}
              />
              <Text style={[styles.actionText, post.liked && styles.actionTextLiked]}>
                {fmtCount(post.likes)}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={styles.actionBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={post.saved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={post.saved ? Colors.accent : Colors.textMuted}
              />
              {post.saves > 0 && (
                <Text style={[styles.actionText, post.saved && styles.actionTextSaved]}>
                  {fmtCount(post.saves)}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleShare}
              style={styles.actionBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="paper-plane-outline" size={22} color={Colors.textMuted} />
            </Pressable>
          </View>

        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },

  /* ── Gallery ──────────────────────────────────────── */
  galleryContainer: {
    width: '100%',
    position: 'relative',
  },
  gallery: {
    width: '100%',
    height: GALLERY_H,
    backgroundColor: Colors.surfaceLight,
  },
  galleryEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyGalleryText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  galleryRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  galleryCol: {
    flexDirection: 'column',
    gap: GAP,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  photoTile: {
    overflow: 'hidden',
  },
  photoFull: {
    width: '100%',
    height: GALLERY_H,
  },
  photoHalf: {
    flex: 1,
    height: GALLERY_H,
  },
  photoStackItem: {
    flex: 1,
  },
  photoGridCell: {
    width: (SCREEN_W - CARD_PADDING - GAP) / 2,
    height: (GALLERY_H - GAP) / 2,
    overflow: 'hidden',
  },
  photoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoFallbackLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
  overflowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#FFF',
  },

  /* ── Garment summary chips ────────────────────────── */
  garmentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
  stripOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  gradeOverlay: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accent,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#FFF',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sourceBadgeAI: { backgroundColor: 'rgba(255,248,220,0.92)', borderColor: '#E8C84A' },
  sourceBadgeUser: { backgroundColor: Colors.surface },
  sourceBadgeText: { fontSize: 10, fontWeight: FontWeight.semibold, letterSpacing: 0.4 },

  body: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  outfitName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  outfitDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  scoreLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    width: 66,
  },
  scoreTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  scoreValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    width: 24,
    textAlign: 'right',
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.semibold,
  },
  actionTextLiked: { color: '#D01345' },
  actionTextSaved: { color: Colors.accent },
});
