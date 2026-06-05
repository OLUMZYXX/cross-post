import mongoose from "mongoose";
import { MONGO_URI } from "../src/config/env.js";
import Post from "../src/models/Post.js";
import { hashCaption } from "../src/utils/contentHash.js";

async function run() {
  await mongoose.connect(MONGO_URI);

  const posts = await Post.find({
    contentHash: null,
    caption: { $nin: [null, ""] },
  });

  let updated = 0;
  for (const post of posts) {
    const contentHash = hashCaption(post.caption);
    if (!contentHash) continue;
    post.contentHash = contentHash;
    await post.save();
    updated += 1;
  }

  console.log(`Backfilled contentHash for ${updated} post(s).`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Backfill failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
