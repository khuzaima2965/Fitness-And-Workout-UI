import AsyncStorage from '@react-native-async-storage/async-storage';
import exercisesData from '../data/exercises';
import userData from '../data/userData';
import progressData from '../data/progressData';

const STORAGE_KEY = 'MAD_PROJECT_PROGRESS_V1';

// Category allocations (sum should be 2200)
const CATEGORY_ALLOC = {
  Strength: 800,
  Cardio: 600,
  Mobility: 300,
  HIIT: 500,
};

let plan = null; // array of exercise plans
let state = null; // map exerciseId -> { completedSets }
const listeners = new Set();

function buildPlan() {
  // group by category
  const byCat = {};
  exercisesData.forEach((e) => {
    const cat = e.category || 'Strength';
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(e);
  });

  plan = exercisesData.map((e) => {
    const catList = byCat[e.category] || [];
    const perExercise = Math.round((CATEGORY_ALLOC[e.category] || 0) / catList.length);
    const sets = Number.isFinite(Number(e.sets)) && Number(e.sets) > 0 ? Number(e.sets) : 1;
    const perSet = perExercise / sets;
    return {
      id: e.id,
      name: e.name,
      category: e.category,
      sets,
      categoryCalories: CATEGORY_ALLOC[e.category] || 0,
      perExerciseCalories: perExercise,
      perSetCalories: perSet,
    };
  });
}

async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw);
    } else {
      state = {};
      // initialize with zeros
      exercisesData.forEach((e) => { state[e.id] = { completedSets: 0 }; });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (e) {
    console.warn('progressManager loadState error', e);
    // fallback
    state = {};
    exercisesData.forEach((e) => { state[e.id] = { completedSets: 0 }; });
  }
}

async function init() {
  buildPlan();
  await loadState();
  return { plan, state };
}

function getPlan() {
  if (!plan) buildPlan();
  return plan;
}

function getState() {
  if (!state) {
    // synchronous fallback
    state = {};
    exercisesData.forEach((e) => { state[e.id] = { completedSets: 0 }; });
  }
  return state;
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // notify subscribers
    listeners.forEach((cb) => {
      try { cb(); } catch (err) { /* ignore */ }
    });
  } catch (e) {
    console.warn('progressManager persist error', e);
  }
}

function getExercisePlan(exerciseId) {
  if (!plan) buildPlan();
  return plan.find((p) => p.id === exerciseId);
}

async function completeSet(exerciseId) {
  if (!state) await loadState();
  const p = getExercisePlan(exerciseId);
  if (!p) return null;
  const cur = state[exerciseId] || { completedSets: 0 };
  if (cur.completedSets < p.sets) cur.completedSets += 1;
  state[exerciseId] = cur;
  await persist();
  return { exerciseId, completedSets: cur.completedSets, totalSets: p.sets };
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

async function resetExercise(exerciseId) {
  if (!state) await loadState();
  state[exerciseId] = { completedSets: 0 };
  await persist();
  return state[exerciseId];
}

function computeTotals() {
  if (!plan) buildPlan();
  if (!state) {
    state = {};
    exercisesData.forEach((e) => { state[e.id] = { completedSets: 0 }; });
  }
  let completedCalories = 0;
  let completedExercises = 0;
  plan.forEach((p) => {
    const s = (state[p.id] && state[p.id].completedSets) || 0;
    const doneSets = Math.min(s, p.sets);
    completedCalories += doneSets * p.perSetCalories;
    if (doneSets >= p.sets) completedExercises += 1;
  });
  const dailyGoal = userData.dailyCalorieGoal || 2200;
  const weeklyGoal = userData.weeklyWorkoutGoal || 4;
  const caloriesPerWorkout = dailyGoal / weeklyGoal;
  let percent = Math.round((completedCalories / dailyGoal) * 100);
  if (!Number.isFinite(percent) || percent < 0) percent = 0;
  percent = Math.min(100, percent);
  // completedWorkouts = how many "workout slots" worth of calories have been completed
  const completedWorkouts = Math.min(weeklyGoal, Math.floor(completedCalories / caloriesPerWorkout));
  return { completedCalories, percent, completedExercises, completedWorkouts };
}

async function markExerciseDone(exerciseId) {
  if (!state) await loadState();
  const p = getExercisePlan(exerciseId);
  if (!p) return null;
  state[exerciseId] = { completedSets: p.sets };
  await persist();
  return state[exerciseId];
}

async function clearAll() {
  state = {};
  exercisesData.forEach((e) => { state[e.id] = { completedSets: 0 }; });
  // reset any in-memory module-backed progress (used by some screens)
  try {
    if (progressData) {
      progressData.weekly = [0, 0, 0, 0, 0, 0, 0];
      progressData.dailyRings = [0, 0, 0];
      progressData.streak = 0;
      progressData.todayCompletedWorkouts = 0;
    }
  } catch (e) {
    // ignore
  }
  await persist();
}

export default {
  init,
  getPlan,
  getState,
  getExercisePlan,
  completeSet,
  resetExercise,
  computeTotals,
  markExerciseDone,
  clearAll,
};
