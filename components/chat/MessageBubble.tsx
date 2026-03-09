import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import type { ChatMessageType } from '../../types';

interface MessageBubbleProps {
  item: ChatMessageType;
}

export function MessageBubble({ item }: MessageBubbleProps) {
  const isUser = item.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={14} color="#FFF" />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{item.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  rowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 0,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: { maxWidth: '78%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.sm },
  bubbleAI: { backgroundColor: Colors.surfaceLight, borderBottomLeftRadius: 0 },
  bubbleUser: { backgroundColor: Colors.accent, borderBottomRightRadius: 0 },
  text: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 22 },
  textUser: { color: '#FFF' },
});
