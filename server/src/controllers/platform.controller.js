import Platform from "../models/Platform.js";
import { Errors } from "../utils/AppError.js";
import {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import { createState, getState } from "../utils/oauthState.js";

const SUPPORTED_PLATFORMS = [
  "Twitter",
  "Instagram",
  "LinkedIn",
  "Facebook",
  "TikTok",
  "YouTube",
  "Reddit",
];

export async function listPlatforms(req, res) {
  const platforms = await Platform.find({ userId: req.user.id });

  res.json({ success: true, data: { platforms } });
}

export async function connectPlatform(req, res) {
  const { name, accessToken, refreshToken, platformUserId, platformUsername } =
    req.body;

  if (!name || !SUPPORTED_PLATFORMS.includes(name)) {
    throw Errors.badRequest(
      `Unsupported platform. Supported: ${SUPPORTED_PLATFORMS.join(", ")}`,
    );
  }

  const existing = await Platform.findOne({ userId: req.user.id, name });
  if (existing) {
    throw Errors.conflict(`${name} is already connected`);
  }

  const platform = new Platform({
    userId: req.user.id,
    name,
    accessToken,
    refreshToken,
    platformUserId,
    platformUsername,
  });

  await platform.save();

  res.status(201).json({ success: true, data: { platform } });
}

export async function disconnectPlatform(req, res) {
  const platform = await Platform.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!platform) {
    throw Errors.notFound("Platform connection not found");
  }

  res.json({ success: true, data: null });
}

// Facebook OAuth functions
export async function initiateFacebookAuth(req, res) {
  const stateId = createState({ userId: req.user.id });
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/facebook/callback`;

  const facebookAuthUrl =
    `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${FACEBOOK_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=email,public_profile,pages_show_list,pages_manage_posts,pages_read_engagement&` +
    `response_type=code&` +
    `state=${stateId}&` +
    `auth_type=rerequest`;

  res.json({ success: true, data: { authUrl: facebookAuthUrl } });
}

function buildRedirectHtml(title, url) {
  return `<!DOCTYPE html><html><head><title>${title}</title><script>window.location.href="${url}";</script></head><body><p>${title}</p><p><a href="${url}">Click here if not redirected</a></p></body></html>`;
}

export async function handleFacebookCallback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code) {
    const appUrl = `crosspost://oauth/facebook/callback?error=${encodeURIComponent(error || "no_code")}`;
    return res.send(buildRedirectHtml("Facebook Connection Failed", appUrl));
  }

  const stateData = getState(state);
  if (!stateData) {
    const appUrl = `crosspost://oauth/facebook/callback?error=invalid_state`;
    return res.send(buildRedirectHtml("Facebook Connection Failed", appUrl));
  }

  try {
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `client_secret=${FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${encodeURIComponent(`${CLIENT_URL}/api/platforms/auth/facebook/callback`)}&` +
        `code=${code}`,
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      const appUrl = `crosspost://oauth/facebook/callback?error=${encodeURIComponent(tokenData.error.message)}`;
      return res.send(buildRedirectHtml("Facebook Connection Failed", appUrl));
    }

    const profileResponse = await fetch(
      `https://graph.facebook.com/me?` +
        `fields=id,name,email&` +
        `access_token=${tokenData.access_token}`,
    );

    const profile = await profileResponse.json();

    const permissionsResponse = await fetch(
      `https://graph.facebook.com/me/permissions?access_token=${tokenData.access_token}`,
    );
    const permissionsData = await permissionsResponse.json();
    console.log(
      "Facebook granted permissions:",
      JSON.stringify(permissionsData, null, 2),
    );

    // Fetch user's Facebook Pages to store page access token for publishing
    let pageId = null;
    let pageAccessToken = null;
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`,
    );
    const pagesData = await pagesRes.json();
    console.log("Facebook Pages response:", JSON.stringify(pagesData, null, 2));

    if (!pagesData.data || pagesData.data.length === 0) {
      const appUrl = `crosspost://oauth/facebook/callback?error=Failed%20to%20connect%20Facebook.%20No%20Facebook%20Pages%20found.%20Please%20create%20a%20Facebook%20Page%20and%20try%20again.`;
      return res.send(buildRedirectHtml("Facebook Connection Failed", appUrl));
    }

    if (pagesData.data && pagesData.data.length > 0) {
      pageId = pagesData.data[0].id;
      pageAccessToken = pagesData.data[0].access_token;
      console.log(
        `Facebook Page found: id=${pageId}, name=${pagesData.data[0].name}`,
      );
    } else {
      console.log("No Facebook Pages found for this user");
    }

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "Facebook",
    });

    if (existing) {
      existing.accessToken = tokenData.access_token;
      existing.platformUserId = profile.id;
      existing.platformUsername = pagesData.data[0].name;
      existing.pageId = pageId;
      existing.pageAccessToken = pageAccessToken;
      await existing.save();
    } else {
      await new Platform({
        userId: stateData.userId,
        name: "Facebook",
        accessToken: tokenData.access_token,
        platformUserId: profile.id,
        platformUsername: pagesData.data[0].name,
        pageId,
        pageAccessToken,
      }).save();
    }

    const appUrl = `crosspost://oauth/facebook/callback?success=true&name=${encodeURIComponent(profile.name)}`;
    res.send(buildRedirectHtml("Facebook Connected", appUrl));
  } catch (err) {
    console.error("Facebook OAuth error:", err);
    const appUrl = `crosspost://oauth/facebook/callback?error=server_error`;
    res.send(buildRedirectHtml("Facebook Connection Failed", appUrl));
  }
}
