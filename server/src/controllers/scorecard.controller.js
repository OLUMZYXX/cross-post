import User from "../models/User.js";
import { Errors } from "../utils/AppError.js";
import { isAllowlistedEmail } from "../services/proAccess.js";
import { fetchTeamBadge, buildScorecardUrl } from "../services/scorecard.js";

async function requireOwner(userId) {
  const user = await User.findById(userId);
  if (!user) throw Errors.notFound("User not found");
  if (!isAllowlistedEmail(user.email)) {
    throw Errors.forbidden("Scorecard is not available on this account");
  }
  return user;
}

export async function saveScorecardTemplate(req, res) {
  const user = await requireOwner(req.user.id);
  const { publicId, url } = req.body;

  if (!publicId) {
    throw Errors.badRequest("A template image is required");
  }

  user.scorecardTemplate = { publicId, url: url || null };
  await user.save();

  res.json({ success: true, data: { scorecardTemplate: user.scorecardTemplate } });
}

export async function composeScorecard(req, res) {
  const user = await requireOwner(req.user.id);
  const { imageUrl, homeTeam, awayTeam, homeScore, awayScore } = req.body;

  if (!imageUrl) {
    throw Errors.badRequest("Select an image to apply the scorecard to");
  }
  if (!user.scorecardTemplate?.publicId) {
    throw Errors.badRequest("Upload your scorecard template first");
  }
  if (homeScore === undefined || awayScore === undefined) {
    throw Errors.badRequest("Enter both scores");
  }

  const [homeBadgeUrl, awayBadgeUrl] = await Promise.all([
    fetchTeamBadge(homeTeam),
    fetchTeamBadge(awayTeam),
  ]);

  const url = buildScorecardUrl(imageUrl, {
    templatePublicId: user.scorecardTemplate.publicId,
    homeBadgeUrl,
    awayBadgeUrl,
    homeScore,
    awayScore,
  });

  res.json({
    success: true,
    data: { url, homeBadgeFound: !!homeBadgeUrl, awayBadgeFound: !!awayBadgeUrl },
  });
}
