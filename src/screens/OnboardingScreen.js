import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/colors';

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.slide}>
        <Text style={styles.title}>Welcome to Fit Pulse</Text>
        <Text style={styles.desc}>Track your workouts and progress.</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.replace('Main')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.background,
  },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.onSurface, textAlign: 'center' },
  desc: { marginTop: 12, textAlign: 'center', color: colors.onSurfaceVariant, fontSize: 16 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  skipText: { color: colors.onSurfaceVariant, fontSize: 16 },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 32,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
