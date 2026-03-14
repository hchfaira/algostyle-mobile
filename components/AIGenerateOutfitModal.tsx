/**
 * AI Generate Outfit Modal — Configure and generate AI-recommended outfits
 * Contains: Occasion, Style Profile, Number of Outfits, Generate Button
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';
import type { Occasion, ScoringProfile } from '../types';

interface AIGenerateOutfitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGenerate: (occasion: Occasion, scoringProfile: ScoringProfile, topK: number) => void;
  isLoading?: boolean;
}

const OCCASIONS: { key: Occasion; label: string }[] = [
  { key: 'casual', label: '😎 Casual' },
  { key: 'business', label: '💼 Business' },
  { key: 'formal', label: '🎩 Formal' },
  { key: 'date', label: '💕 Date' },
  { key: 'party', label: '🎉 Party' },
  { key: 'wedding', label: '💒 Wedding' },
  { key: 'interview', label: '📋 Interview' },
  { key: 'sport', label: '⚽ Sport' },
  { key: 'travel', label: '✈️ Travel' },
  { key: 'beach', label: '🏖️ Beach' },
];

const SCORING_PROFILES: { key: ScoringProfile; label: string; desc: string }[] = [
  { key: 'default', label: 'Balanced', desc: 'Even mix of all factors' },
  { key: 'minimalist', label: 'Minimal', desc: 'Clean & simple lines' },
  { key: 'creative', label: 'Creative', desc: 'Bold & unique combos' },
  { key: 'business', label: 'Business', desc: 'Professional vibes' },
  { key: 'casual', label: 'Casual', desc: 'Relaxed & comfortable' },
];

const TOP_K_OPTIONS = [3, 5, 7, 10];

export const AIGenerateOutfitModal: React.FC<AIGenerateOutfitModalProps> = ({
  isVisible,
  onClose,
  onGenerate,
  isLoading = false,
}) => {
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>('casual');
  const [selectedProfile, setSelectedProfile] = useState<ScoringProfile>('default');
  const [selectedTopK, setSelectedTopK] = useState(3);

  const handleGenerate = () => {
    onGenerate(selectedOccasion, selectedProfile, selectedTopK);
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutDown}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>✨ Let AI Build Your Outfit</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Customize your outfit generation</Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            {/* Occasion Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What&apos;s the Occasion?</Text>
              <View style={styles.chipGrid}>
                {OCCASIONS.map((occ) => (
                  <TouchableOpacity
                    key={occ.key}
                    onPress={() => setSelectedOccasion(occ.key)}
                    style={[
                      styles.chipWrapper,
                      { width: '48%' }, // 2 per row
                    ]}
                  >
                    <View
                      style={[
                        styles.chip,
                        selectedOccasion === occ.key && styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          selectedOccasion === occ.key && styles.chipLabelSelected,
                        ]}
                      >
                        {occ.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Style Profile Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Your Style</Text>
              <View style={styles.profileGrid}>
                {SCORING_PROFILES.map((profile) => (
                  <TouchableOpacity
                    key={profile.key}
                    onPress={() => setSelectedProfile(profile.key)}
                    style={styles.profileCard}
                  >
                    <View
                      style={[
                        styles.profileBox,
                        selectedProfile === profile.key && styles.profileBoxSelected,
                      ]}
                    >
                      <Text style={styles.profileTitle}>{profile.label}</Text>
                      <Text style={styles.profileDesc}>{profile.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Top K Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How Many Options?</Text>
              <View style={styles.topKContainer}>
                {TOP_K_OPTIONS.map((k) => (
                  <TouchableOpacity
                    key={k}
                    onPress={() => setSelectedTopK(k)}
                    style={[
                      styles.topKButton,
                      selectedTopK === k && styles.topKButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.topKText,
                        selectedTopK === k && styles.topKTextSelected,
                      ]}
                    >
                      {k}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info Text */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                Our AI will analyze your wardrobe and create {selectedTopK} personalized outfit
                combinations based on your selections.
              </Text>
            </View>

            <View style={{ height: Spacing.xl }} />
          </ScrollView>

          {/* Action Buttons */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', Colors.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.actionGradient}
          >
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelBtn, isLoading && styles.disabled]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.generateBtn, isLoading && styles.disabled]}
                onPress={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.background} />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={18} color={Colors.background} />
                    <Text style={styles.generateBtnText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    minHeight: '70%',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Occasion Chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chipWrapper: {
    marginBottom: Spacing.md,
  },
  chip: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  chipLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  chipLabelSelected: {
    fontWeight: FontWeight.bold,
    color: Colors.accent,
  },

  // Style Profile Cards
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileCard: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  profileBox: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  profileBoxSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  profileTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  profileDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Top K Selection
  topKContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  topKButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topKButtonSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  topKText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  topKTextSelected: {
    color: Colors.accent,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm + 4,
  },

  // Action Buttons
  actionGradient: {
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  generateBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  generateBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.background,
  },
  disabled: {
    opacity: 0.6,
  },
});
