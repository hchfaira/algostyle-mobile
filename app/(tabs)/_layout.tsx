/**
 * Tab Layout — bottom navigation
 *
 * Bottom tabs: People · Wardrobe · Outfits · Shop · Why AlgoStyle
 * Chat → replaced by FloatingChatButton (FAB) visible across all tabs
 * Profile → accessed via TopBar
 *
 * Design: ASOS-style, black active state, minimal chrome
 */
import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '../../constants/theme';
import { FloatingChatButton } from '../../components/FloatingChatButton';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 28,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: FontSize.xs,
            fontWeight: FontWeight.semibold,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          },
        }}
      >
        <Tabs.Screen
          name="people"
          options={{
            title: 'People',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="wardrobe"
          options={{
            title: 'Wardrobe',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="recommend"
          options={{
            title: 'Outfits',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sparkles-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="image-consulting"
          options={{
            title: 'Style DNA',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="color-wand-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bag-handle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'AI Chat',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sparkles-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="why-algostyle"
          options={{
            href: null, // hidden from tab bar — accessed via profile menu
          }}
        />
        {/* Profile is accessed via TopBar */}
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Floating AI chat button — visible across all tabs */}
      <FloatingChatButton />
    </View>
  );
}
