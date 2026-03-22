/**
 * GarmentFilterBar — Unified filter + sort toolbar.
 *
 * Toolbar row (always visible):
 *   [Sort chips ─────────────────────]  [n results]  [⚙ Filters N]
 *
 * Tapping "Filters" opens a bottom-sheet with:
 *   • Color swatches  (primary)
 *   • Style / formality chips  (secondary)
 *   • [Reset]  [Apply] footer
 *
 * Staged-apply model: selections are only committed when user taps Apply.
 * Active-filter count badge on the button.
 * All strings use i18n keys.
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { formatFormality } from './constants';
import { t } from '../../i18n';
import type { GarmentItem } from '../../types';
import type { SortMode } from '../../types';

// ── Sort option config ────────────────────────────────────────────────────────
type SortLabelKey = 'filterSortDefault' | 'filterSortVersatility' | 'filterSortRedundancy' | 'filterSortSeasonal' | 'filterSortImpact';

interface SortOption {
  key: SortMode;
  labelKey: SortLabelKey;
  icon: string;
  accentColor: string;
  /** Short description of the attribute used for sorting */
  hint: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'default',     labelKey: 'filterSortDefault',     icon: 'grid-outline',    accentColor: Colors.accent,   hint: 'Original order'                        },
  { key: 'versatility', labelKey: 'filterSortVersatility', icon: 'shuffle-outline', accentColor: '#018849',       hint: 'Most outfit combinations'              },
  { key: 'redundancy',  labelKey: 'filterSortRedundancy',  icon: 'copy-outline',    accentColor: '#FF5722',       hint: 'Most duplicate-like pieces first'      },
  { key: 'seasonal',    labelKey: 'filterSortSeasonal',    icon: 'sunny-outline',   accentColor: '#E6A817',       hint: 'Best match for current season'         },
  { key: 'impact',      labelKey: 'filterSortImpact',      icon: 'flash-outline',   accentColor: '#7B2FBE',       hint: 'Highest wear impact score'             },
];

// ── Props ─────────────────────────────────────────────────────────────────────
export interface GarmentFilterBarProps {
  /** All items in the current view (used to derive color / formality options). */
  items: GarmentItem[];
  /** Total visible result count — shown next to the filter button. */
  totalCount: number;
  colorFilter: string | null;
  formalityFilter: string | null;
  onColorChange: (hex: string | null) => void;
  onFormalityChange: (formality: string | null) => void;
  sortMode: SortMode;
  onChangeSortMode: (mode: SortMode) => void;
  sortScoresLoading?: boolean;
  /** When true, hides the sort chip row — useful in contexts where sort is irrelevant. */
  hideSortBar?: boolean;
  /** Called with the `openSheet` function so a parent can trigger the filter sheet externally. */
  onRegisterOpen?: (open: () => void) => void;
}

const SHEET_H = 400;

