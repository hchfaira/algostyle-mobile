/**
 * OutfitHistoryDetailModal — Shows full outfit detail card from history/agenda
 *
 * Features:
 * - Full outfit context, place, time
 * - Wardrobe items list
 * - Composite image placeholder (for diffusion model output)
 * - Try On button (or Show My Try-On if already generated)
 * - Share to People tab button
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
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

interface AgendaEntry {
  id: string;
  outfitName: string;
  date: string;
  fullDate: string;
  location: string;
  occasion: string;
  coordinate: { latitude: number; longitude: number };
  color: string;
}

interface OutfitHistoryDetailModalProps {
  visible: boolean;
  outfit: AgendaEntry | null;
  hasVirtualTryOn?: boolean;
  tryOnImageUrl?: string;
  onClose: () => void;
  onTryOn?: (outfitId: string) => void;
  onShare?: (outfit: AgendaEntry) => void;
}

export function OutfitHistoryDetailModal({
  visible,
  outfit,
  hasVirtualTryOn = false,
  tryOnImageUrl,
  onClose,
  onTryOn,
  onShare,
}: OutfitHistoryDetailModalProps) {
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);

  if (!outfit) return null;

  const handleTryOn = async () => {
    setIsGeneratingTryOn(true);
    try {
      onTryOn?.(outfit.id);
    } finally {
      setIsGeneratingTryOn(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{outfit.outfitName}</Text>
              <Text style={styles.headerSubtitle}>{outfit.occasion}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Context Tags */}
            <View style={styles.contextRow}>
              <View style={styles.contextTag}>
                <Ionicons name="calendar" size={14} color={Colors.accent} />
                <Text style={styles.contextText}>{outfit.fullDate}</Text>
              </View>
              <View style={styles.contextTag}>
                <Ionicons name="location" size={14} color={Colors.accent} />
                <Text style={styles.contextText} numberOfLines={1}>
                  {outfit.location}
                </Text>
              </View>
            </View>

            {/* Garment Items Preview */}
            <Text style={styles.sectionTitle}>WARDROBE ITEMS</Text>
            <View style={styles.garmentPreview}>
              <View
                style={[
                  styles.garmentCircle,
                  { backgroundColor: outfit.color },
                ]}
              >
                <Ionicons name="shirt-outline" size={28} color="rgba(255,255,255,0.8)" />
              </View>
              <Text style={styles.garmentPreviewText}>
                Outfit includes 4-6{'\n'}
                carefully selected items
              </Text>
            </View>

            {/* Composite Image Placeholder */}
            <Text style={styles.sectionTitle}>OUTFIT VISUALIZATION</Text>
            <View style={styles.compositeImageContainer}>
              <View style={styles.compositeImagePlaceholder}>
                <Ionicons name="image" size={48} color={Colors.textMuted} />
                <Text style={styles.compositeImageText}>
                  Diffusion model output{'\n'}(Coming soon)
                </Text>
              </View>
            </View>

            {/* Existing Try-On Preview */}
            {hasVirtualTryOn && tryOnImageUrl && (
              <>
                <Text style={styles.sectionTitle}>YOUR TRY-ON</Text>
                <View style={styles.tryOnPreview}>
                  <View style={styles.tryOnPlaceholder}>
                    <Ionicons name="person" size={48} color={Colors.textMuted} />
                    <Text style={styles.tryOnText}>Your virtual try-on preview</Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionBtn, hasVirtualTryOn && styles.actionBtnSecondary]}
              onPress={handleTryOn}
              disabled={isGeneratingTryOn}
            >
              {isGeneratingTryOn ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <>
                  <Ionicons
                    name={hasVirtualTryOn ? 'eye' : 'sparkles'}
                    size={18}
                    color={Colors.accent}
                  />
                  <Text style={styles.actionBtnText}>
                    {hasVirtualTryOn ? 'SHOW MY TRY-ON' : 'TRY ON'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onShare?.(outfit)}
            >
              <Ionicons name="share-social" size={18} color={Colors.textPrimary} />
              <Text style={styles.actionBtnText} numberOfLines={1}>
                SHARE
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  contextRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  contextTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: BorderRadius.sm,
  },
  contextText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.accent,
    letterSpacing: 0.3,
    maxWidth: 200,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  garmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  garmentCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentPreviewText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: FontWeight.medium,
  },
  compositeImageContainer: {
    marginBottom: Spacing.lg,
  },
  compositeImagePlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  compositeImageText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  tryOnPreview: {
    marginBottom: Spacing.lg,
  },
  tryOnPlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  tryOnText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
  },
  actionBtnSecondary: {
    backgroundColor: 'rgba(13, 110, 253, 0.08)',
    borderColor: Colors.textSecondary,
  },
  actionBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
