/**
 * Reddit Publisher — submits a post to a subreddit
 * Docs: https://www.reddit.com/dev/api/#POST_api_submit
 *
 * NOTE: Reddit requires a subreddit to post to. By default this posts
 * to the user's profile (u/username). For subreddit posting, the post
 * should include a target subreddit.
 */
export async function publishToReddit(platform, post) {
  const { accessToken, platformUsername } = platform;
  const { caption } = post;

  // Post to user's profile by default
  const subreddit = `u_${platformUsername}`;

  const response = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "CrossPost/1.0",
    },
    body: new URLSearchParams({
      kind: "self",
      sr: subreddit,
      title: caption ? caption.slice(0, 300) : "Cross-posted from CrossPost",
      text: caption || "",
      api_type: "json",
    }),
  });

  const data = await response.json();

  if (data.json?.errors && data.json.errors.length > 0) {
    const errorMsg = data.json.errors
      .map((e) => e.slice(1).join(": "))
      .join("; ");
    throw new Error(errorMsg || "Failed to post to Reddit");
  }

  const postUrl =
    data.json?.data?.url || `https://www.reddit.com/user/${platformUsername}`;
  const postId = data.json?.data?.id || data.json?.data?.name || "";

  return {
    externalId: postId,
    externalUrl: postUrl,
  };
}

export async function deleteFromReddit(platform, externalId) {
  const { accessToken } = platform;
  if (!accessToken) throw new Error("No access token for Reddit deletion");

  const res = await fetch("https://oauth.reddit.com/api/del", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "CrossPost/1.0",
    },
    body: new URLSearchParams({ id: externalId }),
  });

  const data = await res.text().catch(() => null);
  if (!res.ok) {
    throw new Error(`Failed to delete Reddit post: ${data}`);
  }

  return true;
}
