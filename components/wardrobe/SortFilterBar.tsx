/**
 * SortFilterBar — Secondary filter row below category tabs.
 * Lets the user sort the grid by Versatility / Redundancy / Seasonal / Impact.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import type { SortMode } from '../../types';

interface SortOption {
  key: SortMode;
  label: string;
  icon: string;
  activeColor: string;
  description: string;
}

const SORT_OPTIONS: SortOption[] = [
  {
    key: 'default',
    label: 'Default',
    icon: 'grid-outline',
    activeColor: Colors.accent,
    description: 'Original order',
  },
  {
    key: 'versatility',
    label: 'Versatility',
    icon: 'shuffle-outline',
    activeColor: '#018849',
    description: 'Most outfits first',
  },
  {
    key: 'redundancy',
    label: 'Redundancy',
    icon: 'copy-outline',
    activeColor: '#FF5722',
    description: 'Duplicates first',
  },
  {
    key: 'seasonal',
    label: 'Seasonal',
    icon: 'sunny-outline',
    activeColor: '#E6A817',
    description: 'Season-ready first',
  },
  {
    key: 'impact',
    label: 'Impact',
    icon: 'flash-outline',
    activeColor: '#7B2FBE',
    description: 'Most outfit loss if removed',
  },
];

interface Props {
  sortMode: SortMode;
  onChangeSortMode: (mode: SortMode) => void;
  loading?: boolean;
  currentSeason?: string;
}

export default function SortFilterBar({ sortMode, onChangeSortMode, loading, currentSeason }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {SORT_OPTIONS.map((opt) => {
          const isActive = sortMode === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.chip,
                isActive && { backgroundColor: opt.activeColor, borderColor: opt.activeColor },
              ]}
              activeOpacity={0.75}
              onPress={() => onChangeSortMode(opt.key)}
            >
              {isActive && loading ? (
                <ActivityIndicator size={11} color="#FFF" style={styles.chipIcon} />
              ) : (
                <Ionicons
                  name={opt.icon as any}
                  size={13}
                  color={isActive ? '#FFF' : Colors.textMuted}
                  style={styles.chipIcon}
                />
              )}
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {opt.label}
              </Text>
              {/* Season badge on Seasonal chip */}
              {opt.key === 'seasonal' && currentSeason && isActive && (
                <View style={styles.seasonBadge}>
                  <Text style={styles.seasonBadgeText}>{currentSeason.toUpperCase().slice(0, 3)}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active mode description */}
      {sortMode !== 'default' && (
        <View style={styles.descRow}>
          <Ionicons name="information-circle-outline" size={12} color={Colors.textMuted} style={styles.descIcon} />
          <Text style={styles.desc}>{
            (SORT_OPTIONS.find((o) => o.key === sortMode)?.description ?? '') +
            (sortMode === 'seasonal' && currentSeason ? ' · ' + currentSeason + ' now' : '')
          }</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  row: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
    marginRight: Spacing.sm,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  chipLabelActive: {
    color: '#FFF',
  },
  seasonBadge: {
    marginLeft: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  seasonBadgeText: {
    fontSize: 8,
    fontWeight: FontWeight.black,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 4,
  },
  descIcon: {
    marginRight: 4,
  },
  desc: {
    fontSize: 10,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
