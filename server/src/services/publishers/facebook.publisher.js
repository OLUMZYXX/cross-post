/**
 * Facebook Publisher — posts to Facebook Pages via Graph API
 * Supports posting to multiple selected pages at once.
 * Docs: https://developers.facebook.com/docs/pages-api/posts
 */

const isVideo = (url) => url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);

async function postToSinglePage(finalPageId, finalPageToken, caption, media) {
  let response;

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

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "Failed to post to Facebook");
  }

  const postId = data.id || data.post_id;
  return {
    externalId: postId,
    externalUrl: `https://www.facebook.com/${postId}`,
  };
}

export async function publishToFacebook(platform, post) {
  const { accessToken, pageId, pageAccessToken, pages, selectedPageIds } =
    platform;
  const { caption, media } = post;

  // Determine which pages to post to
  let pagesToPost = [];

  if (
    pages &&
    pages.length > 0 &&
    selectedPageIds &&
    selectedPageIds.length > 0
  ) {
    // Multi-page mode: post to all selected pages
    pagesToPost = pages.filter((p) => selectedPageIds.includes(p.pageId));
  }

  // Fallback: use the single pageId/pageAccessToken
  if (pagesToPost.length === 0) {
    if (pageId && pageAccessToken) {
      pagesToPost = [{ pageId, pageAccessToken }];
    } else {
      // Last resort: fetch from API
      const pagesRes = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
      );
      const pagesData = await pagesRes.json();

      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error(
          "No Facebook Pages found. You need a Facebook Page to publish posts.",
        );
      }

      pagesToPost = [
        {
          pageId: pagesData.data[0].id,
          pageAccessToken: pagesData.data[0].access_token,
        },
      ];
    }
  }

  // Post to all selected pages
  const results = [];
  const errors = [];

  for (const page of pagesToPost) {
    try {
      const result = await postToSinglePage(
        page.pageId,
        page.pageAccessToken,
        caption,
        media,
      );
      // Store the page token alongside the result so deletion works per-page
      result.pageAccessToken = page.pageAccessToken;
      result.pageName = page.pageName || page.pageId;
      console.log(
        `Facebook: posted to page ${page.pageId} (${page.pageName || "unknown"})`,
      );
      results.push(result);
    } catch (err) {
      console.error(
        `Facebook: failed to post to page ${page.pageId}:`,
        err.message,
      );
      errors.push(`${page.pageName || page.pageId}: ${err.message}`);
    }
  }

  if (results.length === 0) {
    throw new Error(
      `Failed to post to all Facebook pages: ${errors.join("; ")}`,
    );
  }

  if (results.length > 1) {
    console.log(`Facebook: successfully posted to ${results.length} pages`);
  }

  // Return all results so each page post gets tracked individually
  return results;
}

export async function deleteFromFacebook(
  platform,
  externalId,
  pageAccessToken,
) {
  // Use the page-specific token if provided, otherwise fall back to platform tokens
  const token =
    pageAccessToken || platform.pageAccessToken || platform.accessToken;
  if (!token)
    throw new Error(
      "No page or user access token available for Facebook deletion",
    );

  const res = await fetch(
    `https://graph.facebook.com/v18.0/${externalId}?access_token=${token}`,
    {
      method: "DELETE",
    },
  );

  const data = await res.json().catch(() => null);
  if (!res.ok || (data && data.error)) {
    throw new Error(data?.error?.message || "Failed to delete Facebook post");
  }

  return true;
}
