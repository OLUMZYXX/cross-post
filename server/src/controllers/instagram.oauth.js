import Platform from "../models/Platform.js";
import {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import { createState, getState, peekState } from "../utils/oauthState.js";

/**
 * Return pending Instagram account info for the confirm screen
 * Does NOT consume the state — it stays valid for the actual confirm call
 */
export async function getInstagramPendingInfo(req, res) {
  const { stateId } = req.query;
  console.log("Instagram pending info request, stateId:", stateId);
  if (!stateId) {
    return res
      .status(400)
      .json({ success: false, error: { message: "Missing stateId" } });
  }

  const data = peekState(stateId);
  console.log("Instagram pending data found:", !!data);
  if (!data) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or expired session. Please try again." },
    });
  }

  console.log("Instagram pending - state userId:", data.userId, "req userId:", req.user.id);
  if (data.userId !== req.user.id) {
    return res
      .status(403)
      .json({ success: false, error: { message: "User mismatch" } });
  }

  res.json({
    success: true,
    data: {
      username: data.platformUsername,
      userId: data.platformUserId,
      accountType: data.accountType,
      profilePic: data.profilePic,
    },
  });
}

/**
 * Confirm Instagram connection — called from the app after user reviews their account
 */
export async function confirmInstagramConnection(req, res) {
  const { stateId } = req.body;
  console.log("Instagram confirm request, stateId:", stateId);

  if (!stateId) {
    return res
      .status(400)
      .json({ success: false, error: { message: "Missing stateId" } });
  }

  const pendingData = getState(stateId);
  console.log("Instagram confirm data found:", !!pendingData);
  if (!pendingData) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or expired confirmation. Please try again." },
    });
  }

  // Verify the logged-in user matches the one who started the OAuth flow
  console.log("Instagram confirm - state userId:", pendingData.userId, "req userId:", req.user.id);
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

  console.log("Instagram platform saved successfully for user:", pendingData.userId, "username:", platformUsername);
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

  console.log("=== INSTAGRAM AUTH INITIATE ===");
  console.log("User ID:", req.user.id);
  console.log("State ID:", stateId);
  console.log("CLIENT_URL from env:", CLIENT_URL);
  console.log("Instagram App ID:", INSTAGRAM_APP_ID);
  console.log("Redirect URI:", redirectUri);

  const authUrl =
    `https://www.instagram.com/oauth/authorize?` +
    `client_id=${INSTAGRAM_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent("instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages")}&` +
    `response_type=code&` +
    `state=${stateId}&` +
    `force_authentication=1`;

  console.log("Full Auth URL:", authUrl);
  console.log("=== END INSTAGRAM INITIATE ===\n");

  res.json({ success: true, data: { authUrl } });
}

export async function handleInstagramCallback(req, res) {
  const { code, state, error, error_reason, error_description } = req.query;

  console.log("=== INSTAGRAM CALLBACK ===");
  console.log("Query params:", JSON.stringify(req.query, null, 2));
  console.log("Code present:", !!code);
  console.log("State:", state);
  console.log("Error:", error);
  console.log("Error reason:", error_reason);
  console.log("Error description:", error_description);

  if (error || !code) {
    const errMsg = error_description || error_reason || error || "no_code";
    console.log("ERROR: Instagram auth failed -", errMsg);
    console.log("=== END CALLBACK (ERROR) ===\n");
    const appUrl = `crosspost://oauth/instagram/callback?error=${encodeURIComponent(errMsg)}`;
    return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }

  const stateData = getState(state);
  console.log("State data retrieved:", !!stateData);
  if (!stateData) {
    console.log("ERROR: Invalid or expired state");
    console.log("=== END CALLBACK (INVALID STATE) ===\n");
    const appUrl = `crosspost://oauth/instagram/callback?error=invalid_state`;
    return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }

  try {
    const redirectUri = `${CLIENT_URL}/api/platforms/auth/instagram/callback`;
    console.log("CLIENT_URL:", CLIENT_URL);
    console.log("Redirect URI for token exchange:", redirectUri);

    // Exchange code for short-lived token via Instagram API
    const tokenBody = new URLSearchParams({
      client_id: INSTAGRAM_APP_ID,
      client_secret: INSTAGRAM_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    console.log("Token exchange body:", tokenBody.toString());

    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenBody.toString(),
      },
    );

    console.log("Token response status:", tokenResponse.status);
    const tokenData = await tokenResponse.json();
    console.log("Instagram token response:", JSON.stringify(tokenData, null, 2));

    if (tokenData.error_type || tokenData.error_message) {
      console.log("ERROR: Token exchange failed -", tokenData.error_message || tokenData.error_type);
      console.log("Full error object:", JSON.stringify(tokenData, null, 2));
      console.log("=== END CALLBACK (TOKEN ERROR) ===\n");
      const appUrl = `crosspost://oauth/instagram/callback?error=${encodeURIComponent(tokenData.error_message || "Token exchange failed")}`;
      return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
    }

    const shortToken = tokenData.access_token;
    console.log("Short-lived token received:", shortToken ? "YES" : "NO");

    // Exchange short-lived token for long-lived token (60 days)
    console.log("Exchanging for long-lived token...");
    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?` +
        `grant_type=ig_exchange_token&` +
        `client_secret=${INSTAGRAM_APP_SECRET}&` +
        `access_token=${shortToken}`,
    );
    console.log("Long token response status:", longTokenRes.status);
    const longTokenData = await longTokenRes.json();
    console.log("Instagram long-lived token response:", JSON.stringify(longTokenData, null, 2));

    const accessToken = longTokenData.access_token || shortToken;
    const expiresIn = longTokenData.expires_in; // seconds
    console.log("Final access token:", accessToken ? "YES" : "NO");
    console.log("Token expires in:", expiresIn, "seconds");

    // Get user profile (username, account type)
    console.log("Fetching Instagram profile...");
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=user_id,username,account_type,profile_picture_url&access_token=${accessToken}`,
    );
    console.log("Profile response status:", profileRes.status);
    const profile = await profileRes.json();
    console.log("Instagram profile response:", JSON.stringify(profile, null, 2));

    const igUsername = profile.username || "Instagram User";
    // Use profile.id (string) — NOT tokenData.user_id (number loses precision)
    const igUserId = profile.id;
    console.log("Instagram Username:", igUsername);
    console.log("Instagram User ID:", igUserId);

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : null;

    // Save the connection directly (same as other platforms)
    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "Instagram",
    });

    if (existing) {
      existing.accessToken = accessToken;
      existing.platformUserId = igUserId;
      existing.platformUsername = igUsername;
      existing.tokenExpiresAt = tokenExpiresAt;
      await existing.save();
    } else {
      await new Platform({
        userId: stateData.userId,
        name: "Instagram",
        accessToken,
        platformUserId: igUserId,
        platformUsername: igUsername,
        tokenExpiresAt,
      }).save();
    }

    console.log("Instagram connected for user:", stateData.userId, "username:", igUsername);
    console.log("=== INSTAGRAM CALLBACK SUCCESS ===\n");

    const appUrl = `crosspost://oauth/instagram/callback?success=true&name=${encodeURIComponent(igUsername)}`;
    res.send(buildRedirectHtml("Instagram Connected", appUrl));
  } catch (err) {
    console.error("=== INSTAGRAM OAUTH ERROR ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("=== END ERROR ===\n");
    const appUrl = `crosspost://oauth/instagram/callback?error=server_error`;
    res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }
}
