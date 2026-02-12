import Post from "../models/Post.js";
import { Errors } from "../utils/AppError.js";

export async function listPosts(req, res) {
  const posts = await Post.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  res.json({ success: true, data: { posts } });
}

export async function getPost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  res.json({ success: true, data: { post } });
}

export async function createPost(req, res) {
  const { caption, media, platforms, status } = req.body;

  const post = new Post({
    userId: req.user.id,
    caption: caption || "",
    media: media || [],
    platforms: platforms || [],
    status: status || "draft",
  });

  await post.save();

  res.status(201).json({ success: true, data: { post } });
}

export async function updatePost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  if (post.status === "published") {
    throw Errors.badRequest("Cannot edit a published post");
  }

  const { caption, media, platforms, status } = req.body;

  if (caption !== undefined) post.caption = caption;
  if (media !== undefined) post.media = media;
  if (platforms !== undefined) post.platforms = platforms;
  if (status !== undefined) post.status = status;

  await post.save();

  res.json({ success: true, data: { post } });
}

export async function deletePost(req, res) {
  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  res.json({ success: true, data: null });
}

export async function publishPost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  if (post.platforms.length === 0) {
    throw Errors.badRequest("Select at least one platform to publish");
  }

  post.status = "published";
  post.publishedAt = new Date();

  await post.save();

  res.json({ success: true, data: { post } });
}

export async function schedulePost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  const { scheduledAt } = req.body;
  if (!scheduledAt) {
    throw Errors.badRequest("scheduledAt is required");
  }

  const scheduledDate = new Date(scheduledAt);
  if (scheduledDate <= new Date()) {
    throw Errors.badRequest("Scheduled time must be in the future");
  }

  post.status = "scheduled";
  post.scheduledAt = scheduledDate;

  await post.save();

  res.json({ success: true, data: { post } });
}
