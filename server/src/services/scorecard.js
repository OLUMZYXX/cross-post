import crypto from "crypto";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../config/env.js";

const SPORTSDB_URL = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php";
const UPLOAD_MARKER = "/upload/";

const LAYOUT = {
  region: { top: 0.37, color: "0a0d16", fillAlpha: "4d" },
  line: { thickness: 0.006, color: "ffffffe6", bottomY: 0.076 },
  badge: { w: 0.13, edgeX: 0.17, y: 0.13 },
  score: { w: 0.23, y: 0.15 },
  title: { w: 0.2, y: 0.27, opacity: 95 },
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

function closeInlineWatermark(url) {
  return url.replace(
    /l_([^/]*:watermarks:[^/,]+),g_([a-z_]+),(w_[\d.]+),fl_relative,(o_\d+),x_(\d+),y_(\d+)/,
    "l_$1,$3,fl_relative,$4/fl_layer_apply,g_$2,x_$5,y_$6",
  );
}

export function buildScorecardUrl(rawPhotoUrl, options) {
  const { homeBadgeId, awayBadgeId, homeScore, awayScore } = options;
  const photoUrl = closeInlineWatermark(rawPhotoUrl);
  if (photoUrl.indexOf(UPLOAD_MARKER) === -1) return photoUrl;

  const { region, line, badge, score, title } = LAYOUT;

  const blank = encodeURIComponent(" ");
  const lineLayer = (y) =>
    `l_text:Arial_2:${blank},c_fill,w_1.0,h_${line.thickness},fl_relative,b_rgb:${line.color}/fl_layer_apply,g_south,y_${y}`;

  const parts = [
    `l_text:Arial_2:${blank},c_fill,w_1.0,h_${region.top},fl_relative,b_rgb:${region.color}${region.fillAlpha}/fl_layer_apply,g_south,y_0`,
    lineLayer(region.top.toFixed(3)),
    lineLayer(line.bottomY.toFixed(3)),
  ];
  if (homeBadgeId) {
    parts.push(
      `l_${homeBadgeId.replace(/\//g, ":")},c_fill,ar_1.0,w_${badge.w},fl_relative,r_max/fl_layer_apply,g_south_west,x_${badge.edgeX},y_${badge.y}`,
    );
  }
  if (awayBadgeId) {
    parts.push(
      `l_${awayBadgeId.replace(/\//g, ":")},c_fill,ar_1.0,w_${badge.w},fl_relative,r_max/fl_layer_apply,g_south_east,x_${badge.edgeX},y_${badge.y}`,
    );
  }
  parts.push(
    `l_text:Arial_90_bold:${encodeURIComponent("FULL TIME")},co_white,w_${title.w},c_fit,fl_relative,o_${title.opacity}/fl_layer_apply,g_south,y_${title.y}`,
  );
  parts.push(
    `l_text:Arial_120_bold:${encodeURIComponent(`${homeScore} - ${awayScore}`)},co_white,w_${score.w},c_fit,fl_relative/fl_layer_apply,g_south,y_${score.y}`,
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
