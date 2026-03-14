/**
 * Auth Screen — ASOS-style: clean white, bold typography, black CTAs
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../constants/theme';
import { Button } from '../components/ui';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type { UserRole } from '../types';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAuth } = useAppStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (mode === 'register') {
        res = await api.register(email, password, name || 'User');
      } else {
        res = await api.login(email, password);
      }
      api.setToken(res.token);
      setAuth(res);
      if (!res.is_onboarded) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/wardrobe');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      const res = await api.guestLogin();
      api.setToken(res.token);
      setAuth(res);
      router.replace('/onboarding');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {mode === 'login' ? 'SIGN IN' : 'JOIN'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Access your wardrobe & outfits'
                : 'Create your AlgoStyle account'}
            </Text>
          </View>

          {/* Role selector (register only) */}
          {mode === 'register' && (
            <View style={styles.roleSection}>
              <Text style={styles.sectionLabel}>I AM A</Text>
              <View style={styles.roleRow}>
                {[
                  { key: 'user' as UserRole, label: 'User', desc: 'Personal style' },
                  { key: 'stylist' as UserRole, label: 'Stylist', desc: 'Client tools' },
                  { key: 'business' as UserRole, label: 'Business', desc: 'Catalogue' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.roleCard, role === r.key && styles.roleCardActive]}
                    onPress={() => setRole(r.key)}
                  >
                    <Text style={[styles.roleLabel, role === r.key && styles.roleLabelActive]}>
                      {r.label}
                    </Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NAME</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="hello@example.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title={mode === 'login' ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Guest */}
          <Button
            title="Continue as Guest"
            onPress={handleGuest}
            variant="outline"
            fullWidth
          />

          {/* Toggle */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            <Text style={styles.toggleText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <Text style={styles.toggleAction}>
              {mode === 'login' ? 'JOIN' : 'SIGN IN'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  header: { marginBottom: Spacing.xl },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    marginLeft: -8,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  roleSection: { marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 2,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  roleCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  roleCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceLight,
  },
  roleLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  roleLabelActive: { color: Colors.accent },
  roleDesc: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  form: { gap: Spacing.md, marginBottom: Spacing.lg },
  inputGroup: { gap: Spacing.xs },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginHorizontal: Spacing.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  toggleText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  toggleAction: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textDecorationLine: 'underline',
  },
});
