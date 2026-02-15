/**
 * LinkedIn Publisher — posts to LinkedIn profile via API
 * Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
 */
export async function publishToLinkedIn(platform, post) {
  const { accessToken, platformUserId } = platform;
  const { caption } = post;

  if (!platformUserId) {
    throw new Error(
      "LinkedIn user ID not found. Please reconnect your LinkedIn account.",
    );
  }

  const postBody = {
    author: `urn:li:person:${platformUserId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: caption || "",
        },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(postBody),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.message || `LinkedIn API error: ${response.status}`,
    );
  }

  const postId = response.headers.get("x-restli-id") || "";

  return {
    externalId: postId,
    externalUrl: postId
      ? `https://www.linkedin.com/feed/update/${postId}`
      : "https://www.linkedin.com/feed/",
  };
}
