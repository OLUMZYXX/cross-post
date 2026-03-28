export async function publishToTikTok(platform, post) {
  const { accessToken } = platform;
  const { caption, media } = post;

  if (!media || media.length === 0) {
    throw new Error(
      "TikTok requires a video to publish. Text-only posts are not supported.",
    );
  }

  const mediaUrl = typeof media[0] === "string" ? media[0] : media[0]?.uri;

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
            privacy_level: "SELF_ONLY",
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

export async function deleteFromTikTok(platform, externalId) {
  const { accessToken } = platform;
  if (!accessToken) throw new Error("No access token for TikTok deletion");
  if (!externalId)
    throw new Error("No externalId provided for TikTok deletion");

  try {
    const res = await fetch(`https://open.tiktokapis.com/v2/post/remove/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publish_id: externalId }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || data?.error) {
      throw new Error(
        data?.message ||
          data?.error_description ||
          "Failed to delete TikTok post",
      );
    }

    return true;
  } catch (err) {
    throw new Error(err.message || "TikTok deletion failed");
  }
}
