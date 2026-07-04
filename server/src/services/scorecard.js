import crypto from "crypto";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../config/env.js";

const SPORTSDB_URL = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php";
const UPLOAD_MARKER = "/upload/";

const LAYOUT = {
  canvas: { w: 1280, h: 720 },
  darken: 40,
  badge: { w: 190, h: 190, edgeX: 150 },
  score: { size: 150 },
  title: { size: 46, y: 110 },
  name: { size: 40, edgeX: 120, y: 150 },
};

export async function searchTeams(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${SPORTSDB_URL}?t=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.teams || [])
      .filter((t) => t.strSport === "Soccer")
      .slice(0, 6)
      .map((t) => ({
        name: t.strTeam,
        badge: t.strTeamBadge || t.strBadge || null,
        country: t.strCountry || null,
      }));
  } catch {
    return [];
  }
}

export async function fetchTeamBadge(teamName) {
  const results = await searchTeams(teamName);
  return results[0]?.badge || null;
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

function textLayer(text, size, gravity, x, y, extra = "") {
  const value = encodeURIComponent(String(text));
  const offset = `${x ? `,x_${x}` : ""}${y ? `,y_${y}` : ""}`;
  return `l_text:Arial_${size}_bold:${value},co_white${extra}/fl_layer_apply,g_${gravity}${offset}`;
}

export function buildScorecardUrl(photoUrl, options) {
  const { homeBadgeId, awayBadgeId, homeScore, awayScore, homeName, awayName } = options;
  const markerIndex = photoUrl.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1) return photoUrl;

  const base = photoUrl.slice(0, markerIndex + UPLOAD_MARKER.length);
  const after = photoUrl.slice(markerIndex + UPLOAD_MARKER.length);
  const versionMatch = after.match(/v\d+\/.+$/);
  const tail = versionMatch ? versionMatch[0] : after;

  const { canvas, darken, badge, score, title, name } = LAYOUT;
  const parts = [`c_fill,w_${canvas.w},h_${canvas.h}/e_brightness:-${darken}`];

  if (homeBadgeId) {
    parts.push(
      `l_${homeBadgeId.replace(/\//g, ":")}/c_fill,w_${badge.w},h_${badge.h},r_max/fl_layer_apply,g_west,x_${badge.edgeX}`,
    );
  }
  if (awayBadgeId) {
    parts.push(
      `l_${awayBadgeId.replace(/\//g, ":")}/c_fill,w_${badge.w},h_${badge.h},r_max/fl_layer_apply,g_east,x_${badge.edgeX}`,
    );
  }

  parts.push(textLayer("FULL TIME", title.size, "north", 0, title.y, ",o_90"));
  parts.push(textLayer(`${homeScore} - ${awayScore}`, score.size, "center", 0, 0));
  if (homeName) parts.push(textLayer(homeName.toUpperCase(), name.size, "west", name.edgeX, name.y));
  if (awayName) parts.push(textLayer(awayName.toUpperCase(), name.size, "east", name.edgeX, name.y));

  return `${base}${parts.join("/")}/${tail}`;
}
