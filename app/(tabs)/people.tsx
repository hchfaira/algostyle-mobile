/**
 * People Tab — Community Outfit Feed
 *
 * Showcases outfits shared by users (AI-built or user-created)
 * Features: Like, Comment, Share
 */
import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';

import { Colors, Spacing } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import { OutfitPostCard, CommentModal } from '../../components/social';
import { usePeopleFeed } from '../../hooks/usePeopleFeed';

export default function PeopleScreen() {
  const feed = usePeopleFeed();

  return (
    <View style={styles.container}>
      <TopBar title="People" />

      <FlatList
        ref={feed.flatListRef}
        data={feed.posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <OutfitPostCard
            post={item}
            index={index}
            onLike={feed.handleLike}
            onComment={feed.handleComment}
          />
        )}
        refreshControl={<RefreshControl refreshing={feed.refreshing} onRefresh={feed.onRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <CommentModal
        visible={feed.showComments}
        post={feed.selectedPost}
        onClose={feed.closeComments}
        onAddComment={feed.handleAddComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.lg, paddingBottom: 100 },
});
