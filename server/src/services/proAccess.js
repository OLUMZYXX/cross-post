import { PRO_ALLOWLIST_EMAILS } from "../config/env.js";

const TRIAL_DAYS = 7;
const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

const allowlist = (PRO_ALLOWLIST_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAllowlistedEmail(email) {
  if (!email) return false;
  return allowlist.includes(email.toLowerCase());
}

export function trialEndsAt(user) {
  if (!user?.createdAt) return null;
  return new Date(new Date(user.createdAt).getTime() + TRIAL_MS);
}

export function isInTrial(user) {
  const ends = trialEndsAt(user);
  return !!ends && ends.getTime() > Date.now();
}

export function trialDaysLeft(user) {
  const ends = trialEndsAt(user);
  if (!ends) return 0;
  const ms = ends.getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / (24 * 60 * 60 * 1000)) : 0;
}

export function hasActiveSubscription(user) {
  const sub = user?.subscription;
  if (!sub || !sub.isPro) return false;
  if (sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now()) {
    return false;
  }
  return true;
}

export function getProSource(user) {
  if (!user) return null;
  if (isAllowlistedEmail(user.email)) return "allowlist";
  if (hasActiveSubscription(user)) return "subscription";
  if (isInTrial(user)) return "trial";
  return null;
}

export function isUserPro(user) {
  return getProSource(user) !== null;
}

export function isTwitterPlatform(name) {
  return String(name || "").split(":")[0].trim().toLowerCase() === "twitter";
}

export function platformsRequirePro(platforms) {
  return (platforms || []).some(isTwitterPlatform);
}
