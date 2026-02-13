import crypto from "crypto";

const states = new Map();

export function createState(data, ttlMs = 600000) {
  const stateId = crypto.randomUUID();
  states.set(stateId, { ...data, expiresAt: Date.now() + ttlMs });
  return stateId;
}

export function getState(stateId) {
  const data = states.get(stateId);
  if (!data) return null;
  if (Date.now() > data.expiresAt) {
    states.delete(stateId);
    return null;
  }
  states.delete(stateId);
  return data;
}

export function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}
