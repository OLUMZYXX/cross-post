const UPLOAD_URL = "https://api.x.com/2/media/upload";
const CHUNK_SIZE = 2 * 1024 * 1024;
const MAX_RETRIES = 3;

async function initVideoUpload(accessToken, totalBytes) {
  const res = await fetch(`${UPLOAD_URL}/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      media_type: "video/mp4",
      total_bytes: totalBytes,
      media_category: "tweet_video",
    }),
  });

  const data = await res.json();
  console.log(`[Twitter] Video INIT: ${res.status}`, JSON.stringify(data));

  if (!res.ok || data.errors) {
    const msg = data.errors?.[0]?.detail || data.detail || `INIT failed (${res.status})`;
    throw new Error(msg);
  }

  return data.data.id;
}

async function appendChunkWithRetry(accessToken, mediaId, chunk, segmentIndex) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const blob = new Blob([chunk], { type: "video/mp4" });
    const formData = new FormData();
    formData.append("media", blob, `chunk_${segmentIndex}.mp4`);
    formData.append("segment_index", String(segmentIndex));

    const res = await fetch(`${UPLOAD_URL}/${mediaId}/append`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (res.ok) {
      console.log(`[Twitter] Video APPEND ${segmentIndex}: OK`);
      return;
    }

    const errText = await res.text().catch(() => "");
    console.log(`[Twitter] Video APPEND ${segmentIndex}: ${res.status} ${errText} (attempt ${attempt + 1}/${MAX_RETRIES})`);

    if (attempt < MAX_RETRIES - 1) {
      const delay = Math.pow(2, attempt + 1) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    } else {
      throw new Error(`APPEND segment ${segmentIndex} failed (${res.status}) after ${MAX_RETRIES} attempts`);
    }
  }
}

async function appendVideoChunks(accessToken, mediaId, buffer) {
  let segmentIndex = 0;

  for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
    const chunk = buffer.subarray(offset, offset + CHUNK_SIZE);
    await appendChunkWithRetry(accessToken, mediaId, chunk, segmentIndex);
    segmentIndex++;
  }
}

async function finalizeVideoUpload(accessToken, mediaId) {
  const res = await fetch(`${UPLOAD_URL}/${mediaId}/finalize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  console.log(`[Twitter] Video FINALIZE: ${res.status}`, JSON.stringify(data));

  if (!res.ok || data.errors) {
    const msg = data.errors?.[0]?.detail || data.detail || `FINALIZE failed (${res.status})`;
    throw new Error(msg);
  }

  return data.data?.processing_info || null;
}

async function pollVideoStatus(accessToken, mediaId) {
  const MAX_WAIT = 120000;
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT) {
    const res = await fetch(
      `${UPLOAD_URL}?media_id=${mediaId}&command=STATUS`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const data = await res.json();
    const state = data.data?.processing_info?.state;
    console.log(`[Twitter] Video STATUS: ${state}`);

    if (state === "succeeded") return;
    if (state === "failed") {
      throw new Error(data.data?.processing_info?.error?.message || "Video processing failed");
    }

    const waitSecs = data.data?.processing_info?.check_after_secs || 5;
    await new Promise((r) => setTimeout(r, waitSecs * 1000));
  }

  throw new Error("Video processing timed out");
}

export async function uploadVideo(accessToken, buffer) {
  console.log(`[Twitter] Starting chunked video upload (${buffer.length} bytes)`);

  const mediaId = await initVideoUpload(accessToken, buffer.length);
  await appendVideoChunks(accessToken, mediaId, buffer);
  const processingInfo = await finalizeVideoUpload(accessToken, mediaId);

  if (processingInfo && processingInfo.state !== "succeeded") {
    await pollVideoStatus(accessToken, mediaId);
  }

  console.log(`[Twitter] Video upload complete, mediaId: ${mediaId}`);
  return mediaId;
}
