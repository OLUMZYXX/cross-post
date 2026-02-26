import cron from "node-cron";
import Post from "../models/Post.js";
import { publishToAllPlatforms } from "./publishPost.js";
import { notifyPublishResults } from "./notificationService.js";

async function processScheduledPosts() {
  const duePosts = await Post.find({
    status: "scheduled",
    scheduledAt: { $lte: new Date() },
  });

  if (duePosts.length === 0) return;

  console.log(`[Scheduler] Found ${duePosts.length} scheduled post(s) due for publishing`);

  for (const post of duePosts) {
    try {
      post.status = "publishing";
      await post.save();

      const results = await publishToAllPlatforms(post.userId, post);
      const anySuccess = results.some((r) => r.success);

      post.publishResults = results;
      post.publishedAt = new Date();
      post.status = anySuccess ? "published" : "draft";
      await post.save();

      await notifyPublishResults(post.userId, post, results).catch(() => {});

      const succeeded = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      console.log(
        `[Scheduler] Post ${post._id}: ${succeeded} succeeded, ${failed} failed`,
      );
    } catch (err) {
      console.error(`[Scheduler] Post ${post._id} failed:`, err.message);
      post.status = "scheduled";
      await post.save().catch(() => {});
    }
  }
}

export function startScheduler() {
  cron.schedule("* * * * *", () => {
    processScheduledPosts().catch((err) => {
      console.error("[Scheduler] Unexpected error:", err.message);
    });
  });

  console.log("[Scheduler] Cron job started — checking every minute for scheduled posts");
}
