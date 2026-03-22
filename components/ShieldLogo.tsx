import React from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// This allows the SVG paths to accept animated values
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface ShieldProps {
  progress: Animated.Value;
}

export default function ShieldLogo({ progress }: ShieldProps) {
  
  // Math to calculate the "drawing" effect
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1000, 0],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width="220" height="220" viewBox="0 0 500 500">
        {/* Outer Shield - strokeDashoffset is now a direct prop */}
        <AnimatedPath
          d="M250 50 L80 140 V320 C80 420 250 480 250 480 C250 480 420 420 420 320 V140 L250 50 Z"
          fill="none"
          stroke="#F83D3D"
          strokeWidth="12"
          strokeDasharray="1000"
          strokeDashoffset={strokeDashoffset} 
        />
        
        {/* The "A" inside */}
        <AnimatedPath
          d="M250 120 L150 320 M250 120 L350 320 M190 260 H310"
          fill="none"
          stroke="#F83D3D"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset={strokeDashoffset}
        />

        {/* The "P" circle detail */}
        <AnimatedPath
          d="M250 240 A 40 40 0 1 1 249.9 240"
          fill="none"
          stroke="#A9A9A9" 
          strokeWidth="12"
          strokeDasharray="1000"
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
    </View>
  );
}