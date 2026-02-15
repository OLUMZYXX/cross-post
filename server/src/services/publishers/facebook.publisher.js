/**
 * Facebook Publisher — posts to a Facebook Page via Graph API
 * Docs: https://developers.facebook.com/docs/pages-api/posts
 */
export async function publishToFacebook(platform, post) {
  const { accessToken, pageId, pageAccessToken } = platform;
  const { caption, media } = post;

  let finalPageId = pageId;
  let finalPageToken = pageAccessToken;

  // If page data wasn't stored during OAuth, try fetching it now
  if (!finalPageId || !finalPageToken) {
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
    );
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error(
        "No Facebook Pages found. You need a Facebook Page to publish posts. Make sure your account manages at least one Page.",
      );
    }

    finalPageId = pagesData.data[0].id;
    finalPageToken = pagesData.data[0].access_token;
  }

  let response;
  let data;

  const isVideo = (url) => url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);

  if (
    media &&
    media.length > 0 &&
    typeof media[0] === "string" &&
    media[0].startsWith("http")
  ) {
    if (isVideo(media[0])) {
      response = await fetch(
        `https://graph.facebook.com/v18.0/${finalPageId}/videos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_url: media[0],
            description: caption || "",
            access_token: finalPageToken,
          }),
        },
      );
    } else {
      response = await fetch(
        `https://graph.facebook.com/v18.0/${finalPageId}/photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: media[0],
            caption: caption || "",
            access_token: finalPageToken,
          }),
        },
      );
    }
  } else {
    response = await fetch(
      `https://graph.facebook.com/v18.0/${finalPageId}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: caption || "",
          access_token: finalPageToken,
        }),
      },
    );
  }

  data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "Failed to post to Facebook");
  }

  const postId = data.id || data.post_id;
  return {
    externalId: postId,
    externalUrl: `https://www.facebook.com/${postId}`,
  };
}
