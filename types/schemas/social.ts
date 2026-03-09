/**
 * Social media & community types for outfit sharing, connections, and interactions
 */

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type InteractionType = 'like' | 'comment' | 'save' | 'share';
export type NotificationType = 'follow_request' | 'new_follower' | 'outfit_liked' | 'outfit_commented' | 'invitation_accepted' | 'message_received';

/**
 * Shared outfit metadata for the social feed
 */
export interface SharedOutfit {
  outfit_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  user_role?: 'user' | 'stylist' | 'business';
  
  // Outfit details
  title?: string;
  description?: string;
  items: Array<{
    category: string;
    brand?: string;
    color?: string;
  }>;
  
  // Social engagement
  likes_count: number;
  comments_count: number;
  saves_count: number;
  shares_count: number;
  current_user_liked?: boolean;
  current_user_saved?: boolean;
  
  // Metadata
  visibility: 'public' | 'friends_only' | 'private';
  allow_comments: boolean;
  allow_saves: boolean;
  posted_at: string; // ISO 8601 timestamp
  updated_at: string;
}

/**
 * Comment on a shared outfit
 */
export interface OutfitComment {
  comment_id: string;
  outfit_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  text: string;
  likes_count: number;
  current_user_liked?: boolean;
  posted_at: string; // ISO 8601 timestamp
  edited_at?: string;
}

/**
 * Direct message between users
 */
export interface DirectMessage {
  message_id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  attachments?: Array<{
    type: 'image' | 'outfit' | 'file';
    url: string;
    metadata?: Record<string, any>;
  }>;
  is_read: boolean;
  created_at: string; // ISO 8601 timestamp
}

/**
 * Conversation thread between two users
 */
export interface Conversation {
  conversation_id: string;
  participant_ids: [string, string]; // [user1_id, user2_id]
  participant_names: [string, string];
  participant_avatars?: [string | undefined, string | undefined];
  last_message?: DirectMessage;
  unread_count: number;
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Follow request / invitation
 */
export interface FollowRequest {
  request_id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_avatar?: string;
  to_user_id: string;
  status: InvitationStatus;
  message?: string;
  created_at: string; // ISO 8601 timestamp
  responded_at?: string;
}

/**
 * User notification
 */
export interface Notification {
  notification_id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string; // User who triggered the notification
  actor_name: string;
  actor_avatar?: string;
  
  // Context-dependent fields
  outfit_id?: string;
  comment_id?: string;
  follow_request_id?: string;
  
  content: string;
  is_read: boolean;
  created_at: string; // ISO 8601 timestamp
}

/**
 * User activity feed entry
 */
export interface FeedEntry {
  entry_id: string;
  type: 'shared_outfit' | 'user_joined' | 'user_milestone';
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  
  // For shared outfits
  outfit?: SharedOutfit;
  
  created_at: string; // ISO 8601 timestamp
}

/**
 * Trending outfit / style for discovery
 */
export interface TrendingOutfit {
  outfit_id: string;
  rank: number;
  trend_score: number; // Calculated based on engagement
  user_id: string;
  user_name: string;
  user_avatar?: string;
  preview_image_url?: string;
  likes_count: number;
  trend_period: 'daily' | 'weekly' | 'monthly';
  updated_at: string;
}

/**
 * Curated collection of outfits by category or theme
 */
export interface StyleCollection {
  collection_id: string;
  title: string;
  description?: string;
  curator_id: string;
  curator_name: string;
  curator_avatar?: string;
  
  outfits: SharedOutfit[];
  cover_image_url?: string;
  
  followers_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Block / Report functionality
 */
export interface BlockedUser {
  blocked_user_id: string;
  blocker_user_id: string;
  reason?: string;
  blocked_at: string; // ISO 8601 timestamp
}

export interface ReportedContent {
  report_id: string;
  reported_by_user_id: string;
  content_type: 'outfit' | 'comment' | 'user' | 'message';
  content_id: string;
  reason: 'inappropriate' | 'spam' | 'harassment' | 'copyright' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  created_at: string;
}
