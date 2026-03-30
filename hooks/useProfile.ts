import { useState, useMemo, useCallback, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import type { MenuItemDef } from '../components/profile/constants';
import type { FollowRequestItem, FollowUserSummary } from '../services/api/social';
import { api } from '../services/api/index';

export function useProfile() {
  const router = useRouter();
  const { userId, profile, wardrobe, outfits, logout, clearChat, setProfile } = useAppStore();

  const [showStyleDNA, setShowStyleDNA]       = useState(false);
  const [showFollowSheet, setShowFollowSheet] = useState<'followers' | 'following' | null>(null);
  const [showRequests, setShowRequests]       = useState(false);
  const [showEditBio, setShowEditBio]         = useState(false);
  const [bio, setBio]                         = useState(profile?.bio ?? '');
  const [pendingBio, setPendingBio]           = useState(profile?.bio ?? '');
  const [wardrobeCount, setWardrobeCount]     = useState(wardrobe.length);
  const [outfitsCount, setOutfitsCount]       = useState(0);
  const [outfitsShared, setOutfitsShared]     = useState(0);
  const [likesReceived, setLikesReceived]     = useState(0);
  const [following, setFollowing]             = useState<Set<string>>(new Set());
  const [followersCount, setFollowersCount]   = useState(0);
  const [followingCount, setFollowingCount]   = useState(0);
  const [followersList, setFollowersList]     = useState<FollowUserSummary[]>([]);
  const [followingList, setFollowingList]     = useState<FollowUserSummary[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FollowRequestItem[]>([]);

  useEffect(() => {
    if (!userId) return;
    api.profile.getProfile(userId).then((fetched) => {
      setProfile(fetched);
      setBio(fetched.bio ?? '');
      setPendingBio(fetched.bio ?? '');
    }).catch(() => {});
    api.wardrobe.getWardrobe(userId).then((items) => {
      setWardrobeCount(items.length);
    }).catch(() => {});
    api.wardrobe.listCustomOutfits(userId).then((res) => {
      setOutfitsCount(res.total ?? res.outfits?.length ?? 0);
    }).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    api.social.getUserStats(userId).then((stats: { outfits_shared: number; likes_received: number }) => {
      setOutfitsShared(stats.outfits_shared);
      setLikesReceived(stats.likes_received);
    }).catch(() => {});

    // Fetch follow counts
    api.social.getFollowCounts(userId).then((counts) => {
      setFollowersCount(counts.followers_count);
      setFollowingCount(counts.following_count);
    }).catch(() => {});

    // Fetch pending follow requests
    api.social.getFollowRequests(userId).then((res) => {
      setPendingRequests(res.requests);
    }).catch(() => {});
  }, [userId]);

  // Fetch followers/following lists when the sheet opens
  useEffect(() => {
    if (!userId || !showFollowSheet) return;
    if (showFollowSheet === 'followers') {
      api.social.getFollowers(userId, userId).then((res) => {
        setFollowersList(res.users);
        const ids = new Set(res.users.filter((u) => u.is_following).map((u) => u.user_id));
        setFollowing((prev) => new Set([...prev, ...ids]));
      }).catch(() => {});
    } else {
      api.social.getFollowing(userId, userId).then((res) => {
        setFollowingList(res.users);
        const ids = new Set(res.users.map((u) => u.user_id));
        setFollowing((prev) => new Set([...prev, ...ids]));
      }).catch(() => {});
    }
  }, [userId, showFollowSheet]);

  const displayName = profile?.name ?? (userId ? `User ${userId.slice(0, 6).toUpperCase()}` : 'GUEST');
  const handle = (profile?.name ?? userId ?? 'user').toLowerCase().replace(/\s+/g, '_').slice(0, 16);

  const handleLogout = useCallback(() => {
    const doLogout = () => { logout(); clearChat(); router.replace('/'); };
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        doLogout();
      }
    } else {
      Alert.alert('Sign out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: doLogout },
      ]);
    }
  }, [logout, clearChat, router]);

  const openEditBio = useCallback(() => {
    setPendingBio(bio);
    setShowEditBio(true);
  }, [bio]);

  const saveBio = useCallback(() => {
    setBio(pendingBio);
    setShowEditBio(false);
    if (userId) {
      api.profile.updateProfile(userId, { bio: pendingBio }).then((updated: any) => {
        setProfile(updated);
      }).catch(() => {});
    }
  }, [pendingBio, userId, setProfile]);

  const toggleFollow = useCallback((targetId: string) => {
    if (!userId) return;
    const isFollowing = following.has(targetId);
    // Optimistic update
    setFollowing((prev) => {
      const next = new Set(prev);
      isFollowing ? next.delete(targetId) : next.add(targetId);
      return next;
    });
    const call = isFollowing
      ? api.social.unfollowUser(userId, targetId)
      : api.social.followUser(userId, targetId);
    call.then((res) => {
      setFollowersCount(res.followers_count);
      setFollowingCount(res.following_count);
    }).catch(() => {
      // Revert on error
      setFollowing((prev) => {
        const next = new Set(prev);
        isFollowing ? next.add(targetId) : next.delete(targetId);
        return next;
      });
    });
  }, [userId, following]);

  const acceptRequest = useCallback((requestId: string) => {
    if (!userId) return;
    api.social.acceptFollowRequest(userId, requestId).then((res) => {
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      setFollowersCount(res.followers_count);
    }).catch(() => {});
  }, [userId]);

  const declineRequest = useCallback((requestId: string) => {
    if (!userId) return;
    api.social.declineFollowRequest(userId, requestId).then(() => {
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    }).catch(() => {});
  }, [userId]);

  const menuItems: MenuItemDef[] = useMemo(() => [
    { icon: 'person-outline',          label: 'Style Profile',      value: profile ? 'Complete' : 'Not set', action: () => setShowStyleDNA((v) => !v) },
    { icon: 'color-palette-outline',   label: 'Edit Preferences',   value: 'Update style quiz',              action: () => router.push('/onboarding') },
    { icon: 'notifications-outline',   label: 'Notifications',      value: 'On',                             action: () => {} },
    { icon: 'eye-outline',             label: 'Account Visibility', value: profile?.is_public !== false ? 'Public' : 'Private', action: () => {} },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Data',    action: () => {} },
    { icon: 'information-circle-outline', label: 'Why Us',          action: () => router.push('/why-algostyle') },
    { icon: 'help-circle-outline',     label: 'Help & FAQ',         action: () => {} },
  ], [profile, router]);

  return {
    userId,
    profile,
    wardrobe,
    outfits,
    displayName,
    handle,
    bio,
    pendingBio,
    wardrobeCount,
    outfitsCount,
    outfitsShared,
    likesReceived,
    pendingRequests,
    following,
    followersCount,
    followingCount,
    followersList,
    followingList,
    showStyleDNA,
    showFollowSheet,
    showRequests,
    showEditBio,
    menuItems,

    setPendingBio,
    setShowFollowSheet,
    setShowRequests,

    openEditBio,
    saveBio,
    toggleFollow,
    acceptRequest,
    declineRequest,
    handleLogout,
  };
}
