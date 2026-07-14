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

export function truncateCaption(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
