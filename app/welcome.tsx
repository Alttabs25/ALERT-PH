import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import ShieldLogo from '../components/ShieldLogo';

export default function WelcomeScreen() {
  const router = useRouter();
  const animationProgress = useRef(new Animated.Value(0)).current;
  const fadeText = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Draw the logo, 2. Fade in the text, 3. Go to login
    Animated.sequence([
      Animated.timing(animationProgress, {
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
        router.replace('/login');
      }, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* The Shield Logo component we created above */}
      <ShieldLogo progress={animationProgress} />
      
      <Animated.View style={{ opacity: fadeText, alignItems: 'center', marginTop: 20 }}>
        <Text style={styles.title}>ALERT PH</Text>
        <Text style={styles.subtitle}>Emergency Safety App</Text>
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
  title: {
    color: '#F83D3D',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#A9A9A9',
    fontSize: 12,
    marginTop: 5,
  },
});