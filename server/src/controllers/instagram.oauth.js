import Platform from "../models/Platform.js";
import {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import { createState, getState } from "../utils/oauthState.js";

/**
 * Confirm Instagram connection — called from the app after user reviews their account
 */
export async function confirmInstagramConnection(req, res) {
  const { stateId } = req.body;

  if (!stateId) {
    return res
      .status(400)
      .json({ success: false, error: { message: "Missing stateId" } });
  }

  const pendingData = getState(stateId);
  if (!pendingData) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or expired confirmation. Please try again." },
    });
  }

  // Verify the logged-in user matches the one who started the OAuth flow
  if (pendingData.userId !== req.user.id) {
    return res
      .status(403)
      .json({ success: false, error: { message: "User mismatch" } });
  }

  const { accessToken, platformUserId, platformUsername, tokenExpiresAt } =
    pendingData;

  const existing = await Platform.findOne({
    userId: pendingData.userId,
    name: "Instagram",
  });

  if (existing) {
    existing.accessToken = accessToken;
    existing.platformUserId = platformUserId;
    existing.platformUsername = platformUsername;
    existing.tokenExpiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : null;
    await existing.save();
  } else {
    await new Platform({
      userId: pendingData.userId,
      name: "Instagram",
      accessToken,
      platformUserId,
      platformUsername,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
    }).save();
  }

  res.json({
    success: true,
    data: { platformUsername, platformUserId },
  });
}

function buildRedirectHtml(title, url) {
  return `<!DOCTYPE html><html><head><title>${title}</title><script>window.location.href="${url}";</script></head><body><p>${title}</p><p><a href="${url}">Click here if not redirected</a></p></body></html>`;
}

/**
 * Instagram Login flow — uses instagram.com login page directly
 * Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
 */
export async function initiateInstagramAuth(req, res) {
  const stateId = createState({ userId: req.user.id });
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/instagram/callback`;

  const authUrl =
    `https://www.instagram.com/oauth/authorize?` +
    `client_id=${INSTAGRAM_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent("instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages")}&` +
    `response_type=code&` +
    `state=${stateId}`;

  res.json({ success: true, data: { authUrl } });
}

export async function handleInstagramCallback(req, res) {
  const { code, state, error, error_reason } = req.query;

  if (error || !code) {
    const errMsg = error_reason || error || "no_code";
    const appUrl = `crosspost://oauth/instagram/callback?error=${encodeURIComponent(errMsg)}`;
    return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }

  const stateData = getState(state);
  if (!stateData) {
    const appUrl = `crosspost://oauth/instagram/callback?error=invalid_state`;
    return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }

  try {
    const redirectUri = `${CLIENT_URL}/api/platforms/auth/instagram/callback`;

    // Exchange code for short-lived token via Instagram API
    const tokenBody = new URLSearchParams({
      client_id: INSTAGRAM_APP_ID,
      client_secret: INSTAGRAM_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenBody.toString(),
      },
    );

    const tokenData = await tokenResponse.json();
    console.log("Instagram token response:", JSON.stringify(tokenData, null, 2));

    if (tokenData.error_type || tokenData.error_message) {
      const appUrl = `crosspost://oauth/instagram/callback?error=${encodeURIComponent(tokenData.error_message || "Token exchange failed")}`;
      return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
    }

    const shortToken = tokenData.access_token;
    const igUserId = String(tokenData.user_id);

    // Exchange short-lived token for long-lived token (60 days)
    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?` +
        `grant_type=ig_exchange_token&` +
        `client_secret=${INSTAGRAM_APP_SECRET}&` +
        `access_token=${shortToken}`,
    );
    const longTokenData = await longTokenRes.json();
    console.log("Instagram long-lived token:", JSON.stringify(longTokenData, null, 2));

    const accessToken = longTokenData.access_token || shortToken;
    const expiresIn = longTokenData.expires_in; // seconds

    // Get user profile (username, account type)
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=user_id,username,account_type,profile_picture_url&access_token=${accessToken}`,
    );
    const profile = await profileRes.json();
    console.log("Instagram profile:", JSON.stringify(profile, null, 2));

    const igUsername = profile.username || "Instagram User";
    const profilePic = profile.profile_picture_url || "";
    const accountType = profile.account_type || "";

    // Store pending data in OAuth state for confirmation step
    const confirmStateId = createState({
      userId: stateData.userId,
      accessToken,
      platformUserId: igUserId,
      platformUsername: igUsername,
      tokenExpiresAt: expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : null,
    });

    // Redirect to app with account info for user to confirm (NOT auto-saved)
    const appUrl =
      `crosspost://oauth/instagram/callback?confirm=true` +
      `&username=${encodeURIComponent(igUsername)}` +
      `&userId=${encodeURIComponent(igUserId)}` +
      `&accountType=${encodeURIComponent(accountType)}` +
      `&profilePic=${encodeURIComponent(profilePic)}` +
      `&stateId=${confirmStateId}`;
    res.send(buildRedirectHtml("Instagram - Confirm Account", appUrl));
  } catch (err) {
    console.error("Instagram OAuth error:", err);
    const appUrl = `crosspost://oauth/instagram/callback?error=server_error`;
    res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }
}
