import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import {
  ProfileHeader,
  ClosetStats,
  SettingsMenu,
  StyleDNA,
  FollowRequestsSheet,
  FollowListSheet,
  EditBioSheet,
} from '../../components/profile';
import { useProfile } from '../../hooks/useProfile';

export default function ProfileScreen() {
  const p = useProfile();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <ProfileHeader
        displayName={p.displayName}
        handle={p.handle}
        bio={p.bio}
        outfitsShared={p.outfitsCount}
        likesReceived={p.likesReceived}
        followersCount={p.followersCount}
        followingCount={p.followingCount}
        pendingRequestsCount={p.pendingRequests.length}
        onEditBio={p.openEditBio}
        onFollowersPress={() => p.setShowFollowSheet('followers')}
        onFollowingPress={() => p.setShowFollowSheet('following')}
        onRequestsPress={() => p.setShowRequests(true)}
      />

      <ClosetStats wardrobeCount={p.wardrobeCount} outfitsCount={p.outfitsCount} likesReceived={p.likesReceived} />

      <SettingsMenu menuItems={p.menuItems} />

      {p.showStyleDNA && p.profile && <StyleDNA profile={p.profile} />}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.signOutBtn} onPress={p.handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#FFF" />
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </TouchableOpacity>
        <Text style={styles.version}>AlgoStyle v1.0.0</Text>
      </View>

      <FollowRequestsSheet
        visible={p.showRequests}
        pendingRequests={p.pendingRequests}
        onAccept={p.acceptRequest}
        onDecline={p.declineRequest}
        onClose={() => p.setShowRequests(false)}
      />
      <FollowListSheet
        mode={p.showFollowSheet}
        users={p.showFollowSheet === 'followers' ? p.followersList : p.followingList}
        total={p.showFollowSheet === 'followers' ? p.followersCount : p.followingCount}
        following={p.following}
        onToggleFollow={p.toggleFollow}
        onClose={() => p.setShowFollowSheet(null)}
      />
      <EditBioSheet
        visible={p.showEditBio}
        pendingBio={p.pendingBio}
        onChangeBio={p.setPendingBio}
        onSave={p.saveBio}
        onClose={p.saveBio}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  footer: { alignItems: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.lg },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, width: '100%', height: 48, backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
  },
  signOutText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#FFF', letterSpacing: 0.5 },
  version: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.md },
});
