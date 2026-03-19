/**
 * PromptOutfitModal — Type a natural language prompt, get a full outfit suggestion.
 * Style: luxurious, minimal, editorial with playful AI accents.
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { OutfitDatePickerModal } from './OutfitDatePickerModal';
import type { ReminderSetting } from './recommendation/constants';

interface OutfitPiece {
  label: string;
  category: string;
  color: string;
}

interface PromptResult {
  name: string;
  description: string;
  mood: string;
  pieces: OutfitPiece[];
  score: number;
  styling_tip: string;
  prompt: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onPlanOutfit?: (outfitName: string, plannedDate: string | null, reminder: ReminderSetting, displayLabel: string) => void;
}

const EXAMPLE_PROMPTS = [
  'A rooftop dinner in Paris, warm evening, black-tie adjacent',
  'Monday morning investor meeting, confident but not stuffy',
  'Weekend gallery opening, artsy and sharp',
  'Casual coffee date, effortless French girl energy',
];

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  top:        'shirt-outline',
  bottom:     'grid-outline',
  dress:      'sparkles-outline',
  outerwear:  'layers-outline',
  shoes:      'footsteps-outline',
  accessory:  'diamond-outline',
};

export const PromptOutfitModal: React.FC<Props> = ({ isVisible, onClose, onPlanOutfit }) => {
  const { userId } = useAppStore();
  const uid = userId || (__DEV__ ? 'dev-test-user' : null);

  const [prompt, setPrompt]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<PromptResult | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef              = useRef<TextInput>(null);

  const handleGenerate = async () => {
    if (!uid || !prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.outfitFromPrompt(uid, prompt.trim());
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPrompt('');
    setResult(null);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <Animated.View entering={FadeInUp.springify().damping(18)} style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.tagline}>AI STYLIST</Text>
                <Text style={styles.title}>Outfit from Prompt</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.body}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {!result ? (
                <>
                  {/* Input */}
                  <Text style={styles.inputLabel}>Describe the vibe, occasion, or aesthetic</Text>
                  <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    value={prompt}
                    onChangeText={setPrompt}
                    placeholder="e.g. Weekend gallery opening, artsy and sharp..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    numberOfLines={3}
                    maxLength={300}
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                  <Text style={styles.charCount}>{prompt.length}/300</Text>

                  {/* Example prompts */}
                  <Text style={styles.examplesLabel}>TRY ONE OF THESE</Text>
                  <View style={styles.examplesRow}>
                    {EXAMPLE_PROMPTS.map((ex, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.exampleChip}
                        onPress={() => { setPrompt(ex); setError(null); }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.exampleChipText}>{ex}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <TouchableOpacity
                    style={[styles.ctaBtn, (!prompt.trim() || loading) && styles.ctaBtnDisabled]}
                    onPress={handleGenerate}
                    disabled={!prompt.trim() || loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={16} color="#FFF" />
                        <Text style={styles.ctaBtnText}>BUILD THIS OUTFIT</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                /* Results */
                <Animated.View entering={FadeInUp.delay(80)}>
                  {/* Prompt echo */}
                  <View style={styles.promptEcho}>
                    <Ionicons name="chatbubble-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.promptEchoText} numberOfLines={2}>"{result.prompt}"</Text>
                  </View>

                  {/* Outfit name */}
                  <Text style={styles.outfitName}>{result.name}</Text>
                  <Text style={styles.outfitDesc}>{result.description}</Text>

                  {/* Mood chip */}
                  <View style={styles.moodChip}>
                    <Ionicons name="flame-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.moodText}>{result.mood}</Text>
                  </View>

                  {/* Match score */}
                  <View style={styles.scoreBlock}>
                    <Text style={styles.scoreLabel}>PROMPT MATCH</Text>
                    <View style={styles.scoreBarTrack}>
                      <Animated.View
                        entering={FadeIn.delay(200)}
                        style={[styles.scoreBarFill, { width: `${Math.round(result.score * 100)}%` }]}
                      />
                    </View>
                    <Text style={styles.scoreNumber}>{Math.round(result.score * 100)}%</Text>
                  </View>

                  {/* Pieces */}
                  <Text style={styles.piecesTitle}>THE LOOK</Text>
                  {result.pieces.map((piece, i) => (
                    <Animated.View key={i} entering={FadeInUp.delay(100 + i * 60)} style={styles.pieceRow}>
                      <View style={[styles.colorDot, { backgroundColor: piece.color }]} />
                      <Ionicons
                        name={CATEGORY_ICONS[piece.category] ?? 'shirt-outline'}
                        size={15}
                        color={Colors.textSecondary}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.pieceLabel}>{piece.label}</Text>
                    </Animated.View>
                  ))}

                  {/* Styling tip */}
                  <View style={styles.tipBox}>
                    <Ionicons name="bulb-outline" size={14} color={Colors.textPrimary} />
                    <Text style={styles.tipText}>{result.styling_tip}</Text>
                  </View>

                  {/* Try again */}
                  <TouchableOpacity style={styles.retryBtn} onPress={reset} activeOpacity={0.7}>
                    <Ionicons name="refresh-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.retryText}>Try a different prompt</Text>
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
      </KeyboardAvoidingView>

      <OutfitDatePickerModal
        isVisible={showDatePicker}
        outfitName={result?.name}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(isoDate, reminder, displayLabel) => {
          setShowDatePicker(false);
          onPlanOutfit?.(result?.name ?? 'My Prompt Outfit', isoDate, reminder, displayLabel);
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
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 88,
    backgroundColor: Colors.surfaceLight,
    lineHeight: 22,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  examplesLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  examplesRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  exampleChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  exampleChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
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
  },
  ctaBtnDisabled: { opacity: 0.45 },
  ctaBtnText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
  },
  // ── Results ─────────────────────────────────────────
  promptEcho: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: Spacing.md,
  },
  promptEchoText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 16,
  },
  outfitName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  outfitDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginBottom: Spacing.lg,
  },
  moodText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  scoreLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    fontWeight: FontWeight.bold,
    width: 96,
  },
  scoreBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: Colors.textPrimary,
    borderRadius: 2,
  },
  scoreNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    width: 36,
    textAlign: 'right',
  },
  piecesTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  pieceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pieceLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: Spacing.sm,
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
