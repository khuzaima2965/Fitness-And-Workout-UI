let _userSetup = {
  name: '',
  age: null,
  gender: null,
  height: null,
  weight: null,
};

export function setUserSetup(data = {}) {
  _userSetup = { ..._userSetup, ...data };
}

export function getUserSetup() {
  return _userSetup;
}

export default {
  setUserSetup,
  getUserSetup,
};
