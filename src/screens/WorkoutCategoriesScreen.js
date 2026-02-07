import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../styles/colors';

export default function WorkoutCategoriesScreen({ navigation }) {
  const categories = [
    { name: 'Strength', icon: 'barbell-outline' },
    { name: 'Cardio', icon: 'heart-outline' },
    { name: 'Mobility', icon: 'body-outline' },
    { name: 'HIIT', icon: 'flash-outline' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>Choose your training</Text>
      </View>

      {/* Categories Grid */}
      <View style={styles.grid}>
        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.getParent?.()?.navigate('ExerciseList', { category: item.name })}
          >
            <View style={styles.iconContainer}>
              <Icon name={item.icon} size={34} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>Tap to start</Text>
          </TouchableOpacity>
        ))}
      </View>

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
    marginTop: 24,
    marginBottom: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.onSurface,
  },

  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 6,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: 'center',
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },

  cardSub: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 6,
  },
});
