import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import type { MenuItemDef } from './constants';

interface SettingsMenuProps {
  menuItems: MenuItemDef[];
}

export function SettingsMenu({ menuItems }: SettingsMenuProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>SETTINGS</Text>
      {menuItems.map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem} onPress={item.action} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name={item.icon} size={20} color={Colors.textPrimary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </View>
          <View style={styles.menuRight}>
            {item.value ? <Text style={styles.menuValue}>{item.value}</Text> : null}
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: 11, fontWeight: FontWeight.semibold, color: Colors.textSecondary,
    letterSpacing: 0.3, marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  menuLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: FontSize.sm, color: Colors.textMuted },
});
