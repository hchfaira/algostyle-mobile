import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';

import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import { OutfitPostCard } from '../../components/social';
import { usePeopleFeed } from '../../hooks/usePeopleFeed';

export default function PeopleScreen() {
  const feed = usePeopleFeed();

  return (
    <View style={styles.container}>
      <TopBar title="People" />

      {feed.loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.accent} />
          <Text style={styles.loaderText}>Loading community feed…</Text>
        </View>
      ) : (
        <FlatList
          ref={feed.flatListRef}
          data={feed.posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <OutfitPostCard
              post={item}
              index={index}
              onLike={feed.handleLike}
              onSave={feed.handleSave}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={feed.refreshing}
              onRefresh={feed.onRefresh}
              tintColor={Colors.accent}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No outfits shared yet</Text>
              <Text style={styles.emptySubtitle}>
                Share your outfits from the Wardrobe tab to see them here!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: 100,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loaderText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

