import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import { setUserSetup } from '../data/userSetup';
import { setUserData } from '../data/userData';
import accounts from '../data/accounts';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  function handleCreate() {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    if (!password.trim()) e.password = 'Password is required';

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // store basic account info and move to UserSetup
    const payload = { name: name.trim(), email: email.trim(), password };
    // try to persist account
    (async () => {
      try {
        await accounts.addAccount(payload);
      } catch (err) {
        setErrors({ email: 'Account already exists' });
        return;
      }

      // keep a quick in-memory copy and app-wide data
      setUserSetup(payload);
      setUserData({ name: name.trim(), age: null, gender: null, height: null, weight: null, email: email.trim() });
      navigation.replace('UserSetup', { email: email.trim() });
    })();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backBtnText}>{'<--'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create account</Text>

        <TextInput
          placeholder="Name"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.onSurfaceVariant}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
          <Text style={styles.primaryButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: colors.surface, padding: 20, paddingTop: 56, borderRadius: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.onSurface, marginBottom: 16 },
  input: {
    backgroundColor: '#0F1724',
    color: colors.onSurface,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { color: '#000', fontWeight: '800', fontSize: 16 },
  errorText: { color: '#FF6B6B', marginTop: -6, marginBottom: 8 },
  backBtn: { position: 'absolute', left: 12, top: 14, paddingVertical: 6, paddingHorizontal: 10 },
  backBtnText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
