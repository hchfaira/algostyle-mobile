/**
 * Wardrobe Tab — Browse by category with horizontal section rows
 *
 * Layout:
 *  TopBar
 *  SearchBar + Add button
 *  CategoryStrip  (toggle chips — show/hide sections)
 *  Smart Action Carousel  (Smart Add / Audit / Removal / Capsule)
 *  CapsuleScoreCard
 *  ── vertical scroll ──
 *    CategoryRow × N  (one per visible category, 3-wide horizontal strip)
 */
import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import ActionCard, { CARD_WIDTH } from '../../components/wardrobe/ActionCard';
import AddGarmentModal from '../../components/wardrobe/AddGarmentModal';
import GarmentUploadFlow from '../../components/wardrobe/GarmentUploadFlow';
import SmartAddSheet from '../../components/wardrobe/SmartAddSheet';
import ClosetAuditSheet from '../../components/wardrobe/ClosetAuditSheet';
import CapsuleScoreCard from '../../components/wardrobe/CapsuleScoreCard';
import GarmentDetailModal from '../../components/wardrobe/GarmentDetailModal';
import MissingPiecesSheet from '../../components/wardrobe/MissingPiecesSheet';
import CapsuleEvolutionChart from '../../components/wardrobe/CapsuleEvolutionChart';
import SmartRemovalSheet from '../../components/wardrobe/SmartRemovalSheet';
import SortFilterBar from '../../components/wardrobe/SortFilterBar';
import CategoryFilterSheet from '../../components/wardrobe/CategoryFilterSheet';
import CategoryRow from '../../components/wardrobe/CategoryRow';
import { BROWSABLE_CATEGORIES } from '../../components/wardrobe/constants';
import { CapsuleWardrobeModal } from '../../components/CapsuleWardrobeModal';
import { useWardrobe } from '../../hooks/useWardrobe';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Smart action cards ───────────────────────────────────────────────────
const SMART_CARDS = [
  { key: 'smart-add', icon: 'sparkles-outline',  title: 'Smart Add',     subtitle: 'AI spots missing pieces that unlock the most outfit combos.',  buttonLabel: 'See suggestions', accentColor: Colors.accent,    variant: 'primary'   as const },
  { key: 'audit',     icon: 'refresh-outline',    title: 'Closet Audit',  subtitle: 'Surface underused pieces and tidy your wardrobe rhythm.',       buttonLabel: 'Review now',      accentColor: Colors.accentWarm, variant: 'secondary' as const },
  { key: 'removal',   icon: 'trash-outline',      title: 'Smart Removal', subtitle: 'Find low-impact pieces to declutter your capsule.',             buttonLabel: 'Declutter',       accentColor: Colors.error,     variant: 'secondary' as const },
  { key: 'capsule',   icon: 'layers-outline',     title: 'Capsule',       subtitle: 'Build a tight capsule that maximises outfit combinations.',      buttonLabel: 'Build capsule',   accentColor: Colors.accent,    variant: 'primary'   as const },
] as const;

// ── Animated dot indicator ────────────────────────────────────────────────
interface DotProps { index: number; activeIndex: number; scrollX: SharedValue<number>; cardWidth: number; }

function DotIndicator({ index, scrollX, cardWidth }: DotProps) {
  const step = cardWidth + Spacing.sm;
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * step, index * step, (index + 1) * step];
    return {
      width:   interpolate(scrollX.value, inputRange, [5, 18, 5],      Extrapolation.CLAMP),
      opacity: interpolate(scrollX.value, inputRange, [0.30, 1, 0.30], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.dot, animStyle]} />;
}

