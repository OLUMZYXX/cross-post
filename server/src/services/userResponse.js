import { getProSource, trialDaysLeft } from "./proAccess.js";
import { resolveIsPro, resolveHasOwnerFeatures } from "./teamAccess.js";
import { getWorkspaceId } from "./teamService.js";

export async function buildUserResponse(user) {
  const { passwordHash, twoFactorSecret, ...safe } = user.toObject();
  safe.hasPassword = !!passwordHash;
  safe.proSource = getProSource(user);
  safe.trialDaysLeft = trialDaysLeft(user);
  safe.role = user.role || "owner";
  safe.isTeamOwner = safe.role === "owner";
  safe.teamOwnerId = getWorkspaceId(user);
  safe.isPro = await resolveIsPro(user);
  safe.isOwner = await resolveHasOwnerFeatures(user);
  return safe;
}
