import Platform from "../models/Platform.js";
import { createState, getState, peekState } from "../utils/oauthState.js";
import {
  buildInstagramAuthUrl,
  exchangeInstagramCode,
  getLongLivedInstagramToken,
  fetchInstagramProfile,
} from "../services/instagram.auth.service.js";

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
  const authUrl = buildInstagramAuthUrl(stateId);
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
    const shortToken = await exchangeInstagramCode(code);
    const { accessToken, expiresIn } =
      await getLongLivedInstagramToken(shortToken);
    const { username: igUsername, userId: igUserId } =
      await fetchInstagramProfile(accessToken);

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
    const appUrl = `crosspost://oauth/instagram/callback?error=${encodeURIComponent(err.message || "server_error")}`;
    res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }
}
