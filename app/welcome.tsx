import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import ShieldLogo from '../components/ShieldLogo';

export default function WelcomeScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const fadeText = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Draw the Shield Logo (2.5s)
    // 2. Fade in the "ALERT PH" text (0.8s)
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
      // Small pause before switching to login
      setTimeout(() => {
        router.replace('/(auth)/login'); 
      }, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated SVG Component */}
      <ShieldLogo progress={progress} />
      
      {/* Branded Text with Red Accent Line */}
      <Animated.View style={{ opacity: fadeText, alignItems: 'center' }}>
        <View style={styles.accentLine} />
        <Text style={styles.brandTitle}>ALERT PH</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accentLine: {
    width: 80,
    height: 4,
    backgroundColor: '#F83D3D',
    marginBottom: 10,
    borderRadius: 2,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 3,
  },
});