const MIN_ASPECT = 0.8;
const MAX_ASPECT = 1.91;
const MAX_WIDTH = 1080;

const IG_TRANSFORM = [
  `if_ar_gt_${MAX_ASPECT},c_fill,ar_${MAX_ASPECT},g_auto`,
  "if_end",
  `if_ar_lt_${MIN_ASPECT},c_fill,ar_${MIN_ASPECT},g_auto`,
  "if_end",
  `c_limit,w_${MAX_WIDTH}`,
  "f_jpg,q_auto",
].join("/");

export function transformForInstagram(url) {
  if (!url || !url.includes("/image/upload/")) return url;

  if (url.includes("f_auto,q_auto")) {
    return url.replace("f_auto,q_auto", IG_TRANSFORM);
  }

  return url.replace("/image/upload/", `/image/upload/${IG_TRANSFORM}/`);
}
