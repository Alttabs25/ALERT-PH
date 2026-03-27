import { ThemeProvider } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';

// GLOBAL GATEKEEPER
let hasFinishedWelcomeAnimation = false;

// Function to break the loop from the Welcome screen
export const setWelcomeFinished = () => {
  hasFinishedWelcomeAnimation = true;
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    SplashScreen.hideAsync();
    setAppIsReady(true);
  }, []);

  useEffect(() => {
    if (!appIsReady) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isWelcomeScreen = segments[0] === 'welcome';
      const inAuthGroup = segments[0] === '(auth)';

      // 1. FORCE THE ANIMATION FIRST
      if (!hasFinishedWelcomeAnimation) {
        if (!isWelcomeScreen) {
          router.replace('/welcome');
        }
        return; 
      }

      // 2. AUTH LOGIC (Only runs if animation is done)
      if (user && inAuthGroup) {
        router.replace('/(tabs)');
      } else if (!user && !inAuthGroup && !isWelcomeScreen && segments[0] !== 'index') {
        router.replace('/(auth)/login');
      }
    });

    return unsubscribe;
  }, [appIsReady, segments]);

  return (
    <UserProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </UserProvider>
  );
}