import Platform from "../models/Platform.js";
import {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import { createState, getState } from "../utils/oauthState.js";

function buildRedirectHtml(title, url) {
  return `<!DOCTYPE html><html><head><title>${title}</title><script>window.location.href="${url}";</script></head><body><p>${title}</p><p><a href="${url}">Click here if not redirected</a></p></body></html>`;
}

export async function initiateRedditAuth(req, res) {
  const stateId = createState({ userId: req.user.id });
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/reddit/callback`;

  const authUrl =
    `https://www.reddit.com/api/v1/authorize?` +
    `response_type=code&` +
    `client_id=${REDDIT_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent("submit identity")}&` +
    `state=${stateId}&` +
    `duration=permanent&` +
    `prompt=consent`;

  res.json({ success: true, data: { authUrl } });
}

export async function handleRedditCallback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code) {
    const appUrl = `crosspost://oauth/reddit/callback?error=${encodeURIComponent(error || "no_code")}`;
    return res.send(buildRedirectHtml("Reddit Connection Failed", appUrl));
  }

  const stateData = getState(state);
  if (!stateData) {
    const appUrl = `crosspost://oauth/reddit/callback?error=invalid_state`;
    return res.send(buildRedirectHtml("Reddit Connection Failed", appUrl));
  }

  try {
    const redirectUri = `${CLIENT_URL}/api/platforms/auth/reddit/callback`;
    const credentials = Buffer.from(
      `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`,
    ).toString("base64");

    const tokenResponse = await fetch(
      "https://www.reddit.com/api/v1/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
          "User-Agent": "CrossPost/1.0",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      const msg = tokenData.error_description || tokenData.error;
      const appUrl = `crosspost://oauth/reddit/callback?error=${encodeURIComponent(msg)}`;
      return res.send(buildRedirectHtml("Reddit Connection Failed", appUrl));
    }

    // Fetch Reddit user profile
    const profileResponse = await fetch(
      "https://oauth.reddit.com/api/v1/me",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "CrossPost/1.0",
        },
      },
    );

    const profile = await profileResponse.json();
    const username = profile.name || "Reddit User";

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "Reddit",
    });

    if (!existing) {
      await new Platform({
        userId: stateData.userId,
        name: "Reddit",
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        tokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        platformUserId: profile.id,
        platformUsername: username,
      }).save();
    }

    const appUrl = `crosspost://oauth/reddit/callback?success=true&name=${encodeURIComponent(username)}`;
    res.send(buildRedirectHtml("Reddit Connected", appUrl));
  } catch (err) {
    // console.error("Reddit OAuth error:", err);
    const appUrl = `crosspost://oauth/reddit/callback?error=server_error`;
    res.send(buildRedirectHtml("Reddit Connection Failed", appUrl));
  }
}
