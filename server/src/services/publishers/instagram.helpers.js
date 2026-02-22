const GRAPH = "https://graph.instagram.com/v21.0";

export const isVideoUrl = (url) =>
  Boolean(url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) || url.includes("/video/upload/"));

export function ensureVideoFormat(url) {
  if (!url.includes("/video/upload/")) return url;
  if (/\.(mp4|mov|webm)(\?|$)/i.test(url)) return url;
  const base = url.split("?")[0];
  return base.endsWith(".mp4") ? url : `${base}.mp4`;
}

export function igUrl(path, accessToken) {
  return `${GRAPH}${path}?access_token=${encodeURIComponent(accessToken)}`;
}

export function igError(data, fallback) {
  const err = data?.error;
  if (!err) return null;
  const parts = [err.message || fallback];
  if (err.code) parts.push(`(code ${err.code})`);
  if (err.error_subcode) parts.push(`sub ${err.error_subcode}`);
  return parts.join(" ");
}

export async function igPost(path, accessToken, body, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(igUrl(path, accessToken), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    const isRetryable =
      data?.error?.code === 2 ||
      data?.error?.code === 4 ||
      data?.error?.code === 32 ||
      (data?.error?.message || "").toLowerCase().includes("too many") ||
      (data?.error?.message || "").toLowerCase().includes("unexpected error");

    if (isRetryable && attempt < retries) {
      const delay = Math.pow(2, attempt + 1) * 1000;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    return data;
  }
}

export async function waitForContainer(containerId, accessToken, isVideo) {
  if (!containerId) throw new Error("Instagram container ID missing — container creation may have failed.");

  const maxAttempts = isVideo ? 36 : 10;
  const pollInterval = isVideo ? 5000 : 3000;
  let status = "IN_PROGRESS";
  let attempts = 0;

  while (status === "IN_PROGRESS" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    const res = await fetch(
      igUrl(`/${containerId}`, accessToken) + "&fields=status_code,status"
    );
    const data = await res.json();
    status = data.status_code;
    attempts++;
    if (status === "ERROR" || status === "EXPIRED") break;
  }

  if (status !== "FINISHED") {
    throw new Error(
      `Instagram media processing failed (status: ${status || "unknown"}). ` +
      `Ensure your media meets Instagram requirements.`
    );
  }
}
