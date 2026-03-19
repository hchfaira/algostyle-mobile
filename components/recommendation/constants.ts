/**
 * Recommendation-specific types, constants & sample data.
 */
import type { Occasion, ScoringProfile } from '../../types';

// ─── Reminder ────────────────────────────────────────────────
export type ReminderType = 'none' | 'push' | 'email';

export interface ReminderSetting {
  type: ReminderType;
  minutes_before: number; // 0–10080 (1 week)
}

// ─── Types ────────────────────────────────────────────────────
export type AgendaEntry = {
  id: string;
  outfitName: string;
  date: string;          // display label e.g. "Mon 9"
  fullDate: string;      // ISO-8601 or "Mar 9, 2026"
  plannedDate?: string;  // ISO-8601 datetime string (with TZ)
  location: string;
  occasion: string;
  coordinate: { latitude: number; longitude: number };
  color: string;         // dot colour for garment
  // reminder
  reminder?: ReminderSetting;
  userTimezone?: string;
  // source: how the outfit was created
  source?: 'build' | 'ai' | 'score' | 'prompt';
  // AI scoring info (optional)
  aiGrade?: string;
  aiScore?: number;
  outfitId?: string;     // backend outfit ID (for PATCH /plan)
};

// ─── Occasions ────────────────────────────────────────────────
export const OCCASIONS: { key: Occasion; label: string }[] = [
  { key: 'casual',    label: 'Casual' },
  { key: 'business',  label: 'Business' },
  { key: 'formal',    label: 'Formal' },
  { key: 'date',      label: 'Date' },
  { key: 'party',     label: 'Party' },
  { key: 'wedding',   label: 'Wedding' },
  { key: 'interview', label: 'Interview' },
  { key: 'sport',     label: 'Sport' },
  { key: 'travel',    label: 'Travel' },
  { key: 'beach',     label: 'Beach' },
];

// ─── Scoring Profiles ─────────────────────────────────────────
export const SCORING_PROFILES: { key: ScoringProfile; label: string; desc: string }[] = [
  { key: 'default',    label: 'Balanced',  desc: 'Even scoring' },
  { key: 'minimalist', label: 'Minimal',   desc: 'Clean lines' },
  { key: 'creative',   label: 'Creative',  desc: 'Bold combos' },
  { key: 'business',   label: 'Business',  desc: 'Professional' },
  { key: 'casual',     label: 'Casual',    desc: 'Relaxed' },
];

// ─── Reminder preset options ──────────────────────────────────
export const REMINDER_OPTIONS: { label: string; value: ReminderType; minutes: number }[] = [
  { label: 'Pas de rappel / No reminder',       value: 'none',  minutes: 0   },
  { label: '30 min avant / 30 min before',      value: 'push',  minutes: 30  },
  { label: '1h avant / 1h before',              value: 'push',  minutes: 60  },
  { label: 'Matin même / Morning of',           value: 'push',  minutes: 480 },
  { label: 'Veille soir / Evening before',      value: 'push',  minutes: 720 },
];

// ─── Sample Week Data (Mar 9–15, 2026) ───────────────────────
export const INITIAL_AGENDA: AgendaEntry[] = [
  { id: 'a1', outfitName: 'Urban Minimal',  date: 'Mon 9',  fullDate: 'Mar 9, 2026',  plannedDate: '2026-03-09T09:00:00Z', location: 'Office, Downtown',      occasion: 'Business',   coordinate: { latitude: 48.8566, longitude: 2.3522 }, color: '#2D2D2D' },
  { id: 'a2', outfitName: 'Coastal Breeze', date: 'Tue 10', fullDate: 'Mar 10, 2026', plannedDate: '2026-03-10T10:00:00Z', location: 'Café, Marais',          occasion: 'Casual',     coordinate: { latitude: 48.8600, longitude: 2.3620 }, color: '#5B8FA8' },
  { id: 'a3', outfitName: 'Noir Elegance',  date: 'Wed 11', fullDate: 'Mar 11, 2026', plannedDate: '2026-03-11T19:00:00Z', location: 'Gallery, Le Marais',    occasion: 'Date Night', coordinate: { latitude: 48.8584, longitude: 2.3488 }, color: '#1A1A1A' },
  { id: 'a4', outfitName: 'Sport Luxe',     date: 'Thu 12', fullDate: 'Mar 12, 2026', plannedDate: '2026-03-12T07:00:00Z', location: 'Gym, Bastille',         occasion: 'Sport',      coordinate: { latitude: 48.8531, longitude: 2.3698 }, color: '#018849' },
  { id: 'a5', outfitName: 'Friday Layers',  date: 'Fri 13', fullDate: 'Mar 13, 2026', plannedDate: '2026-03-13T20:00:00Z', location: 'Rooftop Bar, Opéra',    occasion: 'Party',      coordinate: { latitude: 48.8710, longitude: 2.3320 }, color: '#D01345' },
  { id: 'a6', outfitName: 'Weekend Stroll', date: 'Sat 14', fullDate: 'Mar 14, 2026', plannedDate: '2026-03-14T11:00:00Z', location: 'Jardin du Luxembourg',  occasion: 'Casual',     coordinate: { latitude: 48.8462, longitude: 2.3372 }, color: '#8B7355' },
  { id: 'a7', outfitName: 'Sunday Brunch',  date: 'Sun 15', fullDate: 'Mar 15, 2026', plannedDate: '2026-03-15T11:00:00Z', location: 'Le Comptoir, 6e',       occasion: 'Casual',     coordinate: { latitude: 48.8512, longitude: 2.3388 }, color: '#C19A6B' },
];
