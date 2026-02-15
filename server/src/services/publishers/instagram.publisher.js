/**
 * Instagram Publisher — posts via Instagram Graph API with Instagram Login
 * Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing
 *
 * Instagram requires a 2-step process:
 * 1. Create a media container
 * 2. Publish the container
 *
 * NOTE: Instagram API requires media (image/video URL). Text-only posts are not supported.
 */
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

  const mediaUrl = typeof media[0] === "string" ? media[0] : media[0]?.uri;
  if (!mediaUrl || !mediaUrl.startsWith("http")) {
    throw new Error(
      "Instagram requires a publicly accessible image URL. Local files must be uploaded first.",
    );
  }

  // Detect if it's a video
  const isVideo = mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);

  // Step 1: Create media container
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

  const containerId = containerData.id;

  // For videos, wait for processing to complete
  if (isVideo) {
    let status = "IN_PROGRESS";
    let attempts = 0;
    while (status === "IN_PROGRESS" && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s
      const statusRes = await fetch(
        `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`,
      );
      const statusData = await statusRes.json();
      status = statusData.status_code;
      attempts++;
      console.log(`Instagram video processing: ${status} (attempt ${attempts})`);
    }
    if (status !== "FINISHED") {
      throw new Error(`Instagram video processing failed with status: ${status}`);
    }
  }

  // Step 2: Publish the container
  const publishRes = await fetch(
    `https://graph.instagram.com/v21.0/${platformUserId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
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
