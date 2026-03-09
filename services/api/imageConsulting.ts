/**
 * Image Consulting API client
 * Wraps POST /api/v1/image-consulting/analyze/:userId
 * and  GET  /api/v1/image-consulting/result/:userId
 */
import { BaseApiClient } from './base';
import type { ImageConsultingResult } from '@/types/schemas/imageConsulting';

export class ImageConsultingApiClient extends BaseApiClient {
  /**
   * Upload a photo and optionally supply height / weight.
   * Returns the full consulting result.
   */
  async analyze(
    userId: string,
    imageUri: string,
    heightCm?: number,
    weightKg?: number,
  ): Promise<ImageConsultingResult> {
    const form = new FormData();

    // React Native FormData file attachment
    form.append('image', {
      uri: imageUri,
      name: 'consulting_photo.jpg',
      type: 'image/jpeg',
    } as any);

    if (heightCm !== undefined) {
      form.append('height_cm', String(heightCm));
    }
    if (weightKg !== undefined) {
      form.append('weight_kg', String(weightKg));
    }

    const url = `${this.baseUrl}/api/v1/image-consulting/analyze/${userId}`;
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    // Do NOT set Content-Type — let the browser set multipart boundary automatically

    const res = await fetch(url, { method: 'POST', headers, body: form });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Image consulting error ${res.status}: ${body}`);
    }
    return res.json();
  }

  /** Fetch the latest cached consulting result without re-uploading. */
  async getResult(userId: string): Promise<ImageConsultingResult> {
    return this.request<ImageConsultingResult>(
      `/api/v1/image-consulting/result/${userId}`,
    );
  }
}
