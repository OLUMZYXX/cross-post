import mongoose from "mongoose";
import { Errors } from "../utils/AppError.js";
import { getTikTokCreatorInfo } from "../services/tiktokCreator.js";

export async function getCreatorInfo(req, res) {
  const { platformId } = req.query;
  if (platformId && !mongoose.Types.ObjectId.isValid(platformId)) {
    throw Errors.badRequest("Invalid TikTok account.");
  }

  const creator = await getTikTokCreatorInfo(req.user.id, platformId);
  res.json({ success: true, data: { creator } });
}
