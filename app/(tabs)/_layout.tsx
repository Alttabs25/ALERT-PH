import { Ionicons } from '@expo/vector-icons'; // <-- Universal Icons!
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 13 + insets.bottom,
          left: 12,
          right: 12,
          backgroundColor: colors.card,
          borderRadius: 20,
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 4,
          paddingTop: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          borderColor: colors.border,
          borderWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? "home" : "home-outline"} 
              color={focused ? colors.primary : colors.icon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? "map" : "map-outline"} 
              color={focused ? colors.primary : colors.icon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? "people" : "people-outline"} 
              color={focused ? colors.primary : colors.icon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="hotlines"
        options={{
          title: 'Hotlines',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? "call" : "call-outline"} 
              color={focused ? colors.primary : colors.icon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? "person" : "person-outline"} 
              color={focused ? colors.primary : colors.icon}
            />
          ),
        }}
      />
    </Tabs>
  );
}