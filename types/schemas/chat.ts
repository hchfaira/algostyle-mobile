/**
 * Chat and messaging types
 */

export interface ChatMessageType {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatResponseType {
  session_id: string;
  response: string;
  suggestions: string[];
}
