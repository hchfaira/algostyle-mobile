/**
 * Unified API service client
 * Aggregates all individual API clients
 */
import { AuthApiClient } from './auth';
import { ProfileApiClient } from './profile';
import { WardrobeApiClient } from './wardrobe';
import { RecommendationApiClient } from './recommendation';
import { ChatApiClient } from './chat';
import { ImageConsultingApiClient } from './imageConsulting';
import { SocialApiClient } from './social';
import { NotificationApiClient } from './notification';

class UnifiedApiService {
  auth: AuthApiClient;
  profile: ProfileApiClient;
  wardrobe: WardrobeApiClient;
  recommendation: RecommendationApiClient;
  chat: ChatApiClient;
  imageConsulting: ImageConsultingApiClient;
  social: SocialApiClient;
  notification: NotificationApiClient;

  constructor() {
    this.auth = new AuthApiClient();
    this.profile = new ProfileApiClient();
    this.wardrobe = new WardrobeApiClient();
    this.recommendation = new RecommendationApiClient();
    this.chat = new ChatApiClient();
    this.imageConsulting = new ImageConsultingApiClient();
    this.social = new SocialApiClient();
    this.notification = new NotificationApiClient();
  }

  /**
   * Set authentication token for all clients
   */
  setToken(token: string) {
    this.auth.setToken(token);
    this.profile.setToken(token);
    this.wardrobe.setToken(token);
    this.recommendation.setToken(token);
    this.chat.setToken(token);
    this.imageConsulting.setToken(token);
    this.social.setToken(token);
    this.notification.setToken(token);
  }
}

export const api = new UnifiedApiService();
