/**
 * TikTok Publisher — posts via TikTok Content Posting API
 * Docs: https://developers.tiktok.com/doc/content-posting-api-get-started
 *
 * TikTok only supports video posts. The flow is:
 * 1. Initialize the upload (create post with video source)
 * 2. Upload the video file
 * 3. TikTok processes and publishes
 *
 * NOTE: For text/image-only posts, TikTok is not supported.
 * The photo_images post type can be used for image carousels.
 */
export async function publishToTikTok(platform, post) {
  const { accessToken } = platform;
  const { caption, media } = post;

  if (!media || media.length === 0) {
    throw new Error(
      "TikTok requires a video to publish. Text-only posts are not supported.",
    );
  }

  const mediaUrl = typeof media[0] === "string" ? media[0] : media[0]?.uri;

  // Use the "pull from URL" method if we have a public URL
  if (mediaUrl && mediaUrl.startsWith("http")) {
    const initRes = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: {
            title: caption ? caption.slice(0, 150) : "",
            privacy_level: "SELF_ONLY", // Start with private for safety; user can change on TikTok
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: mediaUrl,
          },
        }),
      },
    );

    const initData = await initRes.json();

    if (initData.error?.code) {
      throw new Error(
        initData.error?.message || "Failed to initialize TikTok post",
      );
    }

    return {
      externalId: initData.data?.publish_id || "pending",
      externalUrl: "https://www.tiktok.com",
    };
  }

  throw new Error(
    "TikTok requires a publicly accessible video URL. Local files are not supported yet.",
  );
}
