import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import { getUserSetup } from '../data/userSetup';
import { setUserData, getUserData } from '../data/userData';
import accounts from '../data/accounts';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  async function handleLogin() {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!password.trim()) e.password = 'Password is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // authenticate against stored signup data
    try {
      const acc = await accounts.findByEmail(email.trim());
      if (!acc) {
        setErrors({ auth: 'No account found. Please sign up.' });
        return;
      }

      if (String(acc.password) === password) {
        const name = acc.name || getUserData().name || 'Khuzaima';
        setUserData({ name, email: acc.email, age: acc.age || null, gender: acc.gender || null, height: acc.height || null, weight: acc.weight || null });
        navigation.replace('Main');
        return;
      }

      setErrors({ auth: 'Invalid email or password' });
      return;
    } catch (err) {
      setErrors({ auth: 'Authentication failed' });
      return;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backBtnText}>{'<--'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log In</Text>

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

        {errors.auth ? <Text style={styles.errorText}>{errors.auth}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.linkText}>Create account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: colors.surface, padding: 20, paddingTop: 56, borderRadius: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.onSurface, marginBottom: 16 },
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
  linkText: { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 12 },
  errorText: { color: '#FF6B6B', marginTop: -6, marginBottom: 8 },
  backBtn: { position: 'absolute', left: 12, top: 14, paddingVertical: 6, paddingHorizontal: 10 },
  backBtnText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
