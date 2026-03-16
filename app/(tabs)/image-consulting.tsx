/**
 * Style DNA Tab
 * Quiet luxury — nude palette, black text, animated section cards
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

import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
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
import { SECTION_COLORS } from '../../components/imageConsulting/SharedAtoms';
import { useImageConsulting } from '../../hooks/useImageConsulting';

const BLACK    = '#1A1A1A';
const ESPRESSO = '#3B2A1A';

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
  const COLORS = [SECTION_COLORS.palette, SECTION_COLORS.body, SECTION_COLORS.face];
  return (
    <View style={loader.row}>
      {dots.map((dot, i) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const style = useAnimatedStyle(() => ({
          opacity: dot.value,
          transform: [{ scale: 0.8 + dot.value * 0.4 }],
        }));
        return (
          <Animated.View
            key={i}
            style={[loader.dot, { backgroundColor: COLORS[i] }, style]}
          />
        );
      })}
    </View>
  );
}

const loader = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7 },
});

export default function ImageConsultingScreen() {
  const ic = useImageConsulting();

  return (
    <View style={styles.container}>
      <TopBar title="Style DNA" />

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
          <Text style={styles.loadingText}>Analysing your style profile…</Text>
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
            activeOpacity={0.8}
          >
            <Text style={styles.retakeBtnText}>✦ RETAKE ANALYSIS</Text>
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
  container: { flex: 1, backgroundColor: '#FAF7F4' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingTop: Spacing.sm },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF7F4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    zIndex: 10,
  },
  loadingEmoji: {
    fontSize: 48,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: ESPRESSO,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
  },

  stickyBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FAF7F4',
    borderTopWidth: 1,
    borderTopColor: '#E8DDD5',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.lg,
    ...Shadow.md,
  },
  retakeBtn: {
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: BLACK,
  },
  retakeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: '#FFFFFF',
    letterSpacing: 3,
  },
});
