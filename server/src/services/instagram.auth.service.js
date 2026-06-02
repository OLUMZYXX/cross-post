import {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  CLIENT_URL,
} from "../config/env.js";

export function getInstagramRedirectUri() {
  return `${CLIENT_URL}/api/platforms/auth/instagram/callback`;
}

export function buildInstagramAuthUrl(stateId) {
  const scope =
    "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages";

  return (
    `https://www.instagram.com/oauth/authorize?` +
    `client_id=${INSTAGRAM_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(getInstagramRedirectUri())}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `state=${stateId}&` +
    `force_authentication=1`
  );
}

export async function exchangeInstagramCode(code) {
  const body = new URLSearchParams({
    client_id: INSTAGRAM_APP_ID,
    client_secret: INSTAGRAM_APP_SECRET,
    grant_type: "authorization_code",
    redirect_uri: getInstagramRedirectUri(),
    code,
  });

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  if (data.error_type || data.error_message) {
    throw new Error(data.error_message || "Token exchange failed");
  }
  return data.access_token;
}

export async function getLongLivedInstagramToken(shortToken) {
  const res = await fetch(
    `https://graph.instagram.com/access_token?` +
      `grant_type=ig_exchange_token&` +
      `client_secret=${INSTAGRAM_APP_SECRET}&` +
      `access_token=${shortToken}`,
  );

  const data = await res.json();
  return {
    accessToken: data.access_token || shortToken,
    expiresIn: data.expires_in,
  };
}

export async function fetchInstagramProfile(accessToken) {
  const res = await fetch(
    `https://graph.instagram.com/me?` +
      `fields=user_id,username,account_type&access_token=${accessToken}`,
  );

  const profile = await res.json();
  const username = profile.username;
  const userId = profile.user_id || profile.id;

  if (!username || !userId) {
    console.error("Instagram profile fetch failed:", JSON.stringify(profile));
    const err = profile?.error;
    const code = err?.code
      ? ` (code ${err.code}${err.error_subcode ? `/${err.error_subcode}` : ""})`
      : "";
    const detail = err?.message
      ? `${err.message}${code}`
      : `Unexpected profile response: ${JSON.stringify(profile).slice(0, 200)}`;
    throw new Error(detail);
  }

  return { username, userId };
}
