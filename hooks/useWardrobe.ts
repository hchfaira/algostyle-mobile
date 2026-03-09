/**
 * useWardrobe — All wardrobe state, filtering, and async handlers
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, ScrollView, Dimensions } from 'react-native';

import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { Spacing } from '../constants/theme';
import type { SmartSuggestion, FlaggedItem, GarmentItem } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');

export function useWardrobe() {
  const { userId, wardrobe, setWardrobe, addGarment, removeGarment } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Smart Add
  const [showSmartAdd, setShowSmartAdd] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [smartInsight, setSmartInsight] = useState<string | null>(null);
  const [smartLoading, setSmartLoading] = useState(false);

  // Closet Audit
  const [showAudit, setShowAudit] = useState(false);
  const [auditItems, setAuditItems] = useState<FlaggedItem[]>([]);
  const [auditSummary, setAuditSummary] = useState<{
    total_flagged: number;
    never_worn: number;
    rarely_worn: number;
    hard_to_combine: number;
  } | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  // Capsule
  const [showCapsule, setShowCapsule] = useState(false);

  // Auto-scroll ref
  const smartScrollRef = useRef<ScrollView>(null);

  // Auto-scroll smart cards
  useEffect(() => {
    let scrollPosition = 0;
    const cardWidth = (SCREEN_W - Spacing.lg * 2 - Spacing.sm * 2) / 3 + Spacing.sm;
    const totalScrollWidth = cardWidth * 3;
    const interval = setInterval(() => {
      scrollPosition += 1;
      if (scrollPosition >= totalScrollWidth) scrollPosition = 0;
      smartScrollRef.current?.scrollTo({ x: scrollPosition, animated: true });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // ── Load wardrobe ──
  const loadWardrobe = useCallback(async () => {
    if (!userId) return;
    try {
      const filters: Record<string, string> = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (searchQuery) filters.search = searchQuery;
      const items = await api.getWardrobe(userId, filters);
      setWardrobe(items);
    } catch {}
  }, [userId, selectedCategory, searchQuery]);

  useEffect(() => {
    loadWardrobe();
  }, [loadWardrobe]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWardrobe();
    setRefreshing(false);
  };

  // ── Actions ──
  const handleOpenSmartAdd = async () => {
    setShowSmartAdd(true);
    if (!userId || smartSuggestions.length > 0) return;
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

  const handleOpenAudit = async () => {
    setShowAudit(true);
    if (!userId || auditItems.length > 0) return;
    setAuditLoading(true);
    try {
      const res = await api.getClosetAudit(userId);
      setAuditItems(res.flagged_items);
      setAuditSummary(res.summary);
    } catch {
      setAuditSummary(null);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAddGarment = async (category?: string) => {
    if (!userId) return;
    setShowAddMenu(false);
    try {
      const garment = await api.addGarment(userId, category);
      addGarment(garment);
    } catch {
      Alert.alert('Oops', 'Failed to add garment. Please try again.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Item', 'This item will be removed from your wardrobe.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          if (!userId) return;
          try {
            await api.deleteGarment(userId, id);
            removeGarment(id);
          } catch {
            Alert.alert('Error', 'Failed to remove garment');
          }
        },
      },
    ]);
  };

  const handleToggleFavorite = async (id: string) => {
    if (!userId) return;
    try {
      await api.toggleFavorite(userId, id);
      await loadWardrobe();
    } catch {}
  };

  const toggleAuditExpand = (id: string) => {
    setExpandedAuditId((prev) => (prev === id ? null : id));
  };

  // ── Derived data ──
  const filteredItems = wardrobe.filter((item) => {
    if (selectedCategory !== 'all' && item.attributes.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.attributes.color_primary.toLowerCase().includes(q) ||
        (item.attributes.subcategory || '').toLowerCase().includes(q) ||
        (item.attributes.material || '').toLowerCase().includes(q) ||
        item.attributes.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categoryCounts: Record<string, number> = { all: wardrobe.length };
  wardrobe.forEach((g) => {
    const cat = g.attributes.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return {
    // State
    wardrobe,
    filteredItems,
    categoryCounts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    refreshing,

    // Add menu
    showAddMenu,
    setShowAddMenu,
    handleAddGarment,

    // Smart Add
    showSmartAdd,
    setShowSmartAdd,
    smartSuggestions,
    smartInsight,
    smartLoading,
    handleOpenSmartAdd,

    // Closet Audit
    showAudit,
    setShowAudit,
    auditItems,
    auditSummary,
    auditLoading,
    expandedAuditId,
    toggleAuditExpand,
    handleOpenAudit,

    // Capsule
    showCapsule,
    setShowCapsule,

    // Grid
    onRefresh,
    handleDelete,
    handleToggleFavorite,

    // Ref
    smartScrollRef,
  };
}
