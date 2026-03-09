/**
 * Profile Tab — ASOS-style account screen with social media layer
 * Thin orchestrator — all logic in useProfile, UI in components/profile
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { MOCK_SOCIAL } from '../../components/profile/constants';
import {
  ProfileHeader,
  ClosetStats,
  SuggestedPeople,
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
      {/* ── Hero header ── */}
      <ProfileHeader
        displayName={p.displayName}
        handle={p.handle}
        bio={p.bio}
        verificationBadge={MOCK_SOCIAL.verification_badge}
        pendingRequestsCount={p.pendingRequests.length}
        onEditBio={p.openEditBio}
        onFollowersPress={() => p.setShowFollowSheet('followers')}
        onFollowingPress={() => p.setShowFollowSheet('following')}
        onRequestsPress={() => p.setShowRequests(true)}
      />

      {/* ── Wardrobe & Outfits mini-stats ── */}
      <ClosetStats wardrobeCount={p.wardrobe.length} outfitsCount={p.outfits.length} />

      {/* ── Suggested people ── */}
      <SuggestedPeople following={p.following} onToggleFollow={p.toggleFollow} />

      {/* ── Settings menu ── */}
      <SettingsMenu menuItems={p.menuItems} />

      {/* ── Style DNA expand ── */}
      {p.showStyleDNA && p.profile && <StyleDNA profile={p.profile} />}

      {/* ── Sign Out ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.signOutBtn} onPress={p.handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#FFF" />
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </TouchableOpacity>
        <Text style={styles.version}>AlgoStyle v1.0.0</Text>
      </View>

      {/* ── Modals ── */}
      <FollowRequestsSheet
        visible={p.showRequests}
        pendingRequests={p.pendingRequests}
        onAccept={p.acceptRequest}
        onDecline={p.declineRequest}
        onClose={() => p.setShowRequests(false)}
      />
      <FollowListSheet
        mode={p.showFollowSheet}
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
  },
  signOutText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 1.5 },
  version: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.md },
});
