import { ThemeProvider } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { Audio } from 'expo-av'; // Added for Siren
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore'; // Added for SOS
import { useEffect, useState } from 'react';
import { Alert } from 'react-native'; // Added for the popup
import { auth, db } from '../firebaseConfig';

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

  // --- SOS RECEIVER LOGIC (NO DESIGN CHANGES) ---
  useEffect(() => {
    if (!appIsReady) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
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

      // 3. SOS LISTENER (Only active if user is logged in)
      if (user) {
        const q = query(collection(db, "users"), where("emergencyStatus.isActive", "==", true));
        
        const unsubscribeSOS = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added" || change.type === "modified") {
              const victim = change.doc.data();
              if (change.doc.id === user.uid) return; // Don't alert yourself

              try {
                const { sound } = await Audio.Sound.createAsync(
                  { uri: 'https://www.soundjay.com/buttons/beep-01a.mp3' }
                );
                await sound.playAsync();

                Alert.alert(
                  "🚨 SOS ALERT 🚨",
                  `${victim.fullName || 'Someone'} needs help!`,
                  [
                    { 
                      text: "TRACK ON MAP", 
                      onPress: () => router.push({
                        pathname: '/(tabs)/map', // Adjusted to match your tabs
                        params: { lat: victim.emergencyStatus.latitude, lng: victim.emergencyStatus.longitude }
                      }) 
                    },
                    { text: "DISMISS", style: 'cancel' }
                  ]
                );
              } catch (e) { console.log("SOS Audio Error", e); }
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