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

/**
 * Check if a platform's token is expired and refresh it if possible.
 * Mutates the platform document and saves it if refreshed.
 */
export async function ensureValidToken(platform) {
  // If no expiry is tracked, or token hasn't expired yet, do nothing
  if (!platform.tokenExpiresAt) return;
  if (new Date(platform.tokenExpiresAt) > new Date()) return;

  // Token is expired — try to refresh
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

  const newTokens = await refresher(platform.refreshToken);

  platform.accessToken = newTokens.access_token;
  if (newTokens.refresh_token) {
    platform.refreshToken = newTokens.refresh_token;
  }
  if (newTokens.expires_in) {
    platform.tokenExpiresAt = new Date(
      Date.now() + newTokens.expires_in * 1000,
    );
  }

  await platform.save();
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
