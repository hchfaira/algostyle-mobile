export interface UserOutfitPost {
  id: string;
  userId: string;
  userName: string;
  outfitName: string;
  description?: string;
  items: { id: string; color: string; colorName?: string; category: string; subcategory?: string; material?: string; imageUrl?: string }[];
  aiGrade?: string;
  aiScore?: number;
  source: 'ai' | 'build';
  likes: number;
  saves: number;
  liked: boolean;
  saved: boolean;
  timestamp: string;
}
