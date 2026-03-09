/**
 * CapsuleWardrobeModal
 *
 * Lets the user build a capsule wardrobe by:
 *  1. Selecting existing items from their wardrobe  AND/OR
 *  2. Adding Smart-Add suggestions (items that maximise new combinations)
 *
 * After selection it computes the total number of unique outfit combinations
 * (top × bottom/dress × outerwear? × shoes × accessory?) and shows them in a
 * visual breakdown.
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import type { GarmentItem, SmartSuggestion } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
const THUMB = (SCREEN_W - Spacing.lg * 2 - Spacing.sm * 3) / 4;

/* ─── Category config ─────────────────────────────────────────── */
type Cat = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';

const CATEGORY_ICONS: Record<Cat, React.ComponentProps<typeof Ionicons>['name']> = {
  top:        'shirt-outline',
  bottom:     'cut-outline',
  dress:      'rose-outline',
  outerwear:  'layers-outline',
  shoes:      'footsteps-outline',
  accessory:  'watch-outline',
};

const CATEGORY_LABELS: Record<Cat, string> = {
  top:        'Tops',
  bottom:     'Bottoms',
  dress:      'Dresses',
  outerwear:  'Coats',
  shoes:      'Shoes',
  accessory:  'Accessories',
};

const ORDERED_CATS: Cat[] = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'];

/* ─── Combination counter ─────────────────────────────────────── */
/**
 * Simple combinatorics:
 *  A complete outfit needs at minimum: (top OR dress) + shoes
 *  Optionals: bottom (with top), outerwear, accessory
 *
 *  Combinations = outfits that can be assembled:
 *   outfits_with_top    = tops × bottoms (if bottoms > 0, else tops alone) × (coats+1) × (shoes) × (accessories+1)
 *   outfits_with_dress  = dresses × (coats+1) × shoes × (accessories+1)
 *   total               = outfits_with_top + outfits_with_dress
 */
function countCombinations(counts: Record<Cat, number>): number {
  const { top, bottom, dress, outerwear, shoes, accessory } = counts;
  if (shoes === 0) return 0;

  const outfitsWithTop =
    top > 0 && (bottom > 0 || true)          // tops can be worn alone (no bottom required for capsule estimate)
      ? top * Math.max(bottom, 1) * (outerwear + 1) * shoes * (accessory + 1)
      : 0;

  const outfitsWithDress =
    dress > 0
      ? dress * (outerwear + 1) * shoes * (accessory + 1)
      : 0;

  return outfitsWithTop + outfitsWithDress;
}

/* ─── Props ───────────────────────────────────────────────────── */
interface CapsuleWardrobeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

