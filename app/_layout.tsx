import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { auth } from '../firebaseConfig';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync(Ionicons.font);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  // Handle Authentication Redirects
  useEffect(() => {
    if (!appIsReady) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === '(auth)';

      if (user && inAuthGroup) {
        // Redirect to tabs if logged in and trying to access login screen
        router.replace('/(tabs)');
      } else if (!user && !inAuthGroup && segments[0] !== 'welcome' && segments[0] !== 'index') {
        // Redirect to login if not logged in
        router.replace('/(auth)/login');
      }
    });

    return unsubscribe;
  }, [appIsReady, segments]);

  if (!appIsReady) return null;

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> 
        <Stack.Screen name="welcome" /> 
        <Stack.Screen name="(auth)" /> 
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}