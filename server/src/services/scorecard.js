import crypto from "crypto";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../config/env.js";

const SPORTSDB_URL = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php";
const UPLOAD_MARKER = "/upload/";

const LAYOUT = {
  width: 1440,
  band: 520,
  bandColor: "0d0d12",
  badge: { w: 210, h: 210, edgeX: 190, y: 150 },
  score: { size: 175, y: 165 },
  title: { size: 52, y: 410, opacity: 80 },
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

export function buildScorecardUrl(photoUrl, options) {
  const { homeBadgeId, awayBadgeId, homeScore, awayScore } = options;
  if (photoUrl.indexOf(UPLOAD_MARKER) === -1) return photoUrl;

  const { width, band, bandColor, badge, score, title } = LAYOUT;

  const parts = [
    `c_scale,w_${width}`,
    `c_pad,w_${width},h_ih_mul_${width}_div_iw_add_${band},g_north,b_rgb:${bandColor}`,
  ];
  if (homeBadgeId) {
    parts.push(
      `l_${homeBadgeId.replace(/\//g, ":")}/c_fill,w_${badge.w},h_${badge.h},r_max/fl_layer_apply,g_south_west,x_${badge.edgeX},y_${badge.y}`,
    );
  }
  if (awayBadgeId) {
    parts.push(
      `l_${awayBadgeId.replace(/\//g, ":")}/c_fill,w_${badge.w},h_${badge.h},r_max/fl_layer_apply,g_south_east,x_${badge.edgeX},y_${badge.y}`,
    );
  }
  parts.push(
    `l_text:Arial_${title.size}_bold:${encodeURIComponent("FULL TIME")},co_white,o_${title.opacity}/fl_layer_apply,g_south,y_${title.y}`,
  );
  parts.push(
    `l_text:Arial_${score.size}_bold:${encodeURIComponent(`${homeScore} - ${awayScore}`)},co_white/fl_layer_apply,g_south,y_${score.y}`,
  );

  const chain = parts.join("/");
  const versionMatch = photoUrl.match(/\/v\d+\//);
  if (versionMatch) {
    const at = versionMatch.index;
    return `${photoUrl.slice(0, at)}/${chain}${photoUrl.slice(at)}`;
  }
  const at = photoUrl.indexOf(UPLOAD_MARKER) + UPLOAD_MARKER.length;
  return `${photoUrl.slice(0, at)}${chain}/${photoUrl.slice(at)}`;
}
