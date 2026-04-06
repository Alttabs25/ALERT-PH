import { ThemeProvider } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { Audio } from 'expo-av';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';

let hasFinishedWelcomeAnimation = false;

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

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      const isWelcomeScreen = segments[0] === 'welcome';
      const inAuthGroup = segments[0] === '(auth)';
      const isIndex = segments[0] === 'index' || segments.length === 0;

      // 1. ANIMATION GATEKEEPER
      if (!hasFinishedWelcomeAnimation) {
        if (!isWelcomeScreen) router.replace('/welcome');
        return; 
      }

      // 2. FIXED REMEMBER ME LOGIC
      if (user) {
        // If logged in but on a "starting" screen, skip to Tabs
        if (inAuthGroup || isWelcomeScreen || isIndex) {
          router.replace('/(tabs)');
        }
      } else {
        // If logged out and not on a starting screen, go to Login
        if (!inAuthGroup && !isWelcomeScreen && !isIndex) {
          router.replace('/(auth)/login');
        }
      }

      // 3. SOS LISTENER (Your original logic)
      if (user) {
        const q = query(collection(db, "users"), where("emergencyStatus.isActive", "==", true));
        const unsubscribeSOS = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added" || change.type === "modified") {
              const victim = change.doc.data();
              if (change.doc.id === user.uid) return;

              try {
                const { sound } = await Audio.Sound.createAsync({ uri: 'https://www.soundjay.com/buttons/beep-01a.mp3' });
                await sound.playAsync();

                Alert.alert("🚨 SOS ALERT 🚨", `${victim.fullName || 'Someone'} needs help!`, [
                  { text: "TRACK", onPress: () => router.push({ pathname: '/(tabs)/map', params: { lat: victim.emergencyStatus.latitude, lng: victim.emergencyStatus.longitude }}) },
                  { text: "DISMISS", style: 'cancel' }
                ]);
              } catch (e) { console.log("SOS Error", e); }
            }
          });
        });
        return () => unsubscribeSOS();
      }
    });

    return unsubscribeAuth;
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