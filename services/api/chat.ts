/**
 * Chat API endpoints
 */
import { BaseApiClient } from './base';
import type { ChatResponseType } from '../../types';

export class ChatApiClient extends BaseApiClient {
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
}
