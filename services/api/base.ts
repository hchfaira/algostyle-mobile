/**
 * Base API client with request handling
 */
import { API_BASE_URL } from '../../constants/config';

export class BaseApiClient {
  protected baseUrl: string;
  protected token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setToken(token: string) {
    this.token = token;
  }

  protected async request<T>(
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
}
