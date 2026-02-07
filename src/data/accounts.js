import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCOUNTS_KEY = 'MAD_ACCOUNTS_v1';

async function getAccounts() {
  try {
    const json = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.warn('getAccounts error', e);
    return [];
  }
}

async function saveAccounts(accounts) {
  try {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts || []));
  } catch (e) {
    console.warn('saveAccounts error', e);
  }
}

async function addAccount(account) {
  const accounts = await getAccounts();
  const exists = accounts.find((a) => a.email === account.email);
  if (exists) throw new Error('Account already exists');
  accounts.push(account);
  await saveAccounts(accounts);
  return account;
}

async function findByEmail(email) {
  if (!email) return null;
  const accounts = await getAccounts();
  return accounts.find((a) => a.email === email) || null;
}

async function updateAccount(email, patch = {}) {
  const accounts = await getAccounts();
  const idx = accounts.findIndex((a) => a.email === email);
  if (idx === -1) throw new Error('Account not found');
  accounts[idx] = { ...accounts[idx], ...patch };
  await saveAccounts(accounts);
  return accounts[idx];
}

export default {
  getAccounts,
  saveAccounts,
  addAccount,
  findByEmail,
  updateAccount,
};
