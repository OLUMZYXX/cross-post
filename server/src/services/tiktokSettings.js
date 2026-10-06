import { Errors } from "../utils/AppError.js";

export const TIKTOK_PRIVACY_LEVELS = [
  "PUBLIC_TO_EVERYONE",
  "MUTUAL_FOLLOW_FRIENDS",
  "FOLLOWER_OF_CREATOR",
  "SELF_ONLY",
];

const FALLBACK_SETTINGS = {
  privacyLevel: "SELF_ONLY",
  allowComment: false,
  allowDuet: false,
  allowStitch: false,
  yourBrand: false,
  brandedContent: false,
};

function parseInput(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    throw Errors.badRequest("TikTok settings could not be read. Please try again.");
  }
}

export function sanitizeTikTokSettings(raw) {
  const input = parseInput(raw);
  if (!input) return null;

  const privacyLevel = String(input.privacyLevel || "");
  if (!TIKTOK_PRIVACY_LEVELS.includes(privacyLevel)) {
    throw Errors.badRequest("Choose who can see your TikTok post.");
  }

  const discloseContent = input.discloseContent === true;
  const yourBrand = discloseContent && input.yourBrand === true;
  const brandedContent = discloseContent && input.brandedContent === true;

  if (discloseContent && !yourBrand && !brandedContent) {
    throw Errors.badRequest("Say whether the TikTok post promotes your brand, a third party, or both.");
  }
  if (brandedContent && privacyLevel === "SELF_ONLY") {
    throw Errors.badRequest("Branded content on TikTok can't be set to Only me. Choose a wider audience.");
  }

  return {
    privacyLevel,
    allowComment: input.allowComment === true,
    allowDuet: input.allowDuet === true,
    allowStitch: input.allowStitch === true,
    discloseContent,
    yourBrand,
    brandedContent,
  };
}

export function resolveTikTokSettings(post) {
  const stored = post?.tiktokSettings;
  if (stored && TIKTOK_PRIVACY_LEVELS.includes(stored.privacyLevel)) return stored;
  return FALLBACK_SETTINGS;
}

export function videoPostInfo(settings) {
  return {
    privacy_level: settings.privacyLevel,
    disable_comment: !settings.allowComment,
    disable_duet: !settings.allowDuet,
    disable_stitch: !settings.allowStitch,
    brand_content_toggle: Boolean(settings.brandedContent),
    brand_organic_toggle: Boolean(settings.yourBrand),
  };
}

export function photoPostInfo(settings) {
  return {
    privacy_level: settings.privacyLevel,
    disable_comment: !settings.allowComment,
    brand_content_toggle: Boolean(settings.brandedContent),
    brand_organic_toggle: Boolean(settings.yourBrand),
  };
}
