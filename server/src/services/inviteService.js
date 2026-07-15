import User from "../models/User.js";
import TeamInvite from "../models/TeamInvite.js";
import { Errors } from "../utils/AppError.js";

export async function createInvite(workspaceId, email) {
  if (!email || !email.trim()) {
    throw Errors.badRequest("Email is required");
  }
  const normalizedEmail = email.toLowerCase().trim();

  const owner = await User.findById(workspaceId);
  if (owner && owner.email === normalizedEmail) {
    throw Errors.badRequest("You cannot invite yourself");
  }
  const ownerName = owner?.name || "A team owner";

  const alreadyMember = await User.findOne({
    email: normalizedEmail,
    teamOwnerId: workspaceId,
    role: "member",
  });
  if (alreadyMember) {
    throw Errors.conflict("This person is already on your team");
  }

  const existingInvite = await TeamInvite.findOne({
    workspaceId,
    email: normalizedEmail,
    status: "pending",
  });
  if (existingInvite) {
    throw Errors.conflict("An invite is already pending for this email");
  }

  const invite = await TeamInvite.create({
    workspaceId,
    ownerName,
    email: normalizedEmail,
    status: "pending",
  });
  return { id: invite._id, email: invite.email, status: invite.status };
}

export async function getPendingInvitesForEmail(email) {
  const invites = await TeamInvite.find({
    email: email.toLowerCase(),
    status: "pending",
  }).sort({ createdAt: -1 });

  return invites.map((invite) => ({
    id: invite._id,
    ownerName: invite.ownerName || "A team owner",
    createdAt: invite.createdAt,
  }));
}

export async function acceptInvite(user, inviteId) {
  const invite = await TeamInvite.findOne({
    _id: inviteId,
    email: user.email,
    status: "pending",
  });
  if (!invite) {
    throw Errors.notFound("Invite not found or already handled");
  }

  user.role = "member";
  user.teamOwnerId = invite.workspaceId;
  await user.save();

  invite.status = "accepted";
  await invite.save();

  await TeamInvite.updateMany(
    { email: user.email, status: "pending", _id: { $ne: invite._id } },
    { status: "rejected" },
  );
}

export async function rejectInvite(user, inviteId) {
  const invite = await TeamInvite.findOne({
    _id: inviteId,
    email: user.email,
    status: "pending",
  });
  if (!invite) {
    throw Errors.notFound("Invite not found or already handled");
  }
  invite.status = "rejected";
  await invite.save();
}

export async function listPendingInvites(workspaceId) {
  const invites = await TeamInvite.find({
    workspaceId,
    status: "pending",
  }).sort({ createdAt: -1 });
  return invites.map((invite) => ({
    id: invite._id,
    email: invite.email,
    createdAt: invite.createdAt,
  }));
}

export async function cancelInvite(workspaceId, inviteId) {
  const result = await TeamInvite.findOneAndDelete({
    _id: inviteId,
    workspaceId,
    status: "pending",
  });
  if (!result) {
    throw Errors.notFound("Invite not found");
  }
}
