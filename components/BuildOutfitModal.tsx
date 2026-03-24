import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import { AIOutfitResultsModal } from './AIOutfitResultsModal';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';
import CategoryRow from './wardrobe/CategoryRow';
import GarmentFilterBar from './wardrobe/GarmentFilterBar';
import { BROWSABLE_CATEGORIES, CATEGORIES } from './wardrobe/constants';
import type { GarmentItem, GarmentCategory } from '../types';
import type { OutfitResult } from '../types/schemas/recommendation';

interface BuildOutfitModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const BuildOutfitModal: React.FC<BuildOutfitModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [selectedItems, setSelectedItems]         = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory]   = useState<GarmentCategory | 'all'>('all');
  const [colorFilter, setColorFilter]             = useState<string | null>(null);
  const [formalityFilter, setFormalityFilter]     = useState<string | null>(null);
  const [outfitName, setOutfitName]               = useState('');
  const [outfitDescription, setOutfitDescription] = useState('');
  const [isCreating, setIsCreating]               = useState(false);
  const [isScoring, setIsScoring]                 = useState(false);
  const [scoreResults, setScoreResults]           = useState<OutfitResult[]>([]);
  const [showResults, setShowResults]             = useState(false);

  const { wardrobe, userId, addCustomOutfit } = useAppStore();
  const effectiveUserId = userId || (__DEV__ ? 'dev-test-user' : undefined);

  // Items visible in the current category selection
  const categoryFilteredItems = useMemo(() => {
    if (selectedCategory === 'all') return wardrobe;
    return wardrobe.filter((item) => item.attributes.category === selectedCategory);
  }, [wardrobe, selectedCategory]);

  // Items after secondary color + formality filter (feeds GarmentFilterBar options)
  const filteredItems = useMemo(() => {
    return categoryFilteredItems.filter((item) => {
      if (colorFilter && item.attributes.color_hex !== colorFilter) return false;
      if (formalityFilter && item.attributes.formality !== formalityFilter) return false;
      return true;
    });
  }, [categoryFilteredItems, colorFilter, formalityFilter]);

  // Items grouped by BROWSABLE_CATEGORIES order for the sections view
  const itemsByCategory = useMemo(() => {
    const map: Record<string, GarmentItem[]> = {};
    BROWSABLE_CATEGORIES.forEach(({ key }) => {
      map[key] = filteredItems.filter((g) => g.attributes.category === key);
    });
    return map;
  }, [filteredItems]);

  // Which category sections to render
  const visibleSections = useMemo(() => {
    if (selectedCategory === 'all') {
      return BROWSABLE_CATEGORIES.filter((c) => (itemsByCategory[c.key]?.length ?? 0) > 0);
    }
    return BROWSABLE_CATEGORIES.filter((c) => c.key === selectedCategory);
  }, [selectedCategory, itemsByCategory]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // ── Score selected items via HybridOutfitRecommender ──────────
  const handleScoreOutfit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Select items', 'Pick at least 2 pieces to score your outfit.');
      return;
    }
    if (selectedItems.length < 2) {
      Alert.alert('Select more items', 'Pick at least 2 pieces for a meaningful score.');
      return;
    }
    if (!effectiveUserId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      setIsScoring(true);
      const response = await api.getRecommendations(
        {
          occasion: 'casual',
          top_k: 1,
          garment_ids: selectedItems,
        },
        effectiveUserId
      );
      if (response.outfits && response.outfits.length > 0) {
        // Give the outfit the user's chosen name if provided
        const results = response.outfits.map((o, i) =>
          i === 0 && outfitName.trim()
            ? { ...o, name: outfitName.trim() }
            : o
        );
        setScoreResults(results);
        setShowResults(true);
      } else {
        Alert.alert('No result', 'The AI could not score this combination — try different items.');
      }
    } catch (err) {
      Alert.alert('Scoring failed', err instanceof Error ? err.message : 'Could not reach the AI server.');
    } finally {
      setIsScoring(false);
    }
  };

  // ── Save outfit without scoring ────────────────────────────────
  const handleCreateOutfit = async () => {
    if (!outfitName.trim()) {
      Alert.alert('Error', 'Please enter an outfit name');
      return;
    }
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item');
      return;
    }
    if (!effectiveUserId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      setIsCreating(true);
      const response = await api.createCustomOutfit(effectiveUserId, {
        name: outfitName,
        description: outfitDescription || undefined,
        garmentIds: selectedItems,
        isPublic: false,
      });

      if (response.success && response.outfit) {
        addCustomOutfit(response.outfit);
        const savedId = response.outfit.id;
        const savedName = outfitName;
        resetForm();
        onClose();
        // Ask if the user wants to publish to the People feed
        Alert.alert(
          'Outfit Saved! 🎉',
          `"${savedName}" has been saved. Do you want to share it to the People tab?`,
          [
            { text: 'Keep Private', style: 'cancel' },
            {
              text: 'Publish to People',
              onPress: async () => {
                try {
                  await api.publishOutfit(effectiveUserId!, savedId);
                  Alert.alert('Published!', `"${savedName}" is now live on the People tab.`);
                } catch {
                  Alert.alert('Error', 'Could not publish the outfit. Try again later.');
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create outfit');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedItems([]);
    setSelectedCategory('all');
    setColorFilter(null);
    setFormalityFilter(null);
    setOutfitName('');
    setOutfitDescription('');
    setScoreResults([]);
  };

  if (!isVisible) return null;

  // ── Show AI results after scoring ─────────────────────────────
  if (showResults) {
    return (
      <AIOutfitResultsModal
        isVisible
        outfits={scoreResults}
        occasion="casual"
        scoringProfile="casual"
        isLoading={false}
        onClose={() => {
          setShowResults(false);
          resetForm();
          onClose();
        }}
        onWearOutfit={(outfit, _plannedDate, _reminder, _label) => {
          setShowResults(false);
          resetForm();
          onClose();
          Alert.alert('Outfit Selected', `"${outfit.name}" selected! Schedule it in the Agenda below.`);
        }}
        onShareOutfit={async (outfit) => {
          if (!effectiveUserId) {
            setTimeout(() => Alert.alert('Error', 'You must be logged in to publish.'), 150);
            throw new Error('not signed in');
          }
          const garmentIds = (outfit.garments ?? []).map((g) => g.id);
          const res = await api.createCustomOutfit(effectiveUserId, {
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
            await api.publishOutfit(effectiveUserId, res.outfit.id);
            setTimeout(() => Alert.alert('Published! 🎉', `"${outfit.name}" is now live on the People tab.`), 150);
          } else {
            setTimeout(() => Alert.alert('Error', 'Could not save the outfit.'), 150);
            throw new Error('publish failed');
          }
        }}
        onRegeneratePress={() => setShowResults(false)}
        onRequestDetailedExplanation={async (outfitId) => {
          const target = scoreResults.find((o) => o.id === outfitId);
          if (!target) return { outfit_id: outfitId, style_notes: [], styling_tips: [] };
          try {
            const resp = await api.explainOutfit(target, 'casual', 'casual', 'detailed');
            return {
              detailed: resp.detailed,
              styleNotes: resp.style_notes,
              colorNote: resp.color_note,
              occasionNote: resp.occasion_note,
              stylingTips: resp.styling_tips,
            };
          } catch {
            return { outfit_id: outfitId, style_notes: [], styling_tips: [] };
          }
        }}
      />
    );
  }

  return (
    <Animated.View entering={FadeInUp} exiting={FadeOutDown} style={styles.container}>
      {/* ── Compact header: title + name input inline ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Build Outfit</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Name this outfit…"
            placeholderTextColor={Colors.textMuted}
            value={outfitName}
            onChangeText={setOutfitName}
            maxLength={50}
            returnKeyType="done"
          />
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Category chip strip + filter button (single row) ── */}
      <View style={styles.controlRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryStripContent}
          style={{ flex: 1 }}
        >
          {CATEGORIES.map(({ key, label }) => {
            const isActive = selectedCategory === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => {
                  setSelectedCategory(key as GarmentCategory | 'all');
                  setColorFilter(null);
                  setFormalityFilter(null);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.catChipLabel, isActive && styles.catChipLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Filter bar (compact — no sort chips) ── */}
      <GarmentFilterBar
        items={categoryFilteredItems}
        totalCount={filteredItems.length}
        colorFilter={colorFilter}
        formalityFilter={formalityFilter}
        onColorChange={setColorFilter}
        onFormalityChange={setFormalityFilter}
        sortMode="default"
        onChangeSortMode={() => {}}
        hideSortBar
      />

      {/* ── Selected items strip ── */}
      {selectedItems.length > 0 && (
        <View style={styles.selectedBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedBarContent}
          >
            {selectedItems.map((id) => {
              const item = wardrobe.find((w) => w.id === id);
              if (!item) return null;
              return (
                <TouchableOpacity
                  key={id}
                  style={styles.selectedPill}
                  onPress={() => handleSelectItem(id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.selectedPillLabel} numberOfLines={1}>
                    {item.attributes.subcategory || item.attributes.category}
                  </Text>
                  <Ionicons name="close-circle" size={13} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={() => setSelectedItems([])}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={12} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Garment sections ── */}
      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shirt-outline" size={38} color={Colors.border} />
            <Text style={styles.emptyStateText}>No items match these filters</Text>
          </View>
        ) : (
          visibleSections.map((cat, i) => (
            <CategoryRow
              key={cat.key}
              categoryKey={cat.key}
              label={cat.label}
              emoji={cat.emoji}
              items={itemsByCategory[cat.key] ?? []}
              sectionIndex={i}
              selectedItems={selectedItems}
              onPressItem={(item) => handleSelectItem(item.id)}
              onDeleteItem={() => {}}
              onToggleFavorite={() => {}}
              selectionMode
            />
          ))
        )}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Footer CTA ── */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.45 }}
        style={styles.footer}
      >
        {/* Score button — full width, primary CTA */}
        <TouchableOpacity
          style={[
            styles.scoreButton,
            (selectedItems.length < 2 || isScoring) && styles.scoreButtonDisabled,
          ]}
          onPress={handleScoreOutfit}
          disabled={selectedItems.length < 2 || isScoring}
          activeOpacity={0.82}
        >
          <Ionicons name="sparkles" size={15} color="#FFF" />
          <Text style={styles.scoreButtonText}>
            {isScoring
              ? 'Scoring…'
              : selectedItems.length < 2
                ? 'Select 2+ items to score'
                : `Score Outfit · ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}`}
          </Text>
        </TouchableOpacity>

        {/* Secondary row: Cancel + Save */}
        <View style={styles.footerSecondary}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => { resetForm(); onClose(); }}
            activeOpacity={0.75}
          >
            <Text style={styles.cancelBtnLabel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (isCreating || selectedItems.length === 0 || !outfitName.trim()) && styles.saveBtnDisabled,
            ]}
            onPress={handleCreateOutfit}
            disabled={isCreating || selectedItems.length === 0 || !outfitName.trim()}
            activeOpacity={0.82}
          >
            <Text style={styles.saveBtnLabel}>{isCreating ? 'Saving…' : 'Save Only'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 1000,
    flexDirection: 'column',
  },

  // ── Header: title + inline name input + close ────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  nameInput: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.accent,
    backgroundColor: 'transparent',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Category chip row ────────────────────────────────────────
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  categoryStripContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    gap: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catChip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  catChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  catChipLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  catChipLabelActive: {
    color: '#FFF',
  },

  // ── Selected items bar ───────────────────────────────────────
  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingRight: 8,
    maxHeight: 42,
  },
  selectedBarContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 7,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
    maxWidth: 120,
  },
  selectedPillLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: '#FFF',
    flexShrink: 1,
  },
  clearAllBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    flexShrink: 0,
  },

  // ── Garment body ─────────────────────────────────────────────
  scrollBody: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: Spacing.md,
  },
  emptyStateText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // ── Footer ───────────────────────────────────────────────────
  footer: {
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: 10,
  },
  scoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingVertical: 13,
    paddingHorizontal: Spacing.lg,
  },
  scoreButtonDisabled: {
    opacity: 0.42,
  },
  scoreButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFF',
    letterSpacing: 0.1,
  },
  footerSecondary: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  cancelBtnLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.background,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
  },
});

