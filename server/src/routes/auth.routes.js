import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { signup, signin, me, updateProfile, setup2FA, verify2FA, disable2FA, login2FA } from "../controllers/auth.controller.js";
import { googleAuth, appleAuth } from "../controllers/social.auth.controller.js";

const router = express.Router();

router.post(
  "/signup",
  validate({
    name: ["required"],
    email: ["required", "email"],
    password: ["required", "minLength:6"],
  }),
  asyncHandler(signup),
);

router.post(
  "/signin",
  validate({
    email: ["required", "email"],
    password: ["required"],
  }),
  asyncHandler(signin),
);

router.get("/me", authenticate, asyncHandler(me));

router.post("/google", asyncHandler(googleAuth));
router.post("/apple", asyncHandler(appleAuth));

router.put(
  "/profile",
  authenticate,
  validate({
    name: ["required"],
    email: ["required", "email"],
  }),
  asyncHandler(updateProfile),
);

// 2FA routes
router.post("/2fa/setup", authenticate, asyncHandler(setup2FA));
router.post("/2fa/verify", authenticate, asyncHandler(verify2FA));
router.post("/2fa/disable", authenticate, asyncHandler(disable2FA));
router.post("/2fa/login", asyncHandler(login2FA));

export default router;
