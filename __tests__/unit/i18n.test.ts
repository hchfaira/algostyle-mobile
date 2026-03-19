/**
 * Tests for the i18n module.
 */
import { t, setLocale, getLocale, bi } from '../../i18n';

describe('i18n', () => {
  afterEach(() => {
    // Reset locale to default after each test
    setLocale('fr');
  });

  it('defaults to French locale', () => {
    expect(getLocale()).toBe('fr');
  });

  it('translates a key in French', () => {
    setLocale('fr');
    expect(t('planThisLook')).toBe('Planifier cette tenue');
  });

  it('translates a key in English', () => {
    setLocale('en');
    expect(t('planThisLook')).toBe('Plan this look');
  });

  it('accepts explicit locale override', () => {
    setLocale('fr'); // current is French
    expect(t('noDate', 'en')).toBe('No date');
    expect(t('noDate', 'fr')).toBe('Pas de date');
  });

  it('falls back to English for unknown keys', () => {
    // @ts-expect-error testing unknown key
    const result = t('UNKNOWN_KEY_XYZ');
    // Should return the key itself as fallback
    expect(result).toBe('UNKNOWN_KEY_XYZ');
  });

  it('setLocale persists across calls', () => {
    setLocale('en');
    expect(t('upcoming')).toBe('UPCOMING');
    expect(t('past')).toBe('PAST');
  });

  it('bi() returns "FR / EN" format', () => {
    const result = bi('noDate');
    expect(result).toBe('Pas de date / No date');
  });

  it('translates confirm in both locales', () => {
    expect(t('confirm', 'fr')).toBe('Confirmer');
    expect(t('confirm', 'en')).toBe('Confirm');
  });

  it('translates reminderBefore in both locales', () => {
    expect(t('reminderBefore', 'fr')).toBe('avant');
    expect(t('reminderBefore', 'en')).toBe('before');
  });

  it('translates source tags', () => {
    expect(t('sourceAI', 'fr')).toBe('✦ IA');
    expect(t('sourceAI', 'en')).toBe('✦ AI');
  });
});
