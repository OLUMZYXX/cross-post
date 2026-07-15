import User from "../models/User.js";
import Post from "../models/Post.js";
import {
  getTeamUserIds,
  listMembers,
  removeMember,
} from "../services/teamService.js";
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

function monthRange(month) {
  const now = new Date();
  const [year, m] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  return {
    label: `${year}-${String(m).padStart(2, "0")}`,
    start: new Date(year, m - 1, 1),
    end: new Date(year, m, 1),
  };
}

export async function getPerformance(req, res) {
  const { label, start, end } = monthRange(req.query.month);
  const teamUserIds = await getTeamUserIds(workspaceId(req));

  const users = await User.find({ _id: { $in: teamUserIds } }).select(
    "name email role",
  );
  const posts = await Post.find({
    userId: { $in: teamUserIds },
    $or: [
      { publishedAt: { $gte: start, $lt: end } },
      { scheduledAt: { $gte: start, $lt: end } },
    ],
  }).select("userId status publishResults publishedAt scheduledAt");

  const byUser = {};
  for (const user of users) {
    byUser[user._id.toString()] = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "owner",
      published: 0,
      scheduled: 0,
      succeeded: 0,
      failed: 0,
    };
  }

  for (const post of posts) {
    const bucket = byUser[post.userId.toString()];
    if (!bucket) continue;
    if (post.status === "published" && post.publishedAt >= start && post.publishedAt < end)
      bucket.published += 1;
    if (post.status === "scheduled" && post.scheduledAt >= start && post.scheduledAt < end)
      bucket.scheduled += 1;
    for (const result of post.publishResults || []) {
      if (result.success) bucket.succeeded += 1;
      else bucket.failed += 1;
    }
  }

  const members = Object.values(byUser).sort((a, b) => b.published - a.published);
  const totals = members.reduce(
    (acc, m) => ({
      published: acc.published + m.published,
      scheduled: acc.scheduled + m.scheduled,
      succeeded: acc.succeeded + m.succeeded,
      failed: acc.failed + m.failed,
    }),
    { published: 0, scheduled: 0, succeeded: 0, failed: 0 },
  );

  res.json({ success: true, data: { month: label, totals, members } });
}