export default function GarmentFilterBar({
  items,
  totalCount,
  colorFilter,
  formalityFilter,
  onColorChange,
  onFormalityChange,
  sortMode,
  onChangeSortMode,
  hideSortBar = false,
  onRegisterOpen,
}: GarmentFilterBarProps) {
  const [open, setOpen] = useState(false);

  // Staged values — not committed until Apply is tapped
  const [stagedColor,     setStagedColor]     = useState<string | null>(null);
  const [stagedFormality, setStagedFormality] = useState<string | null>(null);

  // Sheet slide animation
  const slideY  = useSharedValue(SHEET_H);
  const opacity = useSharedValue(0);

  const openSheet = useCallback(() => {
    setStagedColor(colorFilter);
    setStagedFormality(formalityFilter);
    setOpen(true);
    opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    slideY.value  = withSpring(0, { damping: 24, stiffness: 220 });
  }, [colorFilter, formalityFilter]);

  // Register open function with parent on mount / when openSheet changes
  React.useEffect(() => {
    onRegisterOpen?.(openSheet);
  }, [onRegisterOpen, openSheet]);

  const closeSheet = useCallback(() => {
    opacity.value = withTiming(0, { duration: 160, easing: Easing.in(Easing.cubic) });
    slideY.value  = withTiming(SHEET_H, { duration: 200, easing: Easing.in(Easing.cubic) });
    setTimeout(() => setOpen(false), 210);
  }, []);

  const handleApply = useCallback(() => {
    onColorChange(stagedColor);
    onFormalityChange(stagedFormality);
    closeSheet();
  }, [stagedColor, stagedFormality, onColorChange, onFormalityChange, closeSheet]);

  const handleReset = useCallback(() => {
    setStagedColor(null);
    setStagedFormality(null);
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: slideY.value }] }));

  // Derived options
  const uniqueColors = useMemo(() => {
    const seen = new Map<string, { hex: string; name: string }>();
    items.forEach((g) => {
      const hex = g.attributes.color_hex;
      if (hex && !seen.has(hex)) seen.set(hex, { hex, name: g.attributes.color_primary });
    });
    return Array.from(seen.values()).slice(0, 18);
  }, [items]);

  const uniqueFormalities = useMemo(() => {
    const seen = new Set<string>();
    items.forEach((g) => { if (g.attributes.formality) seen.add(g.attributes.formality); });
    return Array.from(seen);
  }, [items]);

  // Active committed filter count (badge on button)
  const activeCount = (colorFilter ? 1 : 0) + (formalityFilter ? 1 : 0);

  // Inside sheet: staged changes vs. committed
  const stagedChanged = stagedColor !== colorFilter || stagedFormality !== formalityFilter;
  const stagedActiveCount = (stagedColor ? 1 : 0) + (stagedFormality ? 1 : 0);

  if (uniqueColors.length === 0 && uniqueFormalities.length === 0) return null;

  return (
    <>
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <View style={[styles.toolbar, hideSortBar && styles.toolbarCompact]}>
        {/* Sort chips — hidden when hideSortBar=true */}
        {!hideSortBar && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortRow}
          >
            {SORT_OPTIONS.map((opt) => {
              const isActive = sortMode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.sortChip, isActive && { backgroundColor: opt.accentColor, borderColor: opt.accentColor }]}
                  onPress={() => onChangeSortMode(opt.key)}
                  activeOpacity={0.75}
                  accessibilityLabel={`${t(opt.labelKey)}: ${opt.hint}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Ionicons name={opt.icon as any} size={11} color={isActive ? '#FFF' : Colors.textMuted} />
                  <Text style={[styles.sortChipLabel, isActive && styles.sortChipLabelActive]}>
                    {t(opt.labelKey)}
                  </Text>
                  {isActive && opt.key !== 'default' && (
                    <Text style={styles.sortChipHint}>{opt.hint}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Result count */}
        <Text
          style={styles.countLabel}
          accessibilityLabel={`${totalCount} ${t('filterShowingCount')}`}
        >
          {totalCount}
        </Text>
      </View>

      {/* ── Bottom sheet ─────────────────────────────────────────────────── */}
      {open && (
        <Modal transparent animationType="none" onRequestClose={closeSheet}>
          <Animated.View style={[styles.backdrop, backdropStyle, { pointerEvents: 'box-none' }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          </Animated.View>

          <Animated.View style={[styles.sheet, sheetStyle]}>
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('filters')}</Text>
              {stagedActiveCount > 0 && (
                <Text style={styles.sheetSubtitle}>
                  {stagedActiveCount} {t('filterActive')}
                </Text>
              )}
              <TouchableOpacity
                onPress={closeSheet}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel={t('close')}
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetBody}
              keyboardShouldPersistTaps="handled"
            >
              {/* Color */}
              {uniqueColors.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{t('filterColor')}</Text>
                  <View style={styles.swatchGrid}>
                    <TouchableOpacity
                      style={[styles.allSwatch, stagedColor === null && styles.allSwatchActive]}
                      onPress={() => setStagedColor(null)}
                      activeOpacity={0.75}
                      accessibilityLabel={t('filterAllColors')}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: stagedColor === null }}
                    >
                      <Text style={[styles.allSwatchLabel, stagedColor === null && styles.allSwatchLabelActive]}>
                        {t('filterAllColors')}
                      </Text>
                    </TouchableOpacity>
                    {uniqueColors.map(({ hex, name }) => (
                      <TouchableOpacity
                        key={hex}
                        style={[
                          styles.swatch,
                          { backgroundColor: hex },
                          stagedColor === hex && styles.swatchActive,
                        ]}
                        onPress={() => setStagedColor(stagedColor === hex ? null : hex)}
                        activeOpacity={0.8}
                        accessibilityLabel={name}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: stagedColor === hex }}
                      >
                        {stagedColor === hex && (
                          <Ionicons name="checkmark" size={13} color="#FFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Style / Formality */}
              {uniqueFormalities.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{t('filterStyle')}</Text>
                  <View style={styles.chipWrap}>
                    <TouchableOpacity
                      style={[styles.chip, stagedFormality === null && styles.chipActive]}
                      onPress={() => setStagedFormality(null)}
                      activeOpacity={0.75}
                      accessibilityLabel={t('filterAllStyles')}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: stagedFormality === null }}
                    >
                      <Text style={[styles.chipLabel, stagedFormality === null && styles.chipLabelActive]}>
                        {t('filterAllStyles')}
                      </Text>
                    </TouchableOpacity>
                    {uniqueFormalities.map((f) => (
                      <TouchableOpacity
                        key={f}
                        style={[styles.chip, stagedFormality === f && styles.chipActive]}
                        onPress={() => setStagedFormality(stagedFormality === f ? null : f)}
                        activeOpacity={0.75}
                        accessibilityLabel={formatFormality(f)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: stagedFormality === f }}
                      >
                        <Text style={[styles.chipLabel, stagedFormality === f && styles.chipLabelActive]}>
                          {formatFormality(f)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleReset}
                activeOpacity={0.75}
                accessibilityLabel={t('filterClear')}
                accessibilityRole="button"
              >
                <Text style={styles.resetLabel}>{t('filterClear')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.applyBtn, !stagedChanged && stagedActiveCount === 0 && styles.applyBtnDisabled]}
                onPress={handleApply}
                activeOpacity={0.82}
                accessibilityLabel={t('filterApply')}
                accessibilityRole="button"
              >
                <Text style={styles.applyLabel}>{t('filterApply')}</Text>
                {stagedActiveCount > 0 && (
                  <Text style={styles.applyCount}>
                    · {totalCount} {t('filterShowingCount')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Toolbar ────────────────────────────────────────────────────────────────
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
    minHeight: 44,
  },
  toolbarCompact: {
    paddingTop: 8,
    paddingBottom: 12,
    minHeight: 36,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
    minHeight: 28,
  },
  sortChipLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },
  sortChipLabelActive: {
    color: '#FFF',
  },
  sortChipHint: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
    marginLeft: 2,
  },
  countLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: FontWeight.semibold,
    minWidth: 20,
    textAlign: 'right',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
    minHeight: 30,
  },
  filterBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterBtnLabel: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  filterBtnLabelActive: {
    color: '#FFF',
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
    lineHeight: 16,
  },

  // ── Backdrop ────────────────────────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },

  // ── Sheet ───────────────────────────────────────────────────────────────────
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl + 4,
    borderTopRightRadius: BorderRadius.xl + 4,
    maxHeight: SHEET_H,
    ...Shadow.md,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
    marginTop: 12,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  sheetTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  sheetSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  sheetBody: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  // ── Sections ────────────────────────────────────────────────────────────────
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  allSwatch: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allSwatchActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  allSwatchLabel: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  allSwatchLabelActive: {
    color: '#FFF',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  chipLabelActive: {
    color: '#FFF',
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  resetBtn: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.background,
  },
  resetLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.error,
  },
  applyBtn: {
    flex: 2,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
  },
  applyBtnDisabled: {
    opacity: 0.45,
  },
  applyLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFF',
  },
  applyCount: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.70)',
    fontWeight: FontWeight.medium,
  },
});
