import Platform from "../models/Platform.js";
import { Errors } from "../utils/AppError.js";
import {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  CLIENT_URL,
} from "../config/env.js";

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
  const { state } = req.query; // Can include user ID or other state

  // Use web redirect first, then handle deep linking from there
  const redirectUri = `${CLIENT_URL}/api/platforms/auth/facebook/callback`;

  console.log("Facebook App ID:", FACEBOOK_APP_ID);
  console.log("Redirect URI:", redirectUri);

  const facebookAuthUrl =
    `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${FACEBOOK_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=email,public_profile,pages_manage_posts,pages_read_engagement&` +
    `response_type=code&` +
    `state=${encodeURIComponent(state || "")}`;

  console.log("Generated Facebook Auth URL:", facebookAuthUrl);

  res.json({ success: true, data: { authUrl: facebookAuthUrl } });
}

export async function handleFacebookCallback(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    const appUrl = `crosspost://oauth/facebook/callback?error=${error}`;
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facebook Connection Failed</title>
          <script>
            window.location.href = "${appUrl}";
          </script>
        </head>
        <body>
          <p>Facebook connection failed: ${error}</p>
          <p>If you're not redirected automatically, <a href="${appUrl}">click here</a>.</p>
        </body>
      </html>
    `);
    return;
  }

  if (!code) {
    const appUrl = `crosspost://oauth/facebook/callback?error=no_code`;
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facebook Connection Failed</title>
          <script>
            window.location.href = "${appUrl}";
          </script>
        </head>
        <body>
          <p>Facebook connection failed: No authorization code received</p>
          <p>If you're not redirected automatically, <a href="${appUrl}">click here</a>.</p>
        </body>
      </html>
    `);
    return;
  }

  try {
    // Exchange code for access token
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
      return res.redirect(appUrl);
    }

    // Get user profile
    const profileResponse = await fetch(
      `https://graph.facebook.com/me?` +
        `fields=id,name,email&` +
        `access_token=${tokenData.access_token}`,
    );

    const profile = await profileResponse.json();

    // Create platform connection with OAuth data
    // Note: In a real app, you'd get userId from JWT token or state parameter
    // For now, we'll assume the state contains the user ID
    const userId = state; // This should be the user ID passed in state

    const existing = await Platform.findOne({ userId, name: "Facebook" });
    if (!existing) {
      const platform = new Platform({
        userId,
        name: "Facebook",
        accessToken: tokenData.access_token,
        platformUserId: profile.id,
        platformUsername: profile.name,
      });
      await platform.save();
    }

    const appUrl = `crosspost://oauth/facebook/callback?success=true&name=${encodeURIComponent(profile.name)}`;

    // Return HTML page that redirects to the app
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facebook Connected</title>
          <script>
            window.location.href = "${appUrl}";
          </script>
        </head>
        <body>
          <p>Facebook connected successfully! Redirecting back to app...</p>
          <p>If you're not redirected automatically, <a href="${appUrl}">click here</a>.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Facebook OAuth error:", err);
    const appUrl = `crosspost://oauth/facebook/callback?error=server_error`;
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facebook Connection Failed</title>
          <script>
            window.location.href = "${appUrl}";
          </script>
        </head>
        <body>
          <p>Facebook connection failed: Server error</p>
          <p>If you're not redirected automatically, <a href="${appUrl}">click here</a>.</p>
        </body>
      </html>
    `);
  }
}
