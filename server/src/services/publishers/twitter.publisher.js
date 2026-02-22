import { uploadMediaToTwitter, isVideoUrl } from "./twitter.helpers.js";

export async function publishToTwitter(platform, post) {
  const { accessToken } = platform;
  const { caption, media } = post;

  const text = caption.length > 280 ? caption.slice(0, 277) + "..." : caption;
  const tweetBody = { text };

  if (media && media.length > 0) {
    const mediaUrls = media
      .map((m) => (typeof m === "string" ? m : m?.uri))
      .filter((url) => url && url.startsWith("http"));

    console.log(`[Twitter] media count: ${media.length}, valid URLs: ${mediaUrls.length}`);

    if (mediaUrls.length > 0) {
      const mediaIds = [];
      const maxMedia = mediaUrls.some((u) => isVideoUrl(u)) ? 1 : 4;
      const toUpload = mediaUrls.slice(0, maxMedia);

      for (const url of toUpload) {
        const mediaId = await uploadMediaToTwitter(accessToken, url);
        mediaIds.push(mediaId);
      }

      if (mediaIds.length > 0) {
        tweetBody.media = { media_ids: mediaIds };
      }
      console.log(`[Twitter] Tweet body:`, JSON.stringify(tweetBody));
    }
  }

  const response = await fetch("https://api.x.com/2/tweets", {
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
    `https://api.x.com/2/tweets/${externalId}`,
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
