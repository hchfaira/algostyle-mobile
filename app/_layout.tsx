/**
 * Root layout — Expo Router
 * Sets up the navigation stack with the dark fashion theme.
 */
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Colors } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import IntroVideoScreen from '../components/IntroVideoScreen';

// Module-level flag: true only after the intro has played in this JS runtime
// session. Resets to false every time the app process is freshly started.
let introPlayedThisSession = false;

export default function RootLayout() {
  const { isRestoring, restoreAuth, isAuthenticated, token } = useAppStore();
  const [showIntro, setShowIntro] = useState(!introPlayedThisSession);

  useEffect(() => {
    restoreAuth();
    // restoreAuth is memoized by Zustand, it's safe to skip
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set token on API service when it becomes available
  useEffect(() => {
    if (token) {
      api.setToken(token);
    }
  }, [token]);

  const handleIntroFinish = () => {
    introPlayedThisSession = true;
    setShowIntro(false);
  };

  // Show the intro video fullscreen before anything else
  if (showIntro) {
    return <IntroVideoScreen onFinish={handleIntroFinish} />;
  }

  // Show splash screen while restoring auth state
  if (isRestoring) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="home" />
      <Stack.Screen
        name="outfit-detail"
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
    </Stack>
  );
}
