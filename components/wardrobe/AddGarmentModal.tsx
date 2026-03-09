/**
 * AddGarmentModal — Category picker for adding garments
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { ADD_MENU_ITEMS, CATEGORY_ICONS } from './constants';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddGarment: (category?: string) => void;
}

export default function AddGarmentModal({ visible, onClose, onAddGarment }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>ADD TO WARDROBE</Text>
          <Text style={styles.subtitle}>Choose a category or let AI detect it automatically</Text>
          <View style={styles.grid}>
            {ADD_MENU_ITEMS.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={styles.item}
                activeOpacity={0.7}
                onPress={() => onAddGarment(opt.cat)}
              >
                <View style={styles.itemIcon}>
                  <Ionicons
                    name={opt.cat ? ((CATEGORY_ICONS[opt.cat] || 'cube-outline') as any) : 'camera-outline'}
                    size={22}
                    color={Colors.textPrimary}
                  />
                </View>
                <Text style={styles.itemLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  item: {
    alignItems: 'center',
    width: (SCREEN_W - Spacing.lg * 2 - Spacing.md * 3) / 4,
    gap: Spacing.sm,
  },
  itemIcon: {
    width: 52,
    height: 52,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
