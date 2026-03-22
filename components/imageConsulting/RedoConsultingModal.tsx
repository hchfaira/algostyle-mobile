/**
 * RedoConsultingModal — Photo pick / measure / submit modal
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';

const { height: SCREEN_H } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (imageUri: string, heightCm: number | undefined, weightKg: number | undefined) => void;
  initialHeight?: number | null;
  initialWeight?: number | null;
}

export default function RedoConsultingModal({ visible, onClose, onSubmit, initialHeight, initialWeight }: Props) {
  const [imageUri, setImageUri]   = useState<string | null>(null);
  const [fileName, setFileName]   = useState('');
  const [heightStr, setHeightStr] = useState(initialHeight ? String(initialHeight) : '');
  const [weightStr, setWeightStr] = useState(initialWeight ? String(initialWeight) : '');
  const [step, setStep]           = useState<'photo' | 'measurements'>('photo');
  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setStep('photo');
      setImageUri(null);
      setFileName('');
      setHeightStr(initialHeight ? String(initialHeight) : '');
      setWeightStr(initialWeight ? String(initialWeight) : '');
    }
  }, [visible, initialHeight, initialWeight]);

  const handleWebFileChange = (e: any) => {
    const file: File = e.target.files?.[0];
    if (!file) return;
    setImageUri(URL.createObjectURL(file));
    setFileName(file.name);
    setStep('measurements');
  };

  const pickFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo library access in Settings.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        quality: 0.85,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (!result.canceled && result.assets?.[0]) {
        setImageUri(result.assets[0].uri);
        setFileName(result.assets[0].fileName ?? 'photo.jpg');
        setStep('measurements');
      }
    } catch (e: any) {
      Alert.alert('Error', 'Could not open photo library: ' + (e?.message ?? e));
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access in Settings.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (!result.canceled && result.assets?.[0]) {
        setImageUri(result.assets[0].uri);
        setFileName('camera_photo.jpg');
        setStep('measurements');
      }
    } catch (e: any) {
      Alert.alert('Error', 'Could not open camera: ' + (e?.message ?? e));
    }
  };

  const handleSubmit = () => {
    if (!imageUri) {
      Alert.alert('No photo', 'Please take or choose a photo first.');
      return;
    }
    const h = parseFloat(heightStr) || undefined;
    const w = parseFloat(weightStr) || undefined;
    if (h !== undefined && (h < 100 || h > 250)) {
      Alert.alert('Invalid height', 'Please enter a height between 100 and 250 cm.');
      return;
    }
    onSubmit(imageUri, h, w);
  };

  const handleClose = () => {
    setStep('photo');
    setImageUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleWebFileChange}
        />
      )}

      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{step === 'photo' ? '📸  Choose a Photo' : '📏  Measurements'}</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            {step === 'photo' ? (
              <Animated.View entering={FadeInDown} style={{ gap: 14, paddingTop: Spacing.md }}>
                <Text style={styles.instructions}>
                  Stand ~2 m from the camera in good light with your full body visible for the best analysis.
                </Text>

                {Platform.OS !== 'web' && (
                  <TouchableOpacity style={styles.optionBtn} onPress={takePhoto} activeOpacity={0.85}>
                    <View style={styles.optionIcon}>
                      <Ionicons name="camera" size={22} color={Colors.textOnAccent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>Take a Photo</Text>
                      <Text style={styles.optionSub}>Use your camera right now</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}

                {Platform.OS !== 'web' && (
                  <TouchableOpacity style={styles.optionBtn} onPress={pickFromLibrary} activeOpacity={0.85}>
                    <View style={[styles.optionIcon, { backgroundColor: Colors.info }]}>
                      <Ionicons name="images" size={22} color={Colors.textOnAccent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>Upload from Library</Text>
                      <Text style={styles.optionSub}>Choose an existing full-body photo</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}

                {Platform.OS === 'web' && (
                  <TouchableOpacity
                    style={styles.optionBtn}
                    onPress={() => (fileInputRef.current as any)?.click()}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: Colors.info }]}>
                      <Ionicons name="cloud-upload" size={22} color={Colors.textOnAccent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>Upload a Photo</Text>
                      <Text style={styles.optionSub}>Choose a full-body photo from your files</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown} style={{ gap: 16, paddingTop: Spacing.md }}>
                <View style={styles.confirmRow}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.confirmText}>
                    Photo selected{fileName ? `: ${fileName}` : ' ✓'}
                  </Text>
                  <Pressable onPress={() => setStep('photo')} style={{ marginLeft: 'auto' }}>
                    <Text style={styles.changeLink}>Change</Text>
                  </Pressable>
                </View>

                <Text style={styles.instructions}>
                  Height and weight help give accurate size estimates and proportion advice. Both are optional.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={heightStr}
                    onChangeText={setHeightStr}
                    keyboardType="numeric"
                    placeholder="e.g. 168"
                    placeholderTextColor={Colors.textMuted}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Weight (kg) — optional</Text>
                  <TextInput
                    style={styles.textInput}
                    value={weightStr}
                    onChangeText={setWeightStr}
                    keyboardType="numeric"
                    placeholder="e.g. 62"
                    placeholderTextColor={Colors.textMuted}
                    returnKeyType="done"
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
                  <Ionicons name="sparkles-outline" size={18} color={Colors.textOnAccent} />
                  <Text style={styles.submitBtnText}>Run Analysis</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl + 4,
    borderTopRightRadius: BorderRadius.xl + 4,
    maxHeight: SCREEN_H * 0.92,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    ...Shadow.soft,
  },
  handle: {
    width: 40, height: 4, borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.3 },
  instructions: {
    fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20,
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.sm,
    fontWeight: FontWeight.regular,
  },

  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadow.soft,
  },
  optionIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  optionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, letterSpacing: -0.2 },
  optionSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, fontWeight: FontWeight.regular },

  confirmRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#E8F5E9', borderRadius: BorderRadius.md, padding: Spacing.sm,
  },
  confirmText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.semibold },
  changeLink: { fontSize: FontSize.sm, color: Colors.info, fontWeight: FontWeight.semibold },

  inputGroup: { gap: 6 },
  inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, letterSpacing: -0.1 },
  textInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.surface,
    fontWeight: FontWeight.regular,
  },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: BorderRadius.md, paddingVertical: 16,
    marginTop: 8,
    ...Shadow.soft,
  },
  submitBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textOnAccent, letterSpacing: 0.5 },
});
