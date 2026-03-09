/**
 * OutfitMap — Native implementation using react-native-maps
 * This file is loaded on iOS / Android only.
 */
import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';

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

const MAP_HEIGHT = 220;

export default function OutfitMap({ entries, selectedId, onSelectEntry }: OutfitMapProps) {
  const mapRef = useRef<MapView>(null);

  const handleMarkerPress = (entry: MapEntry) => {
    onSelectEntry(entry.id);
    mapRef.current?.animateToRegion({
      ...entry.coordinate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 600);
  };

  const selected = selectedId ? entries.find(e => e.id === selectedId) : null;

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={{
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {entries.map((entry) => (
          <Marker
            key={entry.id}
            coordinate={entry.coordinate}
            title={entry.outfitName}
            description={`${entry.date} — ${entry.location}`}
            pinColor={selectedId === entry.id ? Colors.accentWarm : entry.color}
            onPress={() => handleMarkerPress(entry)}
          />
        ))}
      </MapView>
      {selected && (
        <View style={s.tooltip}>
          <View style={[s.tooltipDot, { backgroundColor: selected.color }]} />
          <View style={s.tooltipContent}>
            <Text style={s.tooltipName}>{selected.outfitName}</Text>
            <Text style={s.tooltipInfo}>{selected.date}  ·  {selected.location}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { position: 'relative' },
  map: { width: '100%', height: MAP_HEIGHT },
  tooltip: {
    position: 'absolute', bottom: Spacing.md, left: Spacing.md, right: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)', padding: Spacing.md,
    borderRadius: BorderRadius.md, ...Shadow.md,
  },
  tooltipDot: { width: 14, height: 14, borderRadius: 7 },
  tooltipContent: { flex: 1 },
  tooltipName: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  tooltipInfo: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
});
