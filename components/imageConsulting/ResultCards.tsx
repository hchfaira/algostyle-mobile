/**
 * Style DNA Dashboard — Section cards
 * Quiet luxury — black, white, nude palette with enhanced visuals
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, ZoomIn, SlideInRight } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import {
  DashSection, ColorOrb, Chip, TipRow, Divider, MetricCell, AttrRow, GroupLabel,
  SECTION_COLORS,
} from './SharedAtoms';
import type { ImageConsultingResult, BodyShapeGuidance, FaceShapeGuidance } from '../../types';

// ─── 1. Identity Strip ────────────────────────────────────────
export function IdentityStrip({ result }: { result: ImageConsultingResult }) {
  const confidence = Math.round((result.overall_confidence ?? 0) * 100);
  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.stripWrap}>
      {/* Row 1 */}
      <View style={styles.stripRow}>
        <MetricCell value={result.color_season ?? '—'}                          label="Season"    accent={SECTION_COLORS.palette} />
        <MetricCell value={result.body_shape?.replace(/_/g, ' ') ?? '—'}        label="Body"      accent={SECTION_COLORS.body}    />
        <MetricCell value={result.face_shape?.replace(/_/g, ' ') ?? '—'}        label="Face"      accent={SECTION_COLORS.face}    last />
      </View>
      <View style={styles.stripDivider} />
      {/* Row 2 */}
      <View style={styles.stripRow}>
        <MetricCell value={result.undertone ?? '—'}                             label="Undertone" accent={SECTION_COLORS.skin}    />
        <MetricCell value={result.skin_tone?.replace(/_/g, ' ') ?? '—'}         label="Skin Tone" accent={SECTION_COLORS.identity}/>
        <MetricCell value={confidence + '%'}                                    label="Match"     accent={SECTION_COLORS.sizing}  last />
      </View>
    </Animated.View>
  );
}

// ─── 2. Summary Banner ────────────────────────────────────────
export function SummaryBanner({ text }: { text: string }) {
  return (
    <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.summaryCard}>
      <View style={[styles.summaryAccent, { backgroundColor: SECTION_COLORS.summary }]} />
      <Text style={styles.summaryText}>{text}</Text>
    </Animated.View>
  );
}

// ─── 3. Colour Palette Section ────────────────────────────────
export function ColorSeasonCard({ result }: { result: ImageConsultingResult }) {
  const p = result.color_palette;
  if (!p) return null;
  return (
    <DashSection title="Colour Palette" accent={SECTION_COLORS.palette} icon="color-palette-outline">
      {/* Season pill */}
      {result.color_season && (
        <Animated.View entering={ZoomIn.delay(80).springify()} style={styles.seasonPill}>
          <Text style={[styles.seasonName, { color: SECTION_COLORS.palette }]}>
            {result.color_season}
          </Text>
          <Text style={styles.seasonSub}>Your Season</Text>
        </Animated.View>
      )}

      <GroupLabel text="✦ Best for you" accent={SECTION_COLORS.palette} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orbScroll}>
        {p.best_colors.slice(0, 10).map((c, i) => <ColorOrb key={i} name={c} size={48} index={i} />)}
      </ScrollView>

      <Divider accent={SECTION_COLORS.palette} />

      <GroupLabel text="Good choices" accent={Colors.textSecondary} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orbScroll}>
        {p.good_colors.slice(0, 8).map((c, i) => <ColorOrb key={i} name={c} size={38} index={i} />)}
      </ScrollView>

      {p.accent_colors.length > 0 && (
        <>
          <Divider accent={SECTION_COLORS.palette} />
          <GroupLabel text="Statement accents" accent={SECTION_COLORS.summary} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orbScroll}>
            {p.accent_colors.slice(0, 6).map((c, i) => <ColorOrb key={i} name={c} size={34} index={i} />)}
          </ScrollView>
        </>
      )}

      {p.colors_to_avoid.length > 0 && (
        <>
          <Divider accent={Colors.error} />
          <GroupLabel text="✗ Avoid these" accent={Colors.error} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orbScroll}>
            {p.colors_to_avoid.slice(0, 6).map((c, i) => (
              <ColorOrb key={i} name={c} size={34} strikethrough index={i} />
            ))}
          </ScrollView>
        </>
      )}

      {p.tips.length > 0 && (
        <>
          <Divider accent={SECTION_COLORS.palette} />
          {p.tips.slice(0, 3).map((t, i) => (
            <TipRow key={i} tip={t} accent={SECTION_COLORS.palette} />
          ))}
        </>
      )}
    </DashSection>
  );
}

