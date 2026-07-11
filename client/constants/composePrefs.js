import AsyncStorage from "@react-native-async-storage/async-storage";

export const PER_PLATFORM_KEY = "@crosspost_per_platform_rephrase";

export async function getPerPlatformEnabled() {
  try {
    return (await AsyncStorage.getItem(PER_PLATFORM_KEY)) === "true";
  } catch {
    return false;
  }
}

export async function setPerPlatformEnabled(value) {
  try {
    await AsyncStorage.setItem(PER_PLATFORM_KEY, value ? "true" : "false");
  } catch {}
}
