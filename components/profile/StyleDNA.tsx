import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { DnaPill } from './DnaPill';
import type { UserProfile } from '../../types';

interface StyleDNAProps {
  profile: UserProfile;
}

export function StyleDNA({ profile }: StyleDNAProps) {
  return (
    <View style={styles.dnaSection}>
      <Text style={styles.sectionTitle}>YOUR STYLE DNA</Text>
      <View style={styles.dnaGrid}>
        <DnaPill label="Body" value={profile.body_analysis?.body_shape || '—'} />
        <DnaPill label="Location" value={profile.location || '—'} />
        <DnaPill label="Budget" value={profile.budget || '—'} />
        <DnaPill label="Comfort" value={String(profile.comfort_vs_style ?? '—')} />
      </View>
      {profile.style_preferences?.length > 0 && (
        <>
          <Text style={styles.dnaSubtitle}>Preferred styles</Text>
          <View style={styles.chipRow}>
            {profile.style_preferences.map((s: string) => (
              <View key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
            ))}
          </View>
        </>
      )}
      {profile.favorite_colors?.length > 0 && (
        <>
          <Text style={styles.dnaSubtitle}>Favourite colours</Text>
          <View style={styles.chipRow}>
            {profile.favorite_colors.map((c: string) => (
              <View key={c} style={styles.chipColor}>
                <View style={[styles.colorDot, { backgroundColor: c }]} />
                <Text style={styles.chipText}>{c}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dnaSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceLight,
  },
  sectionTitle: {
    fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.md,
  },
  dnaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  dnaSubtitle: {
    fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.xs, marginTop: Spacing.xs,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.accent },
  chipColor: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.border,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  chipText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textPrimary },
});
