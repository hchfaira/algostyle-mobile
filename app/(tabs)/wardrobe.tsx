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

import CategoryFilterSheet from '../../components/wardrobe/CategoryFilterSheet';
import CategoryRow from '../../components/wardrobe/CategoryRow';
import GarmentFilterBar from '../../components/wardrobe/GarmentFilterBar';
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

  // Filter sheet — opened via filter icon button; GarmentFilterBar registers its open fn here
  const openFilterSheet = useRef<(() => void) | null>(null);

  // Category filter sheet (category visibility) — kept for the CategoryFilterSheet modal
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

  // Sections to render: all categories in BROWSABLE_CATEGORIES order
  const sections = useMemo(() => BROWSABLE_CATEGORIES, []);

  return (
    <View style={styles.container}>
      <TopBar
        title="My Wardrobe"
        subtitle={`${w.wardrobe.length} item${w.wardrobe.length !== 1 ? 's' : ''}`}
        favoriteCount={w.wardrobe.filter((g) => g.is_favorite).length}
      />

      {/* ── Search + Filters + Add Clothing ── */}
      <View style={styles.searchRow}>
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
        </View>

        {/* Colour / style filter */}
        <TouchableOpacity
          style={[styles.iconBtn, (w.colorFilter || w.formalityFilter) && styles.iconBtnActive]}
          activeOpacity={0.75}
          onPress={() => openFilterSheet.current?.()}
          accessibilityLabel="Filters"
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={(w.colorFilter || w.formalityFilter) ? Colors.textOnAccent : Colors.textSecondary}
          />
          {(w.colorFilter || w.formalityFilter) && (
            <View style={styles.iconBtnBadge}>
              <Text style={styles.iconBtnBadgeText}>
                {(w.colorFilter ? 1 : 0) + (w.formalityFilter ? 1 : 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Add Clothing */}
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => w.setShowAddMenu(true)}
          accessibilityLabel="Add clothing"
        >
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.addBtnLabel}>Add Clothing</Text>
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

      {/* ── Filter + Sort bar (unified) ── */}
      <GarmentFilterBar
        items={w.sortedItems}
        totalCount={Object.values(w.itemsByCategory).flat().length}
        colorFilter={w.colorFilter}
        formalityFilter={w.formalityFilter}
        onColorChange={w.setColorFilter}
        onFormalityChange={w.setFormalityFilter}
        sortMode={w.sortMode}
        onChangeSortMode={w.setSortMode}
        sortScoresLoading={w.sortScoresLoading}
        onRegisterOpen={(fn) => { openFilterSheet.current = fn; }}
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
        {sections.map((cat, i) => (
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
            isVisible={w.visibleCategories.includes(cat.key)}
            onToggleVisibility={() => w.toggleCategory(cat.key)}
          />
        ))}

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

  // ── Search + filter + add row ─────────────────────────────────────────
  searchRow: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop:        Spacing.sm,
    marginBottom:     Spacing.xs,
  },
  searchBar: {
    flex:              1,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing.sm,
    backgroundColor:   Colors.surfaceLight,
    borderWidth:       1,
    borderColor:       Colors.border,
    paddingHorizontal: Spacing.md,
    height:            46,
  },
  searchInput: {
    flex:       1,
    color:      Colors.textPrimary,
    fontSize:   FontSize.md,
    fontWeight: FontWeight.regular,
  },

  // ── Icon button (filter) ──────────────────────────────────────────────
  iconBtn: {
    width:           46,
    height:          46,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  iconBtnActive: {
    backgroundColor: Colors.accent,
    borderColor:     Colors.accent,
  },
  iconBtnBadge: {
    position:         'absolute',
    top:              6,
    right:            6,
    minWidth:         14,
    height:           14,
    borderRadius:     7,
    backgroundColor:  '#FFFFFF',
    alignItems:       'center',
    justifyContent:   'center',
    paddingHorizontal: 2,
  },
  iconBtnBadgeText: {
    fontSize:   9,
    fontWeight: FontWeight.black,
    color:      Colors.accent,
    lineHeight: 14,
  },

  // ── Add Clothing button ───────────────────────────────────────────────
  addBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    height:          46,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.accent,
  },
  addBtnLabel: {
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.black,
    color:         '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Action carousel ───────────────────────────────────────────────────
  carouselWrap:    { marginTop: Spacing.md, marginBottom: Spacing.sm },
  carouselContent: { paddingHorizontal: Spacing.lg },
  dotsRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            5,
    marginTop:      Spacing.sm,
  },
  dot: { height: 2, borderRadius: 1, backgroundColor: Colors.accent },

  // ── Empty state ───────────────────────────────────────────────────────
  emptyAll: {
    alignItems:        'center',
    paddingTop:        72,
    paddingHorizontal: Spacing.xl,
    gap:               Spacing.sm,
  },
  emptyAllTitle: {
    fontSize:      FontSize.md,
    fontWeight:    FontWeight.black,
    color:         Colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  emptyAllDesc: {
    fontSize:   FontSize.sm,
    color:      Colors.textMuted,
    textAlign:  'center',
    lineHeight: 20,
  },
});
