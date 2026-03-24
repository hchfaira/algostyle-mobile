import { useState, useCallback, useRef, useEffect } from 'react';
import { FlatList } from 'react-native';
import { type UserOutfitPost } from '../components/social/constants';
import { api } from '../services/api/index';
import { toUserOutfitPost } from '../services/api/social';
import { useAppStore } from '../store/useAppStore';

export function usePeopleFeed() {
  const userId = useAppStore((s) => s.userId);

  const [posts, setPosts] = useState<UserOutfitPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadFeed = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.social.getFeed(userId);
      setPosts(res.posts.map(toUserOutfitPost));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, [loadFeed]);

  const handleLike = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
    if (!userId) return;
    try {
      const res = await api.social.toggleLike(userId, postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, liked: res.liked, likes: res.likes } : p)),
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
            : p,
        ),
      );
    }
  }, [userId]);

  const handleSave = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, saved: !p.saved, saves: p.saved ? p.saves - 1 : p.saves + 1 }
          : p,
      ),
    );
    if (!userId) return;
    try {
      const res = await api.social.toggleSave(userId, postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, saved: res.saved, saves: res.saves } : p)),
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, saved: !p.saved, saves: p.saved ? p.saves - 1 : p.saves + 1 }
            : p,
        ),
      );
    }
  }, [userId]);

  return {
    posts,
    loading,
    refreshing,
    onRefresh,
    handleLike,
    handleSave,
    flatListRef,
  };
}
