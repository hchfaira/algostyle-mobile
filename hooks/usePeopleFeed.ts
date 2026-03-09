/**
 * usePeopleFeed — State management for the social People tab.
 */
import { useState, useCallback, useRef } from 'react';
import { FlatList } from 'react-native';
import { MOCK_POSTS, type UserOutfitPost } from '../components/social/constants';

export function usePeopleFeed() {
  const [posts, setPosts] = useState<UserOutfitPost[]>(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<UserOutfitPost | null>(null);
  const [showComments, setShowComments] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLike = useCallback((postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  }, []);

  const handleComment = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setShowComments(true);
    }
  }, [posts]);

  const handleAddComment = useCallback((comment: string) => {
    if (selectedPost) {
      setPosts(prev =>
        prev.map(p =>
          p.id === selectedPost.id ? { ...p, comments: p.comments + 1 } : p,
        ),
      );
    }
  }, [selectedPost]);

  const closeComments = useCallback(() => setShowComments(false), []);

  return {
    posts,
    refreshing,
    onRefresh,
    handleLike,
    handleComment,
    handleAddComment,
    selectedPost,
    showComments,
    closeComments,
    flatListRef,
  };
}
