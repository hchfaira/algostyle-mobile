/**
 * Chat Tab — ASOS-style AI Style Assistant
 * Thin orchestrator — logic in useChat, UI in components/chat
 */
import React from 'react';
import { Text, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import {
  EmptyState,
  MessageBubble,
  TypingIndicator,
  SuggestionChips,
  ChatInput,
} from '../../components/chat';
import { useChat } from '../../hooks/useChat';

export default function ChatScreen() {
  const c = useChat();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <TopBar title="Style Assistant" subtitle="Ask anything about fashion" />

      {c.hasMessages && (
        <TouchableOpacity style={styles.clearRow} onPress={c.clearChat}>
          <Ionicons name="trash-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.clearText}>CLEAR CHAT</Text>
        </TouchableOpacity>
      )}

      {!c.hasMessages ? (
        <EmptyState onSend={c.sendMessage} />
      ) : (
        <FlatList
          ref={c.flatListRef}
          data={c.chatMessages}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <MessageBubble item={item} />}
          onContentSizeChange={c.scrollToEnd}
          ListFooterComponent={c.sending ? <TypingIndicator /> : null}
        />
      )}

      <SuggestionChips suggestions={c.suggestions} onSend={c.sendMessage} />

      <ChatInput
        input={c.input}
        onChangeText={c.setInput}
        onSend={c.handleSend}
        disabled={!c.input.trim() || c.sending}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  clearText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1.5 },
  messageList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
});
