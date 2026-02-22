const BASE_URL = "https://api.x.com/2/media/upload";

const isVideoUrl = (url) =>
  url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) ||
  url.includes("/video/upload/");

async function downloadMedia(mediaUrl) {
  const res = await fetch(mediaUrl);
  if (!res.ok) throw new Error(`Failed to download media from ${mediaUrl}`);
  return Buffer.from(await res.arrayBuffer());
}

function detectMediaType(url) {
  if (url.match(/\.png$/i)) return "image/png";
  if (url.match(/\.gif$/i)) return "image/gif";
  if (url.match(/\.webp$/i)) return "image/webp";
  if (isVideoUrl(url)) return "video/mp4";
  return "image/jpeg";
}

async function simpleImageUpload(accessToken, buffer) {
  const blob = new Blob([buffer]);
  const formData = new FormData();
  formData.append("media", blob);
  formData.append("media_category", "tweet_image");

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.errors) {
    const msg = data.errors?.[0]?.detail || data.detail || "Image upload failed";
    throw new Error(msg);
  }

  return data.data.id;
}

async function chunkedInit(accessToken, totalBytes, mediaType, category) {
  const res = await fetch(`${BASE_URL}/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      media_type: mediaType,
      total_bytes: totalBytes,
      media_category: category,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.errors) {
    const msg = data.errors?.[0]?.detail || data.detail || "Media INIT failed";
    throw new Error(msg);
  }

  return data.data.id;
}

async function chunkedAppend(accessToken, mediaId, buffer) {
  const CHUNK_SIZE = 5 * 1024 * 1024;
  let segmentIndex = 0;

  for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
    const chunk = buffer.subarray(offset, offset + CHUNK_SIZE);
    const blob = new Blob([chunk]);

    const formData = new FormData();
    formData.append("media", blob);
    formData.append("segment_index", String(segmentIndex));

    const res = await fetch(`${BASE_URL}/${mediaId}/append`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Media APPEND failed at segment ${segmentIndex}`);
    }

    segmentIndex++;
  }
}

async function chunkedFinalize(accessToken, mediaId) {
  const res = await fetch(`${BASE_URL}/${mediaId}/finalize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok || data.errors) {
    const msg = data.errors?.[0]?.detail || data.detail || "Media FINALIZE failed";
    throw new Error(msg);
  }

  return data.data?.processing_info || null;
}

async function pollProcessing(accessToken, mediaId) {
  const MAX_WAIT = 120000;
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT) {
    const res = await fetch(
      `${BASE_URL}?media_id=${mediaId}&command=STATUS`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const data = await res.json();
    const state = data.data?.processing_info?.state;

    if (state === "succeeded") return;
    if (state === "failed") {
      throw new Error(data.data?.processing_info?.error?.message || "Media processing failed");
    }

    const waitSecs = data.data?.processing_info?.check_after_secs || 5;
    await new Promise((r) => setTimeout(r, waitSecs * 1000));
  }

  throw new Error("Media processing timed out");
}

export async function uploadMediaToTwitter(accessToken, mediaUrl) {
  const buffer = await downloadMedia(mediaUrl);
  const mediaType = detectMediaType(mediaUrl);

  if (isVideoUrl(mediaUrl)) {
    const mediaId = await chunkedInit(accessToken, buffer.length, mediaType, "tweet_video");
    await chunkedAppend(accessToken, mediaId, buffer);
    const processingInfo = await chunkedFinalize(accessToken, mediaId);
    if (processingInfo) {
      await pollProcessing(accessToken, mediaId);
    }
    return mediaId;
  }

  return simpleImageUpload(accessToken, buffer);
}

export { isVideoUrl };
