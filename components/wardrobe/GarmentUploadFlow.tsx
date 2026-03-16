/**
 * GarmentUploadFlow — multi-step modal for adding a garment via photo.
 *
 * Steps:
 *   1. Mode picker  — "Full outfit" vs "Single garment"
 *   2. Analyzing    — loading while calling /wardrobe/analyze-image
 *   3. Preview      — show extracted attributes + warning badges
 *   4. (done)       — garment saved, modal closes
 *
 * The image URI is received from the parent (after expo-image-picker).
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../../services/api';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import type { GarmentExtractionResult, ExtractionWarning, GarmentAttributes } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'mode' | 'analyzing' | 'preview' | 'saving';

interface Props {
  visible: boolean;
  imageUri: string;
  imageBase64: string;   // base64-encoded JPEG — used for the actual upload (works on web + native)
  userId: string;
  onClose: () => void;
  onGarmentAdded: (attributes: GarmentAttributes) => void;
}

// ─── Warning badge colours ─────────────────────────────────────────────────

const SEVERITY_COLOR: Record<ExtractionWarning['severity'], string> = {
  info: Colors.info,
  warning: Colors.warning,
  error: Colors.error,
};

const SEVERITY_ICON: Record<ExtractionWarning['severity'], keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle-outline',
  warning: 'warning-outline',
  error: 'alert-circle-outline',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function GarmentUploadFlow({ visible, imageUri, imageBase64, userId, onClose, onGarmentAdded }: Props) {
  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<'outfit' | 'auto'>('auto');
  const [result, setResult] = useState<GarmentExtractionResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  // Set of warning codes the user has explicitly chosen to ignore
  const [ignoredWarnings, setIgnoredWarnings] = useState<Set<string>>(new Set());

  const toggleIgnoreWarning = useCallback((code: string) => {
    setIgnoredWarnings((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  // ── Analyze ──────────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async (selectedMode: 'outfit' | 'auto') => {
    setStep('analyzing');
    setAnalyzeError(null);
    try {
      const res = await api.analyzeGarmentImage(userId, imageUri, imageBase64, selectedMode);
      setResult(res);
      setStep('preview');
    } catch (err: any) {
      setAnalyzeError(err?.message ?? 'Analysis failed. Please try again.');
      setStep('mode');
    }
  }, [userId, imageUri, imageBase64]);

  // ── Save confirmed garment ────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!result) return;
    setStep('saving');
    try {
      const garment = await api.addGarmentWithImage(userId, imageUri, imageBase64, result.attributes);
      onGarmentAdded(garment.attributes);
      handleClose();
    } catch {
      setStep('preview');
    }
  }, [result, userId, imageUri, imageBase64, onGarmentAdded]);

  const handleClose = useCallback(() => {
    setStep('mode');
    setResult(null);
    setAnalyzeError(null);
    setIgnoredWarnings(new Set());
    onClose();
  }, [onClose]);

  // A warning blocks saving only if severity='error' AND the user has NOT ignored it
  const blockingErrors = result?.warnings.filter(
    (w) => w.severity === 'error' && !ignoredWarnings.has(w.code),
  ) ?? [];
  const hasBlockingError = blockingErrors.length > 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* ── STEP: Mode ── */}
          {(step === 'mode') && (
            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              {/* Photo preview thumbnail */}
              {!!imageUri && (
                <Image source={{ uri: imageUri }} style={styles.thumbImage} resizeMode="contain" />
              )}

              <Text style={styles.sectionTitle}>WHAT'S IN THIS PHOTO?</Text>
              <Text style={styles.sectionSub}>Tell us how to analyse your image</Text>

              {analyzeError && (
                <View style={[styles.warningCard, { borderColor: Colors.error }]}>
                  <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                  <Text style={[styles.warningMsg, { color: Colors.error }]}>{analyzeError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.modeCard, mode === 'auto' && styles.modeCardActive]}
                onPress={() => setMode('auto')}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="shirt-outline"
                  size={24}
                  color={mode === 'auto' ? Colors.textOnAccent : Colors.textPrimary}
                />
                <View style={styles.modeText}>
                  <Text style={[styles.modeTitle, mode === 'auto' && styles.modeTitleActive]}>
                    Single Garment
                  </Text>
                  <Text style={[styles.modeSub, mode === 'auto' && styles.modeSubActive]}>
                    AI finds the main piece automatically
                  </Text>
                </View>
                {mode === 'auto' && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.textOnAccent} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeCard, mode === 'outfit' && styles.modeCardActive]}
                onPress={() => setMode('outfit')}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={mode === 'outfit' ? Colors.textOnAccent : Colors.textPrimary}
                />
                <View style={styles.modeText}>
                  <Text style={[styles.modeTitle, mode === 'outfit' && styles.modeTitleActive]}>
                    Full Outfit
                  </Text>
                  <Text style={[styles.modeSub, mode === 'outfit' && styles.modeSubActive]}>
                    Extract all garments from this look
                  </Text>
                </View>
                {mode === 'outfit' && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.textOnAccent} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={() => runAnalysis(mode)}
              >
                <Ionicons name="sparkles-outline" size={18} color={Colors.textOnAccent} />
                <Text style={styles.primaryBtnText}>ANALYSE IMAGE</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── STEP: Analyzing ── */}
          {step === 'analyzing' && (
            <View style={[styles.body, styles.centered]}>
              <ActivityIndicator size="large" color={Colors.textPrimary} />
              <Text style={styles.analyzingText}>Analysing your garment…</Text>
              <Text style={styles.analyzingSub}>Detecting fabric, colour & style</Text>
            </View>
          )}

          {/* ── STEP: Saving ── */}
          {step === 'saving' && (
            <View style={[styles.body, styles.centered]}>
              <ActivityIndicator size="large" color={Colors.textPrimary} />
              <Text style={styles.analyzingText}>Saving to wardrobe…</Text>
            </View>
          )}

          {/* ── STEP: Preview ── */}
          {step === 'preview' && result && (
            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>EXTRACTION RESULT</Text>
              <Text style={styles.sectionSub}>
                {Math.round(result.confidence * 100)}% confidence
                {result.garments_detected > 1 ? ` · ${result.garments_detected} garments` : ''}
              </Text>

              {/* Full-width photo — no cropping */}
              {!!imageUri && (
                <Image source={{ uri: imageUri }} style={styles.previewThumb} resizeMode="contain" />
              )}

              {/* Attribute summary row */}
              <View style={styles.attributeBox}>
                {result.cropped_image_b64 ? (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${result.cropped_image_b64}` }}
                    style={styles.croppedThumb}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: result.attributes.color_hex ?? '#CCC' },
                    ]}
                  />
                )}
                <View style={styles.attrTextGroup}>
                  <Text style={styles.attrCategory}>
                    {result.attributes.category.toUpperCase()}
                  </Text>
                  {result.attributes.subcategory && (
                    <Text style={styles.attrSub}>{result.attributes.subcategory}</Text>
                  )}
                </View>
              </View>

              {/* Attribute chips */}
              <View style={styles.chipsRow}>
                {[
                  result.attributes.color_primary,
                  result.attributes.pattern,
                  result.attributes.formality,
                  result.attributes.material,
                ]
                  .filter(Boolean)
                  .map((v) => (
                    <View key={v} style={styles.chip}>
                      <Text style={styles.chipText}>{v}</Text>
                    </View>
                  ))}
              </View>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <View style={styles.warningsSection}>
                  <Text style={styles.warningSectionTitle}>QUALITY NOTICES</Text>
                  {result.warnings.map((w, i) => {
                    const isIgnored = ignoredWarnings.has(w.code);
                    const canIgnore = w.severity !== 'info'; // info notices can't be "ignored" — they're not blockers
                    return (
                      <View
                        key={i}
                        style={[
                          styles.warningCard,
                          { borderColor: isIgnored ? Colors.border : SEVERITY_COLOR[w.severity] },
                          isIgnored && styles.warningCardIgnored,
                        ]}
                      >
                        <Ionicons
                          name={SEVERITY_ICON[w.severity]}
                          size={16}
                          color={isIgnored ? Colors.textMuted : SEVERITY_COLOR[w.severity]}
                        />
                        <View style={styles.warningBody}>
                          <Text
                            style={[
                              styles.warningMsg,
                              { color: isIgnored ? Colors.textMuted : Colors.textSecondary },
                            ]}
                          >
                            {w.message}
                          </Text>
                          {canIgnore && (
                            <TouchableOpacity
                              style={[
                                styles.ignoreBtn,
                                isIgnored && styles.ignoreBtnActive,
                              ]}
                              onPress={() => toggleIgnoreWarning(w.code)}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name={isIgnored ? 'eye-outline' : 'eye-off-outline'}
                                size={12}
                                color={isIgnored ? Colors.textPrimary : Colors.textMuted}
                              />
                              <Text
                                style={[
                                  styles.ignoreBtnText,
                                  isIgnored && styles.ignoreBtnTextActive,
                                ]}
                              >
                                {isIgnored ? 'UNDO IGNORE' : 'IGNORE & CONTINUE'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* CTA buttons */}
              <View style={styles.ctaRow}>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  activeOpacity={0.75}
                  onPress={() => setStep('mode')}
                >
                  <Ionicons name="refresh-outline" size={16} color={Colors.textPrimary} />
                  <Text style={styles.rejectBtnText}>RETRY</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, hasBlockingError && styles.confirmBtnDisabled]}
                  activeOpacity={0.85}
                  onPress={handleConfirm}
                  disabled={hasBlockingError}
                >
                  <Ionicons name="checkmark-outline" size={16} color={Colors.textOnAccent} />
                  <Text style={styles.confirmBtnText}>
                    {hasBlockingError ? 'CANNOT SAVE' : 'ADD TO WARDROBE'}
                  </Text>
                </TouchableOpacity>
              </View>

              {hasBlockingError && (
                <Text style={styles.blockingHint}>
                  Fix the errors above before saving this garment.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    maxHeight: '92%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  closeBtn: {
    position: 'absolute',
    right: Spacing.lg,
    top: Spacing.md,
    padding: 4,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },

  // ── Thumbnail ──
  thumbImage: {
    width: '100%',
    aspectRatio: 3 / 4,       // portrait-friendly; image is letterboxed inside
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
  },

  // ── Section labels ──
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 2,
    marginTop: Spacing.sm,
  },
  sectionSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },

  // ── Mode cards ──
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modeCardActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  modeText: { flex: 1, gap: 2 },
  modeTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  modeTitleActive: { color: Colors.textOnAccent },
  modeSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  modeSubActive: { color: 'rgba(255,255,255,0.7)' },

  // ── Buttons ──
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.textPrimary,
    paddingVertical: 14,
    marginTop: Spacing.sm,
  },
  primaryBtnText: {
    color: Colors.textOnAccent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
  },

  // ── Analyzing / Saving ──
  analyzingText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  analyzingSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // ── Preview ──
  previewThumb: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
  },
  attributeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
  },
  attrTextGroup: {
    flex: 1,
    gap: 2,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  croppedThumb: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
  },
  attrCategory: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  attrSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // ── Chips ──
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },

  // ── Warnings ──
  warningsSection: { gap: Spacing.sm },
  warningSectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
  },
  warningCardIgnored: {
    opacity: 0.5,
  },
  warningBody: {
    flex: 1,
    gap: 6,
  },
  warningMsg: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  ignoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
  },
  ignoreBtnActive: {
    borderColor: Colors.textPrimary,
    backgroundColor: Colors.surfaceLight,
  },
  ignoreBtnText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  ignoreBtnTextActive: {
    color: Colors.textPrimary,
  },

  // ── CTA row ──
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  rejectBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    backgroundColor: Colors.textPrimary,
  },
  confirmBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  confirmBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    color: Colors.textOnAccent,
    letterSpacing: 1.5,
  },
  blockingHint: {
    fontSize: FontSize.xs,
    color: Colors.error,
    textAlign: 'center',
    marginTop: -Spacing.sm,
  },
});
