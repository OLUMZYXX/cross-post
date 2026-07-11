import User from "../models/User.js";
import { Errors } from "../utils/AppError.js";
import { isAllowlistedEmail } from "../services/proAccess.js";
import { getFootballNews } from "../services/footballNews.js";

export async function footballFeed(req, res) {
  const user = await User.findById(req.user.id);
  if (!user || !isAllowlistedEmail(user.email)) {
    throw Errors.forbidden("The feed is not available on this account");
  }

  const items = await getFootballNews();
  res.json({ success: true, data: { items } });
}
