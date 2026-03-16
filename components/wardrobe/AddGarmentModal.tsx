/**
 * AddGarmentModal — Photo source picker (Camera / Gallery)
 * Opens the GarmentUploadFlow after source selection.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPickSource: (source: 'camera' | 'gallery') => void;
}

export default function AddGarmentModal({ visible, onClose, onPickSource }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <Text style={styles.title}>ADD GARMENT</Text>
          <Text style={styles.subtitle}>Choose how to add your piece</Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.option}
              activeOpacity={0.75}
              onPress={() => { onClose(); onPickSource('camera'); }}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="camera-outline" size={28} color={Colors.textPrimary} />
              </View>
              <Text style={styles.optionTitle}>Take Photo</Text>
              <Text style={styles.optionSub}>Use your camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              activeOpacity={0.75}
              onPress={() => { onClose(); onPickSource('gallery'); }}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="image-outline" size={28} color={Colors.textPrimary} />
              </View>
              <Text style={styles.optionTitle}>From Gallery</Text>
              <Text style={styles.optionSub}>Pick existing photo</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 48,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 60,
    height: 60,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  optionSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
