import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  registerPushToken,
  updatePreferences,
  getPreferences,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", asyncHandler(listNotifications));
router.post("/read-all", asyncHandler(markAllAsRead));
router.post("/clear", asyncHandler(clearAllNotifications));
router.post("/push-token", asyncHandler(registerPushToken));
router.get("/preferences", asyncHandler(getPreferences));
router.put("/preferences", asyncHandler(updatePreferences));
router.post("/:id/read", asyncHandler(markAsRead));
router.delete("/:id", asyncHandler(deleteNotification));

export default router;
