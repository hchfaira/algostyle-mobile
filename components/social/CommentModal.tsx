/**
 * CommentModal — Bottom-sheet style modal for post comments.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { SEED_COMMENTS, type UserOutfitPost, type Comment } from './constants';

interface Props {
  visible: boolean;
  post: UserOutfitPost | null;
  onClose: () => void;
  onAddComment: (comment: string) => void;
}

export default function CommentModal({ visible, post, onClose, onAddComment }: Props) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS);

  const handleAdd = () => {
    if (!comment.trim()) return;
    const newComment: Comment = {
      id: String(comments.length + 1),
      userId: 'currentUser',
      userName: 'You',
      userAvatar: '👤',
      content: comment,
      timestamp: 'now',
    };
    setComments([...comments, newComment]);
    onAddComment(comment);
    setComment('');
  };

  if (!post) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Comments</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </Pressable>
          </View>

          {/* List */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.avatar}><Text style={styles.avatarEmoji}>{item.userAvatar}</Text></View>
                <View style={styles.body}>
                  <Text style={styles.user}>{item.userName}</Text>
                  <Text style={styles.text}>{item.content}</Text>
                  <Text style={styles.time}>{item.timestamp}</Text>
                </View>
              </View>
            )}
            style={styles.list}
            scrollEnabled
          />

          {/* Input */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={Colors.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <Pressable onPress={handleAdd} disabled={!comment.trim()} style={[styles.sendBtn, !comment.trim() && styles.sendBtnDisabled]}>
              <Ionicons name="send" size={18} color={comment.trim() ? Colors.accent : Colors.textMuted} />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '85%', overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 0.5 },
  list: { flex: 1, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 18 },
  body: { flex: 1 },
  user: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 2 },
  text: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  time: { fontSize: FontSize.xs, color: Colors.textMuted },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  input: { flex: 1, minHeight: 40, maxHeight: 100, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.background, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, fontSize: FontSize.sm, color: Colors.textPrimary },
  sendBtn: { padding: Spacing.sm, borderRadius: BorderRadius.sm },
  sendBtnDisabled: { opacity: 0.5 },
});
