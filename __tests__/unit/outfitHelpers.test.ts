/**
 * Unit tests for outfit score helpers used across modals.
 * These are pure functions that don't require React Native.
 */

// ─── Replicate the helpers under test ────────────────────────
// (pulled from AIOutfitResultsModal — we test the pure logic here)

function pct(v: number): number {
  return Math.round(v * 100);
}

function scoreColor(v: number): string {
  if (v >= 0.85) return '#4CAF50'; // Colors.success
  if (v >= 0.65) return '#F5A623'; // Colors.accentWarm
  return '#E53935'; // Colors.error
}

type Occasion =
  | 'casual' | 'business' | 'formal' | 'date'
  | 'party' | 'wedding' | 'interview'
  | 'sport' | 'travel' | 'beach';

function occasionEmoji(occ: Occasion): string {
  const map: Record<Occasion, string> = {
    casual: '😎', business: '💼', formal: '🎩', date: '💕',
    party: '🎉', wedding: '💒', interview: '📋',
    sport: '⚽', travel: '✈️', beach: '🏖️',
  };
  return map[occ] ?? '👔';
}

// ─── Tests ────────────────────────────────────────────────────

describe('pct()', () => {
  it('converts 0 to 0', () => expect(pct(0)).toBe(0));
  it('converts 1 to 100', () => expect(pct(1)).toBe(100));
  it('converts 0.88 to 88', () => expect(pct(0.88)).toBe(88));
  it('rounds 0.876 to 88', () => expect(pct(0.876)).toBe(88));
  it('rounds 0.875 to 88 (banker\'s rounding doesn\'t apply — Math.round)', () =>
    expect(pct(0.875)).toBe(88));
});

describe('scoreColor()', () => {
  it('returns success green for score >= 0.85', () => {
    expect(scoreColor(0.85)).toBe('#4CAF50');
    expect(scoreColor(1.0)).toBe('#4CAF50');
    expect(scoreColor(0.92)).toBe('#4CAF50');
  });

  it('returns warm amber for score >= 0.65 and < 0.85', () => {
    expect(scoreColor(0.65)).toBe('#F5A623');
    expect(scoreColor(0.75)).toBe('#F5A623');
    expect(scoreColor(0.84)).toBe('#F5A623');
  });

  it('returns error red for score < 0.65', () => {
    expect(scoreColor(0.0)).toBe('#E53935');
    expect(scoreColor(0.5)).toBe('#E53935');
    expect(scoreColor(0.64)).toBe('#E53935');
  });
});

describe('occasionEmoji()', () => {
  it('returns correct emoji for each occasion', () => {
    expect(occasionEmoji('casual')).toBe('😎');
    expect(occasionEmoji('business')).toBe('💼');
    expect(occasionEmoji('formal')).toBe('🎩');
    expect(occasionEmoji('date')).toBe('💕');
    expect(occasionEmoji('party')).toBe('🎉');
    expect(occasionEmoji('wedding')).toBe('💒');
    expect(occasionEmoji('interview')).toBe('📋');
    expect(occasionEmoji('sport')).toBe('⚽');
    expect(occasionEmoji('travel')).toBe('✈️');
    expect(occasionEmoji('beach')).toBe('🏖️');
  });
});

describe('garment fallback logic', () => {
  interface Garment {
    image_url?: string;
    attributes: { color_hex?: string };
  }

  function hasPhoto(g: Garment): boolean {
    return !!g.image_url;
  }

  function swatchColor(g: Garment): string {
    return g.attributes.color_hex || '#D0C8BE';
  }

  it('detects garment with image_url', () => {
    expect(hasPhoto({ image_url: 'https://example.com/shirt.jpg', attributes: {} })).toBe(true);
  });

  it('detects deleted garment (no image_url)', () => {
    expect(hasPhoto({ image_url: undefined, attributes: {} })).toBe(false);
    expect(hasPhoto({ attributes: {} })).toBe(false);
  });

  it('uses color_hex for swatch', () => {
    expect(swatchColor({ attributes: { color_hex: '#FF0000' } })).toBe('#FF0000');
  });

  it('falls back to default swatch color when no color_hex', () => {
    expect(swatchColor({ attributes: {} })).toBe('#D0C8BE');
  });
});
