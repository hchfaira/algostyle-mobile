import type { Ionicons } from '@expo/vector-icons';

export interface MenuItemDef {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  action: () => void;
}

export const MOCK_SOCIAL = {
  followers_count: 142,
  following_count: 89,
  outfits_shared_count: 24,
  total_likes_received: 1203,
  bio: 'Fashion lover · Minimalist · Paris 🇫🇷',
  is_public: true,
};

export const MOCK_FOLLOW_REQUESTS = [
  { id: '1', name: 'Sophie M.',    handle: '@sophie.mode',  mutuals: 3  },
  { id: '2', name: 'Karim B.',     handle: '@karim.fit',    mutuals: 7  },
  { id: '3', name: 'Léa Fontaine', handle: '@lea_mode',     mutuals: 1  },
];

export const MOCK_SUGGESTIONS = [
  { id: 'a', name: 'Nour S.',     handle: '@nour.style',   mutuals: 5 },
  { id: 'b', name: 'Ali H.',      handle: '@ali.looks',    mutuals: 2 },
  { id: 'c', name: 'Maya R.',     handle: '@maya_wears',   mutuals: 4 },
];
