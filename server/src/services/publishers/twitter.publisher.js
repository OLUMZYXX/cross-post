/**
 * Twitter Publisher — posts tweets via Twitter API v2
 * Docs: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
 */
export async function publishToTwitter(platform, post) {
  const { accessToken } = platform;
  const { caption } = post;

  // Twitter text limit: 280 characters
  const text = caption.length > 280 ? caption.slice(0, 277) + "..." : caption;

  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!response.ok || data.errors) {
    const errMsg =
      data.errors?.[0]?.message || data.detail || "Failed to post tweet";
    throw new Error(errMsg);
  }

  return {
    externalId: data.data.id,
    externalUrl: `https://twitter.com/i/web/status/${data.data.id}`,
  };
}

export async function deleteFromTwitter(platform, externalId) {
  const { accessToken } = platform;

  const response = await fetch(
    `https://api.twitter.com/2/tweets/${externalId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg =
      data?.title || data?.detail || data?.error || "Failed to delete tweet";
    throw new Error(msg);
  }

  return true;
}
