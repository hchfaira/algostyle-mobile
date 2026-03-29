/**
 * Social feed API endpoints
 */
import { BaseApiClient } from './base';
import type { UserOutfitPost } from '../../components/social/constants';

export interface SocialFeedResponse {
  posts: BackendFeedPost[];
  total: number;
  has_more: boolean;
}

export interface BackendFeedPost {
  id: string;
  user_id: string;
  user_name: string;
  outfit_name: string;
  description?: string;
  items: { id: string; color: string; color_name?: string; category: string; subcategory?: string; material?: string; image_url?: string }[];
  ai_grade?: string;
  ai_score?: number;
  source: string;
  likes: number;
  saves: number;
  liked: boolean;
  saved: boolean;
  created_at?: string;
}

export interface ToggleLikeResponse {
  liked: boolean;
  likes: number;
}

export interface ToggleSaveResponse {
  saved: boolean;
  saves: number;
}

export interface UserStats {
  outfits_shared: number;
  likes_received: number;
}

export interface FollowResponse {
  status: string; // accepted | pending | unfollowed
  followers_count: number;
  following_count: number;
}

export interface FollowUserSummary {
  user_id: string;
  name: string;
  handle: string;
  bio?: string;
  is_following: boolean;
}

export interface FollowListResponse {
  users: FollowUserSummary[];
  total: number;
}

export interface FollowRequestItem {
  id: string;
  from_user_id: string;
  name: string;
  handle: string;
  mutuals: number;
  created_at?: string;
}

export interface FollowRequestsResponse {
  requests: FollowRequestItem[];
  total: number;
}

export interface FollowCounts {
  followers_count: number;
  following_count: number;
}

export interface UserSearchResult {
  user_id: string;
  name: string;
  handle: string;
  bio?: string;
  is_following: boolean;
}

export interface UserSearchResponse {
  users: UserSearchResult[];
  total: number;
}

export class SocialApiClient extends BaseApiClient {
  async getUserStats(userId: string): Promise<UserStats> {
    return this.request(`/api/v1/social/stats/${userId}`);
  }

  async getFeed(userId: string, limit = 20, offset = 0): Promise<SocialFeedResponse> {
    return this.request(`/api/v1/social/feed?user_id=${userId}&limit=${limit}&offset=${offset}`);
  }

  async toggleLike(userId: string, outfitId: string): Promise<ToggleLikeResponse> {
    return this.request(`/api/v1/social/posts/${outfitId}/like?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async toggleSave(userId: string, outfitId: string): Promise<ToggleSaveResponse> {
    return this.request(`/api/v1/social/posts/${outfitId}/save?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async followUser(userId: string, targetUserId: string): Promise<FollowResponse> {
    return this.request(`/api/v1/social/users/${targetUserId}/follow?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string, targetUserId: string): Promise<FollowResponse> {
    return this.request(`/api/v1/social/users/${targetUserId}/unfollow?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async getFollowers(userId: string, currentUserId: string): Promise<FollowListResponse> {
    return this.request(`/api/v1/social/users/${userId}/followers?current_user_id=${currentUserId}`);
  }

  async getFollowing(userId: string, currentUserId: string): Promise<FollowListResponse> {
    return this.request(`/api/v1/social/users/${userId}/following?current_user_id=${currentUserId}`);
  }

  async getFollowCounts(userId: string): Promise<FollowCounts> {
    return this.request(`/api/v1/social/users/${userId}/follow-counts`);
  }

  async getFollowRequests(userId: string): Promise<FollowRequestsResponse> {
    return this.request(`/api/v1/social/follow-requests?user_id=${userId}`);
  }

  async acceptFollowRequest(userId: string, requestId: string): Promise<FollowResponse> {
    return this.request(`/api/v1/social/follow-requests/${requestId}/accept?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async declineFollowRequest(userId: string, requestId: string): Promise<FollowResponse> {
    return this.request(`/api/v1/social/follow-requests/${requestId}/decline?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async searchUsers(query: string, currentUserId: string, limit = 20): Promise<UserSearchResponse> {
    return this.request(
      `/api/v1/social/users/search?q=${encodeURIComponent(query)}&current_user_id=${currentUserId}&limit=${limit}`,
    );
  }
}

/** Map backend post → UI post */
export function toUserOutfitPost(p: BackendFeedPost): UserOutfitPost {
  return {
    id: p.id,
    userId: p.user_id,
    userName: p.user_name,
    outfitName: p.outfit_name,
    description: p.description,
    items: p.items.map((it) => ({
      id: it.id,
      color: it.color,
      colorName: it.color_name,
      category: it.category,
      subcategory: it.subcategory,
      material: it.material,
      imageUrl: it.image_url,
    })),
    aiGrade: p.ai_grade,
    aiScore: p.ai_score,
    source: (p.source === 'ai' || p.source === 'score' || p.source === 'prompt') ? 'ai' : 'build',
    likes: p.likes,
    saves: p.saves,
    liked: p.liked,
    saved: p.saved,
    timestamp: formatRelativeTime(p.created_at),
  };
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'recently';
  const diff = Date.now() - new Date(isoString).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
}
