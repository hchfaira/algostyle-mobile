/**
 * User Profile, body analysis, and social media types
 */

export type UserRole = 'user' | 'stylist' | 'business';
export type StylePreference = 'minimalist' | 'classic' | 'streetwear' | 'bohemian' | 'preppy' | 'edgy' | 'romantic';
export type FollowStatus = 'following' | 'follower' | 'mutual' | 'none';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface BodyAnalysis {
  body_shape?: string;
  skin_tone?: string;
  undertone?: string;
  hair_color?: string;
  contrast_level?: string;
  estimated_top_size?: string;
  estimated_bottom_size?: string;
}

export interface SocialMediaProfile {
  followers_count: number;
  following_count: number;
  outfits_shared_count: number;
  total_likes_received: number;
  bio?: string;
  is_public: boolean;
  contact_email?: string;
  instagram_handle?: string;
}

export interface UserFollow {
  follower_id: string;
  following_id: string;
  status: FollowStatus;
  followed_at: string; // ISO 8601 timestamp
}

export interface FollowInvitation {
  invitation_id: string;
  from_user_id: string;
  to_user_id: string;
  status: InvitationStatus;
  message?: string;
  created_at: string; // ISO 8601 timestamp
  responded_at?: string; // ISO 8601 timestamp
}

export interface UserSocialConnection {
  user_id: string;
  connected_user_id: string;
  connected_user_name: string;
  connected_user_avatar?: string;
  relationship_status: FollowStatus;
  invited_me?: boolean; // true if this user invited me
  mutual_followers_count?: number;
}

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  height_cm?: number;
  weight_kg?: number;
  gender?: string;
  body_analysis?: BodyAnalysis;
  profile_photo_url?: string;
  style_preferences: string[];
  favorite_colors: string[];
  avoid_colors: string[];
  comfort_vs_style: number;
  budget?: string;
  location?: string;
  timezone?: string;
  bio?: string;
  is_public?: boolean;
  is_onboarded: boolean;
  social_profile?: SocialMediaProfile;
  created_at: string;
  updated_at?: string;
}
