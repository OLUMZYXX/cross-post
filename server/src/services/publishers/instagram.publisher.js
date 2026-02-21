/**
 * Instagram Publisher — posts via Instagram Graph API with Instagram Login
 * Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing
 *
 * Supports:
 * - Single image posts
 * - Single video posts (Reels)
 * - Carousel posts (multiple images)
 *
 * Instagram requires a 2-step process:
 * 1. Create media container(s)
 * 2. Publish the container
 *
 * For carousels, it's a 3-step process:
 * 1. Create individual item containers (unpublished)
 * 2. Create a carousel container referencing all items
 * 3. Publish the carousel container
 */

const isVideoUrl = (url) => url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);

async function waitForContainer(containerId, accessToken, isVideo) {
  const maxAttempts = isVideo ? 30 : 10;
  const pollInterval = isVideo ? 5000 : 3000;
  let status = "IN_PROGRESS";
  let attempts = 0;

  while (status === "IN_PROGRESS" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    const statusRes = await fetch(
      `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`,
    );
    const statusData = await statusRes.json();
    status = statusData.status_code;
    attempts++;
    console.log(
      `Instagram container processing: ${status} (attempt ${attempts})`,
    );
  }

  if (status !== "FINISHED") {
    throw new Error(
      `Instagram media processing failed with status: ${status}. Please try again.`,
    );
  }
}

export async function publishToInstagram(platform, post) {
  const { accessToken, platformUserId } = platform;
  const { caption, media } = post;

  if (!platformUserId) {
    throw new Error(
      "Instagram user ID not found. Please reconnect your Instagram account.",
    );
  }

  if (!media || media.length === 0) {
    throw new Error(
      "Instagram requires an image or video to publish. Text-only posts are not supported.",
    );
  }

  // Get all valid public URLs
  const mediaUrls = media
    .map((m) => (typeof m === "string" ? m : m?.uri))
    .filter((url) => url && url.startsWith("http"));

  if (mediaUrls.length === 0) {
    throw new Error(
      "Instagram requires publicly accessible media URLs. Local files must be uploaded first.",
    );
  }

  // Single video post
  const hasVideo = mediaUrls.some((url) => isVideoUrl(url));
  if (hasVideo || mediaUrls.length === 1) {
    // Single media post (image or video)
    const mediaUrl = mediaUrls[0];
    const isVideo = isVideoUrl(mediaUrl);

    const containerParams = {
      caption: caption || "",
      access_token: accessToken,
    };

    if (isVideo) {
      containerParams.media_type = "VIDEO";
      containerParams.video_url = mediaUrl;
    } else {
      containerParams.image_url = mediaUrl;
    }

    const containerRes = await fetch(
      `https://graph.instagram.com/v21.0/${platformUserId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerParams),
      },
    );

    const containerData = await containerRes.json();
    console.log("Instagram container response:", JSON.stringify(containerData, null, 2));

    if (containerData.error) {
      throw new Error(
        containerData.error.message || "Failed to create Instagram media container",
      );
    }

    await waitForContainer(containerData.id, accessToken, isVideo);

    const publishRes = await fetch(
      `https://graph.instagram.com/v21.0/${platformUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken,
        }),
      },
    );

    const publishData = await publishRes.json();
    console.log("Instagram publish response:", JSON.stringify(publishData, null, 2));

    if (publishData.error) {
      throw new Error(
        publishData.error.message || "Failed to publish to Instagram",
      );
    }

    return {
      externalId: publishData.id,
      externalUrl: `https://www.instagram.com/`,
    };
  }

  // --- CAROUSEL POST (multiple images) ---
  console.log(`Instagram: creating carousel with ${mediaUrls.length} images`);

  // Step 1: Create individual item containers
  const childIds = [];
  for (const url of mediaUrls) {
    const itemRes = await fetch(
      `https://graph.instagram.com/v21.0/${platformUserId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: url,
          is_carousel_item: true,
          access_token: accessToken,
        }),
      },
    );

    const itemData = await itemRes.json();
    console.log("Instagram carousel item response:", JSON.stringify(itemData, null, 2));

    if (itemData.error) {
      throw new Error(
        itemData.error.message || "Failed to create carousel item container",
      );
    }

    // Wait for each item to finish processing
    await waitForContainer(itemData.id, accessToken, false);
    childIds.push(itemData.id);
  }

  // Step 2: Create carousel container
  const carouselRes = await fetch(
    `https://graph.instagram.com/v21.0/${platformUserId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "CAROUSEL",
        caption: caption || "",
        children: childIds.join(","),
        access_token: accessToken,
      }),
    },
  );

  const carouselData = await carouselRes.json();
  console.log("Instagram carousel container response:", JSON.stringify(carouselData, null, 2));

  if (carouselData.error) {
    throw new Error(
      carouselData.error.message || "Failed to create Instagram carousel container",
    );
  }

  // Wait for carousel to be ready
  await waitForContainer(carouselData.id, accessToken, false);

  // Step 3: Publish the carousel
  const publishRes = await fetch(
    `https://graph.instagram.com/v21.0/${platformUserId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: carouselData.id,
        access_token: accessToken,
      }),
    },
  );

  const publishData = await publishRes.json();
  console.log("Instagram carousel publish response:", JSON.stringify(publishData, null, 2));

  if (publishData.error) {
    throw new Error(
      publishData.error.message || "Failed to publish carousel to Instagram",
    );
  }

  return {
    externalId: publishData.id,
    externalUrl: `https://www.instagram.com/`,
  };
}

export async function deleteFromInstagram(/* platform, externalId */) {
  // Instagram Graph API (with Instagram Login) does not support deleting media.
  // Silently skip — the local post record will still be removed.
  return true;
}
