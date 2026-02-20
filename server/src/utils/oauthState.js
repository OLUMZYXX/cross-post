import crypto from "crypto";
import OAuthState from "../models/OAuthState.js";

export async function createState(data, ttlMs = 600000) {
  const stateId = crypto.randomUUID();
  await OAuthState.create({
    stateId,
    data,
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return stateId;
}

export async function getState(stateId) {
  const doc = await OAuthState.findOneAndDelete({ stateId });
  if (!doc) return null;
  if (new Date() > doc.expiresAt) return null;
  return doc.data;
}

// Read state without consuming it (for preview endpoints)
export async function peekState(stateId) {
  const doc = await OAuthState.findOne({ stateId });
  if (!doc) return null;
  if (new Date() > doc.expiresAt) {
    await doc.deleteOne();
    return null;
  }
  return doc.data;
}

export function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}
