export const TIKTOK_PRIVACY_LABELS = {
  PUBLIC_TO_EVERYONE: "Everyone",
  MUTUAL_FOLLOW_FRIENDS: "Friends",
  FOLLOWER_OF_CREATOR: "Followers",
  SELF_ONLY: "Only me",
};

export const TIKTOK_MUSIC_POLICY_URL = "https://www.tiktok.com/legal/page/global/music-usage-confirmation/en";
export const TIKTOK_BRANDED_POLICY_URL = "https://www.tiktok.com/legal/page/global/bc-policy/en";

export const EMPTY_TIKTOK_SETTINGS = {
  privacyLevel: null,
  allowComment: false,
  allowDuet: false,
  allowStitch: false,
  discloseContent: false,
  yourBrand: false,
  brandedContent: false,
};

export function isTikTokIdentifier(identifier) {
  return identifier.split(":")[0] === "TikTok";
}

export function tiktokSettingsProblem({ settings, creator, isVideo, videoDurationSec }) {
  if (!creator) return "Loading your TikTok account…";
  if (!creator.canPost) return creator.blockedReason;
  if (isVideo && creator.maxVideoDurationSec && videoDurationSec > creator.maxVideoDurationSec) {
    return `TikTok lets this account post videos up to ${creator.maxVideoDurationSec} seconds. Trim the video and try again.`;
  }
  if (!settings.privacyLevel) return "Choose who can see this post.";
  if (settings.discloseContent && !settings.yourBrand && !settings.brandedContent) {
    return "You need to indicate if your content promotes yourself, a third party, or both.";
  }
  if (settings.brandedContent && settings.privacyLevel === "SELF_ONLY") {
    return "Branded content visibility can't be set to Only me.";
  }
  return null;
}

export function tiktokContentLabel(settings) {
  if (!settings.discloseContent) return null;
  if (settings.brandedContent) return "Your post will be labeled as 'Paid partnership'.";
  if (settings.yourBrand) return "Your post will be labeled as 'Promotional content'.";
  return null;
}

export function isVideoMediaUrl(url = "") {
  return /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i.test(url) || url.includes("/video/upload/");
}
