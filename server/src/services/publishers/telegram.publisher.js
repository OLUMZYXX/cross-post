import {
  telegramApiCall,
  isVideoUrl,
  truncateCaption,
  telegramMediaUrl,
  friendlyTelegramError,
} from "./telegram.helpers.js";

const TEXT_MAX = 4096;
const CAPTION_MAX = 1024;

async function sendTextMessage(botToken, chatId, text) {
  return telegramApiCall(botToken, "sendMessage", {
    chat_id: chatId,
    text: truncateCaption(text, TEXT_MAX),
  });
}

async function sendSinglePhoto(botToken, chatId, photoUrl, caption) {
  return telegramApiCall(botToken, "sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption: truncateCaption(caption, CAPTION_MAX),
  });
}

async function sendSingleVideo(botToken, chatId, videoUrl, caption) {
  return telegramApiCall(botToken, "sendVideo", {
    chat_id: chatId,
    video: videoUrl,
    caption: truncateCaption(caption, CAPTION_MAX),
  });
}

async function sendMediaGroup(botToken, chatId, mediaUrls, caption) {
  const mediaItems = mediaUrls.slice(0, 10).map((url, index) => {
    const type = isVideoUrl(url) ? "video" : "photo";
    const item = { type, media: url };
    if (index === 0 && caption) {
      item.caption = truncateCaption(caption, CAPTION_MAX);
    }
    return item;
  });

  return telegramApiCall(botToken, "sendMediaGroup", {
    chat_id: chatId,
    media: mediaItems,
  });
}

export async function publishToTelegram(platform, post) {
  const botToken = platform.accessToken;
  const chatId = platform.platformUserId;
  const caption = post.caption || "";
  const mediaUrls = (post.media || []).map(telegramMediaUrl);

  try {
    let result;

    if (mediaUrls.length === 0) {
      result = await sendTextMessage(botToken, chatId, caption);
    } else if (mediaUrls.length === 1) {
      const url = mediaUrls[0];
      if (isVideoUrl(url)) {
        result = await sendSingleVideo(botToken, chatId, url, caption);
      } else {
        result = await sendSinglePhoto(botToken, chatId, url, caption);
      }
    } else {
      result = await sendMediaGroup(botToken, chatId, mediaUrls, caption);
    }

    const messageId = Array.isArray(result)
      ? result[0]?.message_id
      : result.message_id;

    return {
      externalId: String(messageId),
      externalUrl: null,
    };
  } catch (err) {
    const friendly = new Error(friendlyTelegramError(err.message));
    friendly.rawDetail = err.message;
    throw friendly;
  }
}

export async function deleteFromTelegram(platform, externalId) {
  const botToken = platform.accessToken;
  const chatId = platform.platformUserId;

  await telegramApiCall(botToken, "deleteMessage", {
    chat_id: chatId,
    message_id: Number(externalId),
  });
}
