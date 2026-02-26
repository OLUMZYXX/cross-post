const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

export async function telegramApiCall(botToken, method, body = {}) {
  const url = `${TELEGRAM_API_BASE}${botToken}/${method}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.description || `Telegram API error: ${method}`);
  }

  return data.result;
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
