import Platform from "../models/Platform.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import { createState, getState } from "../utils/oauthState.js";

function buildRedirectHtml(title, url) {
  return `<!DOCTYPE html><html><head><title>${title}</title><script>window.location.href="${url}";</script></head><body><p>${title}</p><p><a href="${url}">Click here if not redirected</a></p></body></html>`;
}

export async function initiateYouTubeAuth(req, res) {
  const stateId = await createState({ userId: req.user.id });
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/youtube/callback`;

  const scopes = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/userinfo.profile",
  ].join(" ");

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `response_type=code&` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `access_type=offline&` +
    `prompt=select_account+consent&` +
    `state=${stateId}`;

  res.json({ success: true, data: { authUrl } });
}

export async function handleYouTubeCallback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code) {
    const appUrl = `crosspost://oauth/youtube/callback?error=${encodeURIComponent(error || "no_code")}`;
    return res.send(buildRedirectHtml("YouTube Connection Failed", appUrl));
  }

  const stateData = await getState(state);
  if (!stateData) {
    const appUrl = `crosspost://oauth/youtube/callback?error=invalid_state`;
    return res.send(buildRedirectHtml("YouTube Connection Failed", appUrl));
  }

  try {
    const redirectUri = `${CLIENT_URL}/api/platforms/auth/youtube/callback`;

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      const msg = tokenData.error_description || tokenData.error;
      const appUrl = `crosspost://oauth/youtube/callback?error=${encodeURIComponent(msg)}`;
      return res.send(buildRedirectHtml("YouTube Connection Failed", appUrl));
    }

    // Fetch YouTube channel info
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
    );

    const channelData = await channelResponse.json();
    let channelName = "YouTube User";
    let channelId = null;

    if (channelData.items && channelData.items.length > 0) {
      channelName = channelData.items[0].snippet.title;
      channelId = channelData.items[0].id;
    }

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "YouTube",
    });

    if (!existing) {
      await new Platform({
        userId: stateData.userId,
        name: "YouTube",
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        tokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        platformUserId: channelId,
        platformUsername: channelName,
      }).save();
    }

    const appUrl = `crosspost://oauth/youtube/callback?success=true&name=${encodeURIComponent(channelName)}`;
    res.send(buildRedirectHtml("YouTube Connected", appUrl));
  } catch (err) {
    // console.error("YouTube OAuth error:", err);
    const appUrl = `crosspost://oauth/youtube/callback?error=server_error`;
    res.send(buildRedirectHtml("YouTube Connection Failed", appUrl));
  }
}