// ─── 4. Body Shape Section ────────────────────────────────────
export function BodyShapeCard({ guidance }: { guidance: BodyShapeGuidance }) {
  return (
    <DashSection title="Body Shape" accent={SECTION_COLORS.body} icon="body-outline">
      <Animated.View entering={ZoomIn.delay(50).springify()} style={[styles.bigBadge, { borderColor: SECTION_COLORS.body, backgroundColor: SECTION_COLORS.body + '12' }]}>
        <Text style={[styles.bigBadgeText, { color: SECTION_COLORS.body }]}>
          {guidance.body_shape.replace(/_/g, ' ')}
        </Text>
      </Animated.View>

      <View style={styles.triCol}>
        {/* Wear */}
        <Animated.View entering={SlideInRight.delay(80).springify()} style={[styles.triCard, { borderTopColor: SECTION_COLORS.body }]}>
          <Text style={[styles.triHeader, { color: SECTION_COLORS.body }]}>✓ Wear</Text>
          {guidance.flattering_silhouettes.slice(0, 4).map((s, i) => (
            <Text key={i} style={styles.triItem}>{s.replace(/_/g, ' ')}</Text>
          ))}
        </Animated.View>

        {/* Avoid */}
        <Animated.View entering={SlideInRight.delay(140).springify()} style={[styles.triCard, { borderTopColor: Colors.error }]}>
          <Text style={[styles.triHeader, { color: Colors.error }]}>✗ Avoid</Text>
          {guidance.items_to_avoid.slice(0, 4).map((s, i) => (
            <Text key={i} style={styles.triItem}>{s.replace(/_/g, ' ')}</Text>
          ))}
        </Animated.View>

        {/* Try */}
        <Animated.View entering={SlideInRight.delay(200).springify()} style={[styles.triCard, { borderTopColor: SECTION_COLORS.face }]}>
          <Text style={[styles.triHeader, { color: SECTION_COLORS.face }]}>✦ Try</Text>
          {guidance.good_patterns.slice(0, 4).map((s, i) => (
            <Text key={i} style={styles.triItem}>{s.replace(/_/g, ' ')}</Text>
          ))}
        </Animated.View>
      </View>

      {[...guidance.styling_tips, ...guidance.proportion_tips].slice(0, 4).map((t, i) => (
        <TipRow key={i} tip={t} accent={SECTION_COLORS.body} />
      ))}
    </DashSection>
  );
}

// ─── 5. Face Shape Section ────────────────────────────────────
export function FaceShapeCard({ guidance }: { guidance: FaceShapeGuidance }) {
  return (
    <DashSection title="Face Shape" accent={SECTION_COLORS.face} icon="happy-outline">
      <Animated.View entering={ZoomIn.delay(50).springify()} style={[styles.bigBadge, { borderColor: SECTION_COLORS.face, backgroundColor: SECTION_COLORS.face + '12' }]}>
        <Text style={[styles.bigBadgeText, { color: SECTION_COLORS.face }]}>
          {guidance.face_shape}
        </Text>
      </Animated.View>

      <GroupLabel text="Flattering necklines" accent={SECTION_COLORS.face} />
      <View style={styles.chipWrap}>
        {guidance.flattering_necklines.map((s, i) => (
          <Chip key={i} label={s} variant="good" accent={SECTION_COLORS.face} />
        ))}
      </View>

      <GroupLabel text="Collar styles" accent={Colors.textSecondary} />
      <View style={styles.chipWrap}>
        {guidance.flattering_collars.map((s, i) => (
          <Chip key={i} label={s} accent={SECTION_COLORS.face} />
        ))}
      </View>

      <Divider accent={SECTION_COLORS.face} />

      <GroupLabel text="Accessories" accent={SECTION_COLORS.face} />
      <View style={styles.chipWrap}>
        {[...guidance.earring_styles, ...guidance.glasses_styles].map((s, i) => (
          <Chip key={i} label={s} accent={SECTION_COLORS.face} />
        ))}
      </View>

      {guidance.tips.slice(0, 3).map((t, i) => (
        <TipRow key={i} tip={t} accent={SECTION_COLORS.face} />
      ))}
    </DashSection>
  );
}

