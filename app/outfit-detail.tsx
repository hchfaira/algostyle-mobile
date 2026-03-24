/**
 * Outfit Detail Screen — ASOS-style monochrome detail view
 * No gradients, black accents, editorial typography
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../constants/theme';
import { Card, ScoreBar, Button } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

const SCORE_LABELS: Record<string, { label: string; color: string }> = {
  color_harmony:  { label: 'Color Harmony',  color: Colors.accent },
  formality_match:{ label: 'Formality',       color: '#525252' },
  occasion_fit:   { label: 'Occasion Fit',    color: Colors.accent },
  pattern_mixing: { label: 'Pattern Mixing',  color: '#525252' },
  proportion:     { label: 'Proportion',       color: Colors.accent },
  season_fit:     { label: 'Season Fit',       color: '#525252' },
  creativity:     { label: 'Creativity',       color: Colors.accent },
};

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  top: 'shirt-outline',
  bottom: 'cut-outline',
  dress: 'rose-outline',
  outerwear: 'layers-outline',
  shoes: 'footsteps-outline',
  accessory: 'watch-outline',
};

export default function OutfitDetailScreen() {
  const { outfitIndex } = useLocalSearchParams<{ outfitIndex: string }>();
  const { outfits, userId, addCustomOutfit } = useAppStore();
  const [showFullExplanation, setShowFullExplanation] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleShare = () => {
    if (!outfit) return;
    Alert.alert(
      'Publish to People',
      `Share "${outfit.name}" with the community?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            if (!userId) {
              Alert.alert('Error', 'You must be logged in to publish.');
              return;
            }
            setIsPublishing(true);
            try {
              const garmentIds = outfit.garments.map((g) => g.id);
              const res = await api.createCustomOutfit(userId, {
                name: outfit.name,
                garmentIds,
                isPublic: false,
                source: 'ai',
                aiGrade: outfit.grade,
                aiScore: outfit.score?.overall,
                explanationBrief: outfit.explanation_brief,
              });
              if (res.success && res.outfit) {
                addCustomOutfit(res.outfit);
                await api.publishOutfit(userId, res.outfit.id);
                Alert.alert('Published! 🎉', `"${outfit.name}" is now live on the People tab.`);
              }
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Could not publish the outfit.');
            } finally {
              setIsPublishing(false);
            }
          },
        },
      ],
    );
  };

  const idx = parseInt(outfitIndex || '0', 10);
  const outfit = outfits[idx];

  if (!outfit) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.errorText}>Outfit not found</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </View>
    );
  }

  const overallPct = Math.round(outfit.score.overall * 100);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header nav */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>OUTFIT DETAIL</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="heart-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare} disabled={isPublishing}>
              <Ionicons name="share-outline" size={20} color={isPublishing ? Colors.textMuted : Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title + rank */}
        <View style={styles.titleArea}>
          <View style={[styles.rankBadge, idx === 0 && styles.rankBadgeFirst]}>
            <Text style={[styles.rankText, idx === 0 && styles.rankTextFirst]}>#{outfit.rank}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.outfitName}>{outfit.name}</Text>
            <Text style={styles.outfitSub}>{outfit.garments.length} garments</Text>
          </View>
        </View>

        {/* Overall score circle */}
        <View style={styles.scoreHero}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{overallPct}</Text>
            <Text style={styles.scoreLabel}>OVERALL</Text>
          </View>
        </View>

        {/* Garments */}
        <Text style={styles.sectionTitle}>GARMENTS</Text>
        <View style={styles.garmentList}>
          {outfit.garments.map((g, i) => {
            return (
              <View key={i} style={styles.garmentItem}>
                <View style={styles.garmentThumb}>
                  <Ionicons
                    name={CATEGORY_ICONS[g.attributes.category] ?? 'pricetag-outline'}
                    size={22}
                    color={Colors.textSecondary}
                  />
                </View>
                <View style={styles.garmentInfo}>
                  <Text style={styles.garmentName}>
                    {g.attributes.subcategory || g.attributes.category}
                  </Text>
                  <View style={styles.garmentMeta}>
                    <View style={[styles.colorDot, { backgroundColor: g.attributes.color_hex || '#888' }]} />
                    <Text style={styles.garmentDetail}>
                      {g.attributes.color_primary} • {g.attributes.material || g.attributes.pattern}
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{g.attributes.category}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Color Palette */}
        <Text style={styles.sectionTitle}>COLOUR PALETTE</Text>
        <View style={styles.paletteRow}>
          {outfit.garments
            .filter((g) => g.attributes.color_hex)
            .map((g, i) => (
              <View key={i} style={styles.paletteItem}>
                <View style={[styles.paletteSwatch, { backgroundColor: g.attributes.color_hex! }]} />
                <Text style={styles.paletteLabel}>{g.attributes.color_primary}</Text>
              </View>
            ))}
        </View>

        {/* Score breakdown */}
        <Text style={styles.sectionTitle}>SCORE BREAKDOWN</Text>
        <Card style={styles.scoreCard}>
          {Object.entries(SCORE_LABELS).map(([key, { label, color }]) => {
            const val = (outfit.score as any)[key] || 0;
            return <ScoreBar key={key} label={label} value={val} color={color} />;
          })}
        </Card>

        {/* Explanation */}
        <Text style={styles.sectionTitle}>AI ANALYSIS</Text>
        <View style={styles.explanationCard}>
          <View style={styles.explanationHeader}>
            <View style={styles.explanationIcon}>
              <Ionicons name="sparkles" size={14} color="#FFF" />
            </View>
            <Text style={styles.explanationHeaderText}>STYLE ANALYSIS</Text>
          </View>
          <Text style={styles.explanationText}>
            {showFullExplanation
              ? outfit.explanation_detailed || outfit.explanation_brief || 'No explanation available.'
              : outfit.explanation_brief || 'No explanation available.'}
          </Text>
          {outfit.explanation_detailed && !showFullExplanation && (
            <TouchableOpacity onPress={() => setShowFullExplanation(true)} style={styles.readMoreBtn}>
              <Text style={styles.readMoreText}>READ FULL ANALYSIS</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsArea}>
          <Button
            title="Virtual Try-On"
            onPress={() => {}}
            variant="primary"
            fullWidth
            icon={<Ionicons name="body-outline" size={18} color="#FFF" />}
          />
          <View style={styles.actionsRow}>
            <Button
              title="Improve"
              onPress={() => {}}
              variant="secondary"
              style={{ flex: 1 }}
              icon={<Ionicons name="trending-up-outline" size={16} color={Colors.textPrimary} />}
            />
            <Button
              title="Ask AI"
              onPress={() => router.push('/(tabs)/chat')}
              variant="outline"
              style={{ flex: 1 }}
              icon={<Ionicons name="chatbubble-outline" size={16} color={Colors.accent} />}
            />
          </View>
          <Button
            title="I'm Wearing This ✓"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            icon={<Ionicons name="checkmark-circle-outline" size={18} color={Colors.accentTertiary} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: 100 },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: FontSize.lg, color: Colors.textMuted },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 2 },
  headerRight: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  /* Title */
  titleArea: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  rankBadge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankBadgeFirst: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  rankText: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary },
  rankTextFirst: { color: '#FFF' },
  outfitName: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, color: Colors.textPrimary },
  outfitSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase' },

  /* Score circle */
  scoreHero: { alignItems: 'center', marginBottom: Spacing.xl },
  scoreCircle: {
    width: 100,
    height: 100,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.black, color: Colors.accent },
  scoreLabel: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 2, marginTop: -2 },

  /* Section title */
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },

  /* Garments */
  garmentList: { gap: Spacing.sm, marginBottom: Spacing.xl },
  garmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  garmentThumb: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentInfo: { flex: 1 },
  garmentName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textTransform: 'capitalize' },
  garmentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  colorDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  garmentDetail: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Palette */
  paletteRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  paletteItem: { alignItems: 'center', gap: 4 },
  paletteSwatch: { width: 40, height: 40, borderWidth: 2, borderColor: 'rgba(0,0,0,0.06)' },
  paletteLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'capitalize' },

  /* Score card */
  scoreCard: { marginBottom: Spacing.xl },

  /* Explanation */
  explanationCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  explanationIcon: { width: 26, height: 26, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  explanationHeaderText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 1.5 },
  explanationText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24 },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  readMoreText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 1 },

  /* Actions */
  actionsArea: { gap: Spacing.sm },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
});
