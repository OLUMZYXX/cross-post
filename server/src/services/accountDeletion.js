import Post from "../models/Post.js";
import Platform from "../models/Platform.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { deleteFromGridFS } from "../utils/gridfs.js";

async function deletePostMedia(userId) {
  const posts = await Post.find({ userId });
  for (const post of posts) {
    for (const url of post.media || []) {
      const match = url.match(/\/media\/([a-f0-9]{24})$/);
      if (match) {
        try {
          await deleteFromGridFS(match[1]);
        } catch {}
      }
    }
  }
}

export async function deleteUserAccount(userId) {
  await deletePostMedia(userId);

  await Post.deleteMany({ userId });
  await Platform.deleteMany({ userId });
  await Notification.deleteMany({ userId });
  await User.deleteOne({ _id: userId });
}
