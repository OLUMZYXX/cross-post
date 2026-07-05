const UPLOAD_MARKER = "/upload/";
const GRAVITY_BY_POSITION = {
  "top-left": "north_west",
  "top-right": "north_east",
  "bottom-left": "south_west",
  "bottom-right": "south_east",
};

function clamp(value, min, max, fallback) {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}

export function buildWatermarkTransform(watermark) {
  const layerId = watermark.publicId.replace(/\//g, ":");
  const gravity = GRAVITY_BY_POSITION[watermark.position] || "north_east";
  const widthRatio = clamp(watermark.size, 5, 50, 18) / 100;
  const opacity = clamp(watermark.opacity, 10, 100, 85);
  const margin = 30;

  return `l_${layerId},w_${widthRatio},fl_relative,o_${opacity}/fl_layer_apply,g_${gravity},x_${margin},y_${margin}`;
}

export function applyWatermarkToUrl(url, watermark) {
  if (!url || !watermark || !watermark.enabled || !watermark.publicId) {
    return url;
  }

  const markerIndex = url.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1) return url;

  const transform = buildWatermarkTransform(watermark);
  const insertAt = markerIndex + UPLOAD_MARKER.length;
  return `${url.slice(0, insertAt)}${transform}/${url.slice(insertAt)}`;
}
