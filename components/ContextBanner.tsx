/**
 * ContextBanner — Live weather single-line strip
 *
 * Displays the real context that feeds the HybridOutfitRecommender
 * in a compact one-line format:
 *   ⚡ CONTEXT  🌙 Clear · 11°C · Night · 71%  📍 Paris  ↻
 *
 * Fetches from GET /api/v1/recommend/context on mount.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { api } from '../services/api';

// ── Types ──────────────────────────────────────────────────────
type Condition = 'sunny' | 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy' | string;
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface ContextData {
  temperature_celsius: number;
  feels_like_celsius: number;
  condition: Condition;
  humidity: number;
  city_name: string;
  time_of_day: TimeOfDay;
  ai_context_summary: string;
  cached: boolean;
  error?: string;
}

function conditionMeta(c: Condition): { icon: string; color: string } {
  switch (c) {
    case 'sunny':   return { icon: '☀️', color: '#F5C542' };
    case 'clear':   return { icon: '🌙', color: '#A8C8E8' };
    case 'cloudy':  return { icon: '☁️', color: '#B0BEC5' };
    case 'rainy':   return { icon: '🌧️', color: '#64B5F6' };
    case 'snowy':   return { icon: '❄️', color: '#E3F2FD' };
    case 'foggy':   return { icon: '🌫️', color: '#CFD8DC' };
    case 'stormy':  return { icon: '⛈️', color: '#7E57C2' };
    default:        return { icon: '🌤️', color: '#FFB74D' };
  }
}

function timeIcon(tod: TimeOfDay): string {
  switch (tod) {
    case 'morning':   return '🌅';
    case 'afternoon': return '🌞';
    case 'evening':   return '🌆';
    case 'night':     return '🌃';
    default:          return '🕐';
  }
}

// ── Inline chip ─────────────────────────────────────────────────
function Chip({ children, accent }: { children: string; accent?: string }) {
  return (
    <View style={[chipStyles.chip, accent ? { borderColor: accent + '50' } : undefined]}>
      <Text style={[chipStyles.text, accent ? { color: accent } : undefined]}>{children}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
});

// ── Main component ──────────────────────────────────────────────
interface ContextBannerProps {
  city?: string;
}

export function ContextBanner({ city }: ContextBannerProps) {
  const [data, setData]       = useState<ContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const ctx = await api.getContext(city);
      setData(ctx);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => { load(); }, [load]);

  const cMeta = data ? conditionMeta(data.condition) : { icon: '🌤️', color: Colors.accentWarm };
  const todIcon = data ? timeIcon(data.time_of_day) : '🕐';
  const todLabel = data
    ? data.time_of_day.charAt(0).toUpperCase() + data.time_of_day.slice(1)
    : '';

  return (
    <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.container}>
      <View style={styles.row}>
        {/* Label */}
        <View style={styles.labelWrap}>
          <View style={[styles.dot, { backgroundColor: loading ? Colors.textMuted : Colors.success }]} />
          <Text style={styles.label}>CONTEXT</Text>
        </View>

        {/* Chips — scrollable if needed */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsScroll}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.textMuted} style={{ marginHorizontal: 4 }} />
          ) : error ? (
            <Chip>⚠ Offline</Chip>
          ) : data ? (
            <>
              <Chip accent={cMeta.color}>{`${cMeta.icon} ${data.condition.charAt(0).toUpperCase() + data.condition.slice(1)}`}</Chip>
              <Chip accent={cMeta.color}>{`🌡 ${data.temperature_celsius}°C`}</Chip>
              <Chip>{`${todIcon} ${todLabel}`}</Chip>
              <Chip>{`💧 ${data.humidity}%`}</Chip>
              <Chip>{`📍 ${data.city_name}`}</Chip>
            </>
          ) : null}
        </ScrollView>

        {/* Refresh */}
        <TouchableOpacity
          onPress={load}
          disabled={loading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.refreshBtn}
        >
          <Ionicons name="refresh" size={13} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingLeft: Spacing.md,
    paddingRight: 6,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: FontWeight.black,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  chipsScroll: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 4,
  },
  refreshBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
