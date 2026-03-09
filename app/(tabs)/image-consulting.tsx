/**
 * Image Consulting Tab
 *
 * Shows the user's full style profile analysis:
 *   • Colour Season, Body Shape, Face Shape, Skin & Contrast, Sizing
 * Bottom: "Redo My Image Consulting" button
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import {
  EmptyState,
  RedoConsultingModal,
  ColorSeasonCard,
  BodyShapeCard,
  FaceShapeCard,
  SkinContrastCard,
  SizingCard,
} from '../../components/imageConsulting';
import { useImageConsulting } from '../../hooks/useImageConsulting';

export default function ImageConsultingScreen() {
  const ic = useImageConsulting();

  return (
    <View style={styles.container}>
      <TopBar title="Image Consulting" />

      {/* ── Loading overlay ── */}
      {ic.isLoadingConsulting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Analysing your style profile…</Text>
        </View>
      )}

      {/* ── Empty state ── */}
      {!ic.isLoadingConsulting && !ic.consultingResult && (
        <EmptyState onPress={ic.openModal} />
      )}

      {/* ── Results ── */}
      {!ic.isLoadingConsulting && !!ic.consultingResult && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {ic.consultingResult.summary && (
            <Animated.View entering={FadeInDown.delay(50)} style={styles.summaryBanner}>
              <Ionicons name="sparkles" size={16} color={Colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.summaryText}>{ic.consultingResult.summary}</Text>
            </Animated.View>
          )}

          {ic.consultingResult.overall_confidence > 0 && (
            <Animated.View entering={FadeInDown.delay(80)} style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                Analysis confidence: {Math.round(ic.consultingResult.overall_confidence * 100)}%
              </Text>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(120)}>
            <ColorSeasonCard result={ic.consultingResult} />
          </Animated.View>

          {ic.consultingResult.body_shape_guidance && (
            <Animated.View entering={FadeInDown.delay(180)}>
              <BodyShapeCard guidance={ic.consultingResult.body_shape_guidance} />
            </Animated.View>
          )}

          {ic.consultingResult.face_shape_guidance && (
            <Animated.View entering={FadeInDown.delay(240)}>
              <FaceShapeCard guidance={ic.consultingResult.face_shape_guidance} />
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(300)}>
            <SkinContrastCard result={ic.consultingResult} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(340)}>
            <SizingCard result={ic.consultingResult} />
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* ── Sticky CTA: Redo ── */}
      {!ic.isLoadingConsulting && !!ic.consultingResult && (
        <Animated.View entering={FadeInUp.delay(400)} style={styles.stickyBar}>
          <TouchableOpacity style={styles.redoBtn} onPress={() => ic.setShowModal(true)} activeOpacity={0.85}>
            <Ionicons name="refresh-outline" size={18} color={Colors.textOnAccent} />
            <Text style={styles.redoBtnText}>Redo My Image Consulting</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Redo Modal ── */}
      <RedoConsultingModal
        visible={ic.showModal}
        onClose={() => ic.setShowModal(false)}
        onSubmit={ic.handleAnalyze}
        initialHeight={ic.profile?.height_cm}
        initialWeight={ic.profile?.weight_kg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 32 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 10,
  },
  loadingText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },

  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  summaryText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },

  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: Spacing.md,
  },
  confidenceText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.semibold },

  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  redoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: BorderRadius.md, paddingVertical: 14,
  },
  redoBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textOnAccent },
});
