/**
 * Domain section cards for Image Consulting results
 * ColorSeasonCard, BodyShapeCard, FaceShapeCard, SkinContrastCard, SizingCard
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { SectionCard, ColorChip, PillList, TipRow } from './SharedAtoms';
import type { ImageConsultingResult, BodyShapeGuidance, FaceShapeGuidance } from '../../types';

// ─── Colour Season Card ──────────────────────────────────────
export function ColorSeasonCard({ result }: { result: ImageConsultingResult }) {
  const p = result.color_palette;
  return (
    <SectionCard title="Your Colour Palette" icon="color-palette-outline">
      {result.color_season && (
        <View style={styles.seasonBadge}>
          <Text style={styles.seasonLabel}>Colour Season</Text>
          <Text style={styles.seasonValue}>{result.color_season}</Text>
        </View>
      )}

      {p && (
        <>
          <Text style={styles.subLabel}>✨ Best colours for you</Text>
          <View style={styles.swatchRow}>
            {p.best_colors.slice(0, 8).map((c, i) => <ColorChip key={i} name={c} />)}
          </View>

          <Text style={styles.subLabel}>👍 Good colours</Text>
          <View style={styles.swatchRow}>
            {p.good_colors.slice(0, 6).map((c, i) => <ColorChip key={i} name={c} />)}
          </View>

          <Text style={styles.subLabel}>🎨 Accent colours</Text>
          <View style={styles.swatchRow}>
            {p.accent_colors.slice(0, 5).map((c, i) => <ColorChip key={i} name={c} />)}
          </View>

          <Text style={styles.subLabel}>⚪ Your neutrals</Text>
          <View style={styles.swatchRow}>
            {p.neutral_colors.slice(0, 5).map((c, i) => <ColorChip key={i} name={c} />)}
          </View>

          {p.colors_to_avoid.length > 0 && (
            <>
              <Text style={[styles.subLabel, { color: Colors.error }]}>🚫 Colours to avoid</Text>
              <PillList items={p.colors_to_avoid.slice(0, 6)} color="#FDEAEA" />
            </>
          )}

          {p.tips.map((t, i) => <TipRow key={i} tip={t} />)}
        </>
      )}
    </SectionCard>
  );
}

// ─── Body Shape Card ─────────────────────────────────────────
export function BodyShapeCard({ guidance }: { guidance: BodyShapeGuidance }) {
  return (
    <SectionCard title="Body Shape" icon="body-outline">
      <View style={styles.bigBadge}>
        <Text style={styles.bigBadgeText}>{guidance.body_shape.replace(/_/g, ' ').toUpperCase()}</Text>
      </View>

      <Text style={styles.subLabel}>Flattering silhouettes</Text>
      <PillList items={guidance.flattering_silhouettes} />

      {guidance.good_patterns.length > 0 && (
        <>
          <Text style={styles.subLabel}>Good patterns</Text>
          <PillList items={guidance.good_patterns} />
        </>
      )}

      {guidance.items_to_avoid.length > 0 && (
        <>
          <Text style={[styles.subLabel, { color: Colors.error }]}>Items to avoid</Text>
          <PillList items={guidance.items_to_avoid} color="#FDEAEA" />
        </>
      )}

      {guidance.styling_tips.map((t, i) => <TipRow key={i} tip={t} />)}
      {guidance.proportion_tips.map((t, i) => <TipRow key={`p${i}`} tip={t} />)}
    </SectionCard>
  );
}

// ─── Face Shape Card ─────────────────────────────────────────
export function FaceShapeCard({ guidance }: { guidance: FaceShapeGuidance }) {
  return (
    <SectionCard title="Face Shape" icon="happy-outline">
      <View style={styles.bigBadge}>
        <Text style={styles.bigBadgeText}>{guidance.face_shape.toUpperCase()}</Text>
      </View>

      <Text style={styles.subLabel}>Flattering necklines</Text>
      <PillList items={guidance.flattering_necklines} />

      <Text style={styles.subLabel}>Flattering collars</Text>
      <PillList items={guidance.flattering_collars} />

      <Text style={styles.subLabel}>Earring styles</Text>
      <PillList items={guidance.earring_styles} />

      <Text style={styles.subLabel}>Glasses styles</Text>
      <PillList items={guidance.glasses_styles} />

      {guidance.tips.map((t, i) => <TipRow key={i} tip={t} />)}
    </SectionCard>
  );
}

// ─── Skin & Contrast Card ────────────────────────────────────
export function SkinContrastCard({ result }: { result: ImageConsultingResult }) {
  const rows = [
    { label: 'Skin Tone',      value: result.skin_tone?.replace(/_/g, ' ') ?? '—' },
    { label: 'Undertone',      value: result.undertone ?? '—' },
    { label: 'Hair Colour',    value: result.hair_color?.replace(/_/g, ' ') ?? '—' },
    { label: 'Contrast Level', value: result.contrast_level?.replace(/_/g, ' ') ?? '—' },
    { label: 'Visual Weight',  value: result.visual_weight?.replace(/_/g, ' ') ?? '—' },
  ];
  return (
    <SectionCard title="Skin, Hair & Contrast" icon="eye-outline">
      {rows.map(({ label, value }) => (
        <View key={label} style={styles.attrRow}>
          <Text style={styles.attrLabel}>{label}</Text>
          <Text style={styles.attrValue}>{value}</Text>
        </View>
      ))}
    </SectionCard>
  );
}

// ─── Sizing Card ─────────────────────────────────────────────
export function SizingCard({ result }: { result: ImageConsultingResult }) {
  if (!result.estimated_top_size && !result.estimated_bottom_size) return null;
  return (
    <SectionCard title="Estimated Sizes" icon="resize-outline">
      <Text style={styles.sizingNote}>Based on your height & body shape analysis:</Text>
      <View style={styles.sizeRow}>
        {result.estimated_top_size && (
          <View style={styles.sizeBadge}>
            <Text style={styles.sizeLabel}>Tops</Text>
            <Text style={styles.sizeValue}>{result.estimated_top_size}</Text>
          </View>
        )}
        {result.estimated_bottom_size && (
          <View style={styles.sizeBadge}>
            <Text style={styles.sizeLabel}>Bottoms</Text>
            <Text style={styles.sizeValue}>{result.estimated_bottom_size}</Text>
          </View>
        )}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  // Sub-labels
  subLabel: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },

  // Badges
  bigBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12,
  },
  bigBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textOnAccent, textTransform: 'uppercase' },

  seasonBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  seasonLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  seasonValue: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary },

  // Attr rows (skin/contrast card)
  attrRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  attrLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  attrValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textTransform: 'capitalize' },

  // Sizing
  sizingNote: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 12 },
  sizeRow: { flexDirection: 'row', gap: Spacing.md },
  sizeBadge: {
    flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  sizeLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  sizeValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, color: Colors.textPrimary, marginTop: 4 },
});
