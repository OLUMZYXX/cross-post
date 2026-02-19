import Platform from "../models/Platform.js";
import {
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  CLIENT_URL,
} from "../config/env.js";
import {
  createState,
  getState,
  generateCodeVerifier,
  generateCodeChallenge,
} from "../utils/oauthState.js";

function buildRedirectHtml(title, url) {
  return `<!DOCTYPE html><html><head><title>${title}</title><script>window.location.href="${url}";</script></head><body><p>${title}</p><p><a href="${url}">Click here if not redirected</a></p></body></html>`;
}

export async function initiateTwitterAuth(req, res) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const stateId = createState({ userId: req.user.id, codeVerifier });
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/twitter/callback`;

  const authUrl =
    `https://twitter.com/i/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${TWITTER_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent("tweet.read tweet.write users.read offline.access")}&` +
    `state=${stateId}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256&` +
    `force_login=true`;

  res.json({ success: true, data: { authUrl } });
}

export async function handleTwitterCallback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code) {
    const appUrl = `crosspost://oauth/twitter/callback?error=${encodeURIComponent(error || "no_code")}`;
    return res.send(buildRedirectHtml("Twitter Connection Failed", appUrl));
  }

  const stateData = getState(state);
  if (!stateData) {
    const appUrl = `crosspost://oauth/twitter/callback?error=invalid_state`;
    return res.send(buildRedirectHtml("Twitter Connection Failed", appUrl));
  }

  try {
    const redirectUri = `${CLIENT_URL}/api/platforms/auth/twitter/callback`;
    const credentials = Buffer.from(
      `${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`,
    ).toString("base64");

    const tokenResponse = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: stateData.codeVerifier,
        }),
      },
    );

    const tokenData = await tokenResponse.json();
    console.log("Twitter token response:", JSON.stringify(tokenData, null, 2));

    if (tokenData.error) {
      const msg = tokenData.error_description || tokenData.error;
      const appUrl = `crosspost://oauth/twitter/callback?error=${encodeURIComponent(msg)}`;
      return res.send(buildRedirectHtml("Twitter Connection Failed", appUrl));
    }

    const profileResponse = await fetch(
      "https://api.twitter.com/2/users/me",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
    );

    const profileData = await profileResponse.json();
    console.log("Twitter profile:", JSON.stringify(profileData, null, 2));
    const profile = profileData.data;

    const existing = await Platform.findOne({
      userId: stateData.userId,
      name: "Twitter",
    });

    if (existing) {
      existing.accessToken = tokenData.access_token;
      existing.refreshToken = tokenData.refresh_token;
      existing.platformUserId = profile.id;
      existing.platformUsername = profile.username;
      await existing.save();
    } else {
      await new Platform({
        userId: stateData.userId,
        name: "Twitter",
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        platformUserId: profile.id,
        platformUsername: profile.username,
      }).save();
    }

    console.log("Twitter connected for user:", stateData.userId, "username:", profile.username);

    const appUrl = `crosspost://oauth/twitter/callback?success=true&name=${encodeURIComponent(profile.username)}`;
    res.send(buildRedirectHtml("Twitter Connected", appUrl));
  } catch (err) {
    console.error("Twitter OAuth error:", err);
    const appUrl = `crosspost://oauth/twitter/callback?error=server_error`;
    res.send(buildRedirectHtml("Twitter Connection Failed", appUrl));
  }
}
