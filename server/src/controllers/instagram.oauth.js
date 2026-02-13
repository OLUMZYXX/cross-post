import Platform from "../models/Platform.js";
import {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import { createState, getState } from "../utils/oauthState.js";

function buildRedirectHtml(title, url) {
  return `<!DOCTYPE html><html><head><title>${title}</title><script>window.location.href="${url}";</script></head><body><p>${title}</p><p><a href="${url}">Click here if not redirected</a></p></body></html>`;
}

export async function initiateInstagramAuth(req, res) {
  const stateId = createState({ userId: req.user.id });
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/instagram/callback`;

  const authUrl =
    `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${INSTAGRAM_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent("instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement")}&` +
    `response_type=code&` +
    `state=${stateId}`;

  res.json({ success: true, data: { authUrl } });
}

export async function handleInstagramCallback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code) {
    const appUrl = `crosspost://oauth/instagram/callback?error=${encodeURIComponent(error || "no_code")}`;
    return res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }

  const stateData = getState(state);
  if (!stateData) {
    const appUrl = `crosspost://oauth/instagram/callback?error=invalid_state`;
    return res.send(
      buildRedirectHtml("Instagram Connection Failed", appUrl),
    );
  }

  try {
    const redirectUri = `${CLIENT_URL}/api/platforms/auth/instagram/callback`;
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${INSTAGRAM_APP_ID}&` +
        `client_secret=${INSTAGRAM_APP_SECRET}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `code=${code}`,
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      const appUrl = `crosspost://oauth/instagram/callback?error=${encodeURIComponent(tokenData.error.message)}`;
      return res.send(
        buildRedirectHtml("Instagram Connection Failed", appUrl),
      );
    }

    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`,
    );
    const pagesData = await pagesResponse.json();

    let igUsername = "Instagram User";
    let igUserId = null;

    if (pagesData.data && pagesData.data.length > 0) {
      const page = pagesData.data[0];
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`,
      );
      const igData = await igResponse.json();

      if (igData.instagram_business_account) {
        const igProfileResponse = await fetch(
          `https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?fields=username&access_token=${tokenData.access_token}`,
        );
        const igProfile = await igProfileResponse.json();
        igUsername = igProfile.username || igUsername;
        igUserId = igData.instagram_business_account.id;
      }
    }

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "Instagram",
    });

    if (!existing) {
      await new Platform({
        userId: stateData.userId,
        name: "Instagram",
        accessToken: tokenData.access_token,
        platformUserId: igUserId,
        platformUsername: igUsername,
      }).save();
    }

    const appUrl = `crosspost://oauth/instagram/callback?success=true&name=${encodeURIComponent(igUsername)}`;
    res.send(buildRedirectHtml("Instagram Connected", appUrl));
  } catch (err) {
    console.error("Instagram OAuth error:", err);
    const appUrl = `crosspost://oauth/instagram/callback?error=server_error`;
    res.send(buildRedirectHtml("Instagram Connection Failed", appUrl));
  }
}
