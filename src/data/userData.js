let userData = {
  name: 'Alex',
  age: 28,
  gender: 'male',
  height: 175,
  weight: 72,
  dailyCalorieGoal: 2200,
  weeklyWorkoutGoal: 4,
};

export function setUserData(data = {}) {
  userData = { ...userData, ...data };
}

export function getUserData() {
  return userData;
}

export default userData;
