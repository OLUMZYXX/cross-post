import express from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  publishLimiter,
  createLimiter,
  rephraseLimiter,
} from "../middleware/rateLimiter.js";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  retryPublish,
  schedulePost,
  rephraseCaption,
  copyrightCheck,
  duplicateCheck,
} from "../controllers/post.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

function optionalUpload(req, res, next) {
  if (req.is("multipart/form-data")) {
    return upload.array("media")(req, res, next);
  }
  next();
}

router.use(authenticate);

router.get("/", asyncHandler(listPosts));
router.get("/:id", asyncHandler(getPost));
router.post("/", createLimiter, optionalUpload, asyncHandler(createPost));
router.put("/:id", asyncHandler(updatePost));
router.delete("/:id", asyncHandler(deletePost));
router.post("/rephrase", rephraseLimiter, asyncHandler(rephraseCaption));
router.post("/copyright-check", asyncHandler(copyrightCheck));
router.post("/duplicate-check", asyncHandler(duplicateCheck));
router.post("/:id/publish", publishLimiter, asyncHandler(publishPost));
router.post("/:id/retry", publishLimiter, asyncHandler(retryPublish));
router.post("/:id/schedule", asyncHandler(schedulePost));

export default router;
