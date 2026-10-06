export const VIDEO_INIT_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/";
export const CONTENT_INIT_URL = "https://open.tiktokapis.com/v2/post/publish/content/init/";
export const VIDEO_TITLE_MAX = 150;
export const PHOTO_TITLE_MAX = 90;
export const PHOTO_DESCRIPTION_MAX = 4000;
export const PHOTO_MAX_COUNT = 35;

export const isVideoUrl = (url) =>
  Boolean(url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) || url.includes("/video/upload/"));

export function friendlyTikTokError(data, status) {
  const raw = `${data?.error?.code || ""} ${data?.error?.message || ""}`.toLowerCase();

  if (raw.includes("privacy_level_option_mismatch")) {
    return "That audience option isn't available for this TikTok account. Pick another one and try again.";
  }
  if (raw.includes("unaudited_client")) {
    return "TikTok is still treating this app as unreviewed. Set your TikTok account to Private, or try again once TikTok finishes switching the app to approved.";
  }
  if (raw.includes("url_ownership_unverified")) {
    return "TikTok has not verified this server's domain yet, so it cannot fetch your photos. Verify the domain in the TikTok developer portal, then try again.";
  }
  if (raw.includes("spam_risk") || raw.includes("daily_post_cap")) {
    return "TikTok has reached its posting limit for this account today. Try again tomorrow.";
  }
  if (raw.includes("scope") || raw.includes("permission") || status === 403) {
    return "Your TikTok connection is missing posting permission. Reconnect TikTok in Settings.";
  }
  if (raw.includes("access_token") || raw.includes("token") || status === 401) {
    return "Your TikTok connection has expired. Please reconnect TikTok in Settings.";
  }
  if (raw.includes("spam") || raw.includes("rate")) {
    return "TikTok is temporarily limiting posts from this account. Wait a few minutes and try again.";
  }
  if (raw.includes("privacy")) {
    return "TikTok didn't accept that audience setting for this account. Pick another one and try again.";
  }
  return data?.error?.message || "We couldn't post this to TikTok. Please try again.";
}
