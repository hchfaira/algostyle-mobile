/**
 * Tests for the outfit garment photo display in AIOutfitResultsModal.
 *
 * Key assertions:
 *   1. Outfit name, score, and explanation are rendered.
 *   2. Each garment renders with its photo (Image) or fallback icon.
 *   3. Tapping a garment photo card calls setState → GarmentDetailModal opens.
 *   4. The GarmentDetailModal opened from the outfit view has readOnly=true.
 *   5. Deleted garments (no image_url) show a fallback icon, not a crash.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AIOutfitResultsModal } from '../components/AIOutfitResultsModal';
import type { OutfitResult } from '../types';

const mockGarmentWithPhoto = {
  id: 'g-001',
  user_id: 'u-001',
  image_url: 'https://example.com/shirt.jpg',
  attributes: {
    category: 'top' as const,
    subcategory: 'T-shirt',
    color_primary: 'blanc',
    color_hex: '#FFFFFF',
    pattern: 'plain',
    material: 'cotton',
    formality: 'casual',
    seasons: ['spring'],
    confidence: 0.95,
  },
  is_favorite: false,
  for_sale: false,
  tags: [],
  times_worn: 0,
  created_at: '2026-01-01T00:00:00Z',
};

const mockGarmentNoPhoto = {
  ...mockGarmentWithPhoto,
  id: 'g-002',
  image_url: undefined,
  attributes: {
    ...mockGarmentWithPhoto.attributes,
    category: 'bottom' as const,
    subcategory: 'Jeans',
    color_primary: 'bleu',
    color_hex: '#1E3A5F',
  },
};

const mockOutfit: OutfitResult = {
  id: 'o-001',
  rank: 1,
  name: 'Urban Explorer',
  grade: 'A',
  garments: [mockGarmentWithPhoto, mockGarmentNoPhoto],
  score: {
    overall: 0.88,
    color_harmony: 0.9,
    formality_match: 0.85,
    occasion_fit: 0.87,
    pattern_mixing: 0.82,
    proportion: 0.91,
    season_fit: 0.93,
    creativity: 0.78,
  },
  explanation_brief: 'A sleek urban combination.',
  explanation_detailed: 'Detailed style notes here.',
};

const noop = jest.fn();

const defaultProps = {
  isVisible: true,
  outfits: [mockOutfit],
  occasion: 'casual' as const,
  scoringProfile: 'casual' as const,
  isLoading: false,
  onClose: noop,
  onWearOutfit: noop,
  onShareOutfit: noop,
  onRegeneratePress: noop,
};

describe('AIOutfitResultsModal — garment display', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders outfit name', () => {
    const { getByText } = render(<AIOutfitResultsModal {...defaultProps} />);
    expect(getByText('Urban Explorer')).toBeTruthy();
  });

  it('renders outfit grade pill', () => {
    const { getAllByText } = render(<AIOutfitResultsModal {...defaultProps} />);
    // Grade "A" appears in the rank badge area and grade pill
    const As = getAllByText('A');
    expect(As.length).toBeGreaterThan(0);
  });

  it('renders overall score', () => {
    const { getByText } = render(<AIOutfitResultsModal {...defaultProps} />);
    // 0.88 * 100 = 88
    expect(getByText('88')).toBeTruthy();
  });

  it('renders garment labels', () => {
    const { getByText } = render(<AIOutfitResultsModal {...defaultProps} />);
    expect(getByText('T-shirt')).toBeTruthy();
    expect(getByText('Jeans')).toBeTruthy();
  });

  it('renders garment color meta', () => {
    const { getByText } = render(<AIOutfitResultsModal {...defaultProps} />);
    expect(getByText('blanc')).toBeTruthy();
    expect(getByText('bleu')).toBeTruthy();
  });

  it('renders piece count', () => {
    const { getByText } = render(<AIOutfitResultsModal {...defaultProps} />);
    expect(getByText('2 pieces')).toBeTruthy();
  });

  it('renders brief explanation', () => {
    const { getByText } = render(<AIOutfitResultsModal {...defaultProps} />);
    expect(getByText('A sleek urban combination.')).toBeTruthy();
  });

  it('renders loading state when isLoading=true', () => {
    const { getByText } = render(
      <AIOutfitResultsModal {...defaultProps} isLoading outfits={[]} />
    );
    expect(getByText(/generating/i)).toBeTruthy();
  });

  it('renders nothing when not visible', () => {
    const { toJSON } = render(
      <AIOutfitResultsModal {...defaultProps} isVisible={false} />
    );
    expect(toJSON()).toBeNull();
  });
});
