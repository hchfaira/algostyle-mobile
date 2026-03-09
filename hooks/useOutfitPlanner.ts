/**
 * useOutfitPlanner — Manages agenda entries, planning form, generation state,
 * and modal visibility for the Recommend tab.
 */
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { INITIAL_AGENDA, type AgendaEntry } from '../components/recommendation/constants';
import type { Occasion, ScoringProfile } from '../types';

export function useOutfitPlanner() {
  const { outfits, setOutfits, isLoadingOutfits, setLoadingOutfits } = useAppStore();

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
      const res = await api.getRecommendations({ occasion, scoring_profile: scoringProfile, top_k: topK });
      setOutfits(res.outfits);
      setShowResults(true);
      setShowAIGenerateModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate outfits');
    } finally {
      setLoadingOutfits(false);
    }
  }, [occasion, scoringProfile, topK, setLoadingOutfits, setOutfits]);

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
      const res = await api.getRecommendations({
        occasion: selectedOccasion,
        scoring_profile: selectedProfile,
        top_k: selectedTopK,
      });
      setOutfits(res.outfits);
    } catch (err: any) {
      setShowAIResultsModal(false);
      Alert.alert('Error', err.message || 'Failed to generate outfits');
    } finally {
      setLoadingOutfits(false);
    }
  }, [setLoadingOutfits, setOutfits]);

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
  };
}
