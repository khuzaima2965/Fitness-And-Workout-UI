import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import { setUserSetup } from '../data/userSetup';
import { setUserData } from '../data/userData';
import accounts from '../data/accounts';

export default function UserSetupScreen({ navigation }) {
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState({});

  // prefill if user already provided some data on signup
  React.useEffect(() => {
    try {
      const us = require('../data/userSetup').getUserSetup();
      if (us) {
        if (us.gender) setGender(us.gender);
        if (us.age) setAge(String(us.age));
        if (us.height) setHeight(String(us.height));
        if (us.weight) setWeight(String(us.weight));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  function handleFinish() {
    const e = {};
    if (!gender) e.gender = 'Please select gender';
    if (!age.trim()) e.age = 'Age is required';
    if (!height.trim()) e.height = 'Height is required';
    if (!weight.trim()) e.weight = 'Weight is required';

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const payload = { gender, age: age ? Number(age) : null, height: height ? Number(height) : null, weight: weight ? Number(weight) : null };
    setUserSetup(payload);
    // also persist into main userData module for app-wide access
    setUserData(payload);

    // if user came here from signup we may have an email param to update the stored account
    (async () => {
      try {
        const emailParam = (navigation.getState && navigation.getState().routes?.find(r => r.name === 'UserSetup')?.params?.email) || null;
        if (emailParam) {
          await accounts.updateAccount(emailParam, payload);
        }
      } catch (e) {
        // ignore account update errors
      }
      navigation.replace('Main');
    })();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backBtnText}>{'<--'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Setup Profile</Text>

        <Text style={styles.label}>Gender</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.option, gender === 'male' ? styles.optionSelected : null]}
            onPress={() => setGender('male')}
          >
            <Text style={[styles.optionText, gender === 'male' ? styles.optionTextSelected : null]}>Male</Text>
          </TouchableOpacity>

          <View style={{ width: 12 }} />

          <TouchableOpacity
            style={[styles.option, gender === 'female' ? styles.optionSelected : null]}
            onPress={() => setGender('female')}
          >
            <Text style={[styles.optionText, gender === 'female' ? styles.optionTextSelected : null]}>Female</Text>
          </TouchableOpacity>
        </View>
        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

        <TextInput
          placeholder="Age"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
        />
        {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}

        <TextInput
          placeholder="Height (cm)"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
          keyboardType="numeric"
          value={height}
          onChangeText={(t) => setHeight(t.replace(/[^0-9]/g, ''))}
        />
        {errors.height ? <Text style={styles.errorText}>{errors.height}</Text> : null}

        <TextInput
          placeholder="Weight (kg)"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={(t) => setWeight(t.replace(/[^0-9]/g, ''))}
        />
        {errors.weight ? <Text style={styles.errorText}>{errors.weight}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
          <Text style={styles.primaryButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: colors.surface, padding: 20, paddingTop: 56, borderRadius: 16 },
  title: { fontSize: 20, fontWeight: '700', color: colors.onSurface, marginBottom: 12 },
  label: { color: colors.onSurfaceVariant, marginBottom: 8 },
  row: { flexDirection: 'row', marginBottom: 12 },
  option: { flex: 1, backgroundColor: '#0F1724', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  optionText: { color: colors.onSurface },
  optionSelected: { backgroundColor: colors.primary },
  optionTextSelected: { color: '#000', fontWeight: '800' },
  input: { backgroundColor: '#0F1724', color: colors.onSurface, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 12, marginBottom: 12 },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 32, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#000', fontWeight: '800', fontSize: 16 },
  errorText: { color: '#FF6B6B', marginTop: -6, marginBottom: 8 },
  backBtn: { position: 'absolute', left: 12, top: 14, paddingVertical: 6, paddingHorizontal: 10 },
  backBtnText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
