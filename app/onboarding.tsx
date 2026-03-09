/**
 * Onboarding Screen — ASOS-style: clean, black accents, bold type
 * Multi-step flow with progress indicator
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { Button, Chip, Card } from '../components/ui';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

const STEPS = ['Profile', 'Body', 'Style', 'Preferences'];

const STYLE_OPTIONS = [
  { key: 'minimalist', label: 'Minimalist' },
  { key: 'classic', label: 'Classic' },
  { key: 'streetwear', label: 'Streetwear' },
  { key: 'bohemian', label: 'Bohemian' },
  { key: 'preppy', label: 'Preppy' },
  { key: 'edgy', label: 'Edgy' },
  { key: 'romantic', label: 'Romantic' },
];

const COLOR_OPTIONS = [
  { key: 'navy', hex: '#1B2A4A', label: 'Navy' },
  { key: 'black', hex: '#1A1A1A', label: 'Black' },
  { key: 'white', hex: '#F5F5F5', label: 'White' },
  { key: 'earth', hex: '#8B6F47', label: 'Earth' },
  { key: 'pastel', hex: '#FFB6C1', label: 'Pastel' },
  { key: 'burgundy', hex: '#722F37', label: 'Burgundy' },
  { key: 'olive', hex: '#556B2F', label: 'Olive' },
  { key: 'coral', hex: '#FF6B6B', label: 'Coral' },
  { key: 'slate', hex: '#708090', label: 'Slate' },
  { key: 'camel', hex: '#C19A6B', label: 'Camel' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { userId, setProfile } = useAppStore();

  // Step 1: Basic info
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [gender, setGender] = useState('');

  // Step 2: Body (placeholder for photo)
  const [bodyPhotoTaken, setBodyPhotoTaken] = useState(false);

  // Step 3: Style
  const [styles_, setStyles_] = useState<string[]>([]);

  // Step 4: Colors
  const [favColors, setFavColors] = useState<string[]>([]);
  const [avoidColors, setAvoidColors] = useState<string[]>([]);
  const [comfortStyle, setComfortStyle] = useState(50);

  const toggleStyle = (key: string) => {
    setStyles_((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const toggleFavColor = (key: string) => {
    setFavColors((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const toggleAvoidColor = (key: string) => {
    setAvoidColors((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleFinish = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const profile = await api.updateProfile(userId, {
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        gender: gender || undefined,
        style_preferences: styles_,
        favorite_colors: favColors,
        avoid_colors: avoidColors,
        comfort_vs_style: comfortStyle,
      } as any);
      await api.completeOnboarding(userId);
      setProfile({ ...profile, is_onboarded: true });
      router.replace('/(tabs)/wardrobe');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={s.stepContent}>
            <Text style={s.stepTitle}>ABOUT YOU</Text>
            <Text style={s.stepDesc}>
              Help our AI personalize recommendations to your body and style.
            </Text>

            {/* Gender */}
            <Text style={s.fieldLabel}>GENDER PREFERENCE</Text>
            <View style={s.chipRow}>
              {['femme', 'homme', 'non-genré'].map((g) => (
                <Chip
                  key={g}
                  label={g.charAt(0).toUpperCase() + g.slice(1)}
                  selected={gender === g}
                  onPress={() => setGender(g)}
                />
              ))}
            </View>

            {/* Height */}
            <Text style={s.fieldLabel}>HEIGHT</Text>
            <View style={s.inputWrapper}>
              <TextInput
                style={s.input}
                value={heightCm}
                onChangeText={setHeightCm}
                placeholder="170"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
              <Text style={s.unit}>CM</Text>
            </View>

            {/* Weight */}
            <Text style={s.fieldLabel}>WEIGHT</Text>
            <View style={s.inputWrapper}>
              <TextInput
                style={s.input}
                value={weightKg}
                onChangeText={setWeightKg}
                placeholder="65"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
              <Text style={s.unit}>KG</Text>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={s.stepContent}>
            <Text style={s.stepTitle}>BODY ANALYSIS</Text>
            <Text style={s.stepDesc}>
              Take a full-body photo so our AI can detect your body shape, skin tone & more.
            </Text>

            <Card variant="elevated" style={s.photoCard}>
              <View style={s.photoPlaceholder}>
                {bodyPhotoTaken ? (
                  <View style={s.photoSuccess}>
                    <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                    <Text style={s.photoSuccessText}>Photo captured!</Text>
                    <Text style={s.photoHint}>AI analysis will run after onboarding</Text>
                  </View>
                ) : (
                  <>
                    <View style={s.photoIconWrap}>
                      <Ionicons name="body-outline" size={48} color={Colors.textMuted} />
                    </View>
                    <Text style={s.photoLabel}>Full-body photo</Text>
                    <Text style={s.photoHint}>
                      Stand straight, arms slightly away from body
                    </Text>
                  </>
                )}
              </View>
            </Card>

            <View style={s.photoActions}>
              <Button
                title="Take Photo"
                onPress={() => setBodyPhotoTaken(true)}
                variant="primary"
                icon={<Ionicons name="camera-outline" size={18} color="#FFF" />}
                style={{ flex: 1 }}
              />
              <Button
                title="Gallery"
                onPress={() => setBodyPhotoTaken(true)}
                variant="outline"
                icon={<Ionicons name="images-outline" size={18} color={Colors.accent} />}
                style={{ flex: 1 }}
              />
            </View>

            <TouchableOpacity style={s.skipLink} onPress={nextStep}>
              <Text style={s.skipText}>SKIP FOR NOW</Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={s.stepContent}>
            <Text style={s.stepTitle}>YOUR STYLE</Text>
            <Text style={s.stepDesc}>
              Select the styles that resonate with you. Pick as many as you like.
            </Text>

            <View style={s.styleGrid}>
              {STYLE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    s.styleCard,
                    styles_.includes(opt.key) && s.styleCardActive,
                  ]}
                  onPress={() => toggleStyle(opt.key)}
                >
                  <Text
                    style={[
                      s.styleLabel,
                      styles_.includes(opt.key) && s.styleLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {styles_.includes(opt.key) && (
                    <View style={s.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={s.stepContent}>
            <Text style={s.stepTitle}>COLOURS</Text>

            <Text style={s.fieldLabel}>COLOURS YOU LOVE</Text>
            <View style={s.colorGrid}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    s.colorChip,
                    favColors.includes(c.key) && s.colorChipActive,
                  ]}
                  onPress={() => toggleFavColor(c.key)}
                >
                  <View style={[s.colorDot, { backgroundColor: c.hex }]} />
                  <Text style={s.colorLabel}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[s.fieldLabel, { marginTop: Spacing.lg }]}>COLOURS TO AVOID</Text>
            <View style={s.colorGrid}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    s.colorChip,
                    avoidColors.includes(c.key) && s.colorChipAvoid,
                  ]}
                  onPress={() => toggleAvoidColor(c.key)}
                >
                  <View style={[s.colorDot, { backgroundColor: c.hex }]} />
                  <Text style={s.colorLabel}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[s.fieldLabel, { marginTop: Spacing.lg }]}>
              COMFORT VS STYLE: {comfortStyle}%
            </Text>
            <View style={s.sliderRow}>
              <Text style={s.sliderLabel}>COMFORT</Text>
              <View style={s.sliderTrack}>
                <View style={[s.sliderFill, { width: `${comfortStyle}%` }]} />
              </View>
              <Text style={s.sliderLabel}>STYLE</Text>
            </View>
            <View style={s.sliderButtons}>
              {[0, 25, 50, 75, 100].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[s.sliderBtn, comfortStyle === v && s.sliderBtnActive]}
                  onPress={() => setComfortStyle(v)}
                >
                  <Text style={[s.sliderBtnText, comfortStyle === v && s.sliderBtnTextActive]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
    }
  };

  return (
    <View style={s.container}>
      {/* Progress bar */}
      <View style={s.progressArea}>
        <TouchableOpacity onPress={prevStep} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.progressBar}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                s.progressDot,
                i <= step && s.progressDotActive,
                i < step && s.progressDotDone,
              ]}
            />
          ))}
        </View>
        <Text style={s.stepIndicator}>
          {step + 1}/{STEPS.length}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomBar}>
        <Button
          title={step < STEPS.length - 1 ? 'Continue' : 'Finish Setup'}
          onPress={nextStep}
          loading={loading}
          fullWidth
          size="lg"
          icon={
            step < STEPS.length - 1 ? (
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            ) : (
              <Ionicons name="checkmark" size={18} color="#FFF" />
            )
          }
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.textMuted,
  },
  progressDotDone: {
    backgroundColor: Colors.accent,
  },
  stepIndicator: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  stepContent: {
    paddingTop: Spacing.md,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: 2,
  },
  stepDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 50,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  unit: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  photoCard: {
    marginBottom: Spacing.md,
  },
  photoPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  photoLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  photoHint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  photoSuccess: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  photoSuccessText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  photoActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
    textDecorationLine: 'underline',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  styleCard: {
    width: (width - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    aspectRatio: 1.2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    position: 'relative',
  },
  styleCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceLight,
  },
  styleLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  styleLabelActive: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  colorChipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceLight,
  },
  colorChipAvoid: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '08',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  colorLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sliderLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderBtn: {
    width: 44,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  sliderBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  sliderBtnText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  sliderBtnTextActive: {
    color: '#FFF',
    fontWeight: FontWeight.bold,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 34,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
