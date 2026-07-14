import User from "../models/User.js";
import { Errors } from "../utils/AppError.js";

export function getWorkspaceId(user) {
  return (user.teamOwnerId || user._id).toString();
}

export async function getTeamUserIds(workspaceId) {
  const members = await User.find({
    $or: [{ teamOwnerId: workspaceId }, { _id: workspaceId }],
  }).select("_id");
  return members.map((member) => member._id);
}

export async function listMembers(workspaceId) {
  return User.find({ teamOwnerId: workspaceId, role: "member" })
    .select("name email createdAt")
    .sort({ createdAt: -1 });
}

export async function createMember(workspaceId, { email }) {
  if (!email || !email.trim()) {
    throw Errors.badRequest("Email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    if (existing._id.toString() === workspaceId) {
      throw Errors.badRequest("You cannot add yourself as a member");
    }
    if (
      existing.teamOwnerId &&
      existing.teamOwnerId.toString() === workspaceId &&
      existing.role === "member"
    ) {
      throw Errors.conflict("This member is already on your team");
    }
    existing.role = "member";
    existing.teamOwnerId = workspaceId;
    await existing.save();
    return { id: existing._id, name: existing.name, email: existing.email };
  }

  const member = new User({
    name: normalizedEmail.split("@")[0],
    email: normalizedEmail,
    role: "member",
    teamOwnerId: workspaceId,
  });
  await member.save();

  return { id: member._id, name: member.name, email: member.email };
}

export async function removeMember(workspaceId, memberId) {
  const member = await User.findOne({
    _id: memberId,
    teamOwnerId: workspaceId,
    role: "member",
  });
  if (!member) {
    throw Errors.notFound("Team member not found");
  }
  await User.deleteOne({ _id: member._id });
}
