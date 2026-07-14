import User from "../models/User.js";
import { isUserPro, isAllowlistedEmail } from "./proAccess.js";
import { getWorkspaceId } from "./teamService.js";

export async function resolveWorkspaceOwner(user) {
  const workspaceId = getWorkspaceId(user);
  if (workspaceId === user._id.toString()) return user;
  return (await User.findById(workspaceId)) || user;
}

export async function resolveIsPro(user) {
  if (isUserPro(user)) return true;
  const owner = await resolveWorkspaceOwner(user);
  return isUserPro(owner);
}

export async function resolveHasOwnerFeatures(user) {
  if (isAllowlistedEmail(user.email)) return true;
  const owner = await resolveWorkspaceOwner(user);
  return isAllowlistedEmail(owner.email);
}
