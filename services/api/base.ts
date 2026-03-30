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
      let message = `Request failed (${res.status})`;
      try {
        const errorBody = await res.json();
        if (errorBody.detail) {
          message = typeof errorBody.detail === 'string'
            ? errorBody.detail
            : JSON.stringify(errorBody.detail);
        }
      } catch {
        // response wasn't JSON — keep generic message
      }
      throw new Error(message);
    }
    return res.json();
  }
}
