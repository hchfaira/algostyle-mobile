/**
 * Welcome Screen — ASOS-style editorial landing
 * Bold typography, black CTA, minimal decoration
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../constants/theme';
import { Button } from '../components/ui';
import { useAppStore } from '../store/useAppStore';

export default function WelcomeScreen() {
  const { isAuthenticated } = useAppStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/wardrobe');
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBg}>
              <Text style={styles.logoText}>AS</Text>
            </View>
          </View>
          <Text style={styles.appName}>ALGOSTYLE</Text>
          <Text style={styles.tagline}>AI-Powered Fashion</Text>
        </View>

        {/* Feature highlights */}
        <View style={styles.features}>
          {[
            { icon: 'grid-outline' as const, text: 'Smart Wardrobe' },
            { icon: 'sparkles-outline' as const, text: 'AI Outfit Recommendations' },
            { icon: 'body-outline' as const, text: 'Virtual Try-On' },
            { icon: 'chatbubble-outline' as const, text: 'Style Assistant' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name={f.icon} size={18} color={Colors.textPrimary} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View style={styles.cta}>
          <Button
            title="Get Started"
            onPress={() => router.push('/auth')}
            variant="primary"
            size="lg"
            fullWidth
            icon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
          />

          <View style={styles.roleHint}>
            <Text style={styles.roleHintText}>
              FOR USERS, STYLISTS & BUSINESSES
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>ALGOSTYLE © 2024</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoBg: {
    width: 72,
    height: 72,
    borderRadius: 0,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 26,
    fontWeight: FontWeight.black,
    color: '#FFF',
    letterSpacing: 2,
  },
  appName: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  features: {
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featureText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
    letterSpacing: 0.3,
  },
  cta: {
    gap: Spacing.md,
  },
  roleHint: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  roleHintText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    letterSpacing: 2,
  },
  footer: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    letterSpacing: 2,
    paddingBottom: 40,
  },
});
