import Platform from "../models/Platform.js";
import { Errors } from "../utils/AppError.js";

const SUPPORTED_PLATFORMS = [
  "Twitter",
  "Instagram",
  "LinkedIn",
  "Facebook",
  "TikTok",
  "YouTube",
  "Reddit",
];

export async function listPlatforms(req, res) {
  const platforms = await Platform.find({ userId: req.user.id });

  res.json({ success: true, data: { platforms } });
}

export async function connectPlatform(req, res) {
  const { name } = req.body;

  if (!name || !SUPPORTED_PLATFORMS.includes(name)) {
    throw Errors.badRequest(
      `Unsupported platform. Supported: ${SUPPORTED_PLATFORMS.join(", ")}`,
    );
  }

  const existing = await Platform.findOne({ userId: req.user.id, name });
  if (existing) {
    throw Errors.conflict(`${name} is already connected`);
  }

  const platform = new Platform({
    userId: req.user.id,
    name,
  });

  await platform.save();

  res.status(201).json({ success: true, data: { platform } });
}

export async function disconnectPlatform(req, res) {
  const platform = await Platform.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!platform) {
    throw Errors.notFound("Platform connection not found");
  }

  res.json({ success: true, data: null });
}
