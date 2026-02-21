import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { Errors } from "../utils/AppError.js";

export async function listNotifications(req, res) {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    read: false,
  });

  res.json({ success: true, data: { notifications, unreadCount } });
}

export async function markAsRead(req, res) {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { read: true },
    { new: true },
  );

  if (!notification) {
    throw Errors.notFound("Notification not found");
  }

  res.json({ success: true, data: { notification } });
}

export async function markAllAsRead(req, res) {
  await Notification.updateMany(
    { userId: req.user.id, read: false },
    { read: true },
  );

  res.json({ success: true, data: null });
}

export async function deleteNotification(req, res) {
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    userId: req.user.id,
  });

  if (!notification) {
    throw Errors.notFound("Notification not found");
  }

  res.json({ success: true, data: null });
}

export async function clearAllNotifications(req, res) {
  await Notification.deleteMany({ userId: req.user.id });

  res.json({ success: true, data: null });
}

export async function registerPushToken(req, res) {
  const { pushToken } = req.body;

  if (!pushToken) {
    throw Errors.badRequest("Push token is required");
  }

  await User.findByIdAndUpdate(req.user.id, { pushToken });

  res.json({ success: true, data: null });
}

export async function updatePreferences(req, res) {
  const { pushEnabled, emailEnabled, postAlerts, scheduleReminders } = req.body;

  const update = {};
  if (pushEnabled !== undefined) update["notificationPreferences.pushEnabled"] = pushEnabled;
  if (emailEnabled !== undefined) update["notificationPreferences.emailEnabled"] = emailEnabled;
  if (postAlerts !== undefined) update["notificationPreferences.postAlerts"] = postAlerts;
  if (scheduleReminders !== undefined) update["notificationPreferences.scheduleReminders"] = scheduleReminders;

  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });

  res.json({ success: true, data: { preferences: user.notificationPreferences } });
}

export async function getPreferences(req, res) {
  const user = await User.findById(req.user.id).select("notificationPreferences");

  res.json({
    success: true,
    data: {
      preferences: user?.notificationPreferences || {
        pushEnabled: true,
        emailEnabled: false,
        postAlerts: true,
        scheduleReminders: true,
      },
    },
  });
}
