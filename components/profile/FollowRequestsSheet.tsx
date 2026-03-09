import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';

interface FollowRequest {
  id: string;
  name: string;
  handle: string;
  mutuals: number;
}

interface FollowRequestsSheetProps {
  visible: boolean;
  pendingRequests: FollowRequest[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onClose: () => void;
}

export function FollowRequestsSheet({
  visible,
  pendingRequests,
  onAccept,
  onDecline,
  onClose,
}: FollowRequestsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>FOLLOW REQUESTS</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          {pendingRequests.length === 0 ? (
            <View style={styles.emptySheet}>
              <Ionicons name="people-outline" size={36} color={Colors.textMuted} />
              <Text style={styles.emptySheetText}>No pending requests</Text>
            </View>
          ) : (
            pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestRow}>
                <View style={styles.personAvatar}>
                  <Ionicons name="person" size={18} color="#FFF" />
                </View>
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{req.name}</Text>
                  <Text style={styles.personHandle}>
                    {req.handle} · {req.mutuals} mutual{req.mutuals !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(req.id)}>
                    <Text style={styles.acceptText}>ACCEPT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => onDecline(req.id)}>
                    <Ionicons name="close" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 32 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    maxHeight: '75%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  sheetTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 2 },
  emptySheet: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptySheetText: { fontSize: FontSize.md, color: Colors.textMuted },
  requestRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  personAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  personInfo: { flex: 1 },
  personName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  personHandle: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  requestActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  acceptBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.accent,
  },
  acceptText: { fontSize: 11, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 1 },
  declineBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
});
