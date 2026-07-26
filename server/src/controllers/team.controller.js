import User from "../models/User.js";
import { listMembers, removeMember } from "../services/teamService.js";
import { buildTeamPerformance } from "../services/teamPerformance.js";
import {
  createInvite,
  getPendingInvitesForEmail,
  acceptInvite,
  rejectInvite,
  listPendingInvites,
  cancelInvite,
} from "../services/inviteService.js";
import { buildUserResponse } from "../services/userResponse.js";
import { generateToken } from "../utils/authToken.js";

function workspaceId(req) {
  return (req.user.teamOwnerId || req.user.id).toString();
}

export async function getMembers(req, res) {
  const members = await listMembers(workspaceId(req));
  const pending = await listPendingInvites(workspaceId(req));
  res.json({ success: true, data: { members, pending } });
}

export async function addMember(req, res) {
  const { email } = req.body;
  const invite = await createInvite(workspaceId(req), email);
  res.status(201).json({ success: true, data: { invite } });
}

export async function deleteMember(req, res) {
  await removeMember(workspaceId(req), req.params.id);
  res.json({ success: true, data: null });
}

export async function cancelPendingInvite(req, res) {
  await cancelInvite(workspaceId(req), req.params.id);
  res.json({ success: true, data: null });
}

export async function getMyInvites(req, res) {
  const invites = await getPendingInvitesForEmail(req.user.email);
  res.json({ success: true, data: { invites } });
}

export async function acceptTeamInvite(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");
  await acceptInvite(user, req.params.id);
  const token = generateToken(user);
  res.json({ success: true, data: { user: await buildUserResponse(user), token } });
}

export async function rejectTeamInvite(req, res) {
  const user = await User.findById(req.user.id);
  await rejectInvite(user, req.params.id);
  res.json({ success: true, data: null });
}

export async function getPerformance(req, res) {
  const data = await buildTeamPerformance(workspaceId(req), req.query.month);
  res.json({ success: true, data });
}
