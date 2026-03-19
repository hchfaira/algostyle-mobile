/**
 * Tests for GarmentDetailModal — specifically the hideDelete / readOnly props.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GarmentDetailModal from '../components/wardrobe/GarmentDetailModal';
import type { GarmentItem } from '../types';

const mockGarment: GarmentItem = {
  id: 'g-001',
  user_id: 'u-001',
  image_url: 'https://example.com/shirt.jpg',
  attributes: {
    category: 'top',
    subcategory: 'T-shirt',
    color_primary: 'blanc',
    color_hex: '#FFFFFF',
    pattern: 'plain',
    material: 'cotton',
    formality: 'casual',
    seasons: ['spring', 'summer'],
    confidence: 0.95,
  },
  is_favorite: false,
  for_sale: false,
  tags: [],
  times_worn: 0,
  created_at: '2026-01-01T00:00:00Z',
};

describe('GarmentDetailModal', () => {
  const noop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders garment name', () => {
    const { getByText } = render(
      <GarmentDetailModal
        visible
        item={mockGarment}
        analysis={null}
        loading={false}
        onClose={noop}
        onDelete={noop}
        onToggleFavorite={noop}
      />
    );
    expect(getByText('T-shirt')).toBeTruthy();
  });

  it('renders null when no item provided', () => {
    const { toJSON } = render(
      <GarmentDetailModal
        visible
        item={null}
        analysis={null}
        loading={false}
        onClose={noop}
        onDelete={noop}
        onToggleFavorite={noop}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('shows delete button by default', () => {
    const { UNSAFE_getAllByProps } = render(
      <GarmentDetailModal
        visible
        item={mockGarment}
        analysis={null}
        loading={false}
        onClose={noop}
        onDelete={noop}
        onToggleFavorite={noop}
      />
    );
    // trash-outline icon present means delete button is visible
    const trashIcons = UNSAFE_getAllByProps({ name: 'trash-outline' });
    expect(trashIcons.length).toBeGreaterThan(0);
  });

  it('hides delete button when hideDelete=true', () => {
    const { UNSAFE_queryAllByProps } = render(
      <GarmentDetailModal
        visible
        item={mockGarment}
        analysis={null}
        loading={false}
        onClose={noop}
        onDelete={noop}
        onToggleFavorite={noop}
        hideDelete
      />
    );
    const trashIcons = UNSAFE_queryAllByProps({ name: 'trash-outline' });
    expect(trashIcons.length).toBe(0);
  });

  it('hides both actions when readOnly=true', () => {
    const { UNSAFE_queryAllByProps } = render(
      <GarmentDetailModal
        visible
        item={mockGarment}
        analysis={null}
        loading={false}
        onClose={noop}
        onDelete={noop}
        onToggleFavorite={noop}
        readOnly
      />
    );
    const trashIcons = UNSAFE_queryAllByProps({ name: 'trash-outline' });
    const heartIcons = UNSAFE_queryAllByProps({ name: 'heart-outline' });
    expect(trashIcons.length).toBe(0);
    expect(heartIcons.length).toBe(0);
  });

  it('calls onClose when CLOSE button pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <GarmentDetailModal
        visible
        item={mockGarment}
        analysis={null}
        loading={false}
        onClose={onClose}
        onDelete={noop}
        onToggleFavorite={noop}
      />
    );
    fireEvent.press(getByText('CLOSE'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
