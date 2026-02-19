import express from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  schedulePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// Use memory storage — files are buffered and then saved to MongoDB GridFS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.use(authenticate);

router.get("/", asyncHandler(listPosts));
router.get("/:id", asyncHandler(getPost));
router.post("/", upload.array("media"), asyncHandler(createPost));
router.put("/:id", asyncHandler(updatePost));
router.delete("/:id", asyncHandler(deletePost));
router.post("/:id/publish", asyncHandler(publishPost));
router.post("/:id/schedule", asyncHandler(schedulePost));

export default router;
