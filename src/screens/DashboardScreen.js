import React, { useMemo, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import userData from '../data/userData';
import { getUserData } from '../data/userData';
import progressManager from '../utils/progressManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen({ navigation }) {
  // -------- DAILY LOGIC (UI-FIRST, REALISTIC) --------
  const DAILY_CALORIE_GOAL = userData.dailyCalorieGoal || 2200;
  const TOTAL_WORKOUTS = userData.weeklyWorkoutGoal || 4;
  // Use progressManager as the single source of truth for today's progress
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusText, setStatusText] = useState('START STRONG');
  const [completedWorkouts, setCompletedWorkouts] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [userName, setUserName] = useState(getUserData().name || 'Alex');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        await progressManager.init();
        const totals = progressManager.computeTotals();
        if (!mounted) return;
        setProgressPercent(totals.percent);
        setCompletedWorkouts(totals.completedWorkouts || 0);
        setCaloriesBurned(totals.completedCalories || 0);
          setUserName(getUserData().name || 'Alex');
        if (totals.percent === 100) setStatusText('GOAL COMPLETED');
        else if (totals.percent >= 75) setStatusText('ALMOST THERE');
        else if (totals.percent >= 50) setStatusText('ON TRACK');
        else setStatusText('START STRONG');

        const unsub = progressManager.subscribe(() => {
          const t = progressManager.computeTotals();
          setProgressPercent(t.percent);
          setCompletedWorkouts(t.completedWorkouts || 0);
          setCaloriesBurned(t.completedCalories || 0);
          if (t.percent === 100) setStatusText('GOAL COMPLETED');
          else if (t.percent >= 75) setStatusText('ALMOST THERE');
          else if (t.percent >= 50) setStatusText('ON TRACK');
          else setStatusText('START STRONG');
        });
        load.unsub = unsub;
      } catch (e) {
        console.warn(e);
      }
    }
    load();
    return () => { mounted = false; if (load.unsub) load.unsub(); };
  }, []);

  // ensure values refresh when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          await progressManager.init();
          const t = progressManager.computeTotals();
          if (!mounted) return;
          setProgressPercent(t.percent);
          setCompletedWorkouts(t.completedWorkouts || 0);
          setCaloriesBurned(t.completedCalories || 0);
          setUserName(getUserData().name || 'Alex');
        } catch (e) {
          console.warn(e);
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  // derived values
  const caloriesPerWorkout = Math.round(DAILY_CALORIE_GOAL / TOTAL_WORKOUTS);
  const caloriesRemaining = Math.max(DAILY_CALORIE_GOAL - caloriesBurned, 0);
  const insets = useSafeAreaInsets();

  function handleReset() {
    console.log('Reset button pressed');
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setConfirmVisible(false) },
        { text: 'Reset', style: 'destructive', onPress: () => {
            (async function handleResetProgress() {
              try {
                await progressManager.clearAll();
                const t = progressManager.computeTotals();
                setProgressPercent(t.percent || 0);
                setCompletedWorkouts(t.completedWorkouts || 0);
                setCaloriesBurned(t.completedCalories || 0);
                setStatusText('START STRONG');
              } catch (e) {
                console.warn(e);
              } finally {
                setConfirmVisible(false);
              }
            }());
          } },
      ],
    );
  }

  const [confirmVisible, setConfirmVisible] = useState(false);

  async function handleResetConfirm() {
    try {
      await progressManager.clearAll();
      const t = progressManager.computeTotals();
      setProgressPercent(t.percent || 0);
      setCompletedWorkouts(t.completedWorkouts || 0);
      setCaloriesBurned(t.completedCalories || 0);
      setStatusText('START STRONG');
    } catch (e) {
      console.warn(e);
    } finally {
      setConfirmVisible(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(260, insets.bottom + 140) }}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName}</Text>
          <Text style={styles.date}>Wed · Feb 04, 2026</Text>
        </View>
        <Icon name="notifications-outline" size={26} color="#A7B0C0" />
      </View>

      {/* Performance Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>CALORIES</Text>
          <Text style={styles.statValue}>{caloriesBurned}</Text>
          <Text style={styles.statSub}>/ {DAILY_CALORIE_GOAL} kcal</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>WORKOUTS</Text>
          <Text style={styles.statValue}>
            {completedWorkouts}/{TOTAL_WORKOUTS}
          </Text>
          <Text style={styles.statSub}>completed</Text>
        </View>
      </View>

      {/* Progress Ring */}
      <View style={styles.progressContainer}>
        <AnimatedCircularProgress
          size={200}
          width={18}
          fill={progressPercent}
          tintColor="#00E5FF"
          backgroundColor="#1E2533"
          lineCap="round"
        >
          {() => (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.progressValue}>{progressPercent}%</Text>
              <Text style={styles.progressText}>Daily Progress</Text>
              <Text style={styles.progressStatus}>{statusText}</Text>
            </View>
          )}
        </AnimatedCircularProgress>

        <Text style={styles.progressHint}>
          {caloriesRemaining} kcal remaining today
        </Text>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>Reset progress</Text>
        </TouchableOpacity>

        <Modal visible={confirmVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Reset Progress</Text>
              <Text style={styles.modalBody}>Are you sure you want to reset all progress? This cannot be undone.</Text>
              <View style={{ flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setConfirmVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalReset} onPress={handleResetConfirm}>
                  <Text style={styles.modalResetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Workout Breakdown */}
      <View style={styles.planContainer}>
        <Text style={styles.sectionTitle}>TODAY’S WORKOUTS</Text>

        {[1, 2, 3, 4].map((item) => {
          const completed = item <= completedWorkouts;
          return (
            <View key={item} style={styles.planItem}>
              <Icon
                name={completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={completed ? '#00E676' : '#4B5568'}
              />
              <Text style={styles.planText}>
                Workout {item} · {caloriesPerWorkout} kcal
              </Text>
            </View>
          );
        })}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.startButton, { marginBottom: insets.bottom + 28 }]}
        onPress={() => navigation.navigate('Workouts')}
      >
        <View style={styles.startIconWrap} pointerEvents="none">
          <Icon name="flash" size={22} color="#000" />
        </View>
        <Text style={styles.startButtonText}>
          {progressPercent === 100 ? 'ALL DONE' : 'START WORKOUT'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// -------- STYLES --------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 24,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  date: {
    fontSize: 14,
    color: '#A7B0C0',
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#141A2A',
    borderRadius: 18,
    padding: 18,
  },

  statLabel: {
    fontSize: 12,
    color: '#7C8DB5',
    letterSpacing: 1,
  },

  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 10,
  },

  statSub: {
    fontSize: 13,
    color: '#7C8DB5',
    marginTop: 2,
  },

  progressContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },

  progressValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  progressText: {
    fontSize: 14,
    color: '#9AA6C1',
    marginTop: 6,
  },

  progressStatus: {
    fontSize: 13,
    color: '#00E5FF',
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 1,
  },

  progressHint: {
    marginTop: 16,
    fontSize: 14,
    color: '#9AA6C1',
  },

  planContainer: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 12,
  },

  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  planText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#CBD5E1',
  },

  startButton: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: '#00E5FF',
    paddingVertical: 18,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // make button full width inside container padding
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  },

  startIconWrap: {
    position: 'absolute',
    left: 28,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  startButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    alignSelf: 'center',
    letterSpacing: 1,
  },
  resetBtn: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3340',
  },
  resetText: {
    color: '#9AA6C1',
    fontSize: 13,
  },
});
