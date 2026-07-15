import User from "../models/User.js";
import { Errors } from "../utils/AppError.js";
import { isAllowlistedEmail } from "../services/proAccess.js";
import {
  searchTeams,
  fetchTeamBadge,
  uploadRemoteImage,
  buildScorecardUrl,
} from "../services/scorecard.js";
import { getFlagUrl } from "../utils/countryFlags.js";

async function requireOwner(userId) {
  const user = await User.findById(userId);
  if (!user) throw Errors.notFound("User not found");
  if (!isAllowlistedEmail(user.email)) {
    throw Errors.forbidden("Scorecard is not available on this account");
  }
  return user;
}

export async function suggestTeams(req, res) {
  await requireOwner(req.user.id);
  const teams = await searchTeams(req.query.q || "");
  res.json({ success: true, data: { teams } });
}

export async function composeScorecard(req, res) {
  await requireOwner(req.user.id);
  const {
    imageUrl,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    homeBadgeUrl,
    awayBadgeUrl,
  } = req.body;

  if (!imageUrl) {
    throw Errors.badRequest("Select an image to apply the scorecard to");
  }
  if (homeScore === undefined || awayScore === undefined) {
    throw Errors.badRequest("Enter both scores");
  }

  const [homeUrl, awayUrl] = await Promise.all([
    getFlagUrl(homeTeam) || homeBadgeUrl || fetchTeamBadge(homeTeam),
    getFlagUrl(awayTeam) || awayBadgeUrl || fetchTeamBadge(awayTeam),
  ]);

  const [homeBadgeId, awayBadgeId] = await Promise.all([
    uploadRemoteImage(homeUrl),
    uploadRemoteImage(awayUrl),
  ]);

  const url = buildScorecardUrl(imageUrl, {
    homeBadgeId,
    awayBadgeId,
    homeScore,
    awayScore,
    homeName: homeTeam,
    awayName: awayTeam,
  });

  res.json({
    success: true,
    data: { url, homeBadgeFound: !!homeBadgeId, awayBadgeFound: !!awayBadgeId },
  });
}
