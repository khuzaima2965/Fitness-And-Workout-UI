import React from 'react';
import { View, Text, Slider, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GoalsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Goals (UI only)</Text>
      <Text>Daily calorie goal</Text>
      <View style={{ height: 48 }} />
      <Text>Weekly workout goal</Text>
      <View style={{ height: 48 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '700' } });
