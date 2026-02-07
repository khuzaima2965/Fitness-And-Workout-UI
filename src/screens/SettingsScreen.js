import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import { getUserData, setUserData } from '../data/userData';
import { setUserSetup } from '../data/userSetup';
import accounts from '../data/accounts';

export default function SettingsScreen({ navigation }) {
  const user = getUserData();
  const [age, setAge] = useState(user.age ? String(user.age) : '');
  const [height, setHeight] = useState(user.height ? String(user.height) : '');
  const [weight, setWeight] = useState(user.weight ? String(user.weight) : '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getUserData();
    setAge(u.age ? String(u.age) : '');
    setHeight(u.height ? String(u.height) : '');
    setWeight(u.weight ? String(u.weight) : '');
  }, []);

  async function handleSave() {
    // simple validation
    const e = [];
    if (!age.trim()) e.push('Age is required');
    if (!height.trim()) e.push('Height is required');
    if (!weight.trim()) e.push('Weight is required');
    if (e.length) return Alert.alert('Validation', e.join('\n'));

    const payload = { age: Number(age), height: Number(height), weight: Number(weight) };
    setSaving(true);
    try {
      // update app-wide userData
      setUserData(payload);

      // update persistent account if email known
      const email = user.email;
      if (email) {
        await accounts.updateAccount(email, payload);
      }

      Alert.alert('Saved', 'Profile updated successfully');
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    // clear in-memory profile and setup, then go to Login
    setUserData({ name: '', email: null, age: null, gender: null, height: null, weight: null });
    setUserSetup({ name: '', age: null, gender: null, height: null, weight: null });
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>

        <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          value={age}
          onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
          placeholder="Age"
          keyboardType="numeric"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
        />

        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          value={height}
          onChangeText={(t) => setHeight(t.replace(/[^0-9]/g, ''))}
          placeholder="Height (cm)"
          keyboardType="numeric"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
        />

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          value={weight}
          onChangeText={(t) => setWeight(t.replace(/[^0-9]/g, ''))}
          placeholder="Weight (kg)"
          keyboardType="numeric"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
        />

        <View style={{ height: 16 }} />
        <TouchableOpacity style={[styles.primaryButton, saving ? styles.disabledButton : null]} onPress={handleSave} disabled={saving}>
          <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' },
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.onSurface, textAlign: 'center' },
  label: { color: colors.onSurfaceVariant, marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#0F1724', color: colors.onSurface, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 32, alignItems: 'center' },
  primaryButtonText: { color: '#000', fontWeight: '800' },
  disabledButton: { opacity: 0.6 },
  logoutButton: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.onSurfaceVariant,
    paddingVertical: 12,
    borderRadius: 32,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logoutButtonText: { color: colors.onSurfaceVariant, fontWeight: '700' },
});
