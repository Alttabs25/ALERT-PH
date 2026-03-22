import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export default function EmergencyLoader() {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const driveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. The Suspension Bounce (Up and Down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 3, duration: 500, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    // 2. The Driving Motion (Moves scenery right to left)
    Animated.loop(
      Animated.timing(driveAnim, {
        toValue: -350,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.loaderContainer}>
      <View style={styles.truckWrapper}>
        
        {/* MOVING BACKGROUND (Lamp Post + Speed Lines) */}
        <Animated.View style={[styles.sceneryLayer, { transform: [{ translateX: driveAnim }] }]}>
          {/* The Lamp Post from your code */}
          <View style={styles.lampPost}>
            <Svg viewBox="0 0 453.459 453.459" width="40" height="90">
              <Path
                fill="#282828"
                d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993 c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514 c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16 c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914 h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75 v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795 V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017 h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"
              />
            </Svg>
          </View>
          {/* Fake Road Lines to simulate speed */}
          <View style={styles.speedLine1} />
          <View style={styles.speedLine2} />
        </Animated.View>

        {/* CUSTOM AMBULANCE BODY (Bouncing) */}
        <Animated.View style={[styles.truckBody, { transform: [{ translateY: bounceAnim }] }]}>
          <Svg width="130" height="65" viewBox="0 0 130 65">
            {/* Sirens */}
            <Rect x="20" y="5" width="12" height="10" fill="#F83D3D" stroke="#282828" strokeWidth="2" rx="2" />
            <Rect x="35" y="5" width="12" height="10" fill="#0055FF" stroke="#282828" strokeWidth="2" rx="2" />
            
            {/* Back Box */}
            <Rect x="5" y="15" width="80" height="45" fill="#FFFFFF" stroke="#282828" strokeWidth="3" rx="4" />
            
            {/* Red Stripe */}
            <Rect x="5" y="45" width="80" height="4" fill="#F83D3D" />

            {/* Medical Cross */}
            <Rect x="35" y="26" width="20" height="6" fill="#F83D3D" />
            <Rect x="42" y="19" width="6" height="20" fill="#F83D3D" />

            {/* Front Cabin */}
            <Path d="M 85 30 L 105 30 L 120 40 L 125 40 L 125 60 L 85 60 Z" fill="#FFFFFF" stroke="#282828" strokeWidth="3" />
            
            {/* Window */}
            <Path d="M 90 34 L 100 34 L 110 42 L 90 42 Z" fill="#7D7C7C" stroke="#282828" strokeWidth="2" />
          </Svg>
        </Animated.View>

        {/* TIRES (Static horizontally, but look like they are spinning on the moving road) */}
        <View style={styles.truckTires}>
          <Svg width="24" height="24" viewBox="0 0 30 30">
            <Circle cx="15" cy="15" r="13.5" fill="#282828" stroke="#282828" strokeWidth="3" />
            <Circle cx="15" cy="15" r="7" fill="#DFDFDF" />
          </Svg>
          <Svg width="24" height="24" viewBox="0 0 30 30">
            <Circle cx="15" cy="15" r="13.5" fill="#282828" stroke="#282828" strokeWidth="3" />
            <Circle cx="15" cy="15" r="7" fill="#DFDFDF" />
          </Svg>
        </View>

        {/* STATIC SOLID ROAD */}
        <View style={styles.road} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  truckWrapper: {
    width: 200,
    height: 100,
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden', // Crops the moving scenery
  },
  truckBody: {
    width: 130,
    height: 65,
    marginBottom: 6,
    zIndex: 2,
  },
  truckTires: {
    width: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 10,
    position: 'absolute',
    bottom: 0,
    zIndex: 3,
  },
  road: {
    width: '100%',
    height: 3,
    backgroundColor: '#282828',
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
    zIndex: 4,
  },
  sceneryLayer: {
    position: 'absolute',
    width: 600, // Very wide so it can slide left infinitely
    height: '100%',
    bottom: 0,
    left: 0,
  },
  lampPost: {
    position: 'absolute',
    bottom: 0,
    left: 350, // Starts off-screen to the right
  },
  speedLine1: {
    position: 'absolute',
    bottom: 0,
    left: 200,
    width: 20,
    height: 3,
    backgroundColor: '#FFFFFF', // Creates the dashed effect on the dark road
    zIndex: 5,
  },
  speedLine2: {
    position: 'absolute',
    bottom: 0,
    left: 300,
    width: 10,
    height: 3,
    backgroundColor: '#FFFFFF',
    zIndex: 5,
  },
});