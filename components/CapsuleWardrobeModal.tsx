/**
 * CapsuleWardrobeModal — 3-step contextual capsule builder
 *
 * Step 1 — CONTEXT   : choose occasion + season
 * Step 2 — LOADING   : discrete analysis screen
 * Step 3 — RESULT    : score · capsule items · missing pieces
 *
 * Design: quiet luxury — nude palette, espresso text, no visual noise
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type {
  CapsuleOccasion,
  CapsuleSeason,
  CapsuleGenerateResponse,
  GarmentItem,
} from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
const ITEM_SIZE = (SCREEN_W - Spacing.lg * 2 - Spacing.sm * 2) / 3;

const ESPRESSO = '#3B2A1A';
const NUDE_BG  = '#FCF9F6';
const NUDE_ALT = '#FDFCFB';
const NUDE_BDR = '#EDE6DF';

// ─── Context options ──────────────────────────────────────────────────────

const OCCASIONS: { key: CapsuleOccasion; label: string; icon: string }[] = [
  { key: 'work',    label: 'Work',    icon: 'briefcase-outline'  },
  { key: 'weekend', label: 'Weekend', icon: 'sunny-outline'      },
  { key: 'evening', label: 'Evening', icon: 'moon-outline'       },
  { key: 'travel',  label: 'Travel',  icon: 'airplane-outline'   },
];

const SEASONS: { key: CapsuleSeason; label: string; icon: string }[] = [
  { key: 'spring', label: 'Spring', icon: 'flower-outline' },
  { key: 'summer', label: 'Summer', icon: 'sunny-outline'  },
  { key: 'autumn', label: 'Autumn', icon: 'leaf-outline'   },
  { key: 'winter', label: 'Winter', icon: 'snow-outline'   },
];

// ─── Sub-components ───────────────────────────────────────────────────────

function ContextTile({
  icon, label, selected, onPress, delay = 0,
}: {
  icon: string; label: string; selected: boolean;
  onPress: () => void; delay?: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(300)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.tile, selected && styles.tileSelected]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={selected ? Colors.surface : ESPRESSO}
        />
        <Text style={[styles.tileLabel, selected && styles.tileLabelSelected]}>
          {label.toUpperCase()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function GarmentThumb({ item, delay = 0 }: { item: GarmentItem; delay?: number }) {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(280)} style={styles.thumbWrap}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.thumbImage} resizeMode="cover" />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Ionicons name="shirt-outline" size={22} color={NUDE_BDR} />
        </View>
      )}
      <Text style={styles.thumbLabel} numberOfLines={1}>
        {item.attributes.category}
      </Text>
    </Animated.View>
  );
}

function MissingRow({
  label, reason, delay = 0,
}: {
  label: string; reason: string; delay?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(280)} style={styles.missingRow}>
      <View style={styles.missingIcon}>
        <Ionicons name="add-outline" size={16} color={ESPRESSO} />
      </View>
      <View style={styles.missingText}>
        <Text style={styles.missingLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.missingReason} numberOfLines={2}>{reason}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

type Step = 'context' | 'loading' | 'result';

export const CapsuleWardrobeModal: React.FC<Props> = ({ isVisible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { userId } = useAppStore();

  const [step, setStep]         = useState<Step>('context');
  const [occasion, setOccasion] = useState<CapsuleOccasion | null>(null);
  const [season, setSeason]     = useState<CapsuleSeason   | null>(null);
  const [result, setResult]     = useState<CapsuleGenerateResponse | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const canGenerate = occasion !== null || season !== null;

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('context');
      setOccasion(null);
      setSeason(null);
      setResult(null);
      setError(null);
    }, 300);
  };

  const handleGenerate = useCallback(async () => {
    if (!userId) return;
    setStep('loading');
    setError(null);
    try {
      const res = await api.generateCapsule(userId, {
        occasion: occasion ?? undefined,
        season:   season   ?? undefined,
      });
      setResult(res);
      setStep('result');
    } catch {
      setError('Could not generate your capsule. Make sure the backend is running.');
      setStep('context');
    }
  }, [userId, occasion, season]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={styles.header}>
          {step === 'result' ? (
            <TouchableOpacity onPress={() => setStep('context')} style={styles.headerBtn}>
              <Ionicons name="chevron-back" size={20} color={ESPRESSO} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerBtn} />
          )}
          <Text style={styles.headerTitle}>
            {step === 'result' && result
              ? result.context_label.toUpperCase()
              : 'BUILD CAPSULE'}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
            <Ionicons name="close" size={20} color={ESPRESSO} />
          </TouchableOpacity>
        </View>

        {/* ── Step 1: Context ── */}
        {step === 'context' && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {error && (
              <Animated.View entering={FadeIn} style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <Text style={styles.sectionLabel}>OCCASION</Text>
            <View style={styles.tileGrid}>
              {OCCASIONS.map((o, i) => (
                <ContextTile
                  key={o.key}
                  icon={o.icon}
                  label={o.label}
                  selected={occasion === o.key}
                  onPress={() => setOccasion(occasion === o.key ? null : o.key)}
                  delay={i * 60}
                />
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>SEASON</Text>
            <View style={styles.tileGrid}>
              {SEASONS.map((s, i) => (
                <ContextTile
                  key={s.key}
                  icon={s.icon}
                  label={s.label}
                  selected={season === s.key}
                  onPress={() => setSeason(season === s.key ? null : s.key)}
                  delay={i * 60 + 240}
                />
              ))}
            </View>

            <Text style={styles.hint}>
              Select at least one context to generate your capsule.
            </Text>
          </ScrollView>
        )}

        {/* ── Step 2: Loading ── */}
        {step === 'loading' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ESPRESSO} />
            <Text style={styles.loadingTitle}>ANALYSING YOUR WARDROBE</Text>
            <Text style={styles.loadingSubtitle}>
              Selecting the most versatile pieces for your{' '}
              {[season, occasion].filter(Boolean).join(' ')} capsule…
            </Text>
          </View>
        )}

        {/* ── Step 3: Result ── */}
        {step === 'result' && result && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeIn.duration(400)} style={styles.insightBanner}>
              <Ionicons name="sparkles" size={14} color={ESPRESSO} />
              <Text style={styles.insightText}>{result.insight}</Text>
            </Animated.View>

            {/* Score strip */}
            <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.scoreStrip}>
              <View style={styles.scoreCell}>
                <Text style={styles.scoreNum}>{Math.round(result.score.score)}</Text>
                <Text style={styles.scoreCaption}>SCORE</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreCell}>
                <Text style={styles.scoreNum}>{result.score.grade}</Text>
                <Text style={styles.scoreCaption}>GRADE</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreCell}>
                <Text style={styles.scoreNum}>{result.combination_count}</Text>
                <Text style={styles.scoreCaption}>OUTFITS</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreCell}>
                <Text style={styles.scoreNum}>{result.items.length}</Text>
                <Text style={styles.scoreCaption}>PIECES</Text>
              </View>
            </Animated.View>

            {/* Items grid */}
            <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>YOUR CAPSULE</Text>
            <View style={styles.itemsGrid}>
              {result.items.map((item, i) => (
                <GarmentThumb key={item.id} item={item} delay={i * 50} />
              ))}
            </View>

            {/* Missing pieces */}
            {result.missing.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>
                  TO COMPLETE YOUR CAPSULE
                </Text>
                {result.missing.map((piece, i) => (
                  <MissingRow
                    key={i}
                    label={piece.subcategory || piece.category}
                    reason={piece.reason}
                    delay={i * 80}
                  />
                ))}
              </>
            )}

            {/* Tip */}
            {result.score.tip && (
              <Animated.View
                entering={FadeInDown.delay(400).duration(350)}
                style={styles.tipBox}
              >
                <Ionicons name="information-circle-outline" size={14} color={ESPRESSO} />
                <Text style={styles.tipText}>{result.score.tip}</Text>
              </Animated.View>
            )}
          </ScrollView>
        )}

        {/* Footer CTA — only on context step */}
        {step === 'context' && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={!canGenerate}
              style={[styles.ctaButton, !canGenerate && styles.ctaDisabled]}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaLabel}>GENERATE CAPSULE</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.surface} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: NUDE_BDR,
  },
  headerTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    letterSpacing: 2.5,
    color: ESPRESSO,
  },
  headerBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // Section label
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 2,
    color: ESPRESSO,
    marginBottom: Spacing.sm,
  },

  // Tiles
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: NUDE_BG,
    borderWidth: 1,
    borderColor: NUDE_BDR,
    borderRadius: BorderRadius.md,
  },
  tileSelected: {
    backgroundColor: ESPRESSO,
    borderColor: ESPRESSO,
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.5,
    color: ESPRESSO,
  },
  tileLabelSelected: {
    color: Colors.surface,
  },

  // Hint
  hint: {
    marginTop: Spacing.lg,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.error + '12',
    borderWidth: 1,
    borderColor: Colors.error + '30',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.error,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  loadingTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 3,
    color: ESPRESSO,
    marginTop: Spacing.md,
  },
  loadingSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Insight banner
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: NUDE_ALT,
    borderWidth: 1,
    borderColor: NUDE_BDR,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  insightText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: ESPRESSO,
    lineHeight: 19,
  },

  // Score strip
  scoreStrip: {
    flexDirection: 'row',
    backgroundColor: NUDE_BG,
    borderWidth: 1,
    borderColor: NUDE_BDR,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  scoreCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 2,
  },
  scoreNum: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: ESPRESSO,
    letterSpacing: 0.5,
  },
  scoreCaption: {
    fontSize: 8,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  scoreDivider: {
    width: 1,
    backgroundColor: NUDE_BDR,
  },

  // Items grid
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  thumbWrap: {
    width: ITEM_SIZE,
    alignItems: 'center',
    gap: 4,
  },
  thumbImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: BorderRadius.sm,
    backgroundColor: NUDE_BG,
  },
  thumbPlaceholder: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: BorderRadius.sm,
    backgroundColor: NUDE_BG,
    borderWidth: 1,
    borderColor: NUDE_BDR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Missing pieces
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: NUDE_BDR,
  },
  missingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NUDE_BG,
    borderWidth: 1,
    borderColor: NUDE_BDR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    flex: 1,
    gap: 2,
  },
  missingLabel: {
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
    color: ESPRESSO,
  },
  missingReason: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },

  // Tip
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: NUDE_ALT,
    borderWidth: 1,
    borderColor: NUDE_BDR,
    borderRadius: BorderRadius.md,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 17,
  },

  // Footer
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: NUDE_BDR,
    backgroundColor: Colors.surface,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: ESPRESSO,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  ctaDisabled: {
    opacity: 0.35,
  },
  ctaLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 2,
    color: Colors.surface,
  },
});
