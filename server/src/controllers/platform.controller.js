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
    `auth_type=reauthenticate`;

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

    let pages = pagesData.data || [];

    // In Development mode, /me/accounts often returns empty even when pages are authorized.
    // Fall back to fetching pages directly by ID from the token's granular_scopes.
    if (pages.length === 0) {
      console.log("me/accounts returned empty, trying granular_scopes fallback...");
      try {
        const debugRes = await fetch(
          `https://graph.facebook.com/debug_token?input_token=${tokenData.access_token}&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`,
        );
        const debugData = await debugRes.json();
        console.log("Facebook token debug:", JSON.stringify(debugData, null, 2));

        // Extract page IDs from granular_scopes (e.g. pages_manage_posts target_ids)
        const granularScopes = debugData.data?.granular_scopes || [];
        const pageIds = new Set();
        for (const scope of granularScopes) {
          if (scope.target_ids) {
            scope.target_ids.forEach((id) => pageIds.add(id));
          }
        }

        if (pageIds.size > 0) {
          console.log("Found page IDs from granular_scopes:", [...pageIds]);
          // Fetch each page directly by ID to get name and page access token
          for (const pid of pageIds) {
            try {
              const pageRes = await fetch(
                `https://graph.facebook.com/v18.0/${pid}?fields=id,name,access_token,category&access_token=${tokenData.access_token}`,
              );
              const pageInfo = await pageRes.json();
              console.log(`Fetched page ${pid}:`, JSON.stringify(pageInfo, null, 2));
              if (pageInfo.id && !pageInfo.error) {
                pages.push(pageInfo);
              }
            } catch (pgErr) {
              console.warn(`Failed to fetch page ${pid}:`, pgErr.message);
            }
          }
        }
      } catch (dbgErr) {
        console.warn("Failed to debug Facebook token:", dbgErr?.message || dbgErr);
      }
    }

    if (pages.length === 0) {
      // Still no pages — save user-level connection so user sees "Facebook connected"
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

    // Save ALL pages and select them all by default
    const allPages = pages.map((p) => ({
      pageId: p.id,
      pageAccessToken: p.access_token,
      pageName: p.name,
      category: p.category || "",
    }));
    const allPageIds = allPages.map((p) => p.pageId);
    const firstPage = pages[0];
    pageId = firstPage.id;
    pageAccessToken = firstPage.access_token;

    const pageNames = pages.map((p) => p.name).join(", ");
    console.log(
      `Facebook Pages found: ${pages.length} pages — ${pageNames}`,
    );

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "Facebook",
    });

    if (existing) {
      existing.accessToken = tokenData.access_token;
      existing.platformUserId = profile.id;
      existing.platformUsername = pageNames;
      existing.pageId = pageId;
      existing.pageAccessToken = pageAccessToken;
      existing.pages = allPages;
      existing.selectedPageIds = allPageIds;
      await existing.save();
    } else {
      await new Platform({
        userId: stateData.userId,
        name: "Facebook",
        accessToken: tokenData.access_token,
        platformUserId: profile.id,
        platformUsername: pageNames,
        pageId,
        pageAccessToken,
        pages: allPages,
        selectedPageIds: allPageIds,
      }).save();
    }

    const appUrl = `crosspost://oauth/facebook/callback?success=true&name=${encodeURIComponent(pageNames)}`;
    res.send(buildRedirectHtml("Facebook Connected", appUrl));
  } catch (err) {
    console.error("Facebook OAuth error:", err);
    const appUrl = `crosspost://oauth/facebook/callback?error=server_error`;
    res.send(buildRedirectHtml("Facebook Connection Failed", appUrl));
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

  let rawPages = pagesData.data || [];

  // In Development mode, /me/accounts may return empty. Fall back to granular_scopes.
  if (rawPages.length === 0) {
    try {
      const debugRes = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${platform.accessToken}&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`,
      );
      const debugData = await debugRes.json();
      const granularScopes = debugData.data?.granular_scopes || [];
      const pageIds = new Set();
      for (const scope of granularScopes) {
        if (scope.target_ids) {
          scope.target_ids.forEach((id) => pageIds.add(id));
        }
      }
      for (const pid of pageIds) {
        try {
          const pageRes = await fetch(
            `https://graph.facebook.com/v18.0/${pid}?fields=id,name,access_token,category&access_token=${platform.accessToken}`,
          );
          const pageInfo = await pageRes.json();
          if (pageInfo.id && !pageInfo.error) {
            rawPages.push(pageInfo);
          }
        } catch {}
      }
    } catch {}
  }

  // Also include pages stored on the platform document (may have page tokens from OAuth)
  const storedPages = platform.pages || [];
  const selectedIds = platform.selectedPageIds || [];

  // Merge: prefer rawPages (fresh from API) but fall back to stored pages
  let finalPages;
  if (rawPages.length > 0) {
    finalPages = rawPages.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      isSelected: selectedIds.includes(p.id),
    }));
  } else {
    finalPages = storedPages.map((p) => ({
      id: p.pageId,
      name: p.pageName,
      category: p.category,
      isSelected: selectedIds.includes(p.pageId),
    }));
  }

  res.json({
    success: true,
    data: { pages: finalPages, selectedPageIds: selectedIds },
  });
}

/**
 * Toggle a Facebook Page on/off for publishing.
 * When a page is toggled ON, it gets added to selectedPageIds.
 * When toggled OFF, it gets removed.
 */
export async function selectFacebookPage(req, res) {
  const { pageId, selected } = req.body;

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

  const currentSelected = platform.selectedPageIds || [];

  if (selected === false) {
    // Remove from selected
    platform.selectedPageIds = currentSelected.filter((id) => id !== pageId);
  } else {
    // Add to selected (if not already there)
    if (!currentSelected.includes(pageId)) {
      platform.selectedPageIds = [...currentSelected, pageId];
    }
  }

  // Update platformUsername to show all selected page names
  const selectedNames = (platform.pages || [])
    .filter((p) => platform.selectedPageIds.includes(p.pageId))
    .map((p) => p.pageName);
  platform.platformUsername = selectedNames.join(", ") || "Facebook";

  await platform.save();

  console.log(
    `Facebook pages updated: ${platform.selectedPageIds.length} selected — ${selectedNames.join(", ")}`,
  );

  res.json({
    success: true,
    data: {
      selectedPageIds: platform.selectedPageIds,
      platformUsername: platform.platformUsername,
    },
  });
}
