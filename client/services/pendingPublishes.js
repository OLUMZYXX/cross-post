import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@crosspost_pending_publishes";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export async function listPending() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function writePending(list) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export async function addPending(postId, meta = {}) {
  if (!postId) return;
  const list = await listPending();
  const filtered = list.filter((e) => e.postId !== postId);
  filtered.push({ postId, attemptedAt: Date.now(), ...meta });
  await writePending(filtered);
}

export async function removePending(postId) {
  if (!postId) return;
  const list = await listPending();
  const next = list.filter((e) => e.postId !== postId);
  if (next.length !== list.length) await writePending(next);
}

export async function clearStale() {
  const list = await listPending();
  const cutoff = Date.now() - MAX_AGE_MS;
  const fresh = list.filter((e) => e.attemptedAt > cutoff);
  if (fresh.length !== list.length) await writePending(fresh);
  return fresh;
}
