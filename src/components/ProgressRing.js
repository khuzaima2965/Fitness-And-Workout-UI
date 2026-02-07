import React from 'react';
import { View, Text } from 'react-native';

// Wrapper for react-native-circular-progress (optional dependency)
// If not installed, this will render a simple placeholder.
let AnimatedCircularProgress;
try {
  AnimatedCircularProgress = require('react-native-circular-progress').AnimatedCircularProgress;
} catch (e) {
  AnimatedCircularProgress = null;
}

export default function ProgressRing({ size = 80, width = 8, fill = 50, tintColor = '#00e0ff' }) {
  if (AnimatedCircularProgress) {
    return (
      <AnimatedCircularProgress
        size={size}
        width={width}
        fill={fill}
        tintColor={tintColor}
        backgroundColor="#e6e6e6"
      />
    );
  }

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
      <Text>{Math.round(fill)}%</Text>
    </View>
  );
}
