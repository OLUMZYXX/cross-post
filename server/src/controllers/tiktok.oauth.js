import Platform from "../models/Platform.js";
import {
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import { createState, getState } from "../utils/oauthState.js";

function buildRedirectHtml(title, url) {
  return `<!DOCTYPE html><html><head><title>${title}</title><script>window.location.href="${url}";</script></head><body><p>${title}</p><p><a href="${url}">Click here if not redirected</a></p></body></html>`;
}

export async function initiateTikTokAuth(req, res) {
  const stateId = createState({ userId: req.user.id });
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/tiktok/callback`;

  const authUrl =
    `https://www.tiktok.com/v2/auth/authorize/?` +
    `client_key=${TIKTOK_CLIENT_KEY}&` +
    `scope=${encodeURIComponent("user.info.basic,video.publish")}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${stateId}`;

  res.json({ success: true, data: { authUrl } });
}

export async function handleTikTokCallback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code) {
    const appUrl = `crosspost://oauth/tiktok/callback?error=${encodeURIComponent(error || "no_code")}`;
    return res.send(buildRedirectHtml("TikTok Connection Failed", appUrl));
  }

  const stateData = getState(state);
  if (!stateData) {
    const appUrl = `crosspost://oauth/tiktok/callback?error=invalid_state`;
    return res.send(buildRedirectHtml("TikTok Connection Failed", appUrl));
  }

  try {
    const redirectUri = `${CLIENT_URL}/api/platforms/auth/tiktok/callback`;
    const tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      },
    );

    const tokenData = await tokenResponse.json();
    console.log("TikTok token response:", JSON.stringify(tokenData, null, 2));

    if (tokenData.error || !tokenData.data?.access_token) {
      const msg =
        tokenData.error?.message ||
        tokenData.error_description ||
        "token_error";
      const appUrl = `crosspost://oauth/tiktok/callback?error=${encodeURIComponent(msg)}`;
      return res.send(buildRedirectHtml("TikTok Connection Failed", appUrl));
    }

    const { access_token, refresh_token, open_id } = tokenData.data;

    const profileResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
      { headers: { Authorization: `Bearer ${access_token}` } },
    );

    const profileData = await profileResponse.json();
    console.log("TikTok profile response:", JSON.stringify(profileData, null, 2));
    const displayName =
      profileData.data?.user?.display_name || "TikTok User";

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "TikTok",
    });

    if (existing) {
      existing.accessToken = access_token;
      existing.refreshToken = refresh_token;
      existing.platformUserId = open_id;
      existing.platformUsername = displayName;
      await existing.save();
    } else {
      await new Platform({
        userId: stateData.userId,
        name: "TikTok",
        accessToken: access_token,
        refreshToken: refresh_token,
        platformUserId: open_id,
        platformUsername: displayName,
      }).save();
    }

    console.log("TikTok connected for user:", stateData.userId, "username:", displayName);

    const appUrl = `crosspost://oauth/tiktok/callback?success=true&name=${encodeURIComponent(displayName)}`;
    res.send(buildRedirectHtml("TikTok Connected", appUrl));
  } catch (err) {
    console.error("TikTok OAuth error:", err);
    const appUrl = `crosspost://oauth/tiktok/callback?error=server_error`;
    res.send(buildRedirectHtml("TikTok Connection Failed", appUrl));
  }
}
