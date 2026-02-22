import { uploadVideo } from "./twitter.video.js";

const UPLOAD_URL = "https://api.x.com/2/media/upload";

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

async function uploadImage(accessToken, buffer, mediaUrl) {
  const mimeType = detectMimeType(mediaUrl);
  const ext = mimeType.split("/")[1] || "bin";
  const blob = new Blob([buffer], { type: mimeType });

  const formData = new FormData();
  formData.append("media", blob, `upload.${ext}`);
  formData.append("media_category", "tweet_image");

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.errors) {
    const msg = data.errors?.[0]?.detail || data.detail || `Image upload failed (${res.status})`;
    throw new Error(msg);
  }

  return data.data?.id || data.media_id_string;
}

export async function uploadMediaToTwitter(accessToken, mediaUrl) {
  const buffer = await downloadMedia(mediaUrl);
  console.log(`[Twitter] Downloaded ${buffer.length} bytes from ${mediaUrl}`);

  if (!isVideoUrl(mediaUrl)) {
    return uploadImage(accessToken, buffer, mediaUrl);
  }

  return uploadVideo(accessToken, buffer);
}

export { isVideoUrl };
