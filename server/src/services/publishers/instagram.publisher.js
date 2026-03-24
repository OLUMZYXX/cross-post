import { isVideoUrl, igPost, igError, waitForContainer, ensureVideoFormat } from "./instagram.helpers.js";
import { prepareImageForInstagram } from "./instagram.image.js";

export async function publishToInstagram(platform, post) {
  const { accessToken, platformUserId } = platform;
  const { caption, media } = post;

  if (!platformUserId) {
    throw new Error("Instagram user ID not found. Please reconnect your Instagram account.");
  }

  if (!media || media.length === 0) {
    throw new Error("Instagram requires an image or video. Text-only posts are not supported.");
  }

  const mediaUrls = media
    .map((m) => (typeof m === "string" ? m : m?.uri))
    .filter((url) => url && url.startsWith("http"));

  if (mediaUrls.length === 0) {
    throw new Error("Instagram requires publicly accessible media URLs.");
  }

  const hasVideo = mediaUrls.some(isVideoUrl);

  if (hasVideo || mediaUrls.length === 1) {
    return publishSingle(platformUserId, accessToken, caption, mediaUrls[0]);
  }

  return publishCarousel(platformUserId, accessToken, caption, mediaUrls);
}

async function publishSingle(userId, accessToken, caption, mediaUrl) {
  const isVideo = isVideoUrl(mediaUrl);
  const containerBody = { caption: caption || "" };

  if (isVideo) {
    containerBody.media_type = "REELS";
    containerBody.video_url = ensureVideoFormat(mediaUrl);
  } else {
    containerBody.image_url = await prepareImageForInstagram(mediaUrl);
  }

  const containerData = await igPost(`/${userId}/media`, accessToken, containerBody);

  const containerErr = igError(containerData, "Failed to create Instagram media container");
  if (containerErr) throw new Error(containerErr);

  await waitForContainer(containerData.id, accessToken, isVideo);

  const publishData = await igPost(`/${userId}/media_publish`, accessToken, {
    creation_id: containerData.id,
  });

  const publishErr = igError(publishData, "Failed to publish to Instagram");
  if (publishErr) throw new Error(publishErr);

  return {
    externalId: publishData.id,
    externalUrl: "https://www.instagram.com/",
  };
}

async function publishCarousel(userId, accessToken, caption, imageUrls) {
  const childIds = [];

  for (let i = 0; i < imageUrls.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 2000));

    const processedUrl = await prepareImageForInstagram(imageUrls[i]);
    const itemData = await igPost(`/${userId}/media`, accessToken, {
      image_url: processedUrl,
      is_carousel_item: true,
    });

    const itemErr = igError(itemData, "Failed to create carousel item container");
    if (itemErr) throw new Error(itemErr);

    await waitForContainer(itemData.id, accessToken, false);
    childIds.push(itemData.id);
  }

  const carouselData = await igPost(`/${userId}/media`, accessToken, {
    media_type: "CAROUSEL",
    caption: caption || "",
    children: childIds.join(","),
  });

  const carouselErr = igError(carouselData, "Failed to create Instagram carousel container");
  if (carouselErr) throw new Error(carouselErr);

  await waitForContainer(carouselData.id, accessToken, false);

  const publishData = await igPost(`/${userId}/media_publish`, accessToken, {
    creation_id: carouselData.id,
  });

  const publishErr = igError(publishData, "Failed to publish carousel to Instagram");
  if (publishErr) throw new Error(publishErr);

  return {
    externalId: publishData.id,
    externalUrl: "https://www.instagram.com/",
  };
}

export async function deleteFromInstagram() {
  return true;
}
