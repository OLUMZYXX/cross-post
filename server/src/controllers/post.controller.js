import Post from "../models/Post.js";
import Media from "../models/Media.js";
import { Errors } from "../utils/AppError.js";
import { publishToAllPlatforms } from "../services/publishPost.js";
import { SERVER_URL } from "../config/env.js";

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

  // Handle file uploads from multer (multipart/form-data)
  const mediaUrls = [];
  for (const file of (req.files || [])) {
    // Guard against storing very large files inside a MongoDB document
    const MAX_DB_FILE = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_DB_FILE) {
      throw Errors.badRequest(
        "One of the files is too large to store in MongoDB (max 15MB). Use smaller files or external storage.",
      );
    }

    const m = new Media({
      filename: file.originalname,
      data: file.buffer,
      contentType: file.mimetype,
      size: file.size,
    });
    await m.save();
    mediaUrls.push(`${SERVER_URL}/api/media/${m._id}`);
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
