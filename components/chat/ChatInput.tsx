import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface ChatInputProps {
  input: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function ChatInput({ input, onChangeText, onSend, disabled }: ChatInputProps) {
  return (
    <View style={styles.inputBar}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={onChangeText}
          placeholder="Ask about style, outfits, colours..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
          onSubmitEditing={onSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, disabled && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={disabled}
        >
          <Ionicons name="send" size={16} color={!disabled ? '#FFF' : Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingBottom: 34,
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
    borderRadius: 0,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
