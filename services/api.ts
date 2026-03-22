/**
 * API Service — communicates with the FastAPI backend
 */
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/config';
import type {
  AuthResponse,
  UserProfile,
  GarmentItem,
  GarmentAttributes,
  GarmentExtractionResult,
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
  WardrobeInsightsResponse,
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
    // Some endpoints (e.g. DELETE) return empty body or plain JSON
    const contentType = res.headers.get('content-type') ?? '';
    if (res.status === 204 || !contentType.includes('application/json')) {
      return undefined as unknown as T;
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

  /**
   * Build a FormData with a real Blob from base64.
   * Works on both web and React Native (no native file URI needed).
   */
  private base64ToFormData(base64: string, fieldName: string, extraFields?: Record<string, string>): FormData {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: 'image/jpeg' });
    const form = new FormData();
    form.append(fieldName, blob, 'garment.jpg');
    if (extraFields) {
      for (const [k, v] of Object.entries(extraFields)) form.append(k, v);
    }
    return form;
  }

  /**
   * Analyze an image before saving.
   * Returns extracted attributes + quality warnings.
   * Does NOT persist — call addGarmentWithImage to save.
   */
  async analyzeGarmentImage(
    userId: string,
    imageUri: string,
    imageBase64: string,
    mode: 'outfit' | 'auto',
    hintCategory?: string,
  ): Promise<GarmentExtractionResult> {
    if (!userId) throw new Error('Not logged in — userId is missing');
    const extraFields: Record<string, string> = { mode };
    if (hintCategory) extraFields.hint_category = hintCategory;
    const form = this.base64ToFormData(imageBase64, 'image', extraFields);
    const url = `${this.baseUrl}/api/v1/wardrobe/analyze-image?user_id=${userId}`;
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(url, { method: 'POST', headers, body: form });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Analyze error ${res.status}: ${body}`);
    }
    return res.json();
  }

  /**
   * Upload image + save garment (call after user confirms extraction result).
   * All garment attributes go as query params; image is multipart body.
   * Pass llm_attributes from the analyzeGarmentImage response to skip
   * flat→nested re-conversion on every future LLM call.
   */
  async addGarmentWithImage(
    userId: string,
    imageUri: string,
    imageBase64: string,
    attributes: GarmentAttributes,
    llmAttributes?: Record<string, unknown>,
  ): Promise<GarmentItem> {
    if (!userId) throw new Error('Not logged in — userId is missing');
    const params = new URLSearchParams({ user_id: userId, category: attributes.category });
    if (attributes.subcategory)   params.set('subcategory',   attributes.subcategory);
    if (attributes.color_primary) params.set('color_primary', attributes.color_primary);
    if (attributes.color_hex)     params.set('color_hex',     attributes.color_hex);
    if (attributes.pattern)       params.set('pattern',       attributes.pattern);
    if (attributes.material)      params.set('material',      attributes.material);
    if (attributes.formality)     params.set('formality',     attributes.formality);
    if (llmAttributes)            params.set('llm_attributes_json', JSON.stringify(llmAttributes));

    const form = this.base64ToFormData(imageBase64, 'image');
    const url = `${this.baseUrl}/api/v1/wardrobe/items?${params}`;
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(url, { method: 'POST', headers, body: form });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Add garment error ${res.status}: ${body}`);
    }
    return res.json();
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

  /**
   * Wardrobe Insights — all 5 AI analysis features in one call:
   *   1. Capsule gap analysis
   *   2. Cost-per-wear ranking
   *   3. Duplicate detection
   *   4. Occasion coverage heatmap
   *   5. Versatility ranking
   */
  async getWardrobeInsights(userId: string, refresh = false): Promise<WardrobeInsightsResponse> {
    const qs = new URLSearchParams({ user_id: userId });
    if (refresh) qs.set('refresh', 'true');
    return this.request(`/api/v1/wardrobe/insights?${qs}`);
  }

  // ─── Recommendations ──────────────────────────
  async getRecommendations(
    config: {
      occasion?: Occasion;
      scoring_profile?: ScoringProfile;
      top_k?: number;
      garment_ids?: string[];
    },
    userId?: string,
  ): Promise<RecommendationResponse> {
    const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
    return this.request(`/api/v1/recommend/outfits${qs}`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /** Fetch live weather + time-of-day context snapshot. */
  async getContext(city?: string): Promise<{
    temperature_celsius: number;
    feels_like_celsius: number;
    condition: string;
    condition_code: number;
    humidity: number;
    city_name: string;
    time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
    ai_context_summary: string;
    cached: boolean;
    error?: string;
  }> {
    const qs = city ? `?city=${encodeURIComponent(city)}` : '';
    return this.request(`/api/v1/recommend/context${qs}`);
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

  /** PATCH /api/v1/outfits/{id}/plan — update planned_date, reminder, etc. */
  async updateOutfitPlan(
    userId: string,
    outfitId: string,
    patch: {
      planned_date?: string | null;      // ISO-8601 or null to clear
      reminder?: { type: string; minutes_before: number } | null;
      user_timezone?: string;
      name?: string;
      description?: string;
    },
  ): Promise<CustomOutfit> {
    return this.request(`/api/v1/outfits/${outfitId}/plan?user_id=${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  }

  /** GET /api/v1/outfits/week — outfits planned in the next 7 days */
  async getWeekOutfits(userId: string): Promise<{ outfits: CustomOutfit[]; total: number }> {
    return this.request(`/api/v1/outfits/week?user_id=${userId}`);
  }

  /** GET /api/v1/outfits/list with optional upcoming/past filter */
  async listOutfits(
    userId: string,
    options?: { upcomingOnly?: boolean; pastOnly?: boolean },
  ): Promise<{ outfits: CustomOutfit[]; total: number }> {
    const qs = new URLSearchParams({ user_id: userId });
    if (options?.upcomingOnly) qs.set('upcoming_only', 'true');
    if (options?.pastOnly)     qs.set('past_only', 'true');
    return this.request(`/api/v1/outfits/list?${qs}`);
  }

  /**
   * Score a worn-outfit photo — returns scores + improvement tips.
   */
  async scoreOutfitPhoto(
    userId: string,
    imageBase64: string,
  ): Promise<{
    overall: number;
    color_harmony: number;
    formality_match: number;
    proportion: number;
    creativity: number;
    summary: string;
    improvements: string[];
    style_score_label: string;
  }> {
    const form = this.base64ToFormData(imageBase64, 'image');
    const url = `${this.baseUrl}/api/v1/outfits/score-photo?user_id=${userId}`;
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(url, { method: 'POST', headers, body: form });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Score photo error ${res.status}: ${body}`);
    }
    return res.json();
  }

  /**
   * Generate an outfit from a natural language prompt.
   */
  async outfitFromPrompt(
    userId: string,
    prompt: string,
  ): Promise<{
    name: string;
    description: string;
    mood: string;
    pieces: Array<{ label: string; category: string; color: string }>;
    score: number;
    styling_tip: string;
    prompt: string;
  }> {
    const form = new FormData();
    form.append('prompt', prompt);
    const url = `${this.baseUrl}/api/v1/outfits/from-prompt?user_id=${userId}`;
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(url, { method: 'POST', headers, body: form });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Prompt outfit error ${res.status}: ${body}`);
    }
    return res.json();
  }

  // ─── Image Consulting ─────────────────────────
  async analyzeImageConsulting(
    userId: string,
    imageUri: string,
    heightCm?: number,
    weightKg?: number,
  ): Promise<ImageConsultingResult> {
    const form = new FormData();
    if (Platform.OS === 'web') {
      // On web, imageUri is a blob: URL from URL.createObjectURL().
      // We must fetch it as a Blob and append it as a File — the RN
      // { uri, name, type } object format only works in React Native.
      const blobRes = await fetch(imageUri);
      const blob    = await blobRes.blob();
      form.append('image', new File([blob], 'consulting_photo.jpg', { type: blob.type || 'image/jpeg' }));
    } else {
      // React Native: pass the file-reference object
      form.append('image', { uri: imageUri, name: 'consulting_photo.jpg', type: 'image/jpeg' } as any);
    }
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