// ─── 6. Your Profile — all LLM output fields ─────────────────
export function SkinContrastCard({ result }: { result: ImageConsultingResult }) {
  // Two columns: left label, right value pill
  const rows = [
    { label: 'Skin Tone',      value: result.skin_tone?.replace(/_/g, ' ')      ?? '—' },
    { label: 'Undertone',      value: result.undertone                           ?? '—' },
    { label: 'Hair Colour',    value: result.hair_color?.replace(/_/g, ' ')      ?? '—' },
    { label: 'Face Shape',     value: result.face_shape?.replace(/_/g, ' ')      ?? '—' },
    { label: 'Body Shape',     value: result.body_shape?.replace(/_/g, ' ')      ?? '—' },
    { label: 'Contrast Level', value: result.contrast_level?.replace(/_/g, ' ') ?? '—' },
    { label: 'Visual Weight',  value: result.visual_weight?.replace(/_/g, ' ')  ?? '—' },
    { label: 'Colour Season',  value: result.color_season                        ?? '—' },
  ];
  return (
    <DashSection title="Your Profile" accent={SECTION_COLORS.skin} icon="person-outline">
      {rows.map(({ label, value }, i) => (
        <AttrRow key={i} label={label} value={value} accent={SECTION_COLORS.skin} index={i} />
      ))}
    </DashSection>
  );
}

// ─── 7. Sizing Section ───────────────────────────────────────
export function SizingCard({ result }: { result: ImageConsultingResult }) {
  if (!result.estimated_top_size && !result.estimated_bottom_size) return null;
  return (
    <DashSection title="Estimated Sizes" accent={SECTION_COLORS.sizing} icon="shirt-outline">
      <Text style={styles.sizingNote}>Based on your height & shape analysis</Text>
      <View style={styles.sizeRow}>
        {result.estimated_top_size && (
          <Animated.View
            entering={ZoomIn.delay(60).springify()}
            style={[styles.sizeBadge, { borderColor: SECTION_COLORS.sizing, backgroundColor: SECTION_COLORS.sizing + '10' }]}
          >
            <Text style={[styles.sizeLabel, { color: SECTION_COLORS.sizing }]}>Tops</Text>
            <Text style={[styles.sizeValue, { color: SECTION_COLORS.sizing }]}>{result.estimated_top_size}</Text>
          </Animated.View>
        )}
        {result.estimated_bottom_size && (
          <Animated.View
            entering={ZoomIn.delay(120).springify()}
            style={[styles.sizeBadge, { borderColor: SECTION_COLORS.identity, backgroundColor: SECTION_COLORS.identity + '10' }]}
          >
            <Text style={[styles.sizeLabel, { color: SECTION_COLORS.identity }]}>Bottoms</Text>
            <Text style={[styles.sizeValue, { color: SECTION_COLORS.identity }]}>{result.estimated_bottom_size}</Text>
          </Animated.View>
        )}
      </View>
    </DashSection>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Identity strip
  stripWrap: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadow.soft,
    overflow: 'hidden',
  },
  stripRow: {
    flexDirection: 'row',
  },
  stripDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
    opacity: 0.5,
  },
  // keep old strip key for any legacy usage
  strip: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadow.soft,
    overflow: 'hidden',
  },

  // Summary card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.soft,
  },
  summaryAccent: { width: 5 },
  summaryText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    fontWeight: FontWeight.medium,
    padding: Spacing.md,
    letterSpacing: 0.1,
  },

  // Season pill
  seasonPill: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
    gap: 3,
  },
  seasonName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  seasonSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    fontWeight: FontWeight.medium,
  },

  // Orb scroll
  orbScroll: { gap: Spacing.md, paddingVertical: Spacing.sm, paddingRight: Spacing.sm },

  // Big badge (shape name)
  bigBadge: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  bigBadgeText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },

  // Three columns
  triCol: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  triCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderTopWidth: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftColor: Colors.border,
    borderRightColor: Colors.border,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    gap: 4,
    ...Shadow.soft,
  },
  triHeader: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  triItem: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 18,
  },

  // Chips
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },

  // Sizing
  sizingNote: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.1,
  },
  sizeRow: { flexDirection: 'row', gap: Spacing.sm },
  sizeBadge: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    ...Shadow.soft,
  },
  sizeLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },
  sizeValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
});

