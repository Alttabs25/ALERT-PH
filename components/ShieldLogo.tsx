import React from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function ShieldLogo({ progress }: { progress: Animated.Value }) {
  // Line drawing interpolation
  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1000, 0],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
      <Svg width="200" height="200" viewBox="0 0 800 800">
        {/* Outer Shield Geometry */}
        <AnimatedPath
          d="M400 50 L150 150 V450 C150 600 400 750 400 750 C400 750 650 600 650 450 V150 L400 50 Z"
          fill="none"
          stroke="#F83D3D"
          strokeWidth="15"
          strokeDasharray="1000"
          strokeDashoffset={dashOffset}
        />
        {/* Inner Branding (A & P) */}
        <AnimatedPath
          d="M400 200 L280 500 M400 200 L520 500 M340 400 H460"
          fill="none"
          stroke="#F83D3D"
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset={dashOffset}
        />
      </Svg>
    </View>
  );
}