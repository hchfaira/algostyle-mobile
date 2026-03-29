import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { TopBar } from '../../components/ui';
import { OutfitPostCard } from '../../components/social';
import { usePeopleFeed } from '../../hooks/usePeopleFeed';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api/index';
import type { UserSearchResult } from '../../services/api/social';

export default function PeopleScreen() {
  const feed = usePeopleFeed();
  const userId = useAppStore((s) => s.userId);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSearchActive = searchQuery.trim().length > 0;

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!text.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      if (!userId) return;
      try {
        const res = await api.social.searchUsers(text.trim(), userId);
        setSearchResults(res.users);
        const ids = new Set(res.users.filter((u) => u.is_following).map((u) => u.user_id));
        setFollowingSet(ids);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [userId]);

  const handleToggleFollow = useCallback(async (targetId: string) => {
    if (!userId) return;
    const isFollowing = followingSet.has(targetId);
    setFollowingSet((prev) => {
      const next = new Set(prev);
      isFollowing ? next.delete(targetId) : next.add(targetId);
      return next;
    });
    try {
      if (isFollowing) {
        await api.social.unfollowUser(userId, targetId);
      } else {
        await api.social.followUser(userId, targetId);
      }
    } catch {
      setFollowingSet((prev) => {
        const next = new Set(prev);
        isFollowing ? next.add(targetId) : next.delete(targetId);
        return next;
      });
    }
  }, [userId, followingSet]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearching(false);
  }, []);

  return (
    <View style={styles.container}>
      <TopBar title="People" />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people…"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {isSearchActive && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearchActive ? (
        /* Search results */
        searching ? (
          <View style={styles.loader}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.user_id}
            renderItem={({ item }) => (
              <View style={styles.personRow}>
                <View style={styles.personAvatar}>
                  <Ionicons name="person" size={18} color="#FFF" />
                </View>
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{item.name}</Text>
                  <Text style={styles.personHandle}>{item.handle}</Text>
                  {item.bio ? <Text style={styles.personBio} numberOfLines={1}>{item.bio}</Text> : null}
                </View>
                <TouchableOpacity
                  style={[styles.followBtn, followingSet.has(item.user_id) && styles.followBtnActive]}
                  onPress={() => handleToggleFollow(item.user_id)}
                >
                  <Text style={[styles.followBtnText, followingSet.has(item.user_id) && styles.followBtnTextActive]}>
                    {followingSet.has(item.user_id) ? 'FOLLOWING' : 'FOLLOW'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.searchListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={36} color={Colors.textMuted} />
                <Text style={styles.emptySubtitle}>No users found for "{searchQuery}"</Text>
              </View>
            }
          />
        )
      ) : (
        /* Normal feed */
        feed.loading ? (
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
                <Text style={styles.emptyTitle}>No outfits yet</Text>
                <Text style={styles.emptySubtitle}>
                  Follow people using the search bar above to see their outfits here!
                </Text>
              </View>
            }
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  searchListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInfo: { flex: 1 },
  personName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  personHandle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  personBio: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: BorderRadius.full,
  },
  followBtnActive: { backgroundColor: Colors.textPrimary },
  followBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  followBtnTextActive: { color: '#FFF' },
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

