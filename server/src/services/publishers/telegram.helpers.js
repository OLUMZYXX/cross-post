const TELEGRAM_API_BASE = "https://api.telegram.org/bot";
const MAX_RETRIES = 3;
const TIMEOUT_MS = 25000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientDescription(description) {
  const desc = (description || "").toLowerCase();
  return (
    desc.includes("failed to get http url content") ||
    desc.includes("wrong type of the web page content") ||
    desc.includes("timeout") ||
    desc.includes("try again") ||
    desc.includes("internal server error")
  );
}

export async function telegramApiCall(botToken, method, body = {}) {
  const url = `${TELEGRAM_API_BASE}${botToken}/${method}`;
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));

      if (data.ok) return data.result;

      if (res.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = data.parameters?.retry_after || 2 ** attempt;
        await sleep((retryAfter + 1) * 1000);
        continue;
      }
      if (
        (res.status >= 500 || isTransientDescription(data.description)) &&
        attempt < MAX_RETRIES
      ) {
        await sleep(1500 * (attempt + 1));
        continue;
      }

      throw new Error(data.description || `Telegram API error: ${method}`);
    } catch (err) {
      lastError = err;
      const networkIssue =
        err.name === "AbortError" ||
        /fetch failed|network|ECONNRESET|ETIMEDOUT/i.test(err.message || "");
      if (networkIssue && attempt < MAX_RETRIES) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error(`Telegram API error: ${method}`);
}

export async function validateBot(botToken) {
  const bot = await telegramApiCall(botToken, "getMe");
  return bot;
}

export async function validateChannel(botToken, channelId) {
  const formatted = channelId.startsWith("@") ? channelId : `@${channelId}`;
  const chat = await telegramApiCall(botToken, "getChat", {
    chat_id: formatted,
  });
  return chat;
}

export function isVideoUrl(url) {
  return (
    /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i.test(url) ||
    url.includes("/video/upload/")
  );
}

export function telegramMediaUrl(url) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (isVideoUrl(url)) {
    return url.replace(/\bf_auto\b/g, "f_mp4");
  }
  if (/\bf_auto\b/.test(url)) {
    return url.replace(/\bf_auto\b/g, "f_jpg,c_limit,w_2560");
  }
  return url.replace("/upload/", "/upload/f_jpg,c_limit,w_2560/");
}

export function friendlyTelegramError(raw) {
  const m = (raw || "").toLowerCase();
  if (
    m.includes("wrong type of the web page content") ||
    m.includes("failed to get http url content") ||
    m.includes("wrong file identifier") ||
    m.includes("image_process_failed") ||
    m.includes("photo_invalid_dimensions")
  ) {
    return "Telegram couldn't load the media — the file may be too large or in a format Telegram doesn't accept. Try a smaller image or video.";
  }
  if (m.includes("chat not found")) {
    return "Telegram channel not found. Reconnect Telegram in Settings and make sure the bot is an admin of the channel.";
  }
  if (
    m.includes("not enough rights") ||
    m.includes("administrator") ||
    m.includes("chat_write_forbidden") ||
    m.includes("bot is not a member")
  ) {
    return "The Telegram bot must be an admin of your channel with permission to post. Add it as an admin and try again.";
  }
  if (m.includes("bot was blocked") || m.includes("bot was kicked")) {
    return "The Telegram bot was removed from the channel. Re-add it as an admin and reconnect Telegram.";
  }
  if (m.includes("too many requests") || m.includes("retry after")) {
    return "Telegram is temporarily rate-limiting posts. Please wait a minute and try again.";
  }
  if (m.includes("caption is too long")) {
    return "The caption is too long for Telegram. Shorten it and try again.";
  }
  return `Couldn't post to Telegram: ${raw || "unknown error"}.`;
}

export function truncateCaption(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
