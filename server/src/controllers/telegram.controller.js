import Platform from "../models/Platform.js";
import { Errors } from "../utils/AppError.js";
import { validateBot, validateChannel } from "../services/publishers/telegram.helpers.js";

export async function connectTelegram(req, res) {
  const { botToken, channelId } = req.body;

  if (!botToken || !channelId) {
    throw Errors.badRequest("Bot token and channel ID are required");
  }

  let bot;
  try {
    bot = await validateBot(botToken);
  } catch {
    throw Errors.badRequest(
      "Invalid bot token. Please check your token from @BotFather.",
    );
  }

  const formatted = channelId.startsWith("@") ? channelId : `@${channelId}`;
  let chat;
  try {
    chat = await validateChannel(botToken, formatted);
  } catch {
    throw Errors.badRequest(
      "Cannot access this channel. Make sure your bot is added as an admin.",
    );
  }

  const chatId = String(chat.id);
  const channelTitle = chat.title || formatted;

  const existing = await Platform.findOne({
    userId: req.user.id,
    name: "Telegram",
    platformUserId: chatId,
  });

  if (existing) {
    existing.accessToken = botToken;
    existing.platformUsername = channelTitle;
    await existing.save();
  } else {
    await new Platform({
      userId: req.user.id,
      name: "Telegram",
      accessToken: botToken,
      platformUserId: chatId,
      platformUsername: channelTitle,
    }).save();
  }

  res.status(201).json({
    success: true,
    data: { channelTitle, botName: bot.username },
  });
}
