/**
 * Wardrobe Tab — Elegant, Minimal, Human-Centered Redesign
 *
 * ASOS-inspired monochrome aesthetic with improved UX, smooth Reanimated
 * micro-interactions, layout animations, and optimized typography.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  RefreshControl,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import {
  GarmentCard,
  ActionCard,
  AddGarmentModal,
  SmartAddSheet,
  ClosetAuditSheet,
  CATEGORIES,
  CARD_GAP,
} from '../../components/wardrobe';
import { CapsuleWardrobeModal } from '../../components/CapsuleWardrobeModal';
import { useWardrobe } from '../../hooks/useWardrobe';
import type { GarmentItem } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');

export default function WardrobeScreen() {
  const w = useWardrobe();

  return (
    <View style={styles.container}>
      <TopBar
        title="My Wardrobe"
        subtitle={`${w.wardrobe.length} item${w.wardrobe.length !== 1 ? 's' : ''}`}
        favoriteCount={w.wardrobe.filter((g) => g.is_favorite).length}
      />

      {/* ── Search + Add ── */}
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
          <TouchableOpacity onPress={() => w.setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => w.setShowAddMenu(true)}>
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── Category tabs ── */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
        keyExtractor={(item) => item.key}
        renderItem={({ item: cat }) => {
          const isActive = w.selectedCategory === cat.key;
          const count = w.categoryCounts[cat.key] || 0;
          return (
            <TouchableOpacity
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.75}
              onPress={() => w.setSelectedCategory(cat.key)}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{cat.label}</Text>
              {count > 0 && <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>{count}</Text>}
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Smart Highlights ── */}
      <ScrollView
        ref={w.smartScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.smartCardsGrid}
        scrollEventThrottle={16}
        decelerationRate={0}
        snapToInterval={(SCREEN_W - Spacing.lg * 2 - Spacing.sm * 2) / 3 + Spacing.sm}
        snapToAlignment="start"
      >
        <ActionCard
          icon="sparkles-outline"
          title="Smart Add"
          subtitle="AI spots missing items to unlock outfit combos."
          buttonLabel="See suggestions"
          accentColor={Colors.accent}
          variant="primary"
          onPress={w.handleOpenSmartAdd}
        />
        <ActionCard
          icon="refresh-outline"
          title="Closet Audit"
          subtitle="Surface underused pieces and tidy your closet rhythm."
          buttonLabel="Review now"
          accentColor={Colors.accentWarm}
          variant="secondary"
          onPress={w.handleOpenAudit}
        />
        <ActionCard
          icon="layers-outline"
          title="Capsule Wardrobe"
          subtitle="Pick items + Smart Add to maximise outfit combinations."
          buttonLabel="Build capsule"
          accentColor={Colors.accent}
          variant="primary"
          onPress={() => w.setShowCapsule(true)}
        />
      </ScrollView>

      {/* ── Modals ── */}
      <AddGarmentModal visible={w.showAddMenu} onClose={() => w.setShowAddMenu(false)} onAddGarment={w.handleAddGarment} />

      <SmartAddSheet
        visible={w.showSmartAdd}
        onClose={() => w.setShowSmartAdd(false)}
        loading={w.smartLoading}
        suggestions={w.smartSuggestions}
        insight={w.smartInsight}
      />

      <ClosetAuditSheet
        visible={w.showAudit}
        onClose={() => w.setShowAudit(false)}
        loading={w.auditLoading}
        items={w.auditItems}
        summary={w.auditSummary}
        expandedId={w.expandedAuditId}
        onToggleExpand={w.toggleAuditExpand}
      />

      <CapsuleWardrobeModal isVisible={w.showCapsule} onClose={() => w.setShowCapsule(false)} />

      {/* ── Garment Grid ── */}
      <FlatList
        data={w.filteredItems}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={w.refreshing} onRefresh={w.onRefresh} tintColor={Colors.accent} colors={[Colors.accent]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="grid-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>YOUR WARDROBE IS EMPTY</Text>
            <Text style={styles.emptyDesc}>Tap the + button to add your first item and let AI organise it for you.</Text>
          </View>
        }
        renderItem={({ item, index }: { item: GarmentItem; index: number }) => (
          <GarmentCard item={item} index={index} onDelete={w.handleDelete} onToggleFavorite={w.handleToggleFavorite} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  addBtn: { width: 36, height: 36, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  tabList: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.accent },
  tabLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium, letterSpacing: 0.5, textTransform: 'uppercase' },
  tabLabelActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  tabCount: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted },
  tabCountActive: { color: Colors.textPrimary },
  smartCardsGrid: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm, flexDirection: 'row' },
  grid: { paddingHorizontal: Spacing.lg, paddingBottom: 110 },
  gridRow: { gap: CARD_GAP, marginBottom: CARD_GAP },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 2 },
  emptyDesc: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
});
