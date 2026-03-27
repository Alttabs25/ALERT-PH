import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import ShieldLogo from '../components/ShieldLogo';
import { setWelcomeFinished } from './_layout'; // Import the switch

export default function WelcomeScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const fadeText = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeText, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        // BREAK THE LOOP HERE
        setWelcomeFinished(); 
        router.replace('/(auth)/login'); 
      }, 500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <ShieldLogo progress={progress} />
      <Animated.View style={{ opacity: fadeText, alignItems: 'center' }}>
        <View style={styles.accentLine} />
        <Text style={styles.brandTitle}>ALERT PH</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  accentLine: { width: 80, height: 4, backgroundColor: '#F83D3D', marginBottom: 10, borderRadius: 2 },
  brandTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', fontStyle: 'italic', letterSpacing: 3 },
});