const SPORTSDB_URL = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php";
const UPLOAD_MARKER = "/upload/";

const LAYOUT = {
  canvas: { w: 1280, h: 853 },
  homeBadge: { w: 170, h: 170, x: 178, y: 462 },
  awayBadge: { w: 170, h: 170, x: 932, y: 462 },
  homeScore: { x: 520, y: 500, size: 130 },
  awayScore: { x: 700, y: 500, size: 130 },
};

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

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

function badgeLayer(badgeUrl, spec) {
  return `l_fetch:${base64Url(badgeUrl)},c_fit,w_${spec.w},h_${spec.h}/fl_layer_apply,g_north_west,x_${spec.x},y_${spec.y}`;
}

function scoreLayer(score, spec) {
  const text = encodeURIComponent(String(score));
  return `l_text:Arial_${spec.size}_bold:${text},co_white/fl_layer_apply,g_north_west,x_${spec.x},y_${spec.y}`;
}

export function buildScorecardUrl(photoUrl, options) {
  const { templatePublicId, homeBadgeUrl, awayBadgeUrl, homeScore, awayScore } = options;
  const markerIndex = photoUrl.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1 || !templatePublicId) return photoUrl;

  const tpl = templatePublicId.replace(/\//g, ":");
  const { canvas, homeBadge, awayBadge, homeScore: hs, awayScore: as } = LAYOUT;

  const segments = [
    `c_fill,w_${canvas.w},h_${canvas.h}`,
    `l_${tpl},w_${canvas.w},h_${canvas.h}/fl_layer_apply,g_center`,
    homeBadgeUrl ? badgeLayer(homeBadgeUrl, homeBadge) : null,
    awayBadgeUrl ? badgeLayer(awayBadgeUrl, awayBadge) : null,
    scoreLayer(homeScore, hs),
    scoreLayer(awayScore, as),
  ].filter(Boolean);

  const insertAt = markerIndex + UPLOAD_MARKER.length;
  return `${photoUrl.slice(0, insertAt)}${segments.join("/")}/${photoUrl.slice(insertAt)}`;
}
