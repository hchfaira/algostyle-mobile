/**
 * Style DNA Tab — Quiet luxury redesign
 * Black, white, nude palette with enhanced visuals and animations
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInUp, ZoomIn, useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import {
  EmptyState,
  RedoConsultingModal,
  IdentityStrip,
  SummaryBanner,
  ColorSeasonCard,
  BodyShapeCard,
  FaceShapeCard,
  SkinContrastCard,
  SizingCard,
} from '../../components/imageConsulting';
import { useImageConsulting } from '../../hooks/useImageConsulting';

// Animated loading dots
function LoadingDots() {
  const dots = [0, 1, 2].map(() => useSharedValue(0));
  useEffect(() => {
    dots.forEach((dot, i) => {
      dot.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    });
  }, []);
  const DOT_COLORS = ['#D4C4B0', '#C4B5A4', '#B4A594']; // Warm nude gradient
  return (
    <View style={loader.row}>
      {dots.map((dot, i) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const style = useAnimatedStyle(() => ({
          opacity: 0.3 + dot.value * 0.7,
          transform: [{ scale: 0.75 + dot.value * 0.35 }],
        }));
        return (
          <Animated.View
            key={i}
            style={[loader.dot, { backgroundColor: DOT_COLORS[i] }, style]}
          />
        );
      })}
    </View>
  );
}

const loader = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: BorderRadius.full },
});

export default function ImageConsultingScreen() {
  const ic = useImageConsulting();

  return (
    <View style={styles.container}>
      <TopBar title="Style DNA" subtitle={ic.consultingResult ? 'Your personalised analysis' : 'Discover your style profile'} />

      {/* ── Loading overlay ── */}
      {ic.isLoadingConsulting && (
        <View style={styles.loadingOverlay}>
          <Animated.Text
            entering={ZoomIn.springify()}
            style={styles.loadingEmoji}
          >
            ✨
          </Animated.Text>
          <LoadingDots />
          <Text style={styles.loadingText}>Analysing your style profile</Text>
          <Text style={styles.loadingSubtext}>This takes about 30 seconds…</Text>
        </View>
      )}

      {/* ── Empty state ── */}
      {!ic.isLoadingConsulting && !ic.consultingResult && (
        <EmptyState onPress={ic.openModal} />
      )}

      {/* ── Dashboard ── */}
      {!ic.isLoadingConsulting && !!ic.consultingResult && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity strip */}
          <Animated.View entering={FadeInDown.delay(40).springify()}>
            <IdentityStrip result={ic.consultingResult} />
          </Animated.View>

          {/* Summary */}
          {!!ic.consultingResult.summary && (
            <Animated.View entering={FadeInDown.delay(80).springify()}>
              <SummaryBanner text={ic.consultingResult.summary} />
            </Animated.View>
          )}

          {/* Colour palette */}
          <Animated.View entering={FadeInDown.delay(130).springify()}>
            <ColorSeasonCard result={ic.consultingResult} />
          </Animated.View>

          {/* Body shape */}
          {!!ic.consultingResult.body_shape_guidance && (
            <Animated.View entering={FadeInDown.delay(190).springify()}>
              <BodyShapeCard guidance={ic.consultingResult.body_shape_guidance} />
            </Animated.View>
          )}

          {/* Face shape */}
          {!!ic.consultingResult.face_shape_guidance && (
            <Animated.View entering={FadeInDown.delay(250).springify()}>
              <FaceShapeCard guidance={ic.consultingResult.face_shape_guidance} />
            </Animated.View>
          )}

          {/* Skin & contrast */}
          <Animated.View entering={FadeInDown.delay(310).springify()}>
            <SkinContrastCard result={ic.consultingResult} />
          </Animated.View>

          {/* Sizes */}
          <Animated.View entering={FadeInDown.delay(360).springify()}>
            <SizingCard result={ic.consultingResult} />
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* ── Sticky retake CTA ── */}
      {!ic.isLoadingConsulting && !!ic.consultingResult && (
        <Animated.View entering={FadeInUp.delay(420).springify()} style={styles.stickyBar}>
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => ic.setShowModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.retakeBtnText}>✦  Retake Analysis</Text>
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
  scrollContent: { paddingBottom: 24, paddingTop: Spacing.sm },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    zIndex: 10,
  },
  loadingEmoji: {
    fontSize: 52,
    marginBottom: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.2,
  },
  loadingSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.regular,
    letterSpacing: 0.1,
  },

  stickyBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
    ...Shadow.soft,
  },
  retakeBtn: {
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.accent,
  },
  retakeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textOnAccent,
    letterSpacing: 0.5,
  },
});
