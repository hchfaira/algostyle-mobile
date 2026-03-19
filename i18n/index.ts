/**
 * i18n — Lightweight localization for AlgoStyle mobile app.
 *
 * Usage:
 *   import { t, setLocale, getLocale } from '../../i18n';
 *   t('planThisLook')          // uses current locale
 *   t('planThisLook', 'en')    // explicit locale
 *
 * Default locale: 'fr'.  Override via setLocale('en').
 * The bilingual "FR / EN" inline strings in older components are
 * still supported but new components should call t() directly.
 */

export type Locale = 'fr' | 'en';

// ─── String catalogue ─────────────────────────────────────────

const strings = {
  fr: {
    // ── Generic actions ────────────────────────────────────────
    confirm: 'Confirmer',
    cancel: 'Annuler',
    close: 'Fermer',
    save: 'Enregistrer',
    delete: 'Supprimer',
    add: 'Ajouter',
    edit: 'Modifier',
    share: 'Partager',
    noDate: 'Pas de date',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    yesterday: 'Hier',

    // ── Outfit planning ────────────────────────────────────────
    planThisLook: 'Planifier cette tenue',
    planOutfit: 'Planifier / Plan Outfit',
    planSubtitle: 'Choisir une date & rappel',
    planWeek: 'Semaine',
    wearThis: 'PORTER',
    selectDay: 'Jour',
    selectTime: 'Heure',
    reminder: 'Rappel',
    forOutfit: 'pour',
    noReminder: 'Pas de rappel',
    reminderBefore: 'avant',

    // ── Agenda ────────────────────────────────────────────────
    outfitAgenda: 'OUTFIT AGENDA',
    planned: 'planifiée(s)',
    upcoming: 'À VENIR',
    past: 'PASSÉ',
    noUpcoming: 'Aucune tenue planifiée',
    noPast: 'Aucune tenue passée',
    planOutfitsHere: 'Planifiez vos tenues ici',

    // ── Outfit history ────────────────────────────────────────
    outfitHistory: 'HISTORIQUE',

    // ── Garment display ───────────────────────────────────────
    garmentDeleted: 'Ce vêtement n\'est plus dans votre garde-robe',
    garmentDeletedShort: 'Supprimé',
    pieces: 'pièce(s)',
    outfitAnalysis: 'ANALYSE',
    outfitScore: 'SCORE',
    tapToSeeDetail: 'Appuyer pour voir le détail',

    // ── Score labels ───────────────────────────────────────────
    colorHarmony: 'Couleur',
    formalityMatch: 'Formalité',
    occasionFit: 'Occasion',
    patternMixing: 'Motifs',
    proportion: 'Proportions',
    seasonFit: 'Saison',
    creativity: 'Créativité',

    // ── Source tags ────────────────────────────────────────────
    sourceAI: '✦ IA',
    sourceScore: '★ Score',
    sourcePrompt: '💬 Prompt',
    sourceBuild: '🔧 Build',

    // ── Week planner ──────────────────────────────────────────
    weekPlanner: 'PLANIFICATEUR SEMAINE',
    addOutfitForDay: 'Ajouter une tenue',
    noOutfitThisWeek: 'Aucune tenue cette semaine',

    // ── Filters ───────────────────────────────────────────────
    filters: 'Filtres',
    filterSort: 'Trier',
    filterColor: 'Couleur',
    filterStyle: 'Style',
    filterApply: 'Appliquer',
    filterClear: 'Réinitialiser',
    filterActive: 'filtre(s) actif(s)',
    filterNoResults: 'Aucun résultat',
    filterResetSuggestion: 'Essayez de réinitialiser les filtres',
    filterShowingCount: 'résultat(s)',
    filterSortDefault: 'Par défaut',
    filterSortVersatility: 'Polyvalence',
    filterSortRedundancy: 'Redondance',
    filterSortSeasonal: 'Saison',
    filterSortImpact: 'Impact',
    filterAllColors: 'Toutes',
    filterAllStyles: 'Tous',
  },

  en: {
    // ── Generic actions ────────────────────────────────────────
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    add: 'Add',
    edit: 'Edit',
    share: 'Share',
    noDate: 'No date',
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',

    // ── Outfit planning ────────────────────────────────────────
    planThisLook: 'Plan this look',
    planOutfit: 'Plan Outfit',
    planSubtitle: 'Choose a date & reminder',
    planWeek: 'Week',
    wearThis: 'WEAR THIS',
    selectDay: 'Day',
    selectTime: 'Time',
    reminder: 'Reminder',
    forOutfit: 'for',
    noReminder: 'No reminder',
    reminderBefore: 'before',

    // ── Agenda ────────────────────────────────────────────────
    outfitAgenda: 'OUTFIT AGENDA',
    planned: 'planned',
    upcoming: 'UPCOMING',
    past: 'PAST',
    noUpcoming: 'No upcoming outfits',
    noPast: 'No past outfits',
    planOutfitsHere: 'Plan your outfits here',

    // ── Outfit history ────────────────────────────────────────
    outfitHistory: 'OUTFIT HISTORY',

    // ── Garment display ───────────────────────────────────────
    garmentDeleted: 'This garment is no longer in your wardrobe',
    garmentDeletedShort: 'Removed',
    pieces: 'piece(s)',
    outfitAnalysis: 'ANALYSIS',
    outfitScore: 'SCORE',
    tapToSeeDetail: 'Tap to see detail',

    // ── Score labels ───────────────────────────────────────────
    colorHarmony: 'Color',
    formalityMatch: 'Formality',
    occasionFit: 'Occasion',
    patternMixing: 'Pattern',
    proportion: 'Proportion',
    seasonFit: 'Season',
    creativity: 'Creativity',

    // ── Source tags ────────────────────────────────────────────
    sourceAI: '✦ AI',
    sourceScore: '★ Score',
    sourcePrompt: '💬 Prompt',
    sourceBuild: '🔧 Build',

    // ── Week planner ──────────────────────────────────────────
    weekPlanner: 'WEEK PLANNER',
    addOutfitForDay: 'Add an outfit',
    noOutfitThisWeek: 'No outfits this week',

    // ── Filters ───────────────────────────────────────────────
    filters: 'Filters',
    filterSort: 'Sort',
    filterColor: 'Color',
    filterStyle: 'Style',
    filterApply: 'Apply',
    filterClear: 'Reset',
    filterActive: 'active filter(s)',
    filterNoResults: 'No results',
    filterResetSuggestion: 'Try resetting the filters',
    filterShowingCount: 'result(s)',
    filterSortDefault: 'Default',
    filterSortVersatility: 'Versatility',
    filterSortRedundancy: 'Redundancy',
    filterSortSeasonal: 'Seasonal',
    filterSortImpact: 'Impact',
    filterAllColors: 'All',
    filterAllStyles: 'All',
  },
} as const;

