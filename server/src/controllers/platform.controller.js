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
  // If the client requests a mobile/app redirect, point Facebook to the app scheme
  const useAppRedirect =
    req.query.useAppRedirect === "true" || req.query.useAppRedirect === "1";
  const redirectUri = useAppRedirect
    ? `crosspost://oauth/facebook/callback`
    : `${CLIENT_URL}/api/platforms/auth/facebook/callback`;

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
      `https://graph.facebook.com/v18.0/me/accounts?limit=100&access_token=${tokenData.access_token}`,
    );
    const pagesData = await pagesRes.json();
    console.log("Facebook Pages response:", JSON.stringify(pagesData, null, 2));

    if (!pagesData.data || pagesData.data.length === 0) {
      // debug token information to help troubleshoot why /me/accounts returned empty
      try {
        const debugRes = await fetch(
          `https://graph.facebook.com/debug_token?input_token=${tokenData.access_token}&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`,
        );
        const debugData = await debugRes.json();
        console.log(
          "Facebook token debug:",
          JSON.stringify(debugData, null, 2),
        );
      } catch (dbgErr) {
        console.warn(
          "Failed to debug Facebook token:",
          dbgErr?.message || dbgErr,
        );
      }

      // Save a user-level Facebook connection even when there are no Pages yet so user sees "Facebook connected"
      const existingNoPage = await Platform.findOne({
        userId: stateData.userId,
        name: "Facebook",
      });
      if (existingNoPage) {
        existingNoPage.accessToken = tokenData.access_token;
        existingNoPage.platformUserId = profile.id;
        existingNoPage.platformUsername = profile.name;
        existingNoPage.pageId = null;
        existingNoPage.pageAccessToken = null;
        await existingNoPage.save();
      } else {
        await new Platform({
          userId: stateData.userId,
          name: "Facebook",
          accessToken: tokenData.access_token,
          platformUserId: profile.id,
          platformUsername: profile.name,
          pageId: null,
          pageAccessToken: null,
        }).save();
      }

      const appUrl = `crosspost://oauth/facebook/callback?success=true&missing_pages=true&name=${encodeURIComponent(profile.name)}`;
      return res.send(
        buildRedirectHtml("Facebook Connected (no pages)", appUrl),
      );
    }

    // Connect the first page by default
    const firstPage = pagesData.data[0];
    pageId = firstPage.id;
    pageAccessToken = firstPage.access_token;
    console.log(
      `Facebook Page found: id=${pageId}, name=${firstPage.name} (${pagesData.data.length} total pages)`,
    );

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "Facebook",
    });

    if (existing) {
      existing.accessToken = tokenData.access_token;
      existing.platformUserId = profile.id;
      existing.platformUsername = firstPage.name;
      existing.pageId = pageId;
      existing.pageAccessToken = pageAccessToken;
      await existing.save();
    } else {
      await new Platform({
        userId: stateData.userId,
        name: "Facebook",
        accessToken: tokenData.access_token,
        platformUserId: profile.id,
        platformUsername: firstPage.name,
        pageId,
        pageAccessToken,
      }).save();
    }

    const appUrl = `crosspost://oauth/facebook/callback?success=true&name=${encodeURIComponent(firstPage.name)}`;
    res.send(buildRedirectHtml("Facebook Connected", appUrl));
  } catch (err) {
    console.error("Facebook OAuth error:", err);
    const appUrl = `crosspost://oauth/facebook/callback?error=server_error`;
    res.send(buildRedirectHtml("Facebook Connection Failed", appUrl));
  }
}

