/**
 * Twitter Publisher — posts tweets via Twitter API v2
 * Supports text + media (images/video) by downloading and uploading to Twitter
 * Docs: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
 * Media: https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload
 */

const isVideoUrl = (url) => url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);

/**
 * Download a file from URL and upload it to Twitter's media endpoint.
 * Twitter requires media to be uploaded via their own upload API first.
 */
async function uploadMediaToTwitter(accessToken, mediaUrl) {
  // Download the file
  const fileRes = await fetch(mediaUrl);
  if (!fileRes.ok) {
    throw new Error(`Failed to download media from ${mediaUrl}`);
  }

  const buffer = await fileRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const isVideo = isVideoUrl(mediaUrl);
  const mediaType = isVideo ? "video/mp4" : "image/jpeg";

  // Upload to Twitter v1.1 media upload endpoint
  const formData = new URLSearchParams();
  formData.append("media_data", base64);
  formData.append("media_category", isVideo ? "tweet_video" : "tweet_image");

  const uploadRes = await fetch(
    "https://upload.twitter.com/1.1/media/upload.json",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    },
  );

  const uploadData = await uploadRes.json();

  if (!uploadRes.ok || uploadData.errors) {
    throw new Error(
      uploadData.errors?.[0]?.message || "Failed to upload media to Twitter",
    );
  }

  return uploadData.media_id_string;
}

export async function publishToTwitter(platform, post) {
  const { accessToken } = platform;
  const { caption, media } = post;

  // Twitter text limit: 280 characters
  const text = caption.length > 280 ? caption.slice(0, 277) + "..." : caption;

  const tweetBody = { text };

  // Upload media if available (up to 4 images or 1 video)
  if (media && media.length > 0) {
    const mediaUrls = media
      .map((m) => (typeof m === "string" ? m : m?.uri))
      .filter((url) => url && url.startsWith("http"));

    if (mediaUrls.length > 0) {
      try {
        const mediaIds = [];
        // Twitter allows up to 4 images or 1 video
        const maxMedia = mediaUrls.some((u) => isVideoUrl(u)) ? 1 : 4;
        const toUpload = mediaUrls.slice(0, maxMedia);

        for (const url of toUpload) {
          const mediaId = await uploadMediaToTwitter(accessToken, url);
          mediaIds.push(mediaId);
        }

        if (mediaIds.length > 0) {
          tweetBody.media = { media_ids: mediaIds };
        }
      } catch (err) {
        // If media upload fails, still post the text
        console.error("Twitter media upload failed:", err.message);
      }
    }
  }

  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tweetBody),
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
