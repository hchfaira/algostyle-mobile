import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';

interface EditBioSheetProps {
  visible: boolean;
  pendingBio: string;
  onChangeBio: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditBioSheet({ visible, pendingBio, onChangeBio, onSave, onClose }: EditBioSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>EDIT PROFILE</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldLabel}>BIO</Text>
          <TextInput
            style={styles.bioInput}
            value={pendingBio}
            onChangeText={onChangeBio}
            placeholder="Tell the world your style…"
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={120}
          />
          <Text style={styles.charCount}>{pendingBio.length}/120</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
          </TouchableOpacity>
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
  fieldLabel: {
    fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.sm,
  },
  bioInput: {
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, fontSize: FontSize.md, color: Colors.textPrimary,
    minHeight: 90, textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: Colors.textMuted, textAlign: 'right', marginTop: 4, marginBottom: Spacing.lg },
  saveBtn: { height: 48, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: 2 },
});
