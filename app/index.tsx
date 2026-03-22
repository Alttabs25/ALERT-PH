import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  // This creates the starting point for our moving line
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // This loops the animation up and down continuously
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 54, // Moves the line down
          duration: 500, 
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0, // Moves the line back up
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // This waits 3 seconds then sends you to the login screen
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.loaderContainer}>
        
        {/* Your Loading Text */}
        <Text style={styles.loaderText}>ALERT PH</Text>

        {/* The Glowing Red Scanner Line */}
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [{ translateY: scanAnim }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // A dark background makes the glow look much better
  },
  loaderContainer: {
    position: 'relative',
    paddingVertical: 10,
  },
  loaderText: {
    color: 'rgb(242, 255, 240)',
    fontSize: 50,
    fontStyle: 'italic',
    fontWeight: 'bold', // Replace this with fontFamily: 'Mine' if you have the custom font linked
    letterSpacing: 2,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10,
    height: 6,
    backgroundColor: '#ff8282',
    borderRadius: 4,
    // This creates the glow effect you had with CSS blur
    shadowColor: '#ff8282',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10, // Glow effect for Android
  },
});