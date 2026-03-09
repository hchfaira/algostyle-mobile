/**
 * useMarketplaceFilters — custom hook for marketplace filter & sort state.
 */
import { useState, useMemo, useCallback } from 'react';
import {
  Source, Category, Condition, SortKey, ListingItem,
  activeFilterCount, MOCK_LISTINGS,
} from '../components/marketplace/constants';

export function useMarketplaceFilters() {
  const [source, setSource] = useState<Source>('all');
  const [category, setCategory] = useState<Category>('all');
  const [condition, setCondition] = useState<Condition>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(MOCK_LISTINGS.filter((l) => l.isFavorited).map((l) => l.id)),
  );

  const filterCount = activeFilterCount(source, condition, minPrice, maxPrice, selectedSizes, sort);

  const listings = useMemo(() => {
    let items: ListingItem[] = MOCK_LISTINGS.map((l) => ({
      ...l,
      isFavorited: favorites.has(l.id),
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.brand.toLowerCase().includes(q) ||
          l.colorName.toLowerCase().includes(q),
      );
    }
    if (source !== 'all') items = items.filter((l) => l.source === source);
    if (category !== 'all') items = items.filter((l) => l.category === category);
    if (condition !== 'all') items = items.filter((l) => l.condition === condition);
    if (minPrice) items = items.filter((l) => l.price >= Number(minPrice));
    if (maxPrice) items = items.filter((l) => l.price <= Number(maxPrice));
    if (selectedSizes.length > 0)
      items = items.filter((l) => selectedSizes.includes(l.size));

    switch (sort) {
      case 'price_asc':  items = [...items].sort((a, b) => a.price - b.price); break;
      case 'price_desc': items = [...items].sort((a, b) => b.price - a.price); break;
      case 'popular':    items = [...items].sort((a, b) => (b.sellerRating ?? 0) - (a.sellerRating ?? 0)); break;
      default: break;
    }
    return items;
  }, [source, category, condition, sort, minPrice, maxPrice, selectedSizes, searchQuery, favorites]);

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSize = useCallback((s: string) => {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSource('all');
    setCondition('all');
    setSort('recent');
    setMinPrice('');
    setMaxPrice('');
    setSelectedSizes([]);
  }, []);

  return {
    // filter state
    source, setSource,
    category, setCategory,
    condition, setCondition,
    sort, setSort,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    selectedSizes, toggleSize,
    searchQuery, setSearchQuery,
    // derived
    filterCount,
    listings,
    favorites,
    // actions
    toggleFav,
    resetFilters,
  };
}
