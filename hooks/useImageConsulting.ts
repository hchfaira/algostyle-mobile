/**
 * useImageConsulting — Async state for image consulting analysis
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export function useImageConsulting() {
  const {
    userId, profile,
    consultingResult, isLoadingConsulting, consultingError,
    setConsultingResult, setLoadingConsulting, setConsultingError,
  } = useAppStore();

  const [showModal, setShowModal] = useState(false);

  // Load cached result on mount
  useEffect(() => {
    if (!userId || consultingResult) return;
    (async () => {
      try {
        setLoadingConsulting(true);
        const result = await api.getImageConsultingResult(userId);
        setConsultingResult(result);
      } catch {
        // 404 = no result yet — fine, show empty state
      } finally {
        setLoadingConsulting(false);
      }
    })();
  }, [userId]);

  const handleAnalyze = useCallback(
    async (imageUri: string, heightCm: number | undefined, weightKg: number | undefined) => {
      if (!userId) {
        Alert.alert('Not logged in', 'Please log in to run the analysis.');
        return;
      }
      setShowModal(false);
      setLoadingConsulting(true);
      setConsultingError(null);
      try {
        const result = await api.analyzeImageConsulting(userId, imageUri, heightCm, weightKg);
        setConsultingResult(result);
      } catch (err: any) {
        const msg = err?.message ?? 'Analysis failed. Please try again.';
        setConsultingError(msg);
        Alert.alert(
          'Analysis failed',
          msg.includes('fetch') || msg.includes('Network')
            ? 'Cannot reach the server. Make sure the backend is running on ' +
              require('../constants/config').API_BASE_URL
            : msg,
        );
      } finally {
        setLoadingConsulting(false);
      }
    },
    [userId],
  );

  const openModal = () => {
    if (!userId) {
      Alert.alert('Not signed in', 'Please sign in or continue as guest to use Image Consulting.');
      return;
    }
    setShowModal(true);
  };

  return {
    userId,
    profile,
    consultingResult,
    isLoadingConsulting,
    consultingError,
    showModal,
    setShowModal,
    openModal,
    handleAnalyze,
  };
}
