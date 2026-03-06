import { useState } from "react";

let useShareIntentOriginal;
try {
  useShareIntentOriginal = require("expo-share-intent").useShareIntent;
} catch {
  useShareIntentOriginal = null;
}

export default function useShareIntentSafe() {
  const [fallback] = useState({
    hasShareIntent: false,
    shareIntent: null,
    resetShareIntent: () => {},
  });

  if (!useShareIntentOriginal) return fallback;

  try {
    return useShareIntentOriginal();
  } catch {
    return fallback;
  }
}
