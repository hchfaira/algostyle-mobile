/**
 * API Service — communicates with the FastAPI backend
 */
import { API_BASE_URL } from '../constants/config';
import type {
  AuthResponse,
  UserProfile,
  GarmentItem,
  RecommendationResponse,
  ChatResponseType,
  Occasion,
  ScoringProfile,
  SmartSuggestionsResponse,
  ClosetAuditResponse,
  CustomOutfit,
  CreateCustomOutfitRequest,
  CustomOutfitResponse,
  OutfitResult,
  ImageConsultingResult,
  CapsuleScoreResponse,
  GarmentAnalysis,
  MissingPiecesResponse,
  CapsuleEvolutionResponse,
  SmartRemovalResponse,
  WardrobeSortScoresResponse,
  CapsuleGenerateRequest,
  CapsuleGenerateResponse,
} from '../types';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API Error ${res.status}: ${errorBody}`);
    }
    return res.json();
  }

  // ─── Auth ──────────────────────────────────────
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async guestLogin(): Promise<AuthResponse> {
    return this.request('/api/v1/auth/guest', { method: 'POST' });
  }

  // ─── Profile ───────────────────────────────────
  async getProfile(userId: string): Promise<UserProfile> {
    return this.request(`/api/v1/onboarding/profile/${userId}`);
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request(`/api/v1/onboarding/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeOnboarding(userId: string): Promise<{ status: string }> {
    return this.request(`/api/v1/onboarding/complete/${userId}`, {
      method: 'POST',
    });
  }

  // ─── Wardrobe ──────────────────────────────────
  async getWardrobe(userId: string, filters?: Record<string, string>): Promise<GarmentItem[]> {
    const params = new URLSearchParams({ user_id: userId, ...filters });
    return this.request(`/api/v1/wardrobe/items?${params}`);
  }

  async addGarment(userId: string, category?: string): Promise<GarmentItem> {
    const params = new URLSearchParams({ user_id: userId });
    if (category) params.set('category', category);
    return this.request(`/api/v1/wardrobe/items?${params}`, {
      method: 'POST',
    });
  }

  async deleteGarment(userId: string, garmentId: string): Promise<void> {
    await this.request(`/api/v1/wardrobe/items/${garmentId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  async toggleFavorite(userId: string, garmentId: string): Promise<any> {
    return this.request(`/api/v1/wardrobe/items/${garmentId}/favorite?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async getSmartSuggestions(userId: string): Promise<SmartSuggestionsResponse> {
    return this.request(`/api/v1/wardrobe/smart-suggestions?user_id=${userId}`);
  }

  async getClosetAudit(userId: string): Promise<ClosetAuditResponse> {
    return this.request(`/api/v1/wardrobe/audit?user_id=${userId}`);
  }

  // ─── Capsule Intelligence ─────────────────────
  async getCapsuleScore(userId: string): Promise<CapsuleScoreResponse> {
    return this.request(`/api/v1/wardrobe/capsule-score?user_id=${userId}`);
  }

  async getGarmentAnalysis(userId: string, garmentId: string): Promise<GarmentAnalysis> {
    return this.request(`/api/v1/wardrobe/items/${garmentId}/analysis?user_id=${userId}`);
  }

  async getMissingPieces(userId: string, limit = 5): Promise<MissingPiecesResponse> {
    return this.request(`/api/v1/wardrobe/missing-pieces?user_id=${userId}&limit=${limit}`);
  }

  async getCapsuleEvolution(userId: string, days = 90): Promise<CapsuleEvolutionResponse> {
    return this.request(`/api/v1/wardrobe/capsule-evolution?user_id=${userId}&days=${days}`);
  }

  async getSmartRemoval(userId: string, profile = 'balanced'): Promise<SmartRemovalResponse> {
    return this.request(`/api/v1/wardrobe/smart-removal?user_id=${userId}&profile=${profile}`);
  }

  async getSortScores(userId: string): Promise<WardrobeSortScoresResponse> {
    return this.request(`/api/v1/wardrobe/sort-scores?user_id=${userId}`);
  }

  async generateCapsule(userId: string, params: CapsuleGenerateRequest): Promise<CapsuleGenerateResponse> {
    const qs = new URLSearchParams({ user_id: userId });
    if (params.occasion) qs.set('occasion', params.occasion);
    if (params.season)   qs.set('season',   params.season);
    return this.request(`/api/v1/wardrobe/capsule-generate?${qs}`);
  }

  // ─── Recommendations ──────────────────────────
  async getRecommendations(config: {
    occasion?: Occasion;
    scoring_profile?: ScoringProfile;
    top_k?: number;
  }): Promise<RecommendationResponse> {
    return this.request('/api/v1/recommend/outfits', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async explainOutfit(
    outfit: OutfitResult,
    occasion?: Occasion,
    scoringProfile?: ScoringProfile,
    detailLevel: 'brief' | 'standard' | 'detailed' = 'detailed',
  ): Promise<{
    outfit_id: string;
    detailed?: string;
    style_notes: string[];
    color_note?: string;
    occasion_note?: string;
    styling_tips: string[];
  }> {
    return this.request('/api/v1/recommend/explain', {
      method: 'POST',
      body: JSON.stringify({
        outfit,
        occasion,
        scoring_profile: scoringProfile,
        detail_level: detailLevel,
      }),
    });
  }

  // ─── Chat ─────────────────────────────────────
  async startChatSession(userId?: string): Promise<{ session_id: string }> {
    const params = userId ? `?user_id=${userId}` : '';
    return this.request(`/api/v1/chat/start-session${params}`, {
      method: 'POST',
    });
  }

  async sendChatMessage(sessionId: string, message: string): Promise<ChatResponseType> {
    return this.request('/api/v1/chat/message', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message }),
    });
  }

  // ─── Custom Outfits ────────────────────────────
  async createCustomOutfit(
    userId: string,
    outfitData: CreateCustomOutfitRequest
  ): Promise<CustomOutfitResponse> {
    return this.request(`/api/v1/outfits/create?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(outfitData),
    });
  }

  async listCustomOutfits(userId: string): Promise<{ outfits: CustomOutfit[]; total: number }> {
    return this.request(`/api/v1/outfits/list?user_id=${userId}`);
  }

  async getCustomOutfit(userId: string, outfitId: string): Promise<CustomOutfit> {
    return this.request(`/api/v1/outfits/${outfitId}?user_id=${userId}`);
  }

  async deleteCustomOutfit(userId: string, outfitId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/v1/outfits/${outfitId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  async shareCustomOutfit(
    userId: string,
    outfitId: string
  ): Promise<{ success: boolean; share_code: string; share_url: string; outfit_name: string }> {
    return this.request(`/api/v1/outfits/${outfitId}/share?user_id=${userId}`, {
      method: 'POST',
    });
  }

  // ─── Image Consulting ─────────────────────────
  async analyzeImageConsulting(
    userId: string,
    imageUri: string,
    heightCm?: number,
    weightKg?: number,
  ): Promise<ImageConsultingResult> {
    const form = new FormData();
    form.append('image', { uri: imageUri, name: 'consulting_photo.jpg', type: 'image/jpeg' } as any);
    if (heightCm !== undefined) form.append('height_cm', String(heightCm));
    if (weightKg !== undefined) form.append('weight_kg', String(weightKg));

    const url = `${this.baseUrl}/api/v1/image-consulting/analyze/${userId}`;
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(url, { method: 'POST', headers, body: form });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Image consulting error ${res.status}: ${body}`);
    }
    return res.json();
  }

  async getImageConsultingResult(userId: string): Promise<ImageConsultingResult> {
    return this.request(`/api/v1/image-consulting/result/${userId}`);
  }
}

export const api = new ApiService();
