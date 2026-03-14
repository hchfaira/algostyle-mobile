/**
 * FloatingChatButton — AI Style Assistant FAB
 *
 * A circular floating action button that bounces gently at idle,
 * and opens a full bottom-sheet chat when tapped.
 * Rendered inside the tabs layout so it persists across all tabs.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
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
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [dots]);
  return (
    <View style={chat.typingRow}>
      <View style={chat.avatar}><Ionicons name="sparkles" size={13} color="#FFF" /></View>
      <View style={chat.typingBubble}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[chat.dot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
};

// ─── Single message bubble ────────────────────────────────────
const MessageBubble = ({ item }: { item: ChatMessageType }) => {
  const isUser = item.role === 'user';
  return (
    <View style={[chat.msgRow, isUser && chat.msgRowUser]}>
      {!isUser && (
        <View style={chat.avatar}><Ionicons name="sparkles" size={13} color="#FFF" /></View>
      )}
      <View style={[chat.bubble, isUser ? chat.bubbleUser : chat.bubbleAI]}>
        <Text style={[chat.bubbleText, isUser && chat.bubbleTextUser]}>{item.content}</Text>
      </View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────
export const FloatingChatButton: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { userId, chatSessionId, chatMessages, setChatSession, addChatMessage, clearChat } = useAppStore();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // ── Idle float animation ──────────────────────────────────
  const floatY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle vertical float
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -7, duration: 1400, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    // Subtle glow pulse on the ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, [floatY, glowAnim]);

  // ── Press feedback ────────────────────────────────────────
  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, speed: 30 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  // ── Chat session ──────────────────────────────────────────
  const initSession = useCallback(async () => {
    try {
      const res = await api.startChatSession(userId || undefined);
      setChatSession(res.session_id);
    } catch {}
  }, [userId, setChatSession]);

  useEffect(() => {
    if (open && !chatSessionId) initSession();
  }, [open, chatSessionId, initSession]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !chatSessionId) return;
    addChatMessage({ role: 'user', content: text.trim(), timestamp: new Date().toISOString() });
    setInput('');
    setSending(true);
    setSuggestions([]);
    try {
      const res = await api.sendChatMessage(chatSessionId, text.trim());
      addChatMessage({ role: 'assistant', content: res.response, timestamp: new Date().toISOString() });
      setSuggestions(res.suggestions || []);
    } catch {
      addChatMessage({ role: 'assistant', content: "Sorry, I couldn't process that. Please try again." });
    } finally {
      setSending(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const ringOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] });

  return (
    <>
      {/* ── Floating Button ── */}
      <Animated.View
        style={[
          fab.wrapper,
          {
            bottom: insets.bottom + 90, // sits above tab bar
            transform: [{ translateY: floatY }, { scale: scaleAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Animated glow ring */}
        <Animated.View style={[fab.ring, { opacity: ringOpacity }]} />

        <TouchableOpacity
          style={fab.btn}
          onPress={() => setOpen(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <Ionicons name="sparkles" size={26} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Chat Modal ── */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={modal.overlay} onPress={() => setOpen(false)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={modal.kavWrapper}
        >
          <SafeAreaView style={modal.sheet} edges={['bottom']}>
            {/* Handle */}
            <View style={modal.handle} />

            {/* Header */}
            <View style={modal.header}>
              <View style={modal.headerLeft}>
                <View style={modal.headerIcon}>
                  <Ionicons name="sparkles" size={16} color="#FFF" />
                </View>
                <View>
                  <Text style={modal.headerTitle}>Style Assistant</Text>
                  <Text style={modal.headerSub}>Ask anything about fashion</Text>
                </View>
              </View>
              <View style={modal.headerActions}>
                {chatMessages.length > 0 && (
                  <TouchableOpacity onPress={clearChat} style={modal.clearBtn}>
                    <Ionicons name="trash-outline" size={17} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setOpen(false)} style={modal.closeBtn}>
                  <Ionicons name="close" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages / Empty */}
            {chatMessages.length === 0 ? (
              <View style={modal.emptyState}>
                <Text style={modal.emptyTitle}>ASK ME ANYTHING</Text>
                <Text style={modal.emptyDesc}>
                  Outfit ideas, style tips, colour matching, and more.
                </Text>
                <View style={modal.quickList}>
                  {QUICK_PROMPTS.map((p, i) => (
                    <TouchableOpacity key={i} style={modal.quickChip} onPress={() => sendMessage(p)}>
                      <Ionicons name="arrow-forward" size={13} color={Colors.textPrimary} />
                      <Text style={modal.quickChipText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={chatMessages}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={modal.messageList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => <MessageBubble item={item} />}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListFooterComponent={sending ? <TypingIndicator /> : null}
              />
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <FlatList
                data={suggestions}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                style={modal.suggestionsRow}
                contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={modal.suggestionChip} onPress={() => sendMessage(item)}>
                    <Text style={modal.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Input */}
            <View style={modal.inputBar}>
              <View style={modal.inputWrapper}>
                <TextInput
                  style={modal.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask about style, outfits, colours..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  maxLength={500}
                  onSubmitEditing={() => sendMessage(input)}
                />
                <TouchableOpacity
                  style={[modal.sendBtn, (!input.trim() || sending) && modal.sendBtnOff]}
                  onPress={() => sendMessage(input)}
                  disabled={!input.trim() || sending}
                >
                  <Ionicons name="send" size={15} color={input.trim() ? '#FFF' : Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

// ─── FAB Styles ───────────────────────────────────────────────
const FAB_SIZE = 60;
const fab = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  ring: {
    position: 'absolute',
    width: FAB_SIZE + 16,
    height: FAB_SIZE + 16,
    borderRadius: (FAB_SIZE + 16) / 2,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  btn: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
});

// ─── Modal / Chat Sheet Styles ────────────────────────────────
const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  kavWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '55%',
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 0.5 },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  clearBtn: { padding: Spacing.xs },
  closeBtn: { padding: Spacing.xs },

  // Empty state
  emptyState: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 2, marginBottom: Spacing.sm },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 20, marginBottom: Spacing.lg },
  quickList: { gap: Spacing.sm },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  quickChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, flex: 1 },

  // Messages
  messageList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },

  // Suggestions
  suggestionsRow: { paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, maxHeight: 48 },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  suggestionText: { fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: FontWeight.semibold, letterSpacing: 0.5, textTransform: 'uppercase' },

  // Input
  inputBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md, maxHeight: 100, paddingTop: 4, paddingBottom: 4 },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: { backgroundColor: Colors.border },
});

// ─── Inline chat bubble styles ────────────────────────────────
const chat = StyleSheet.create({
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  msgRowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: { maxWidth: '78%', paddingHorizontal: Spacing.md, paddingVertical: 9, borderRadius: BorderRadius.sm },
  bubbleAI: { backgroundColor: Colors.surfaceLight, borderBottomLeftRadius: 0 },
  bubbleUser: { backgroundColor: Colors.accent, borderBottomRightRadius: 0 },
  bubbleText: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 22 },
  bubbleTextUser: { color: '#FFF' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  typingBubble: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.textMuted },
});
