/**
 * AnimatedOutfitCard — Reanimated outfit card with spring press interaction.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { ScoreBar } from '../ui';
import type { OutfitResult } from '../../types';

interface Props {
  item: OutfitResult;
  index: number;
}

export default function AnimatedOutfitCard({ item, index }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const pct = Math.round(item.score.overall * 100);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(14)}
      layout={Layout.springify().damping(14)}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => router.push({ pathname: '/outfit-detail', params: { outfitIndex: index.toString() } })}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{item.rank}</Text>
          </View>

          <View style={styles.garmentStrip}>
            {item.garments.map((g, i) => (
              <View key={i} style={[styles.garmentDot, { backgroundColor: g.attributes.color_hex || '#DDD' }]}>
                <Ionicons
                  name={
                    g.attributes.category === 'top'
                      ? 'shirt-outline'
                      : g.attributes.category === 'shoes'
                        ? 'footsteps-outline'
                        : 'cube-outline'
                  }
                  size={20}
                  color="rgba(255,255,255,0.8)"
                />
              </View>
            ))}
          </View>

          <Text style={styles.outfitName}>{item.name}</Text>

          <View style={styles.scoreRow}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{pct}</Text>
              <Text style={styles.scoreUnit}>%</Text>
            </View>
            <View style={styles.scoreBars}>
              <ScoreBar label="Color Harmony" value={item.score.color_harmony} />
              <ScoreBar label="Formality" value={item.score.formality_match} />
              <ScoreBar label="Occasion" value={item.score.occasion_fit} />
            </View>
          </View>

          {item.explanation_brief && <Text style={styles.explanation}>{item.explanation_brief}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="heart-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnWear]}>
              <Text style={styles.actionWearText}>WEAR THIS</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.soft,
  },
  rankBadge: {
    position: 'absolute', top: 0, right: 0, zIndex: 1,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  rankText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.5 },
  garmentStrip: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg, marginTop: Spacing.sm },
  garmentDot: {
    width: 52, height: 52, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.soft,
  },
  outfitName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md, letterSpacing: -0.3 },
  scoreRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.lg, alignItems: 'center' },
  scoreCircle: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2.5, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  scoreValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -1 },
  scoreUnit: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 6, fontWeight: FontWeight.medium },
  scoreBars: { flex: 1, gap: 4 },
  explanation: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.lg, alignItems: 'center' },
  actionBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border,
  },
  actionBtnWear: {
    flexDirection: 'row', width: 'auto', paddingHorizontal: Spacing.xl, height: 44,
    borderRadius: BorderRadius.full, gap: Spacing.sm, marginLeft: 'auto',
    backgroundColor: Colors.accent, borderWidth: 0,
  },
  actionWearText: { fontSize: FontSize.sm, color: '#FFF', fontWeight: FontWeight.semibold, letterSpacing: 0.5 },
});
