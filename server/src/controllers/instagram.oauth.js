import Platform from "../models/Platform.js";
import {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import { createState, getState, peekState } from "../utils/oauthState.js";

export async function getInstagramPendingInfo(req, res) {
  const { stateId } = req.query;
  if (!stateId) {
    return res
      .status(400)
      .json({ success: false, error: { message: "Missing stateId" } });
  }

  const data = await peekState(stateId);
  if (!data) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or expired session. Please try again." },
    });
  }

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

export async function confirmInstagramConnection(req, res) {
  const { stateId } = req.body;
  if (!stateId) {
    return res
      .status(400)
      .json({ success: false, error: { message: "Missing stateId" } });
  }

  const pendingData = await getState(stateId);
  if (!pendingData) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or expired confirmation. Please try again." },
    });
  }

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
    platformUserId,
  });

  if (existing) {
    existing.accessToken = accessToken;
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

export async function initiateInstagramAuth(req, res) {
  const stateId = await createState({ userId: req.user.id });
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/instagram/callback`;

  const authUrl =
    `https://www.instagram.com/oauth/authorize?` +
    `client_id=${INSTAGRAM_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent("instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages")}&` +
    `response_type=code&` +
    `state=${stateId}&` +
    `force_authentication=1`;

  res.json({ success: true, data: { authUrl } });
}

export async function handleInstagramCallback(req, res) {
  const { code, state, error, error_reason, error_description } = req.query;

  if (error || !code) {
    const errMsg = error_description || error_reason || error || "no_code";
    const appUrl = `crosspost://oauth/instagram/callback?error=${encodeURIComponent(errMsg)}`;
    return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }

  const stateData = await getState(state);
  if (!stateData) {
    const appUrl = `crosspost://oauth/instagram/callback?error=invalid_state`;
    return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }

  try {
    const redirectUri = `${CLIENT_URL}/api/platforms/auth/instagram/callback`;

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

    if (tokenData.error_type || tokenData.error_message) {
      const appUrl = `crosspost://oauth/instagram/callback?error=${encodeURIComponent(tokenData.error_message || "Token exchange failed")}`;
      return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
    }

    const shortToken = tokenData.access_token;

    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?` +
        `grant_type=ig_exchange_token&` +
        `client_secret=${INSTAGRAM_APP_SECRET}&` +
        `access_token=${shortToken}`,
    );
    const longTokenData = await longTokenRes.json();

    const accessToken = longTokenData.access_token || shortToken;
    const expiresIn = longTokenData.expires_in;
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=user_id,username,account_type,profile_picture_url&access_token=${accessToken}`,
    );
    const profile = await profileRes.json();

    const igUsername = profile.username || "Instagram User";
    const igUserId = profile.id;

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : null;

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "Instagram",
      platformUserId: igUserId,
    });

    if (existing) {
      existing.accessToken = accessToken;
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

    const appUrl = `crosspost://oauth/instagram/callback?success=true&name=${encodeURIComponent(igUsername)}`;
    res.send(buildRedirectHtml("Instagram Connected", appUrl));
  } catch (err) {
    const appUrl = `crosspost://oauth/instagram/callback?error=server_error`;
    res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }
}
