/**
 * Central exports for all TypeScript types
 * Types are organized in schemas/ subfolders by domain
 */

// Auth types
export type { UserRole } from './schemas/auth';
export type { AuthResponse } from './schemas/auth';

// Profile types
export type {
  StylePreference,
  BodyAnalysis,
  UserProfile,
  SocialMediaProfile,
  UserFollow,
  FollowInvitation,
  UserSocialConnection,
  FollowStatus,
  InvitationStatus,
} from './schemas/profile';

// Social media & community types
export type {
  SharedOutfit,
  OutfitComment,
  DirectMessage,
  Conversation,
  FollowRequest,
  Notification,
  FeedEntry,
  TrendingOutfit,
  StyleCollection,
  BlockedUser,
  ReportedContent,
  InteractionType,
  NotificationType,
} from './schemas/social';

// Wardrobe types
export type {
  GarmentCategory,
  GarmentAttributes,
  GarmentItem,
  SmartSuggestion,
  SmartSuggestionsResponse,
  FlaggedItem,
  ClosetAuditSummary,
  ClosetAuditResponse,
  CapsuleScoreBreakdown,
  CapsuleOpportunity,
  CapsuleScoreResponse,
  GarmentAnalysis,
  MissingPiece,
  MissingPiecesResponse,
  EvolutionSnapshot,
  CapsuleEvolutionResponse,
  RemovalCandidate,
  SmartRemovalResponse,
  SortMode,
  GarmentSortScore,
  WardrobeSortScoresResponse,
  CapsuleOccasion,
  CapsuleSeason,
  CapsuleGenerateRequest,
  CapsuleGenerateResponse,
} from './schemas/wardrobe';

// Recommendation types
export type { Occasion, ScoringProfile, OutfitScore, OutfitResult, RecommendationResponse } from './schemas/recommendation';

// Custom outfit types
export type { CustomOutfit, CreateCustomOutfitRequest, CustomOutfitResponse, VirtualTryOnResult, VirtualTryOnRequest, VirtualTryOnResponse } from './schemas/outfit';

// Chat types
export type { ChatMessageType, ChatResponseType } from './schemas/chat';

// Image Consulting types
export type {
  ImageConsultingResult,
  ColorPaletteRecommendation,
  BodyShapeGuidance,
  FaceShapeGuidance,
} from './schemas/imageConsulting';
