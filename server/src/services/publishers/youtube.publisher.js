/**
 * YouTube Publisher — creates community posts or uploads videos
 * Docs: https://developers.google.com/youtube/v3/docs
 *
 * NOTE: YouTube API v3 is primarily for video uploads.
 * Community posts are not available via the API.
 * This publisher handles video uploads when media is provided.
 * For text-only content, it creates a video with the caption as description (requires a video file).
 */
export async function publishToYouTube(platform, post) {
  const { accessToken } = platform;
  const { caption, media } = post;

  if (!media || media.length === 0) {
    throw new Error(
      "YouTube requires a video to upload. Text-only posts are not supported via the YouTube API.",
    );
  }

  const mediaUrl = typeof media[0] === "string" ? media[0] : media[0]?.uri;

  if (!mediaUrl || !mediaUrl.startsWith("http")) {
    throw new Error(
      "YouTube requires a publicly accessible video URL for upload.",
    );
  }

  // Download the video first, then upload to YouTube
  const videoResponse = await fetch(mediaUrl);
  if (!videoResponse.ok) {
    throw new Error("Failed to fetch video for YouTube upload");
  }

  const videoBuffer = await videoResponse.arrayBuffer();

  // Step 1: Initialize resumable upload
  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": "video/*",
        "X-Upload-Content-Length": videoBuffer.byteLength.toString(),
      },
      body: JSON.stringify({
        snippet: {
          title: caption ? caption.slice(0, 100) : "Cross-posted video",
          description: caption || "",
        },
        status: {
          privacyStatus: "private", // Start as private for safety
        },
      }),
    },
  );

  if (!initRes.ok) {
    const errData = await initRes.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `YouTube upload init failed: ${initRes.status}`,
    );
  }

  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) {
    throw new Error("YouTube did not return an upload URL");
  }

  // Step 2: Upload the video data
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/*",
      "Content-Length": videoBuffer.byteLength.toString(),
    },
    body: videoBuffer,
  });

  const uploadData = await uploadRes.json();

  if (!uploadRes.ok || uploadData.error) {
    throw new Error(uploadData.error?.message || "YouTube video upload failed");
  }

  return {
    externalId: uploadData.id,
    externalUrl: `https://www.youtube.com/watch?v=${uploadData.id}`,
  };
}

export async function deleteFromYouTube(platform, externalId) {
  const { accessToken } = platform;
  if (!accessToken) throw new Error("No access token for YouTube deletion");

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${externalId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error?.message || `Failed to delete YouTube video: ${res.status}`,
    );
  }

  return true;
}
