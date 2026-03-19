/**
 * ScoreOutfitModal — Upload a worn-outfit photo and get AI scores + tips.
 * Style: luxurious, minimalist, editorial with subtle AI-tech accents.
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { OutfitDatePickerModal } from './OutfitDatePickerModal';
import type { ReminderSetting } from './recommendation/constants';

const MODAL_W = Dimensions.get('window').width - Spacing.lg * 2;  // body padding each side

interface ScoreResult {
  overall: number;
  color_harmony: number;
  formality_match: number;
  proportion: number;
  creativity: number;
  summary: string;
  improvements: string[];
  style_score_label: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onPlanOutfit?: (outfitName: string, plannedDate: string | null, reminder: ReminderSetting, displayLabel: string) => void;
}

const SCORE_METRICS: { key: keyof Omit<ScoreResult, 'summary' | 'improvements' | 'style_score_label'>; label: string }[] = [
  { key: 'overall',         label: 'Overall' },
  { key: 'color_harmony',   label: 'Color Harmony' },
  { key: 'formality_match', label: 'Formality' },
  { key: 'proportion',      label: 'Proportion' },
  { key: 'creativity',      label: 'Creativity' },
];

const LABEL_COLORS: Record<string, string> = {
  Iconic:       '#C8A96E',
  Editorial:    '#2D2D2D',
  Polished:     '#018849',
  Casual:       '#0770CF',
  'Needs Work': '#D01345',
};

function ScoreBar({ value, color = '#2D2D2D' }: { value: number; color?: string }) {
  return (
    <View style={styles.barTrack}>
      <Animated.View entering={FadeIn.delay(200)} style={[styles.barFill, { width: `${Math.round(value * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export const ScoreOutfitModal: React.FC<Props> = ({ isVisible, onClose, onPlanOutfit }) => {
  const { userId } = useAppStore();
  const uid = userId || (__DEV__ ? 'dev-test-user' : null);

  const [imageUri, setImageUri]     = useState<string | null>(null);
  const [imageB64, setImageB64]     = useState<string | null>(null);
  const [imgSize, setImgSize]       = useState<{ w: number; h: number } | null>(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<ScoreResult | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo library permission required.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]) {
      const asset = res.assets[0];
      setImageUri(asset.uri);
      setImageB64(asset.base64 ?? null);
      if (asset.width && asset.height) {
        setImgSize({ w: asset.width, h: asset.height });
      } else {
        setImgSize(null);
      }
      setResult(null);
      setError(null);
    }
  };

  const handleScore = async () => {
    if (!uid || !imageB64) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.scoreOutfitPhoto(uid, imageB64);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Scoring failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageUri(null);
    setImageB64(null);
    setImgSize(null);
    setResult(null);
    setError(null);
  };

  if (!isVisible) return null;

  const labelColor = result ? (LABEL_COLORS[result.style_score_label] ?? '#2D2D2D') : '#2D2D2D';

  return (
    <Modal transparent visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp.springify().damping(18)} style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.tagline}>AI STYLIST</Text>
              <Text style={styles.title}>Score My Outfit</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Photo picker */}
            {(() => {
              // Compute displayed height from real image aspect ratio so nothing is cropped
              const displayH = imgSize
                ? Math.min(Math.round(MODAL_W * (imgSize.h / imgSize.w)), 520)
                : 240;
              return (
                <TouchableOpacity
                  style={[styles.photoZone, { height: displayH }, imageUri && styles.photoZoneFilled]}
                  onPress={pickImage}
                  activeOpacity={0.85}
                >
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera-outline" size={36} color={Colors.textMuted} />
                      <Text style={styles.photoHint}>Tap to upload your look</Text>
                      <Text style={styles.photoSub}>Full-body or waist-up works best</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })()}

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Analyse button */}
            {imageUri && !result && (
              <TouchableOpacity
                style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
                onPress={handleScore}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#FFF" />
                    <Text style={styles.ctaBtnText}>ANALYSE THIS LOOK</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Results */}
            {result && (
              <Animated.View entering={FadeInUp.delay(100)}>
                {/* Style label badge */}
                <View style={[styles.labelBadge, { borderColor: labelColor }]}>
                  <Text style={[styles.labelText, { color: labelColor }]}>{result.style_score_label.toUpperCase()}</Text>
                </View>

                {/* Summary */}
                <Text style={styles.summary}>"{result.summary}"</Text>

                {/* Score bars */}
                <View style={styles.scoresBlock}>
                  {SCORE_METRICS.map(({ key, label }) => (
                    <View key={key} style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>{label}</Text>
                      <ScoreBar value={result[key] as number} color={key === 'overall' ? '#2D2D2D' : '#888'} />
                      <Text style={styles.scoreValue}>{Math.round((result[key] as number) * 100)}</Text>
                    </View>
                  ))}
                </View>

                {/* Improvements */}
                <Text style={styles.improvementsTitle}>SUGGESTED IMPROVEMENTS</Text>
                {result.improvements.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}

                {/* Try again */}
                <TouchableOpacity style={styles.retryBtn} onPress={reset} activeOpacity={0.7}>
                  <Ionicons name="refresh-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.retryText}>Score another look</Text>
                </TouchableOpacity>

                {/* Plan this outfit */}
                <TouchableOpacity
                  style={styles.planBtn}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={15} color="#FFF" />
                  <Text style={styles.planBtnText}>PLANIFIER / PLAN THIS LOOK</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      <OutfitDatePickerModal
        isVisible={showDatePicker}
        outfitName={result?.style_score_label ? `${result.style_score_label} Look` : 'My Scored Look'}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(isoDate, reminder, displayLabel) => {
          setShowDatePicker(false);
          onPlanOutfit?.(
            result?.style_score_label ? `${result.style_score_label} Look` : 'My Scored Look',
            isoDate,
            reminder,
            displayLabel,
          );
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tagline: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  photoZone: {
    // height is set dynamically in JSX based on real image aspect ratio
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoZoneFilled: {
    borderColor: Colors.textPrimary,
    backgroundColor: '#000',   // letterbox background for contain mode
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  photoHint: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  photoSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.textPrimary,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
  },
  labelBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginBottom: Spacing.md,
  },
  labelText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
  summary: {
    fontSize: FontSize.md,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  scoresBlock: {
    gap: 10,
    marginBottom: Spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 100,
    letterSpacing: 0.3,
  },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  scoreValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    width: 28,
    textAlign: 'right',
  },
  improvementsTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.textPrimary,
    marginTop: 6,
    flexShrink: 0,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    alignSelf: 'center',
  },
  retryText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  planBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accentWarm,
  },
  planBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: '#FFF',
    letterSpacing: 1,
  },
});
