import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function createNotification(userId, { type, title, message, postId = null }) {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    postId,
  });

  const user = await User.findById(userId).select("pushToken notificationPreferences");
  if (!user) return notification;

  const prefs = user.notificationPreferences || {};

  if (!prefs.pushEnabled) return notification;

  const postTypes = ["post_published", "post_failed", "post_partial"];
  const scheduleTypes = ["post_scheduled", "schedule_reminder"];

  if (postTypes.includes(type) && !prefs.postAlerts) return notification;
  if (scheduleTypes.includes(type) && !prefs.scheduleReminders) return notification;

  if (user.pushToken) {
    await sendExpoPush(user.pushToken, title, message).catch((err) => {
      console.error("Push notification failed:", err.message);
    });
  }

  return notification;
}

async function sendExpoPush(pushToken, title, body) {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: pushToken,
      sound: "default",
      title,
      body,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.errors?.[0]?.message || "Expo push send failed");
  }

  return response.json();
}

export async function notifyPublishResults(userId, post, results) {
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (failed.length === 0 && succeeded.length > 0) {
    await createNotification(userId, {
      type: "post_published",
      title: "Post Published",
      message: `Your post was published to ${succeeded.map((r) => r.platform).join(", ")}`,
      postId: post._id,
    });
  } else if (succeeded.length > 0 && failed.length > 0) {
    await createNotification(userId, {
      type: "post_partial",
      title: "Partially Published",
      message: `Published to ${succeeded.map((r) => r.platform).join(", ")}. Failed on ${failed.map((r) => r.platform).join(", ")}`,
      postId: post._id,
    });
  } else if (failed.length > 0) {
    await createNotification(userId, {
      type: "post_failed",
      title: "Publishing Failed",
      message: `Failed to publish to ${failed.map((r) => r.platform).join(", ")}`,
      postId: post._id,
    });
  }
}