// ─────────────────────────────────────────────────────────────────────────
export default function WardrobeScreen() {
  const w = useWardrobe();

  // Carousel
  const carouselRef = useRef<FlatList>(null);
  const [activeCard, setActiveCard] = useState(0);
  const scrollX = useSharedValue(0);

  // Category filter sheet
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const hiddenCount = BROWSABLE_CATEGORIES.length - w.visibleCategories.length;

  const onCarouselScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      scrollX.value = x;
      const idx = Math.round(x / (CARD_WIDTH + Spacing.sm));
      if (idx !== activeCard) setActiveCard(idx);
    },
    [activeCard, scrollX],
  );

  const handleCardPress = useCallback(
    (key: string) => {
      if (key === 'smart-add') w.handleOpenSmartAdd();
      else if (key === 'audit')    w.handleOpenAudit();
      else if (key === 'removal')  w.handleOpenSmartRemoval();
      else if (key === 'capsule')  w.setShowCapsule(true);
    },
    [w],
  );

  // Sections to render: only visible categories that appear in BROWSABLE_CATEGORIES order
  const sections = useMemo(
    () => BROWSABLE_CATEGORIES.filter((c) => w.visibleCategories.includes(c.key)),
    [w.visibleCategories],
  );

  return (
    <View style={styles.container}>
      <TopBar
        title="My Wardrobe"
        subtitle={`${w.wardrobe.length} item${w.wardrobe.length !== 1 ? 's' : ''}`}
        favoriteCount={w.wardrobe.filter((g) => g.is_favorite).length}
      />

      {/* ── Search + Filter + Add ── */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={w.searchQuery}
          onChangeText={w.setSearchQuery}
          placeholder="Search items..."
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
        />
        {w.searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => w.setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        {/* Category filter icon — badge shows number of hidden categories */}
        <TouchableOpacity
          style={styles.filterBtn}
          activeOpacity={0.7}
          onPress={() => setShowCategoryFilter(true)}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={hiddenCount > 0 ? Colors.accent : Colors.textMuted}
          />
          {hiddenCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{hiddenCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => w.setShowAddMenu(true)}>
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── Category filter bottom sheet ── */}
      <CategoryFilterSheet
        visible={showCategoryFilter}
        onClose={() => setShowCategoryFilter(false)}
        visibleCategories={w.visibleCategories}
        onToggle={w.toggleCategory}
        counts={w.categoryCounts}
      />

      {/* ── Sort Filter Bar ── */}
      <SortFilterBar
        sortMode={w.sortMode}
        onChangeSortMode={w.setSortMode}
        loading={w.sortScoresLoading}
        currentSeason={w.currentSeason}
      />

      {/* ── Scrollable body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={w.refreshing}
            onRefresh={w.onRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        {/* ── Capsule Score Card ── */}
        <CapsuleScoreCard
          data={w.capsuleScore}
          loading={w.capsuleScoreLoading}
          onPressEvolution={w.handleOpenEvolution}
          onPressMissing={w.handleOpenMissingPieces}
        />

        {/* ── Smart Action Carousel ── */}
        <View style={styles.carouselWrap}>
          <FlatList
            ref={carouselRef}
            data={SMART_CARDS}
            keyExtractor={(item) => item.key}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + Spacing.sm}
            snapToAlignment="start"
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselContent}
            renderItem={({ item, index }) => (
              <ActionCard
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                buttonLabel={item.buttonLabel}
                accentColor={item.accentColor}
                variant={item.variant}
                index={index}
                isActive={index === activeCard}
                onPress={() => handleCardPress(item.key)}
              />
            )}
          />
          <View style={styles.dotsRow}>
            {SMART_CARDS.map((_, i) => (
              <DotIndicator key={i} index={i} activeIndex={activeCard} scrollX={scrollX} cardWidth={CARD_WIDTH} />
            ))}
          </View>
        </View>

        {/* ── Category sections ── */}
        {sections.length === 0 ? (
          <View style={styles.emptyAll}>
            <Ionicons name="eye-off-outline" size={40} color={Colors.border} />
            <Text style={styles.emptyAllTitle}>No categories selected</Text>
            <Text style={styles.emptyAllDesc}>Tap the chips above to show your wardrobe sections.</Text>
          </View>
        ) : (
          sections.map((cat, i) => (
            <CategoryRow
              key={cat.key}
              categoryKey={cat.key}
              label={cat.label}
              emoji={cat.emoji}
              items={w.itemsByCategory[cat.key] ?? []}
              sectionIndex={i}
              sortScores={w.sortScores}
              onPressItem={w.handleGarmentPress}
              onDeleteItem={w.handleDelete}
              onToggleFavorite={w.handleToggleFavorite}
            />
          ))
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Modals ── */}
      <AddGarmentModal visible={w.showAddMenu} onClose={() => w.setShowAddMenu(false)} onPickSource={w.handlePickSource} />
      {w.showUploadFlow && !!w.uploadImageUri && (
        <GarmentUploadFlow
          visible={w.showUploadFlow}
          imageUri={w.uploadImageUri}
          imageBase64={w.uploadImageBase64}
          userId={w.userId ?? ''}
          onClose={() => w.setShowUploadFlow(false)}
          onGarmentAdded={w.handleGarmentAdded}
        />
      )}

      <SmartAddSheet visible={w.showSmartAdd} onClose={() => w.setShowSmartAdd(false)} loading={w.smartLoading} suggestions={w.smartSuggestions} insight={w.smartInsight} />
      <ClosetAuditSheet visible={w.showAudit} onClose={() => w.setShowAudit(false)} loading={w.auditLoading} items={w.auditItems} summary={w.auditSummary} expandedId={w.expandedAuditId} onToggleExpand={w.toggleAuditExpand} />
      <CapsuleWardrobeModal isVisible={w.showCapsule} onClose={() => w.setShowCapsule(false)} />
      <GarmentDetailModal visible={w.showGarmentDetail} item={w.selectedGarment} analysis={w.garmentAnalysis} loading={w.garmentAnalysisLoading} onClose={() => w.setShowGarmentDetail(false)} onDelete={w.handleDelete} onToggleFavorite={w.handleToggleFavorite} />
      <MissingPiecesSheet visible={w.showMissingPieces} onClose={() => w.setShowMissingPieces(false)} loading={w.missingPiecesLoading} data={w.missingPieces} />
      <CapsuleEvolutionChart visible={w.showEvolution} onClose={() => w.setShowEvolution(false)} loading={w.evolutionLoading} data={w.evolutionData} />
      <SmartRemovalSheet visible={w.showSmartRemoval} onClose={() => w.setShowSmartRemoval(false)} loading={w.removalLoading} data={w.removalData} activeProfile={w.removalProfile} onChangeProfile={w.handleChangeRemovalProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  addBtn: { width: 36, height: 36, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  filterBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.black,
    color: Colors.textOnAccent,
    lineHeight: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },

  // ── Carousel ──────────────────────────────────────────────────────────
  carouselWrap: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  carouselContent: { paddingHorizontal: Spacing.lg },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  dot: { height: 2, borderRadius: 1, backgroundColor: '#3B2A1A' },

  // ── Empty state ───────────────────────────────────────────────────────
  emptyAll: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyAllTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptyAllDesc: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