/* ─── Component ───────────────────────────────────────────────── */
export const CapsuleWardrobeModal: React.FC<CapsuleWardrobeModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { wardrobe, userId } = useAppStore();

  /* step: 'select' | 'review' */
  const [step, setStep] = useState<'select' | 'review'>('select');

  /* wardrobe selection */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterCat, setFilterCat] = useState<Cat | 'all'>('all');

  /* smart-add */
  const [showSmartAdd, setShowSmartAdd] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartInsight, setSmartInsight] = useState<string | null>(null);
  const [pendingSuggestions, setPendingSuggestions] = useState<Set<string>>(new Set());

  /* ── derived data ──────────────────────────────────────────── */
  const filteredWardrobe = useMemo(
    () => (filterCat === 'all' ? wardrobe : wardrobe.filter((g) => g.attributes.category === filterCat)),
    [wardrobe, filterCat]
  );

  const selectedItems = useMemo(
    () => wardrobe.filter((g) => selectedIds.has(g.id)),
    [wardrobe, selectedIds]
  );

  const categoryCounts = useMemo<Record<Cat, number>>(() => {
    const counts = { top: 0, bottom: 0, dress: 0, outerwear: 0, shoes: 0, accessory: 0 } as Record<Cat, number>;
    selectedItems.forEach((g) => {
      const cat = g.attributes.category as Cat;
      if (cat in counts) counts[cat]++;
    });
    // Add pending smart-add suggestions
    pendingSuggestions.forEach((id) => {
      const sug = smartSuggestions.find((s) => s.id === id);
      if (sug) {
        const cat = sug.category as Cat;
        if (cat in counts) counts[cat]++;
      }
    });
    return counts;
  }, [selectedItems, pendingSuggestions, smartSuggestions]);

  const totalCombinations = useMemo(() => countCombinations(categoryCounts), [categoryCounts]);
  const totalSelectedCount = selectedIds.size + pendingSuggestions.size;

  /* ── handlers ──────────────────────────────────────────────── */
  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleOpenSmartAdd = async () => {
    setShowSmartAdd(true);
    if (smartSuggestions.length > 0 || !userId) return;
    setSmartLoading(true);
    try {
      const res = await api.getSmartSuggestions(userId);
      setSmartSuggestions(res.suggestions);
      setSmartInsight(res.insight);
    } catch {
      setSmartInsight('Could not load suggestions. Make sure the backend is running.');
    } finally {
      setSmartLoading(false);
    }
  };

  const toggleSuggestion = (id: string) => {
    setPendingSuggestions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleReset = () => {
    setSelectedIds(new Set());
    setPendingSuggestions(new Set());
    setStep('select');
  };

  const handleClose = () => {
    handleReset();
    setShowSmartAdd(false);
    onClose();
  };

  /* ── render helpers ─────────────────────────────────────────── */
  const renderGarmentThumb = ({ item }: { item: GarmentItem }) => {
    const selected = selectedIds.has(item.id);
    const cat = item.attributes.category as Cat;
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={[styles.thumb, selected && styles.thumbSelected]}
        onPress={() => toggleItem(item.id)}
      >
        <View
          style={[
            styles.thumbColor,
            { backgroundColor: item.attributes.color_hex || '#CCC' },
          ]}
        >
          <Ionicons
            name={CATEGORY_ICONS[cat] ?? 'pricetag-outline'}
            size={20}
            color="rgba(255,255,255,0.75)"
          />
        </View>
        <Text style={styles.thumbLabel} numberOfLines={1}>
          {item.attributes.subcategory || item.attributes.category}
        </Text>
        {selected && (
          <View style={styles.thumbCheck}>
            <Ionicons name="checkmark" size={10} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /* ── STEP: select ─────────────────────────────────────────────── */
  const renderSelectStep = () => (
    <>
      {/* Category filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catPills}
      >
        {(['all', ...ORDERED_CATS] as const).map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.pill, filterCat === c && styles.pillActive]}
            onPress={() => setFilterCat(c)}
          >
            {c !== 'all' && (
              <Ionicons
                name={CATEGORY_ICONS[c]}
                size={12}
                color={filterCat === c ? '#FFF' : Colors.textSecondary}
              />
            )}
            <Text style={[styles.pillLabel, filterCat === c && styles.pillLabelActive]}>
              {c === 'all' ? 'All' : CATEGORY_LABELS[c]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Smart Add CTA */}
      <TouchableOpacity style={styles.smartAddBtn} onPress={handleOpenSmartAdd} activeOpacity={0.8}>
        <Ionicons name="sparkles" size={16} color={Colors.accent} />
        <Text style={styles.smartAddBtnLabel}>SMART ADD — let AI pick missing items</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Wardrobe grid */}
      {filteredWardrobe.length === 0 ? (
        <View style={styles.emptyGrid}>
          <Ionicons name="grid-outline" size={36} color={Colors.textMuted} />
          <Text style={styles.emptyGridText}>No items in this category</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWardrobe}
          numColumns={4}
          keyExtractor={(g) => g.id}
          renderItem={renderGarmentThumb}
          contentContainerStyle={styles.thumbGrid}
          columnWrapperStyle={styles.thumbRow}
          scrollEnabled={false}
        />
      )}
    </>
  );

  /* ── STEP: review ─────────────────────────────────────────────── */
  const renderReviewStep = () => {
    const hasSomething = totalSelectedCount > 0;

    return (
      <Animated.View entering={FadeInUp.springify()}>
        {/* Combination hero */}
        <View style={styles.comboHero}>
          <Text style={styles.comboNumber}>{totalCombinations.toLocaleString()}</Text>
          <Text style={styles.comboLabel}>OUTFIT COMBINATIONS</Text>
          <Text style={styles.comboSub}>
            from {totalSelectedCount} capsule piece{totalSelectedCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Category breakdown */}
        <View style={styles.breakdownGrid}>
          {ORDERED_CATS.map((cat) => {
            const count = categoryCounts[cat];
            return (
              <View key={cat} style={[styles.breakdownCell, count === 0 && styles.breakdownCellEmpty]}>
                <Ionicons
                  name={CATEGORY_ICONS[cat]}
                  size={18}
                  color={count > 0 ? Colors.accent : Colors.textMuted}
                />
                <Text style={[styles.breakdownCount, count === 0 && styles.breakdownCountEmpty]}>
                  {count}
                </Text>
                <Text style={styles.breakdownCat}>{CATEGORY_LABELS[cat]}</Text>
              </View>
            );
          })}
        </View>

        {/* Tips based on gaps */}
        {renderCapsuleTips()}

        {/* Selected items list */}
        <Text style={styles.reviewSectionTitle}>YOUR CAPSULE ITEMS</Text>
        {selectedItems.map((g) => {
          const cat = g.attributes.category as Cat;
          return (
            <View key={g.id} style={styles.reviewRow}>
              <View style={[styles.reviewSwatch, { backgroundColor: g.attributes.color_hex || '#CCC' }]}>
                <Ionicons name={CATEGORY_ICONS[cat] ?? 'pricetag-outline'} size={16} color="rgba(255,255,255,0.8)" />
              </View>
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewName} numberOfLines={1}>
                  {g.attributes.subcategory || g.attributes.category}
                </Text>
                <Text style={styles.reviewMeta}>
                  {g.attributes.color_primary} · {CATEGORY_LABELS[cat]}
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleItem(g.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Smart-add pending items */}
        {pendingSuggestions.size > 0 && (
          <>
            <Text style={[styles.reviewSectionTitle, { marginTop: Spacing.lg }]}>
              ITEMS TO ADD (SMART ADD)
            </Text>
            {smartSuggestions
              .filter((s) => pendingSuggestions.has(s.id))
              .map((sug) => (
                <View key={sug.id} style={[styles.reviewRow, styles.reviewRowSuggested]}>
                  <View style={[styles.reviewSwatch, { backgroundColor: sug.color_hex }]}>
                    <Ionicons name="sparkles" size={14} color="rgba(255,255,255,0.8)" />
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName} numberOfLines={1}>{sug.description}</Text>
                    <Text style={styles.reviewMeta}>AI suggestion · +{sug.new_combinations} combos</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleSuggestion(sug.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </Animated.View>
    );
  };

  const renderCapsuleTips = () => {
    const tips: string[] = [];
    if (categoryCounts.shoes === 0) tips.push('Add at least 1 pair of shoes to start generating outfits.');
    if (categoryCounts.top === 0 && categoryCounts.dress === 0) tips.push('Add tops or dresses — they anchor most outfit combos.');
    if (categoryCounts.bottom === 0 && categoryCounts.dress === 0) tips.push('Bottoms paired with tops multiply your combinations quickly.');
    if (categoryCounts.outerwear === 0) tips.push('A coat or jacket adds an extra layer of variety to every combo.');
    if (tips.length === 0 && totalCombinations < 10) tips.push('Select a wider variety of categories to unlock more combinations.');
    if (tips.length === 0) return null;

    return (
      <View style={styles.tipsBox}>
        <Ionicons name="bulb-outline" size={16} color={Colors.accentWarm} />
        <View style={{ flex: 1, gap: 4 }}>
          {tips.map((t, i) => (
            <Text key={i} style={styles.tipText}>· {t}</Text>
          ))}
        </View>
      </View>
    );
  };

  /* ── Smart Add sheet ────────────────────────────────────────── */
  const renderSmartAddSheet = () => (
    <Modal visible={showSmartAdd} transparent animationType="slide" onRequestClose={() => setShowSmartAdd(false)}>
      <Pressable style={styles.overlay} onPress={() => setShowSmartAdd(false)}>
        <Pressable style={[styles.sheet, styles.tallSheet]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <View>
              <Text style={styles.sheetTitle}>SMART ADD</Text>
              <Text style={styles.sheetSub}>Select suggestions to include in your capsule</Text>
            </View>
            <TouchableOpacity onPress={() => setShowSmartAdd(false)}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {smartLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>Analysing your wardrobe...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {smartInsight && (
                <View style={styles.insightBanner}>
                  <Ionicons name="bulb-outline" size={14} color={Colors.accentWarm} />
                  <Text style={styles.insightText}>{smartInsight}</Text>
                </View>
              )}
              {smartSuggestions.map((sug) => {
                const added = pendingSuggestions.has(sug.id);
                return (
                  <View key={sug.id} style={styles.sugRow}>
                    <View style={[styles.sugSwatch, { backgroundColor: sug.color_hex }]} />
                    <View style={styles.sugInfo}>
                      <Text style={styles.sugTitle}>{sug.description}</Text>
                      <Text style={styles.sugReason}>{sug.reason}</Text>
                      <View style={styles.comboBadge}>
                        <Text style={styles.comboText}>+{sug.new_combinations} outfits</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.sugToggle, added && styles.sugToggleActive]}
                      onPress={() => toggleSuggestion(sug.id)}
                    >
                      <Ionicons
                        name={added ? 'checkmark' : 'add'}
                        size={18}
                        color={added ? '#FFF' : Colors.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );

  /* ── Main render ─────────────────────────────────────────────── */
  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={[styles.sheet, styles.tallSheet]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>CAPSULE WARDROBE</Text>
              <Text style={styles.subtitle}>
                {step === 'select'
                  ? 'Pick items from your wardrobe or use Smart Add'
                  : 'Review your capsule & unlock max combinations'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ── Live counter bar ── */}
          <View style={styles.counterBar}>
            <View style={styles.counterLeft}>
              <Ionicons name="layers-outline" size={15} color={Colors.accent} />
              <Text style={styles.counterItems}>
                {totalSelectedCount} item{totalSelectedCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.counterRight}>
              <Ionicons name="shuffle-outline" size={14} color={Colors.success} />
              <Text style={styles.counterCombos}>
                {totalCombinations.toLocaleString()} combos
              </Text>
            </View>
          </View>

          {/* ── Scrollable body ── */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {step === 'select' ? renderSelectStep() : renderReviewStep()}
          </ScrollView>

          {/* ── Footer actions ── */}
          <View style={styles.footer}>
            {step === 'select' ? (
              <>
                <TouchableOpacity
                  style={styles.footerSecondary}
                  onPress={handleReset}
                >
                  <Text style={styles.footerSecondaryLabel}>CLEAR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.footerPrimary, totalSelectedCount === 0 && styles.footerPrimaryDisabled]}
                  onPress={() => totalSelectedCount > 0 && setStep('review')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="shuffle-outline" size={16} color="#FFF" />
                  <Text style={styles.footerPrimaryLabel}>SEE COMBINATIONS</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.footerSecondary} onPress={() => setStep('select')}>
                  <Ionicons name="arrow-back" size={14} color={Colors.textPrimary} />
                  <Text style={styles.footerSecondaryLabel}>EDIT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerPrimary}
                  onPress={() => {
                    Alert.alert(
                      'Capsule Saved',
                      `Your ${totalSelectedCount}-piece capsule wardrobe with ${totalCombinations.toLocaleString()} combinations has been saved.`,
                      [{ text: 'Great!', onPress: handleClose }]
                    );
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="bookmark-outline" size={16} color="#FFF" />
                  <Text style={styles.footerPrimaryLabel}>SAVE CAPSULE</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>

      {renderSmartAddSheet()}
    </Modal>
  );
};

/* ─── Styles ──────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  tallSheet: { maxHeight: '92%' },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },

  /* header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 2 },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3, lineHeight: 18 },

  /* live counter */
  counterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    marginBottom: Spacing.md,
  },
  counterLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  counterRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  counterItems: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  counterCombos: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: Colors.success },

  /* scrollable body */
  scrollBody: { paddingBottom: 20 },

  /* category pills */
  catPills: { gap: Spacing.sm, paddingBottom: Spacing.md, flexDirection: 'row' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  pillActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  pillLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillLabelActive: { color: '#FFF' },

  /* smart add CTA row */
  smartAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceLight,
  },
  smartAddBtnLabel: { flex: 1, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textPrimary, letterSpacing: 0.5 },

  /* garment thumbnails */
  thumbGrid: { paddingBottom: Spacing.sm },
  thumbRow: { gap: Spacing.sm, marginBottom: Spacing.sm },
  thumb: {
    width: THUMB,
    alignItems: 'center',
    gap: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + '0A' },
  thumbColor: {
    width: THUMB - 8,
    height: THUMB * 1.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLabel: { fontSize: 9, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },
  thumbCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* empty grid */
  emptyGrid: { paddingVertical: 40, alignItems: 'center', gap: Spacing.sm },
  emptyGridText: { fontSize: FontSize.sm, color: Colors.textMuted },

  /* review step — combo hero */
  comboHero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
  },
  comboNumber: { fontSize: 56, fontWeight: FontWeight.black, color: Colors.accent, letterSpacing: -2 },
  comboLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 3, marginTop: 4 },
  comboSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },

  /* breakdown grid */
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  breakdownCell: {
    width: (SCREEN_W - Spacing.lg * 2 - 3) / 3 - 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  breakdownCellEmpty: { backgroundColor: Colors.surfaceLight },
  breakdownCount: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.accent },
  breakdownCountEmpty: { color: Colors.textMuted },
  breakdownCat: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  /* tips box */
  tipsBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.accentWarm + '12',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentWarm,
    marginBottom: Spacing.lg,
  },
  tipText: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },

  /* review rows */
  reviewSectionTitle: {
    fontSize: 10,
    fontWeight: FontWeight.black,
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  reviewRowSuggested: { backgroundColor: Colors.accent + '06' },
  reviewSwatch: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  reviewInfo: { flex: 1 },
  reviewName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.4 },
  reviewMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  /* footer */
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  footerSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 0,
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerSecondaryLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase' },
  footerPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    backgroundColor: Colors.accent,
  },
  footerPrimaryDisabled: { backgroundColor: Colors.textMuted },
  footerPrimaryLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: 1.5, textTransform: 'uppercase' },

  /* inner smart-add sheet */
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  sheetTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 2 },
  sheetSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  loadingWrap: { paddingVertical: 60, alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: FontSize.sm, color: Colors.textMuted },
  insightBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.accentWarm + '15',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentWarm,
    marginBottom: Spacing.md,
  },
  insightText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  sugRow: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'center' },
  sugSwatch: { width: 44, height: 56 },
  sugInfo: { flex: 1, gap: 4 },
  sugTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.4 },
  sugReason: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 17 },
  comboBadge: { alignSelf: 'flex-start', backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 3 },
  comboText: { fontSize: 10, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: 0.5 },
  sugToggle: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sugToggleActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
});
