/**
 * OutfitMap — Web fallback (no react-native-maps on web)
 * Shows an interactive location list with colored pins.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';

export type MapEntry = {
  id: string;
  outfitName: string;
  date: string;
  location: string;
  color: string;
  coordinate: { latitude: number; longitude: number };
};

type OutfitMapProps = {
  entries: MapEntry[];
  selectedId: string | null;
  onSelectEntry: (id: string) => void;
};

export default function OutfitMap({ entries, selectedId, onSelectEntry }: OutfitMapProps) {
  return (
    <View style={s.container}>
      {entries.map((entry) => {
        const isSelected = selectedId === entry.id;
        return (
          <TouchableOpacity
            key={entry.id}
            onPress={() => onSelectEntry(isSelected ? '' : entry.id)}
            activeOpacity={0.7}
            style={[s.row, isSelected && s.rowSelected]}
          >
            <View style={[s.pin, { backgroundColor: entry.color }]}>
              <Ionicons name="location-sharp" size={14} color="#FFF" />
            </View>
            <View style={s.info}>
              <Text style={s.name}>{entry.outfitName}</Text>
              <Text style={s.location}>{entry.location}</Text>
            </View>
            <Text style={s.date}>{entry.date}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingVertical: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowSelected: { backgroundColor: Colors.accent + '08' },
  pin: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  location: { fontSize: FontSize.xs, color: Colors.accentWarm, fontWeight: FontWeight.semibold },
  date: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase' },
});
