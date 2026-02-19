import Post from "../models/Post.js";
import { Errors } from "../utils/AppError.js";
import {
  publishToAllPlatforms,
  deleteFromAllPlatforms,
} from "../services/publishPost.js";
import { SERVER_URL } from "../config/env.js";
import { uploadToGridFS, deleteFromGridFS } from "../utils/gridfs.js";

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
  const { caption, platforms, status } = req.body;

  // Upload files to MongoDB GridFS
  const mediaUrls = [];
  for (const file of req.files || []) {
    const { fileId } = await uploadToGridFS(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
    mediaUrls.push(`${SERVER_URL}/media/${fileId}`);
  }

  // platforms may come as a single string or array from FormData
  const platformList = Array.isArray(platforms)
    ? platforms
    : platforms
      ? [platforms]
      : [];

  const post = new Post({
    userId: req.user.id,
    caption: caption || "",
    media: mediaUrls,
    platforms: platformList,
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
  if (media !== undefined)
    post.media = media.map((item) =>
      typeof item === "string" ? item : item.uri,
    );
  if (platforms !== undefined) post.platforms = platforms;
  if (status !== undefined) post.status = status;

  await post.save();

  res.json({ success: true, data: { post } });
}

export async function deletePost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  // Attempt to remove published posts from external platforms
  try {
    await deleteFromAllPlatforms(req.user.id, post);
  } catch (err) {
    console.error("Error deleting remote posts:", err.message || err);
    // Continue to delete local record even if remote deletions fail
  }

  // Clean up media files from GridFS
  for (const url of post.media || []) {
    const match = url.match(/\/media\/([a-f0-9]{24})$/);
    if (match) {
      try {
        await deleteFromGridFS(match[1]);
      } catch {}
    }
  }

  await Post.deleteOne({ _id: post._id });

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

  // Publish to all selected platforms via their APIs
  const results = await publishToAllPlatforms(req.user.id, post);

  const anySuccess = results.some((r) => r.success);

  post.publishResults = results;
  post.publishedAt = new Date();
  post.status = anySuccess ? "published" : "draft";

  await post.save();

  res.json({ success: true, data: { post, publishResults: results } });
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
