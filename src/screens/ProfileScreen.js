import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../styles/colors';
import { getUserData } from '../data/userData';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = React.useState(() => getUserData());

  useFocusEffect(
    React.useCallback(() => {
      setUser(getUserData());
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="person" size={42} color={colors.background} />
        </View>
        <Text style={styles.name}>{user.name || 'Guest'}</Text>
        <Text style={styles.subtitle}>Daily Performance Goal</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>AGE</Text>
          <Text style={styles.infoValue}>{user.age ?? '-'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>HEIGHT</Text>
          <Text style={styles.infoValue}>{user.height ? `${user.height} cm` : '-'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>WEIGHT</Text>
          <Text style={styles.infoValue}>{user.weight ? `${user.weight} kg` : '-'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>EMAIL</Text>
          <Text style={styles.infoValue}>{user.email || '-'}</Text>
        </View>
      </View>

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Settings')}
      >
        <Icon name="settings-outline" size={22} color="#000" />
        <Text style={styles.settingsText}>SETTINGS</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },

  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
  },

  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 6,
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },

  infoCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
  },

  infoLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },

  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 8,
  },

  settingsButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingsText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginLeft: 8,
    letterSpacing: 1,
  },
});
