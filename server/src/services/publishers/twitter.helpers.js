const UPLOAD_URL = "https://api.x.com/2/media/upload";
const UPLOAD_URL_V1 = "https://upload.twitter.com/1.1/media/upload.json";

const isVideoUrl = (url) =>
  url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) ||
  url.includes("/video/upload/");

async function downloadMedia(mediaUrl) {
  const res = await fetch(mediaUrl);
  if (!res.ok) throw new Error(`Failed to download media from ${mediaUrl}`);
  return Buffer.from(await res.arrayBuffer());
}

function detectMimeType(url) {
  if (url.match(/\.png$/i)) return "image/png";
  if (url.match(/\.gif$/i)) return "image/gif";
  if (url.match(/\.webp$/i)) return "image/webp";
  if (isVideoUrl(url)) return "video/mp4";
  return "image/jpeg";
}

function getCategory(url) {
  if (url.match(/\.gif$/i)) return "tweet_gif";
  if (isVideoUrl(url)) return "tweet_video";
  return "tweet_image";
}

async function uploadViaV2Simple(accessToken, buffer, mediaUrl) {
  const mimeType = detectMimeType(mediaUrl);
  const category = getCategory(mediaUrl);
  const ext = mimeType.split("/")[1] || "bin";
  const blob = new Blob([buffer], { type: mimeType });

  const formData = new FormData();
  formData.append("media", blob, `upload.${ext}`);
  formData.append("media_category", category);

  console.log(`[Twitter] v2 simple upload: ${category}, ${mimeType}, ${buffer.length} bytes`);

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = await res.json();
  console.log(`[Twitter] v2 simple response: ${res.status}`, JSON.stringify(data));

  if (!res.ok || data.errors) {
    const msg = data.errors?.[0]?.detail || data.detail || `v2 upload failed (${res.status})`;
    throw new Error(msg);
  }

  return data.data?.id || data.media_id_string;
}

async function uploadViaV1(accessToken, buffer, mediaUrl) {
  const base64 = buffer.toString("base64");
  const category = getCategory(mediaUrl);

  const form = new URLSearchParams();
  form.append("media_data", base64);
  form.append("media_category", category);

  console.log(`[Twitter] v1.1 fallback upload: ${category}, ${buffer.length} bytes`);

  const res = await fetch(UPLOAD_URL_V1, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const data = await res.json();
  console.log(`[Twitter] v1.1 response: ${res.status}`, JSON.stringify(data));

  if (!res.ok || data.errors) {
    const msg = data.errors?.[0]?.message || `v1.1 upload failed (${res.status})`;
    throw new Error(msg);
  }

  return data.media_id_string;
}

export async function uploadMediaToTwitter(accessToken, mediaUrl) {
  const buffer = await downloadMedia(mediaUrl);

  try {
    return await uploadViaV2Simple(accessToken, buffer, mediaUrl);
  } catch (v2Err) {
    console.log(`[Twitter] v2 failed: ${v2Err.message}, trying v1.1 fallback...`);
    try {
      return await uploadViaV1(accessToken, buffer, mediaUrl);
    } catch (v1Err) {
      throw new Error(`Media upload failed. v2: ${v2Err.message} | v1.1: ${v1Err.message}`);
    }
  }
}

export { isVideoUrl };
