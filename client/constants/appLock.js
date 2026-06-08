import AsyncStorage from "@react-native-async-storage/async-storage";

export const BIOMETRIC_KEY = "@crosspost_biometric_enabled";
export const AUTO_LOCK_DELAY_KEY = "@crosspost_autolock_delay";
export const DEFAULT_AUTO_LOCK_DELAY_MS = 2 * 60 * 1000;

export const AUTO_LOCK_OPTIONS = [
  { label: "Immediately", value: 0 },
  { label: "After 1 minute", value: 60 * 1000 },
  { label: "After 2 minutes", value: 2 * 60 * 1000 },
  { label: "After 5 minutes", value: 5 * 60 * 1000 },
];

export async function getAutoLockDelay() {
  try {
    const stored = await AsyncStorage.getItem(AUTO_LOCK_DELAY_KEY);
    if (stored === null) return DEFAULT_AUTO_LOCK_DELAY_MS;
    const parsed = parseInt(stored, 10);
    return Number.isNaN(parsed) ? DEFAULT_AUTO_LOCK_DELAY_MS : parsed;
  } catch {
    return DEFAULT_AUTO_LOCK_DELAY_MS;
  }
}

export async function setAutoLockDelay(value) {
  try {
    await AsyncStorage.setItem(AUTO_LOCK_DELAY_KEY, String(value));
  } catch {}
}
