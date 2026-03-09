import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { Button } from '../ui';
import type { FeatureCard } from './constants';

interface ExpandedCardSheetProps {
  feature: FeatureCard;
  onClose: () => void;
}

export function ExpandedCardSheet({ feature, onClose }: ExpandedCardSheetProps) {
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <Ionicons name={feature.icon} size={24} color={Colors.textPrimary} />
          </View>
          <Text style={styles.headerTitle}>{feature.title}</Text>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Main text */}
          <Text style={styles.details}>{feature.details}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Actions */}
          <Text style={styles.actionsLabel}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {feature.actions.map((action, i) => (
              <TouchableOpacity key={i} style={styles.actionBtn} activeOpacity={0.7}>
                {action.icon ? (
                  <Ionicons name={action.icon} size={18} color={Colors.accent} />
                ) : null}
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Full-width CTA */}
          <Button
            title="Explore this feature"
            onPress={onClose}
            variant="primary"
            fullWidth
            icon={<Ionicons name="arrow-forward" size={16} color="#FFF" />}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: 52,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerIcon: {
    width: 44,
    height: 44,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: 120,
  },
  details: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  actionsLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
});
