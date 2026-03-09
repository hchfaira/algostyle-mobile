/**
 * Social / People feed types, mock data & helpers.
 */

// ─── Types ────────────────────────────────────────────────────
export interface UserOutfitPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  outfitName: string;
  description: string;
  items: { id: string; color: string; category: string }[];
  imageUrl?: string;
  occasion: string;
  likes: number;
  comments: number;
  liked: boolean;
  timestamp: string;
  createdBy: 'user' | 'ai';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

// ─── Mock Data ────────────────────────────────────────────────
export const MOCK_POSTS: UserOutfitPost[] = [
  {
    id: '1', userId: 'user1', userName: 'Sarah Chen', userAvatar: '👩‍🦰',
    outfitName: 'Minimalist Monday',
    description: 'AI suggested this perfect office look. Loving the monochrome vibes! ✨',
    items: [
      { id: '1', color: '#000000', category: 'top' },
      { id: '2', color: '#F5F5F5', category: 'bottom' },
      { id: '3', color: '#333333', category: 'shoes' },
    ],
    occasion: 'Office', likes: 342, comments: 28, liked: false, timestamp: '2h ago', createdBy: 'ai',
  },
  {
    id: '2', userId: 'user2', userName: 'Marcus Williams', userAvatar: '👨‍🦱',
    outfitName: 'Weekend Casual',
    description: 'Just put this together from my wardrobe. Perfect for brunch! ☕',
    items: [
      { id: '1', color: '#8B4513', category: 'top' },
      { id: '2', color: '#CCCCCC', category: 'bottom' },
      { id: '3', color: '#FFFFFF', category: 'shoes' },
    ],
    occasion: 'Casual', likes: 521, comments: 45, liked: true, timestamp: '4h ago', createdBy: 'user',
  },
  {
    id: '3', userId: 'user3', userName: 'Emma Thompson', userAvatar: '👩‍🦳',
    outfitName: 'Date Night Ready',
    description: 'AlgoStyle helped me find the perfect evening look. Feeling confident! 💃',
    items: [
      { id: '1', color: '#1a1a1a', category: 'dress' },
      { id: '2', color: '#FFD700', category: 'accessory' },
      { id: '3', color: '#000000', category: 'shoes' },
    ],
    occasion: 'Night Out', likes: 1203, comments: 89, liked: false, timestamp: '1h ago', createdBy: 'ai',
  },
  {
    id: '4', userId: 'user4', userName: 'Alex Park', userAvatar: '👨‍💼',
    outfitName: 'Business Professional',
    description: 'Classic tailored look. Always reliable! 🎩',
    items: [
      { id: '1', color: '#002147', category: 'top' },
      { id: '2', color: '#1a1a1a', category: 'bottom' },
      { id: '3', color: '#8B0000', category: 'accessory' },
    ],
    occasion: 'Business', likes: 234, comments: 12, liked: false, timestamp: '6h ago', createdBy: 'user',
  },
];

export const SEED_COMMENTS: Comment[] = [
  { id: '1', userId: 'user5', userName: 'Jessica Liu', userAvatar: '👩‍🦲', content: 'Absolutely love this look! The proportions are perfect.', timestamp: '2h ago' },
  { id: '2', userId: 'user6', userName: 'David Kumar', userAvatar: '👨‍🦯', content: 'This is fire! 🔥', timestamp: '1h ago' },
];
