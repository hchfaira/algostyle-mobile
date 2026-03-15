/**
 * SideTabAI — Discreet lateral AI Agent access
 *
 * A semi-transparent vertical tab (36px wide × 100px tall) stuck to the right edge.
 * Minimal visual footprint — just an icon + "AI" label.
 * Opens the chat modal when tapped.
 *
 * Design principles:
 *  • Quiet luxury: no shadow, no vibrant colors, no animations
 *  • Off-white/nude background with espresso icon
 *  • Always visible but never intrusive
 *  • Same logic as FloatingChatButton but repositioned as a side tab
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type { ChatMessageType } from '../types';

const QUICK_PROMPTS = [
  'What should I wear today?',
  'Style tips for a date night',
  'How to accessorize my navy blazer?',
  'Build me a capsule wardrobe',
];

// Espresso: warm dark brown
const ESPRESSO = '#3B2A1A';
// Near-white nude for background
const NUDE_BG = '#FCF9F6';
// Very subtle border
const NUDE_BORDER = '#EDE6DF';

// ─── Typing indicator dots with staggered fade ───────────────
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const dots = React.useMemo(() => [dot1, dot2, dot3], [dot1, dot2, dot3]);

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(480 - i * 160),
        ])
      )
    );
    anims.forEach((anim) => anim.start());
    return () => anims.forEach((anim) => anim.stop());
  }, [dots]);

  return (
    <View style={styles.typingContainer}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
      ))}
    </View>
  );
};

export default function SideTabAI() {
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const { userId } = useAppStore();
  const sessionIdRef = useRef<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Start chat session on modal open
  useEffect(() => {
    if (showModal && !sessionIdRef.current) {
      startChatSession();
    }
  }, [showModal]);

  const startChatSession = useCallback(async () => {
    try {
      const response = await api.startChatSession(userId || undefined);
      sessionIdRef.current = response.session_id;
    } catch (error) {
      console.error('Failed to start chat session:', error);
    }
  }, [userId]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !sessionIdRef.current) return;

    const userMessage: ChatMessageType = {
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage(sessionIdRef.current, inputText);

      const aiMessage: ChatMessageType = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: ChatMessageType = {
        role: 'assistant',
        content: 'Sorry, I could not process your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [inputText]);

  const handleQuickPrompt = useCallback(
    async (prompt: string) => {
      setInputText(prompt);
      if (!sessionIdRef.current) return;

      const userMessage: ChatMessageType = {
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        const response = await api.sendChatMessage(sessionIdRef.current, prompt);

        const aiMessage: ChatMessageType = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (error) {
        console.error('Chat API error:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <>
      {/* Side Tab — fixed to bottom-right, just above tab bar */}
      <TouchableOpacity
        style={[
          styles.sideTab,
          {
            bottom: insets.bottom + 95, // just above tab bar (85px height + 28px padding)
            right: 0,
          },
        ]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="sparkles" size={14} color={ESPRESSO} style={styles.icon} />
        <Text style={styles.label}>AI</Text>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          {/* Modal Header */}
          <View
            style={[
              styles.modalHeader,
              { paddingTop: insets.top + Spacing.md, paddingBottom: Spacing.md },
            ]}
          >
            <Text style={styles.modalTitle}>AI Style Assistant</Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={ESPRESSO} />
            </Pressable>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `${item.role}-${index}`}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.role === 'user' && styles.userText,
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="sparkles" size={32} color={NUDE_BORDER} />
                <Text style={styles.emptyText}>Ask me anything about your style!</Text>
                {QUICK_PROMPTS.length > 0 && (
                  <>
                    <Text style={styles.quickLabel}>Try these:</Text>
                    <View style={styles.quickPromptsContainer}>
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <Pressable
                          key={idx}
                          style={styles.quickPromptButton}
                          onPress={() => handleQuickPrompt(prompt)}
                        >
                          <Text style={styles.quickPromptText}>{prompt}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </View>
            }
          />

          {/* Loading indicator */}
          {loading && <TypingIndicator />}

          {/* Input bar */}
          <View
            style={[
              styles.inputBar,
              { paddingBottom: insets.bottom + Spacing.md },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Ask me something..."
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <Pressable
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
              style={[styles.sendButton, { opacity: !inputText.trim() || loading ? 0.5 : 1 }]}
            >
              <Ionicons
                name="send"
                size={18}
                color={ESPRESSO}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ─── Side Tab ───
  sideTab: {
    position: 'absolute',
    width: 32,
    height: 70,
    backgroundColor: NUDE_BG,
    borderColor: NUDE_BORDER,
    borderLeftWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    gap: 1,
    opacity: 0.85, // semi-transparent
    zIndex: 50,
  },
  icon: {
    marginBottom: 1,
  },
  label: {
    fontSize: 8,
    fontWeight: '600',
    color: ESPRESSO,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ─── Modal ───
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: ESPRESSO,
    letterSpacing: 0.5,
  },

  // ─── Messages ───
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageBubble: {
    marginVertical: Spacing.sm,
    maxWidth: '85%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: ESPRESSO,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: NUDE_BG,
    borderColor: NUDE_BORDER,
    borderWidth: 1,
  },
  messageText: {
    fontSize: FontSize.md,
    color: ESPRESSO,
    lineHeight: 20,
  },
  userText: {
    color: Colors.surface,
  },

  // ─── Empty State ───
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  quickLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: ESPRESSO,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  quickPromptsContainer: {
    flexDirection: 'column',
    gap: Spacing.sm,
    width: '100%',
  },
  quickPromptButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: NUDE_BG,
    borderColor: NUDE_BORDER,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  quickPromptText: {
    fontSize: FontSize.sm,
    color: ESPRESSO,
    lineHeight: 18,
  },

  // ─── Input bar ───
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: NUDE_BG,
    borderColor: NUDE_BORDER,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    fontSize: FontSize.md,
    color: ESPRESSO,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },

  // ─── Typing indicator ───
  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 4,
    marginBottom: Spacing.md,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: NUDE_BORDER,
  },
});
