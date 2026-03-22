/**
 * Marketplace Tab — ASOS-style fashion marketplace
 *
 * Discover clothes from partner brands and second-hand user listings.
 * Filters: source · category · condition · price range · size · sort
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ScrollView, TextInput, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import {
  ListingCard, FilterSheet, ItemDetailModal,
  CATEGORIES, CONDITION_LABELS, SORTS, Source, Condition,
  ListingItem,
} from '../../components/marketplace';
import { CARD_GAP, NUM_COLUMNS } from '../../components/marketplace/ListingCard';
import { useMarketplaceFilters } from '../../hooks/useMarketplaceFilters';

export default function MarketplaceScreen() {
  const filters = useMarketplaceFilters();

  // UI state
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handlePress = useCallback(
    (item: ListingItem) => {
      setSelectedItem({ ...item, isFavorited: filters.favorites.has(item.id) });
      setShowDetailModal(true);
    },
    [filters.favorites],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Marketplace"
        subtitle={`${filters.listings.length} item${filters.listings.length !== 1 ? 's' : ''}`}
      />

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={17} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={filters.searchQuery}
          onChangeText={filters.setSearchQuery}
          placeholder="Search items, brands, colours…"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
        />
        {filters.searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => filters.setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={17} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.filterBtn, filters.filterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilterSheet(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={17} color={filters.filterCount > 0 ? '#FFF' : Colors.textPrimary} />
          {filters.filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filters.filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Source toggle */}
      <View style={styles.sourceRow}>
        {([['all', 'All'], ['brand', 'Brands'], ['user', 'Second-hand']] as [Source, string][]).map(
          ([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.sourceTab, filters.source === key && styles.sourceTabActive]}
              onPress={() => filters.setSource(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sourceTabLabel, filters.source === key && styles.sourceTabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {/* Category filter */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c.key}
        contentContainerStyle={styles.catList}
        renderItem={({ item: cat }) => {
          const active = filters.category === cat.key;
          return (
            <TouchableOpacity
              style={[styles.catTab, active && styles.catTabActive]}
              onPress={() => filters.setCategory(cat.key)}
              activeOpacity={0.75}
            >
              <Ionicons name={cat.icon} size={13} color={active ? '#FFF' : Colors.textSecondary} />
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Active filter chips */}
      {filters.filterCount > 0 && (
        <View style={styles.activeChipsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeChips}>
            {filters.condition !== 'all' && (
              <TouchableOpacity style={styles.activeChip} onPress={() => filters.setCondition('all')}>
                <Text style={styles.activeChipText}>{CONDITION_LABELS[filters.condition as Condition]}</Text>
                <Ionicons name="close" size={10} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <TouchableOpacity style={styles.activeChip} onPress={() => { filters.setMinPrice(''); filters.setMaxPrice(''); }}>
                <Text style={styles.activeChipText}>
                  {filters.minPrice ? `€${filters.minPrice}` : '€0'} – {filters.maxPrice ? `€${filters.maxPrice}` : '∞'}
                </Text>
                <Ionicons name="close" size={10} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
            {filters.selectedSizes.map((s) => (
              <TouchableOpacity key={s} style={styles.activeChip} onPress={() => filters.toggleSize(s)}>
                <Text style={styles.activeChipText}>{s}</Text>
                <Ionicons name="close" size={10} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
            {filters.sort !== 'recent' && (
              <TouchableOpacity style={styles.activeChip} onPress={() => filters.setSort('recent')}>
                <Text style={styles.activeChipText}>{SORTS.find((s) => s.key === filters.sort)?.label}</Text>
                <Ionicons name="close" size={10} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.clearAllChip} onPress={filters.resetFilters}>
              <Text style={styles.clearAllText}>CLEAR ALL</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Listing grid */}
      <FlatList
        data={filters.listings}
        numColumns={NUM_COLUMNS}
        key={NUM_COLUMNS}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} colors={[Colors.accent]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>NO RESULTS</Text>
            <Text style={styles.emptyDesc}>Try adjusting your filters or search term.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={filters.resetFilters}>
              <Text style={styles.emptyBtnText}>CLEAR FILTERS</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item, index }) => (
          <ListingCard item={item} index={index} onToggleFav={filters.toggleFav} onPress={handlePress} />
        )}
      />

      {/* Filter bottom sheet */}
      <FilterSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        source={filters.source}
        setSource={filters.setSource}
        condition={filters.condition}
        setCondition={filters.setCondition}
        sort={filters.sort}
        setSort={filters.setSort}
        minPrice={filters.minPrice}
        setMinPrice={filters.setMinPrice}
        maxPrice={filters.maxPrice}
        setMaxPrice={filters.setMaxPrice}
        selectedSizes={filters.selectedSizes}
        toggleSize={filters.toggleSize}
        onReset={filters.resetFilters}
        resultCount={filters.listings.length}
      />

      {/* Item detail modal */}
      <ItemDetailModal
        visible={showDetailModal}
        item={selectedItem}
        onClose={() => setShowDetailModal(false)}
        onToggleFav={filters.toggleFav}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, height: 48,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  filterBtn: {
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
  },
  filterBtnActive: { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
  filterBadge: {
    position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: BorderRadius.full,
    backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFF',
  },
  filterBadgeText: { fontSize: 9, fontWeight: FontWeight.bold, color: '#FFF' },

  sourceRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    gap: 24, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  sourceTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  sourceTabActive: { backgroundColor: 'transparent', borderBottomColor: Colors.textPrimary },
  sourceTabLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textMuted, letterSpacing: 0.3 },
  sourceTabLabelActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },

  catList: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: 8 },
  catTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full,
  },
  catTabActive: { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
  catLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textPrimary, letterSpacing: 0.3 },
  catLabelActive: { color: '#FFF' },

  activeChipsWrapper: { maxHeight: 50, marginBottom: Spacing.md },
  activeChips: { paddingHorizontal: Spacing.lg, gap: 8, flexDirection: 'row', alignItems: 'center' },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
  },
  activeChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textPrimary, letterSpacing: 0.2 },
  clearAllChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.textPrimary, borderRadius: BorderRadius.full },
  clearAllText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: '#FFF', letterSpacing: 0.3 },

  grid: { paddingHorizontal: Spacing.lg, paddingBottom: 120, paddingTop: Spacing.md },
  gridRow: { gap: CARD_GAP, marginBottom: 24 },

  empty: { alignItems: 'center', paddingTop: 70, paddingHorizontal: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.2 },
  emptyDesc: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.accent, marginTop: Spacing.sm, borderRadius: BorderRadius.full },
  emptyBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.accent, letterSpacing: 0.5 },
});
