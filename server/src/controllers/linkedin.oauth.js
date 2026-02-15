import Platform from "../models/Platform.js";
import {
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import { createState, getState } from "../utils/oauthState.js";

function buildRedirectHtml(title, url) {
  return `<!DOCTYPE html><html><head><title>${title}</title><script>window.location.href="${url}";</script></head><body><p>${title}</p><p><a href="${url}">Click here if not redirected</a></p></body></html>`;
}

export async function initiateLinkedInAuth(req, res) {
  const stateId = createState({ userId: req.user.id });
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/linkedin/callback`;

  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent("openid profile w_member_social")}&` +
    `state=${stateId}`;

  res.json({ success: true, data: { authUrl } });
}

export async function handleLinkedInCallback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code) {
    const appUrl = `crosspost://oauth/linkedin/callback?error=${encodeURIComponent(error || "no_code")}`;
    return res.send(buildRedirectHtml("LinkedIn Connection Failed", appUrl));
  }

  const stateData = getState(state);
  if (!stateData) {
    const appUrl = `crosspost://oauth/linkedin/callback?error=invalid_state`;
    return res.send(buildRedirectHtml("LinkedIn Connection Failed", appUrl));
  }

  try {
    const redirectUri = `${CLIENT_URL}/api/platforms/auth/linkedin/callback`;

    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      const msg = tokenData.error_description || tokenData.error;
      const appUrl = `crosspost://oauth/linkedin/callback?error=${encodeURIComponent(msg)}`;
      return res.send(buildRedirectHtml("LinkedIn Connection Failed", appUrl));
    }

    // Fetch user profile using userinfo endpoint
    const profileResponse = await fetch(
      "https://api.linkedin.com/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
    );

    const profile = await profileResponse.json();
    const displayName = profile.name || "LinkedIn User";
    const userId = profile.sub;

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "LinkedIn",
    });

    if (!existing) {
      await new Platform({
        userId: stateData.userId,
        name: "LinkedIn",
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        tokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        platformUserId: userId,
        platformUsername: displayName,
      }).save();
    }

    const appUrl = `crosspost://oauth/linkedin/callback?success=true&name=${encodeURIComponent(displayName)}`;
    res.send(buildRedirectHtml("LinkedIn Connected", appUrl));
  } catch (err) {
    console.error("LinkedIn OAuth error:", err);
    const appUrl = `crosspost://oauth/linkedin/callback?error=server_error`;
    res.send(buildRedirectHtml("LinkedIn Connection Failed", appUrl));
  }
}
