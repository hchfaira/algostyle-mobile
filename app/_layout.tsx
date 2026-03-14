/**
 * Root layout — Expo Router
 * Sets up the navigation stack with the dark fashion theme.
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Colors } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

export default function RootLayout() {
  const { isRestoring, restoreAuth, isAuthenticated, token } = useAppStore();

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

  // Show splash screen while restoring auth state
  if (isRestoring) {
    return (
      <>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: Colors.background }} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        {/* If authenticated, show tabs directly */}
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        ) : (
          <>
            {/* If not authenticated, show welcome and auth flow */}
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="onboarding" />
          </>
        )}
        <Stack.Screen
          name="outfit-detail"
          options={{ animation: 'slide_from_right', presentation: 'card' }}
        />
      </Stack>
    </>
  );
}