// Mobile-friendly completion endpoint: exchange code (received via app deep link)
export async function completeFacebookAuth(req, res) {
  const { code, state } = req.body;
  if (!code || !state) {
    return res
      .status(400)
      .json({
        success: false,
        error: { message: "code and state are required" },
      });
  }

  const stateData = getState(state);
  if (!stateData || stateData.userId !== req.user.id) {
    return res
      .status(400)
      .json({ success: false, error: { message: "invalid or expired state" } });
  }

  try {
    // Exchange code for user access token (redirect_uri must match the one used when building the auth URL)
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `client_secret=${FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${encodeURIComponent(`crosspost://oauth/facebook/callback`)}&` +
        `code=${code}`,
    );

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            message: tokenData.error.message || "Token exchange failed",
          },
        });
    }

    const profileResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`,
    );
    const profile = await profileResponse.json();

    // Fetch user's Facebook Pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?limit=100&access_token=${tokenData.access_token}`,
    );
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      // debug token information to help troubleshooting
      try {
        const debugRes = await fetch(
          `https://graph.facebook.com/debug_token?input_token=${tokenData.access_token}&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`,
        );
        const debugData = await debugRes.json();
        console.log(
          "completeFacebookAuth - token debug:",
          JSON.stringify(debugData, null, 2),
        );
      } catch (dbgErr) {
        console.warn(
          "completeFacebookAuth - debug failed:",
          dbgErr?.message || dbgErr,
        );
      }

      // Save user-level connection (no page yet) and return success indicating pages are missing
      const existingNoPage = await Platform.findOne({
        userId: stateData.userId,
        name: "Facebook",
      });
      if (existingNoPage) {
        existingNoPage.accessToken = tokenData.access_token;
        existingNoPage.platformUserId = profile.id;
        existingNoPage.platformUsername = profile.name;
        existingNoPage.pageId = null;
        existingNoPage.pageAccessToken = null;
        await existingNoPage.save();
      } else {
        await new Platform({
          userId: stateData.userId,
          name: "Facebook",
          accessToken: tokenData.access_token,
          platformUserId: profile.id,
          platformUsername: profile.name,
          pageId: null,
          pageAccessToken: null,
        }).save();
      }

      return res.json({
        success: true,
        data: { missingPages: true, profileName: profile.name },
      });
    }

    const firstPage = pagesData.data[0];
    const pageId = firstPage.id;
    const pageAccessToken = firstPage.access_token;

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "Facebook",
    });

    if (existing) {
      existing.accessToken = tokenData.access_token;
      existing.platformUserId = profile.id;
      existing.platformUsername = firstPage.name;
      existing.pageId = pageId;
      existing.pageAccessToken = pageAccessToken;
      await existing.save();
    } else {
      await new Platform({
        userId: stateData.userId,
        name: "Facebook",
        accessToken: tokenData.access_token,
        platformUserId: profile.id,
        platformUsername: firstPage.name,
        pageId,
        pageAccessToken,
      }).save();
    }

    res.json({ success: true, data: { pageName: firstPage.name } });
  } catch (err) {
    console.error("completeFacebookAuth error:", err);
    res
      .status(500)
      .json({ success: false, error: { message: "server_error" } });
  }
}

export async function getFacebookDebug(req, res) {
  const platform = await Platform.findOne({
    userId: req.user.id,
    name: "Facebook",
  });
  if (!platform) {
    return res
      .status(404)
      .json({
        success: false,
        error: { message: "Facebook is not connected." },
      });
  }

  if (!platform.accessToken) {
    return res
      .status(400)
      .json({
        success: false,
        error: { message: "No Facebook access token saved for this user." },
      });
  }

  try {
    const meRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${platform.accessToken}`,
    );
    const me = await meRes.json();

    const accountsRes = await fetch(
      `https://graph.facebook.com/me/accounts?limit=100&access_token=${platform.accessToken}`,
    );
    const accounts = await accountsRes.json();

    const debugRes = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${platform.accessToken}&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`,
    );
    const debug = await debugRes.json();

    return res.json({ success: true, data: { platform, me, accounts, debug } });
  } catch (err) {
    console.error("getFacebookDebug error:", err);
    return res
      .status(500)
      .json({ success: false, error: { message: "server_error" } });
  }
}

/**
 * List all Facebook Pages available to the connected user
 */
export async function listFacebookPages(req, res) {
  const platform = await Platform.findOne({
    userId: req.user.id,
    name: "Facebook",
  });

  if (!platform) {
    throw Errors.notFound(
      "Facebook is not connected. Please connect Facebook first.",
    );
  }

  const pagesRes = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?limit=100&access_token=${platform.accessToken}`,
  );
  const pagesData = await pagesRes.json();

  if (pagesData.error) {
    throw Errors.badRequest(pagesData.error.message || "Failed to fetch pages");
  }

  const pages = (pagesData.data || []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    isSelected: p.id === platform.pageId,
  }));

  res.json({ success: true, data: { pages, currentPageId: platform.pageId } });
}

/**
 * Switch the connected Facebook Page
 */
export async function selectFacebookPage(req, res) {
  const { pageId } = req.body;

  if (!pageId) {
    throw Errors.badRequest("pageId is required");
  }

  const platform = await Platform.findOne({
    userId: req.user.id,
    name: "Facebook",
  });

  if (!platform) {
    throw Errors.notFound("Facebook is not connected.");
  }

  // Fetch all pages to find the selected one's access token
  const pagesRes = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?limit=100&access_token=${platform.accessToken}`,
  );
  const pagesData = await pagesRes.json();

  if (pagesData.error) {
    throw Errors.badRequest(pagesData.error.message || "Failed to fetch pages");
  }

  const selectedPage = (pagesData.data || []).find((p) => p.id === pageId);
  if (!selectedPage) {
    throw Errors.notFound(
      "Page not found. Make sure you have access to this page.",
    );
  }

  platform.pageId = selectedPage.id;
  platform.pageAccessToken = selectedPage.access_token;
  platform.platformUsername = selectedPage.name;
  await platform.save();

  console.log(
    `Facebook page switched to: ${selectedPage.name} (${selectedPage.id})`,
  );

  res.json({
    success: true,
    data: { pageName: selectedPage.name, pageId: selectedPage.id },
  });
}
