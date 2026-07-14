import AsyncStorage from "@react-native-async-storage/async-storage";

export const PER_PLATFORM_KEY = "@crosspost_per_platform_rephrase";
export const TWITTER_LONG_KEY = "@crosspost_twitter_long_posts";

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

export async function getTwitterLongPosts() {
  try {
    return (await AsyncStorage.getItem(TWITTER_LONG_KEY)) === "true";
  } catch {
    return false;
  }
}

export async function setTwitterLongPosts(value) {
  try {
    await AsyncStorage.setItem(TWITTER_LONG_KEY, value ? "true" : "false");
  } catch {}
}
