/**
 * useWardrobe — All wardrobe state, filtering, and async handlers
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { BROWSABLE_CATEGORIES } from '../components/wardrobe/constants';
import type {
  SmartSuggestion,
  FlaggedItem,
  GarmentItem,
  GarmentAttributes,
  CapsuleScoreResponse,
  GarmentAnalysis,
  MissingPiecesResponse,
  CapsuleEvolutionResponse,
  SmartRemovalResponse,
  SortMode,
  GarmentSortScore,
  WardrobeSortScoresResponse,
} from '../types';

export function useWardrobe() {
  const { userId: storeUserId, wardrobe, setWardrobe, addGarment, removeGarment } = useAppStore();

  // In dev, fall back to a test user so the wardrobe tab works without login
  // Use || (not ??) so empty string '' also triggers the fallback
  const userId = storeUserId || (__DEV__ ? 'dev-test-user' : null);

  // All category keys visible by default
  const allCategoryKeys = BROWSABLE_CATEGORIES.map((c) => c.key);
  const [visibleCategories, setVisibleCategories] = useState<string[]>(allCategoryKeys);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // ─── Garment Upload Flow ──────────────────────────────────────────────────
  const [showUploadFlow, setShowUploadFlow] = useState(false);
  const [uploadImageUri, setUploadImageUri] = useState<string>('');
  const [uploadImageBase64, setUploadImageBase64] = useState<string>('');


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

  // ── Capsule Score ──────────────────────────────────────────
  const [capsuleScore, setCapsuleScore] = useState<CapsuleScoreResponse | null>(null);
  const [capsuleScoreLoading, setCapsuleScoreLoading] = useState(false);

  // ── Garment Detail + Analysis ─────────────────────────────
  const [selectedGarment, setSelectedGarment] = useState<GarmentItem | null>(null);
  const [garmentAnalysis, setGarmentAnalysis] = useState<GarmentAnalysis | null>(null);
  const [garmentAnalysisLoading, setGarmentAnalysisLoading] = useState(false);
  const [showGarmentDetail, setShowGarmentDetail] = useState(false);

  // ── Missing Pieces ─────────────────────────────────────────
  const [showMissingPieces, setShowMissingPieces] = useState(false);
  const [missingPieces, setMissingPieces] = useState<MissingPiecesResponse | null>(null);
  const [missingPiecesLoading, setMissingPiecesLoading] = useState(false);

  // ── Capsule Evolution ──────────────────────────────────────
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionData, setEvolutionData] = useState<CapsuleEvolutionResponse | null>(null);
  const [evolutionLoading, setEvolutionLoading] = useState(false);

  // ── Smart Removal ──────────────────────────────────────────
  const [showSmartRemoval, setShowSmartRemoval] = useState(false);
  const [removalData, setRemovalData] = useState<SmartRemovalResponse | null>(null);
  const [removalLoading, setRemovalLoading] = useState(false);
  const [removalProfile, setRemovalProfile] = useState<'minimalist' | 'balanced' | 'generous'>('balanced');

  // ── Sort Mode ──────────────────────────────────────────────
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [sortScores, setSortScores] = useState<Record<string, GarmentSortScore>>({});
  const [sortScoresLoading, setSortScoresLoading] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<string>('');

  // ── Load wardrobe ──
  const loadWardrobe = useCallback(async () => {
    if (!userId) return;
    try {
      const filters: Record<string, string> = {};
      if (searchQuery) filters.search = searchQuery;
      const items = await api.getWardrobe(userId, filters);
      setWardrobe(items);
    } catch {}
  }, [userId, searchQuery]);

  useEffect(() => {
    loadWardrobe();
  }, [loadWardrobe]);

  // Load capsule score on mount / wardrobe change
  useEffect(() => {
    if (!userId) return;
    setCapsuleScoreLoading(true);
    api.getCapsuleScore(userId)
      .then(setCapsuleScore)
      .catch(() => {})
      .finally(() => setCapsuleScoreLoading(false));
  }, [userId, wardrobe.length]);

  // Load sort scores on mount / wardrobe change
  useEffect(() => {
    if (!userId) return;
    setSortScoresLoading(true);
    api.getSortScores(userId)
      .then((res: WardrobeSortScoresResponse) => {
        const map: Record<string, GarmentSortScore> = {};
        res.scores.forEach((s) => { map[s.garment_id] = s; });
        setSortScores(map);
        setCurrentSeason(res.current_season);
      })
      .catch(() => {})
      .finally(() => setSortScoresLoading(false));
  }, [userId, wardrobe.length]);

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

  /**
   * Called when user picks a source from AddGarmentModal.
   * Requests camera / gallery permission, launches picker, then opens upload flow.
   */
  const handlePickSource = async (source: 'camera' | 'gallery') => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera access is needed to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85,
          allowsEditing: false,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Gallery access is needed to pick photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85,
          allowsEditing: false,
          base64: true,
        });
      }

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setUploadImageUri(asset.uri);
        setUploadImageBase64(asset.base64 ?? '');
        setShowUploadFlow(true);
      }
    } catch {
      Alert.alert('Error', 'Could not open photo picker. Please try again.');
    }
  };

  const handleGarmentAdded = useCallback((_attributes: GarmentAttributes) => {
    setShowUploadFlow(false);
    setUploadImageUri('');
    setUploadImageBase64('');
    loadWardrobe();
  }, [loadWardrobe]);

  const handleDelete = (id: string) => {
    const doDelete = async () => {
      if (!userId) return;
      try {
        await api.deleteGarment(userId, id);
        removeGarment(id);
      } catch (e) {
        // Use platform-safe error alert
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Failed to remove garment. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to remove garment');
        }
      }
    };

    // Alert.alert is broken on Expo web — use window.confirm instead
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Remove this item from your wardrobe?')) {
        doDelete();
      }
    } else {
      Alert.alert('Remove Item', 'This item will be removed from your wardrobe.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: doDelete },
      ]);
    }
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

  // ── Garment detail + analysis ──
  const handleGarmentPress = async (item: GarmentItem) => {
    setSelectedGarment(item);
    setGarmentAnalysis(null);
    setShowGarmentDetail(true);
    if (!userId) return;
    setGarmentAnalysisLoading(true);
    try {
      const analysis = await api.getGarmentAnalysis(userId, item.id);
      setGarmentAnalysis(analysis);
    } catch {}
    finally {
      setGarmentAnalysisLoading(false);
    }
  };

  // ── Missing pieces ──
  const handleOpenMissingPieces = async () => {
    setShowMissingPieces(true);
    if (!userId || missingPieces) return;
    setMissingPiecesLoading(true);
    try {
      const res = await api.getMissingPieces(userId, 6);
      setMissingPieces(res);
    } catch {}
    finally {
      setMissingPiecesLoading(false);
    }
  };

  // ── Capsule evolution ──
  const handleOpenEvolution = async () => {
    setShowEvolution(true);
    if (!userId || evolutionData) return;
    setEvolutionLoading(true);
    try {
      const res = await api.getCapsuleEvolution(userId, 90);
      setEvolutionData(res);
    } catch {}
    finally {
      setEvolutionLoading(false);
    }
  };

  // ── Smart removal ──
  const handleOpenSmartRemoval = async (profile?: 'minimalist' | 'balanced' | 'generous') => {
    const p = profile || removalProfile;
    setRemovalProfile(p);
    setShowSmartRemoval(true);
    if (!userId) return;
    setRemovalLoading(true);
    setRemovalData(null);
    try {
      const res = await api.getSmartRemoval(userId, p);
      setRemovalData(res);
    } catch {}
    finally {
      setRemovalLoading(false);
    }
  };

  const handleChangeRemovalProfile = (p: 'minimalist' | 'balanced' | 'generous') => {
    handleOpenSmartRemoval(p);
  };

  // ── Derived data ──

  // Search-filtered full list
  const searchFiltered = wardrobe.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.attributes.color_primary.toLowerCase().includes(q) ||
      (item.attributes.subcategory || '').toLowerCase().includes(q) ||
      (item.attributes.material || '').toLowerCase().includes(q) ||
      item.attributes.category.toLowerCase().includes(q)
    );
  });

  // Apply sort
  const sortedAll = [...searchFiltered].sort((a, b) => {
    if (sortMode === 'default') return 0;
    const sa = sortScores[a.id];
    const sb = sortScores[b.id];
    if (!sa || !sb) return 0;
    if (sortMode === 'versatility') return sb.versatility_score - sa.versatility_score;
    if (sortMode === 'redundancy')  return sb.redundancy_score  - sa.redundancy_score;
    if (sortMode === 'seasonal')    return sb.seasonal_score    - sa.seasonal_score;
    if (sortMode === 'impact')      return sb.impact_score      - sa.impact_score;
    return 0;
  });

  // Items grouped by category (only visible categories, in their order)
  const itemsByCategory: Record<string, typeof wardrobe> = {};
  visibleCategories.forEach((cat) => {
    itemsByCategory[cat] = sortedAll.filter((item) => item.attributes.category === cat);
  });

  const categoryCounts: Record<string, number> = { all: wardrobe.length };
  wardrobe.forEach((g) => {
    const cat = g.attributes.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Toggle a category on/off in the visible list
  const toggleCategory = (key: string) => {
    setVisibleCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return {
    // State
    userId,
    wardrobe,
    itemsByCategory,
    categoryCounts,
    visibleCategories,
    toggleCategory,
    searchQuery,
    setSearchQuery,
    refreshing,

    // Sort
    sortMode,
    setSortMode,
    sortScores,
    sortScoresLoading,
    currentSeason,

    // Add menu
    showAddMenu,
    setShowAddMenu,
    handleAddGarment,

    // Upload flow (camera / gallery → analyze → confirm)
    showUploadFlow,
    setShowUploadFlow,
    uploadImageUri,
    uploadImageBase64,
    handlePickSource,
    handleGarmentAdded,

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

    // Capsule Score
    capsuleScore,
    capsuleScoreLoading,

    // Garment Detail
    selectedGarment,
    garmentAnalysis,
    garmentAnalysisLoading,
    showGarmentDetail,
    setShowGarmentDetail,
    handleGarmentPress,

    // Missing Pieces
    showMissingPieces,
    setShowMissingPieces,
    missingPieces,
    missingPiecesLoading,
    handleOpenMissingPieces,

    // Capsule Evolution
    showEvolution,
    setShowEvolution,
    evolutionData,
    evolutionLoading,
    handleOpenEvolution,

    // Smart Removal
    showSmartRemoval,
    setShowSmartRemoval,
    removalData,
    removalLoading,
    removalProfile,
    handleOpenSmartRemoval,
    handleChangeRemovalProfile,

    // Grid
    onRefresh,
    handleDelete,
    handleToggleFavorite,
  };
}
