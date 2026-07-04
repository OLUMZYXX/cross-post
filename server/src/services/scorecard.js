import crypto from "crypto";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../config/env.js";

const SPORTSDB_URL = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php";
const UPLOAD_MARKER = "/upload/";

const LAYOUT = {
  canvas: { w: 1280, h: 853 },
  homeBadge: { w: 175, h: 175, x: 178, y: 460 },
  awayBadge: { w: 175, h: 175, x: 927, y: 460 },
  homeScore: { x: 520, y: 500, size: 130 },
  awayScore: { x: 700, y: 500, size: 130 },
};

export async function fetchTeamBadge(teamName) {
  if (!teamName) return null;
  try {
    const res = await fetch(`${SPORTSDB_URL}?t=${encodeURIComponent(teamName)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const team = data?.teams?.[0];
    return team?.strTeamBadge || team?.strBadge || null;
  } catch {
    return null;
  }
}

export async function uploadRemoteImage(remoteUrl, folder = "cross-post/scorecard") {
  if (!remoteUrl || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_SECRET) return null;
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

    const form = new FormData();
    form.append("file", remoteUrl);
    form.append("api_key", CLOUDINARY_API_KEY);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: form },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.public_id || null;
  } catch {
    return null;
  }
}

function badgeLayer(publicId, spec) {
  const id = publicId.replace(/\//g, ":");
  return `l_${id}/c_fit,w_${spec.w},h_${spec.h}/fl_layer_apply,g_north_west,x_${spec.x},y_${spec.y}`;
}

function scoreLayer(score, spec) {
  const text = encodeURIComponent(String(score));
  return `l_text:Arial_${spec.size}_bold:${text},co_white/fl_layer_apply,g_north_west,x_${spec.x},y_${spec.y}`;
}

export function buildScorecardUrl(photoUrl, options) {
  const { templatePublicId, homeBadgeId, awayBadgeId, homeScore, awayScore } = options;
  const markerIndex = photoUrl.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1 || !templatePublicId) return photoUrl;

  const base = photoUrl.slice(0, markerIndex + UPLOAD_MARKER.length);
  const after = photoUrl.slice(markerIndex + UPLOAD_MARKER.length);
  const versionMatch = after.match(/v\d+\/.+$/);
  const tail = versionMatch ? versionMatch[0] : after;

  const tpl = templatePublicId.replace(/\//g, ":");
  const { canvas, homeBadge, awayBadge, homeScore: hs, awayScore: as } = LAYOUT;

  const parts = [
    `c_fill,w_${canvas.w},h_${canvas.h}`,
    `l_${tpl}/c_fill,w_${canvas.w},h_${canvas.h}/fl_layer_apply,g_center`,
  ];
  if (homeBadgeId) parts.push(badgeLayer(homeBadgeId, homeBadge));
  if (awayBadgeId) parts.push(badgeLayer(awayBadgeId, awayBadge));
  parts.push(scoreLayer(homeScore, hs));
  parts.push(scoreLayer(awayScore, as));

  return `${base}${parts.join("/")}/${tail}`;
}
