/**
 * OutfitPostCard — Animated social-feed card with like, comment, share.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown, Layout,
  useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import type { UserOutfitPost } from './constants';

interface Props {
  post: UserOutfitPost;
  index: number;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

export default function OutfitPostCard({ post, index, onLike, onComment }: Props) {
  const likeScale = useSharedValue(1);
  const heartScale = useSharedValue(0);

  const animatedLikeStyle = useAnimatedStyle(() => ({ transform: [{ scale: likeScale.value }] }));

  const handleLike = () => {
    likeScale.value = withSpring(0.95);
    heartScale.value = withSpring(1);
    setTimeout(() => { heartScale.value = withTiming(0); }, 600);
    onLike(post.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(14)}
      layout={Layout.springify().damping(14)}
      style={styles.card}
    >
      {/* User Header */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={styles.avatar}><Text style={styles.avatarEmoji}>{post.userAvatar}</Text></View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{post.userName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
              <Text style={styles.separator}>•</Text>
              <View style={[styles.badge, post.createdBy === 'ai' ? styles.badgeAI : styles.badgeUser]}>
                <Ionicons name={post.createdBy === 'ai' ? 'sparkles' : 'brush'} size={12} color={post.createdBy === 'ai' ? Colors.accent : Colors.textSecondary} />
                <Text style={[styles.badgeText, { color: post.createdBy === 'ai' ? Colors.accent : Colors.textSecondary }]}>
                  {post.createdBy === 'ai' ? 'AI' : 'User'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Outfit Details */}
      <View style={styles.content}>
        <Text style={styles.outfitName}>{post.outfitName}</Text>
        <Text style={styles.outfitDesc}>{post.description}</Text>

        <View style={styles.itemsGrid}>
          {post.items.map((item) => (
            <View key={item.id} style={styles.itemWrapper}>
              <View style={[styles.itemSwatch, { backgroundColor: item.color }]}>
                <Ionicons
                  name={item.category === 'top' ? 'shirt-outline' : item.category === 'bottom' ? 'resize-outline' : item.category === 'shoes' ? 'footsteps-outline' : item.category === 'dress' ? 'woman-outline' : 'watch-outline'}
                  size={18} color="rgba(255,255,255,0.7)"
                />
              </View>
              <Text style={styles.itemLabel} numberOfLines={1}>{item.category}</Text>
            </View>
          ))}
        </View>

        <View style={styles.occasionRow}>
          <View style={styles.occasionTag}>
            <Ionicons name="bookmark-outline" size={12} color={Colors.accent} />
            <Text style={styles.occasionText}>{post.occasion}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Animated.View style={animatedLikeStyle}>
          <Pressable onPress={handleLike} style={[styles.actionBtn, post.liked && styles.actionBtnActive]} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={18} color={post.liked ? '#D01345' : Colors.textMuted} />
            <Text style={[styles.actionText, post.liked && styles.actionTextActive]}>{post.likes}</Text>
          </Pressable>
        </Animated.View>

        <Pressable onPress={() => onComment(post.id)} style={styles.actionBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chatbubble-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="share-social-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadow.sm },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border },
  avatarEmoji: { fontSize: 24 },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timestamp: { fontSize: FontSize.xs, color: Colors.textMuted },
  separator: { fontSize: FontSize.xs, color: Colors.textMuted },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  badgeAI: { backgroundColor: 'rgba(255, 193, 7, 0.1)' },
  badgeUser: { backgroundColor: 'rgba(156, 39, 176, 0.1)' },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 0.5 },
  content: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  outfitName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  outfitDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  itemsGrid: { flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.sm },
  itemWrapper: { alignItems: 'center', gap: 6 },
  itemSwatch: { width: 60, height: 60, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  itemLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'capitalize', maxWidth: 60, textAlign: 'center' },
  occasionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  occasionTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: BorderRadius.sm },
  occasionText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.accent, letterSpacing: 0.3 },
  actions: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.lg },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  actionBtnActive: { backgroundColor: 'rgba(208, 19, 69, 0.08)' },
  actionText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, letterSpacing: 0.3 },
  actionTextActive: { color: '#D01345' },
});
