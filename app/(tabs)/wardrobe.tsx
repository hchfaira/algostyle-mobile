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
  ScrollView,
  RefreshControl,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { TopBar } from '../../components/ui';
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


// ── Smart action cards ────────────────────────────────────────────────────
// Refined quiet luxury — soft tones, understated elegance
const SMART_CARDS = [
  {
    key:       'smart-add',
    icon:      '🛍️',
    title:     'Smart Add',
    subtitle:  'Find missing pieces',
    accent:    '#C9B8A8',   // warm cashmere
    accentBg:  '#FAF8F5',
    iconColor: '#8B7355',   // warm espresso
  },
  {
    key:       'audit',
    icon:      '📋',
    title:     'Audit',
    subtitle:  'Review your closet',
    accent:    '#B8ADA3',   // cool stone
    accentBg:  '#F9F7F5',
    iconColor: '#6E6358',   // cool walnut
  },
  {
    key:       'removal',
    icon:      '✨',
    title:     'Simplify',
    subtitle:  'Streamline your wardrobe',
    accent:    '#A89E94',   // soft taupe
    accentBg:  '#F8F6F3',
    iconColor: '#8A7E72',   // warm taupe
  },
  {
    key:       'capsule',
    icon:      '📦',
    title:     'Capsule',
    subtitle:  'Build the perfect set',
    accent:    '#9B9189',   // greige
    accentBg:  '#F7F5F2',
    iconColor: '#7A706A',   // warm greige
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────
// SmartTile — premium card with large colored icon, entrance + press animations
// ─────────────────────────────────────────────────────────────────────────
interface SmartTileProps {
  icon:       typeof SMART_CARDS[number]['icon'];
  title:      string;
  subtitle:   string;
  accent:     string;
  accentBg:   string;
  iconColor:  string;
  onPress:    () => void;
  delay:      number;
  isEmoji?:   boolean;
}

function SmartTile({ icon, title, subtitle, accent, accentBg, iconColor, onPress, delay, isEmoji = true }: SmartTileProps) {
  const scale    = useSharedValue(1);
  const iconRotY = useSharedValue(0);

  // entrance: scale up from 0.88
  const entranceScale = useSharedValue(0.88);
  const entranceAnim  = useAnimatedStyle(() => ({
    opacity:   entranceScale.value === 1 ? 1 : entranceScale.value / 0.88 * 0.3 + 0.7,
    transform: [{ scale: entranceScale.value }],
  }));

  React.useEffect(() => {
    entranceScale.value = withDelay(
      delay,
      withSpring(1, { damping: 16, stiffness: 260 }),
    );
  }, []);

  // press animation
  const pressAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // icon spin on press
  const iconAnim = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${iconRotY.value}deg` }],
  }));

  const onPressIn = () => {
    scale.value    = withSpring(0.95, { damping: 18, stiffness: 400 });
    iconRotY.value = withTiming(180, { duration: 280, easing: Easing.out(Easing.cubic) });
  };
  const onPressOut = () => {
    scale.value    = withSpring(1, { damping: 14, stiffness: 320 });
    iconRotY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
  };

  return (
    <Animated.View style={[gridStyles.tileWrapper, entranceAnim, pressAnim]}>
      <TouchableOpacity
        style={gridStyles.tile}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {/* Large colored icon pill — fully rounded */}
        <Animated.View style={[gridStyles.iconPill, { backgroundColor: accentBg }, iconAnim]}>
          {isEmoji ? (
            <Text style={[gridStyles.emojiIcon, { color: iconColor }]}>{icon}</Text>
          ) : (
            <Ionicons name={icon as any} size={40} color={iconColor} />
          )}
        </Animated.View>

        <Text style={gridStyles.tileTitle}>{title}</Text>
        <Text style={gridStyles.tileSub} numberOfLines={1}>{subtitle}</Text>

        {/* Bottom accent pill — rounded, centered */}
        <View style={[gridStyles.accentPill, { backgroundColor: accent }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const gridStyles = StyleSheet.create({
  grid: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    paddingHorizontal: Spacing.lg,
    gap:               Spacing.md,
    marginTop:         Spacing.lg,
    marginBottom:      Spacing.md,
  },
  tileWrapper: {
    width: '47.5%',
  },
  tile: {
    backgroundColor:   Colors.surface,
    paddingVertical:   22,
    paddingHorizontal: 16,
    borderRadius:      BorderRadius.xl,
    borderWidth:       1,
    borderColor:       Colors.border,
    gap:               10,
    overflow:          'hidden',
    ...Shadow.md,
    alignItems:        'center',
  },
  iconPill: {
    width:          72,
    height:         72,
    borderRadius:   BorderRadius.full,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   4,
    shadowColor:    '#B8A799',
    shadowOffset:   { width: 0, height: 3 },
    shadowOpacity:  0.10,
    shadowRadius:   10,
    elevation:      3,
  },
  emojiIcon: {
    fontSize:   40,
    lineHeight: 44,
  },
  tileTitle: {
    fontSize:      FontSize.sm,
    fontWeight:    FontWeight.bold,
    color:         Colors.textPrimary,
    letterSpacing: 0.3,
    textAlign:     'center',
  },
  tileSub: {
    fontSize:   FontSize.xs,
    color:      Colors.textMuted,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
    textAlign:  'center',
  },
  accentPill: {
    width:        32,
    height:       3,
    borderRadius: BorderRadius.full,
    alignSelf:    'center',
    marginTop:    2,
  },
});

// ─────────────────────────────────────────────────────────────────────────
export default function WardrobeScreen() {
  const w = useWardrobe();

  // Filter sheet — opened via filter icon button; GarmentFilterBar registers its open fn here
  const openFilterSheet = useRef<(() => void) | null>(null);

  // Category filter sheet (category visibility) — kept for the CategoryFilterSheet modal
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const hiddenCount = BROWSABLE_CATEGORIES.length - w.visibleCategories.length;

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

        {/* ── Smart Action Grid — 2×2, no scrolling ── */}
        <View style={gridStyles.grid}>
          {SMART_CARDS.map((card, i) => (
            <SmartTile
              key={card.key}
              icon={card.icon}
              title={card.title}
              subtitle={card.subtitle}
              accent={card.accent}
              accentBg={card.accentBg}
              iconColor={card.iconColor}
              delay={i * 70}
              onPress={() => handleCardPress(card.key)}
              isEmoji={true}
            />
          ))}
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
    marginTop:        Spacing.md,
    marginBottom:     Spacing.sm,
  },
  searchBar: {
    flex:              1,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing.sm,
    backgroundColor:   Colors.surfaceLight,
    borderWidth:       1,
    borderColor:       Colors.border,
    borderRadius:      BorderRadius.full,
    paddingHorizontal: Spacing.md + 2,
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
    borderRadius:    BorderRadius.full,
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
    top:              4,
    right:            4,
    minWidth:         16,
    height:           16,
    borderRadius:     BorderRadius.full,
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
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    height:            46,
    paddingHorizontal: Spacing.md,
    backgroundColor:   Colors.accent,
    borderRadius:      BorderRadius.full,
  },
  addBtnLabel: {
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.black,
    color:         '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

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
