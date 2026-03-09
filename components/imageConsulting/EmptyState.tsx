/**
 * EmptyState — shown when no consulting result exists yet
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';

interface Props {
  onPress: () => void;
}

export default function EmptyState({ onPress }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.wrap}>
      <Ionicons name="color-wand-outline" size={64} color={Colors.textMuted} />
      <Text style={styles.title}>No Image Consulting yet</Text>
      <Text style={styles.subtitle}>
        Take or upload a full-body photo to receive your personalised colour palette,
        body-shape guidance, and style tips.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.85}>
        <Ionicons name="camera-outline" size={18} color={Colors.textOnAccent} />
        <Text style={styles.btnText}>Start My Image Consulting</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl, gap: 12,
  },
  title: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: BorderRadius.md, paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
  },
  btnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textOnAccent },
});
