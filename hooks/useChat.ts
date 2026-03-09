import { useState, useRef, useEffect, useCallback } from 'react';
import { FlatList } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import type { ChatMessageType } from '../types';

export function useChat() {
  const {
    userId,
    chatSessionId,
    chatMessages,
    setChatSession,
    addChatMessage,
    clearChat,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatSessionId) initSession();
  }, []);

  const initSession = async () => {
    try {
      const res = await api.startChatSession(userId || undefined);
      setChatSession(res.session_id);
    } catch (_err) { /* noop */ }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !chatSessionId) return;
    const userMsg: ChatMessageType = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    addChatMessage(userMsg);
    setInput('');
    setSending(true);
    setSuggestions([]);

    try {
      const res = await api.sendChatMessage(chatSessionId, text.trim());
      const assistantMsg: ChatMessageType = { role: 'assistant', content: res.response, timestamp: new Date().toISOString() };
      addChatMessage(assistantMsg);
      setSuggestions(res.suggestions || []);
    } catch (_err) {
      addChatMessage({ role: 'assistant', content: "Sorry, I couldn't process that. Please try again." });
    } finally {
      setSending(false);
    }

    setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 100);
  }, [chatSessionId, addChatMessage]);

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const scrollToEnd = useCallback(() => {
    flatListRef.current?.scrollToEnd();
  }, []);

  return {
    input,
    setInput,
    sending,
    suggestions,
    chatMessages,
    flatListRef,
    hasMessages: chatMessages.length > 0,
    clearChat,
    sendMessage,
    handleSend,
    scrollToEnd,
  };
}
