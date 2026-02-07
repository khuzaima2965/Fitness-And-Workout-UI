import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import exercisesData from '../data/exercises';
import colors from '../styles/colors';
import progressManager from '../utils/progressManager';

function parseDurationSeconds(d) {
  if (!d) return 30;
  if (typeof d === 'number') return d;
  const m = String(d).match(/(\d+)/);
  return m ? parseInt(m[0], 10) : 30;
}

export default function ExerciseDetailScreen({ navigation, route }) {
  const exerciseParam = route?.params?.exercise || null;
  const exerciseId = route?.params?.exerciseId || (exerciseParam && exerciseParam.id);

  let exercise = null;
  if (exerciseParam) {
    if (typeof exerciseParam === 'string') {
      exercise = {
        id: null,
        name: exerciseParam,
        duration: route?.params?.duration || '30s',
        difficulty: route?.params?.level || route?.params?.difficulty || 'Easy',
        calories: route?.params?.calories || '-',
        sets: route?.params?.sets || '-',
        reps: route?.params?.reps || '-',
      };
    } else {
      exercise = exerciseParam;
    }
  } else if (exerciseId) {
    exercise = exercisesData.find((e) => e.id === exerciseId);
  }
  if (!exercise) exercise = exercisesData[0];

  const totalSeconds = parseDurationSeconds(exercise.duration);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const [completedSets, setCompletedSets] = useState(0);

  useEffect(() => {
    setRemaining(totalSeconds);
    setRunning(false);
    let mounted = true;
    let unsub = null;
    async function load() {
      await progressManager.init();
      const st = progressManager.getState();
      if (mounted) setCompletedSets((st[exercise.id] && st[exercise.id].completedSets) || 0);
      unsub = progressManager.subscribe(() => {
        const s = progressManager.getState();
        if (mounted) setCompletedSets((s[exercise.id] && s[exercise.id].completedSets) || 0);
      });
    }
    load();
    return () => { mounted = false; if (unsub) unsub(); };
  }, [exerciseId]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  function formatMMSS(sec) {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }

  function onSkip() {
    const idx = exercisesData.findIndex((e) => e.id === exercise.id);
    const next = exercisesData[idx + 1];
    if (next) {
      navigation.replace('ExerciseDetail', { exerciseId: next.id });
    } else {
      navigation.goBack();
    }
  }

  function onPrev() {
    const idx = exercisesData.findIndex((e) => e.id === exercise.id);
    const prev = exercisesData[idx - 1];
    if (prev) {
      navigation.replace('ExerciseDetail', { exerciseId: prev.id });
    } else {
      navigation.goBack();
    }
  }

  function onReset() {
    setRunning(false);
    setRemaining(totalSeconds);
  }

  async function onNextSet() {
    const res = await progressManager.completeSet(exercise.id);
    if (res) setCompletedSets(res.completedSets);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={26} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.mainCard}>
        <View style={styles.iconWrap}>
          <Icon name={exercise.icon || 'fitness-center'} size={36} color={colors.primary} />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{exercise.name}</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{exercise.difficulty}</Text>
          </View>
        </View>

        <Text style={styles.timerLabel}>Time</Text>
        <Text style={styles.timerValue}>{formatMMSS(remaining)}</Text>

        <View style={styles.controlsContainer}>
          <View style={styles.controlsRowTop}>
            <TouchableOpacity onPress={onPrev} style={styles.controlBtn}>
              <Icon name="skip-previous" size={20} color={colors.primary} />
              <Text style={styles.controlText}>Prev</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRunning((r) => !r)}
              style={styles.controlBtn}
            >
              <Icon name={running ? 'pause' : 'play-arrow'} size={20} color={colors.primary} />
              <Text style={styles.controlText}> 
                {running ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onNextSet} style={styles.controlBtn}>
              <Icon name="skip-next" size={20} color={colors.primary} />
              <Text style={styles.controlText}>Next Set</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlsRowBottom}>
            <TouchableOpacity onPress={onReset} style={styles.controlBtn}>
              <Icon name="refresh" size={20} color={colors.primary} />
              <Text style={styles.controlText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSkip} style={styles.controlBtn}>
              <Icon name="skip-next" size={20} color={colors.primary} />
              <Text style={styles.controlText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoItem label="Calories" value={exercise.calories || '-'} />
          <InfoItem label="Sets" value={exercise.sets || '-'} />
          <InfoItem label="Reps" value={exercise.reps || '-'} />
        </View>
        <View style={{ marginTop: 10, width: '100%', alignItems: 'center' }}>
          <Text style={{ color: colors.onSurfaceVariant }}>Set {completedSets} / {exercise.sets || 1}</Text>
          {completedSets >= (exercise.sets || 1) ? (
            <Text style={{ color: colors.primary, marginTop: 6 }}>Exercise completed ✓</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* Small reusable info item */
const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoValue}>{value}</Text>
    <Text style={styles.infoLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 12,
  },

  backBtn: { width: 40, alignItems: 'flex-start' },

  headerInfo: { flex: 1, paddingLeft: 8 },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
  },

  subtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },

  mainCard: {
    margin: 20,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 380,
  },

  titleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 6,
  },

  chip: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },

  chipText: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '600',
  },

  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  timerLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 6,
  },

  timerValue: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 6,
  },

  controlsRow: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
    paddingHorizontal: 6,
  },

  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
  },

  controlsRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },

  controlsRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 12,
  },

  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 86,
  },

  controlText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '600',
  },

  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 18,
    width: '100%',
  },

  infoItem: {
    alignItems: 'center',
    flex: 1,
  },

  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },

  infoLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
});
