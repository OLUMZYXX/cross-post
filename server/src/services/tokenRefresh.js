import {
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
} from "../config/env.js";
import { logger } from "../utils/logger.js";

const REFRESH_WINDOWS_MS = {
  Instagram: 7 * 24 * 60 * 60 * 1000,
};
const DEFAULT_REFRESH_WINDOW_MS = 5 * 60 * 1000;

export async function ensureValidToken(platform) {
  const account = platform.platformUsername || platform.platformUserId || null;
  try {
    return await runTokenRefresh(platform);
  } catch (err) {
    logger.token("REFRESH_FAIL", { platform: platform.name, account, error: err.message });
    throw err;
  }
}

async function runTokenRefresh(platform) {
  const expiresAt = platform.tokenExpiresAt
    ? new Date(platform.tokenExpiresAt).getTime()
    : null;
  const now = Date.now();
  const refreshWindow =
    REFRESH_WINDOWS_MS[platform.name] ?? DEFAULT_REFRESH_WINDOW_MS;

  if (expiresAt && expiresAt - now > refreshWindow) return;
  if (!expiresAt && !platform.refreshToken && platform.name !== "Instagram") return;

  if (platform.name === "Instagram") {
    if (expiresAt && expiresAt <= now) {
      throw new Error(
        "Instagram access token has expired. Please reconnect your Instagram account.",
      );
    }
    if (!platform.accessToken) {
      throw new Error("Instagram access token missing. Please reconnect.");
    }
    logger.token("REFRESH_START", { platform: "Instagram", account: platform.platformUserId });
    const newTokens = await refreshInstagramToken(platform.accessToken);
    platform.accessToken = newTokens.access_token;
    if (newTokens.expires_in) {
      platform.tokenExpiresAt = new Date(now + newTokens.expires_in * 1000);
    }
    await platform.save();
    logger.token("REFRESH_OK", { platform: "Instagram" });
    return;
  }

  if (!platform.refreshToken) {
    throw new Error(
      `${platform.name} access token has expired and no refresh token is available. Please reconnect.`,
    );
  }

  const refreshers = {
    Twitter: refreshTwitterToken,
    TikTok: refreshTikTokToken,
    YouTube: refreshGoogleToken,
    Reddit: refreshRedditToken,
  };

  const refresher = refreshers[platform.name];
  if (!refresher) {
    throw new Error(
      `${platform.name} access token has expired. Please reconnect your account.`,
    );
  }

  logger.token("REFRESH_START", { platform: platform.name, account: platform.platformUsername || platform.platformUserId });
  const newTokens = await refresher(platform.refreshToken);

  if (!newTokens.access_token) {
    throw new Error(
      `${platform.name} session has expired. Please reconnect your account.`,
    );
  }

  platform.accessToken = newTokens.access_token;
  if (newTokens.refresh_token) {
    platform.refreshToken = newTokens.refresh_token;
  }
  if (newTokens.expires_in) {
    platform.tokenExpiresAt = new Date(now + newTokens.expires_in * 1000);
  }

  await platform.save();
  logger.token("REFRESH_OK", { platform: platform.name });
}

async function refreshInstagramToken(accessToken) {
  const url =
    `https://graph.instagram.com/refresh_access_token` +
    `?grant_type=ig_refresh_token` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const res = await fetch(url);
  const data = await res.json();
  if (data.error || !data.access_token) {
    throw new Error(
      data.error?.message || "Instagram token refresh failed. Please reconnect.",
    );
  }
  return data;
}

async function refreshTwitterToken(refreshToken) {
  const credentials = Buffer.from(
    `${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return data;
}

async function refreshTikTokToken(refreshToken) {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (data.error || !data.data?.access_token) {
    throw new Error(data.error?.message || "TikTok token refresh failed");
  }
  return data.data;
}

async function refreshGoogleToken(refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return data;
}

async function refreshRedditToken(refreshToken) {
  const credentials = Buffer.from(
    `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
      "User-Agent": "CrossPost/1.0",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return data;
}