export type StringKey = keyof typeof strings['en'];

// ─── Runtime locale state ─────────────────────────────────────

let _locale: Locale = 'en';

export function setLocale(locale: Locale): void {
  _locale = locale;
}

export function getLocale(): Locale {
  return _locale;
}

/**
 * Translate a key into the current (or specified) locale.
 * Falls back to English if the key is missing in the target locale.
 */
export function t(key: StringKey, locale?: Locale): string {
  const l = locale ?? _locale;
  return (strings[l] as Record<string, string>)[key]
    ?? (strings['en'] as Record<string, string>)[key]
    ?? key;
}

/**
 * Returns a bilingual string "FR / EN" — for backwards compatibility
 * with components that still use the inline bilingual format.
 */
export function bi(key: StringKey): string {
  return `${strings.fr[key]} / ${strings.en[key]}`;
}

/**
 * React hook that returns a bound translate function for the current locale.
 * Re-renders on locale change (simple ref — for a full reactive version,
 * replace with a Zustand-backed locale store slice).
 */
export function useTranslation(): { t: (key: StringKey) => string; locale: Locale; setLocale: (l: Locale) => void } {
  return {
    t: (key: StringKey) => t(key, _locale),
    locale: _locale,
    setLocale: (l: Locale) => {
      setLocale(l);
    },
  };
}
