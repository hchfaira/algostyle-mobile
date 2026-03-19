/**
 * useOutfitPlanner — Manages agenda entries, planning form, generation state,
 * and modal visibility for the Recommend tab.
 */
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { INITIAL_AGENDA, type AgendaEntry, type ReminderSetting } from '../components/recommendation/constants';
import type { Occasion, ScoringProfile } from '../types';

/** Short display label from an ISO date string, e.g. "Wed 18 Mar" */
function formatShortDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return isoDate;
  }
}

export function useOutfitPlanner() {
  const { userId: storeUserId, outfits, setOutfits, isLoadingOutfits, setLoadingOutfits } = useAppStore();
  const userId = storeUserId || (__DEV__ ? 'dev-test-user' : undefined);

  // Generation params
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [scoringProfile, setScoringProfile] = useState<ScoringProfile>('default');
  const [topK, setTopK] = useState(3);

  // UI state
  const [showResults, setShowResults] = useState(false);
  const [showOutfitHistory, setShowOutfitHistory] = useState(false);
  const [showBuildOutfit, setShowBuildOutfit] = useState(false);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [showAIResultsModal, setShowAIResultsModal] = useState(false);
  const [showOutfitDetail, setShowOutfitDetail] = useState(false);
  const [selectedOutfitDetail, setSelectedOutfitDetail] = useState<AgendaEntry | null>(null);
  const [showWeekPlanner, setShowWeekPlanner] = useState(false);

  // Agenda
  const [agendaEntries, setAgendaEntries] = useState<AgendaEntry[]>(INITIAL_AGENDA);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [selectedOutfitForPlanning, setSelectedOutfitForPlanning] = useState<string | null>(null);
  const [planningDate, setPlanningDate] = useState('');
  const [planningLocation, setPlanningLocation] = useState('');
  const [planningOccasion, setPlanningOccasion] = useState('');

  // Virtual try-on cache
  const [virtualTryOns] = useState<Record<string, string>>({});

  // ─── Handlers ───────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setLoadingOutfits(true);
    try {
      const res = await api.getRecommendations(
        { occasion, scoring_profile: scoringProfile, top_k: topK },
        userId,
      );
      setOutfits(res.outfits);
      setShowResults(true);
      setShowAIGenerateModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate outfits');
    } finally {
      setLoadingOutfits(false);
    }
  }, [occasion, scoringProfile, topK, userId, setLoadingOutfits, setOutfits]);

  const handleAIGenerate = useCallback(async (
    selectedOccasion: Occasion,
    selectedProfile: ScoringProfile,
    selectedTopK: number,
  ) => {
    setOccasion(selectedOccasion);
    setScoringProfile(selectedProfile);
    setTopK(selectedTopK);
    setShowAIGenerateModal(false);
    setShowAIResultsModal(true);
    setLoadingOutfits(true);
    try {
      const res = await api.getRecommendations(
        {
          occasion: selectedOccasion,
          scoring_profile: selectedProfile,
          top_k: selectedTopK,
        },
        userId,
      );
      setOutfits(res.outfits);
    } catch (err: any) {
      setShowAIResultsModal(false);
      Alert.alert('Error', err.message || 'Failed to generate outfits');
    } finally {
      setLoadingOutfits(false);
    }
  }, [userId, setLoadingOutfits, setOutfits]);

  const handleScheduleOutfit = useCallback(() => {
    if (!planningDate.trim() || !planningLocation.trim()) {
      Alert.alert('Missing Info', 'Please enter a date and location');
      return;
    }
    const outfit = outfits.find(o => o.id === selectedOutfitForPlanning);
    const newEntry: AgendaEntry = {
      id: `custom_${Date.now()}`,
      outfitName: outfit?.name || 'My Outfit',
      date: planningDate,
      fullDate: planningDate,
      location: planningLocation,
      occasion: planningOccasion || 'Personal',
      coordinate: { latitude: 48.8566, longitude: 2.3522 },
      color: outfit?.garments?.[0]?.attributes?.color_hex || '#2D2D2D',
    };
    setAgendaEntries(prev => [...prev, newEntry]);
    setPlanningDate('');
    setPlanningLocation('');
    setPlanningOccasion('');
    setSelectedOutfitForPlanning(null);
    Alert.alert('Scheduled!', `Outfit scheduled for ${planningDate} in ${planningLocation}`);
  }, [planningDate, planningLocation, planningOccasion, outfits, selectedOutfitForPlanning]);

  const removeAgendaEntry = useCallback((id: string) => {
    setAgendaEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  /** Add a new entry (used by WeekPlannerModal when user picks a day) */
  const addAgendaEntry = useCallback((entry: Omit<AgendaEntry, 'id'>) => {
    const newEntry: AgendaEntry = { ...entry, id: `planned_${Date.now()}` };
    setAgendaEntries(prev => [...prev, newEntry]);
  }, []);

  /** Update the planned date + reminder of an existing entry */
  const updateAgendaEntryDate = useCallback((
    id: string,
    isoDate: string | null,
    reminder: ReminderSetting,
    displayLabel: string,
  ) => {
    setAgendaEntries(prev => prev.map(e => {
      if (e.id !== id) return e;
      return {
        ...e,
        plannedDate: isoDate ?? undefined,
        reminder,
        fullDate: displayLabel,
        date: isoDate ? formatShortDate(isoDate) : e.date,
      };
    }));
  }, []);

  const openOutfitDetail = useCallback((entry: AgendaEntry) => {
    setSelectedOutfitDetail(entry);
    setShowOutfitDetail(true);
  }, []);

  const closeOutfitDetail = useCallback(() => {
    setShowOutfitDetail(false);
    setSelectedOutfitDetail(null);
  }, []);

  return {
    // Generation
    occasion, setOccasion,
    scoringProfile, setScoringProfile,
    topK, setTopK,
    handleGenerate,
    handleAIGenerate,
    isLoadingOutfits,

    // Results
    outfits,
    showResults, setShowResults,

    // Modals
    showOutfitHistory, setShowOutfitHistory,
    showBuildOutfit, setShowBuildOutfit,
    showAIGenerateModal, setShowAIGenerateModal,
    showAIResultsModal, setShowAIResultsModal,
    showOutfitDetail, selectedOutfitDetail,
    openOutfitDetail, closeOutfitDetail,
    showWeekPlanner, setShowWeekPlanner,
    virtualTryOns,

    // Agenda
    agendaEntries, setAgendaEntries,
    selectedAgendaId, setSelectedAgendaId,
    selectedOutfitForPlanning, setSelectedOutfitForPlanning,
    planningDate, setPlanningDate,
    planningLocation, setPlanningLocation,
    planningOccasion, setPlanningOccasion,
    handleScheduleOutfit,
    removeAgendaEntry,
    addAgendaEntry,
    updateAgendaEntryDate,
  };
}
