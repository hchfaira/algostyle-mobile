import { useState, useMemo, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { MOCK_FOLLOW_REQUESTS } from '../components/profile/constants';
import type { MenuItemDef } from '../components/profile/constants';
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
  const [followedBack, setFollowedBack]       = useState<Set<string>>(new Set());
  const [declinedReqs, setDeclinedReqs]       = useState<Set<string>>(new Set());
  const [following, setFollowing]             = useState<Set<string>>(new Set());

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
  }, [userId]);

  const pendingRequests = useMemo(
    () => MOCK_FOLLOW_REQUESTS.filter((r) => !declinedReqs.has(r.id) && !followedBack.has(r.id)),
    [declinedReqs, followedBack],
  );

  const displayName = profile?.name ?? (userId ? `User ${userId.slice(0, 6).toUpperCase()}` : 'GUEST');
  const handle = (profile?.name ?? userId ?? 'user').toLowerCase().replace(/\s+/g, '_').slice(0, 16);

  const handleLogout = useCallback(() => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); clearChat(); router.replace('/'); } },
    ]);
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

  const toggleFollow = useCallback((id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const acceptRequest = useCallback((id: string) => {
    setFollowedBack((prev) => new Set([...prev, id]));
  }, []);

  const declineRequest = useCallback((id: string) => {
    setDeclinedReqs((prev) => new Set([...prev, id]));
  }, []);

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
