import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import exercisesData from '../data/exercises';

export default function ExerciseListScreen({ navigation, route }) {
  // Category passed from previous screen (default = Strength)
  const category = route?.params?.category || 'Strength';

  // Use central exercises data and filter by category
  const exercisesAll = exercisesData.map((e) => ({
    id: e.id,
    name: e.name,
    duration: e.duration,
    level: e.difficulty || 'Medium',
    category: e.category || 'Strength',
    icon: e.icon || 'fitness-center',
  }));

  const exercises = exercisesAll.filter((e) => e.category === category);

  // Fallback: if no exercises for category, show all
  const displayExercises = exercises.length ? exercises : exercisesAll;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>{category}</Text>
          <Text style={styles.subtitle}>
            {exercises.length} exercises • Strength training
          </Text>
        </View>
      </View>

      {/* Exercise List */}
      {displayExercises.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.exerciseCard}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('ExerciseDetail', {
              exerciseId: item.id,
            })
          }
        >
          <View style={styles.iconBox}>
            <Icon name={item.icon} size={24} color="#00E5FF" />
          </View>

          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseMeta}>
              {item.duration} • {item.level}
            </Text>
          </View>

          <Icon name="chevron-right" size={22} color="#4B5568" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 28,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 14,
    color: '#9AA6C1',
    marginTop: 4,
  },

  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141A2A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E2533',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  exerciseMeta: {
    fontSize: 13,
    color: '#9AA6C1',
    marginTop: 4,
  },
});
