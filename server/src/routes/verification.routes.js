import express from "express";
import { TIKTOK_VERIFICATION_CODES } from "../config/env.js";

const router = express.Router();

TIKTOK_VERIFICATION_CODES.forEach((code) => {
  router.get(`/tiktok${code}.txt`, (_req, res) =>
    res.type("text/plain").send(`tiktok-developers-site-verification=${code}`),
  );
});

export default router;
