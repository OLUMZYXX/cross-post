import { isVideoUrl } from "./instagram.helpers.js";

const INSTAGRAM_MIN_AR = 0.8;
const INSTAGRAM_MAX_AR = 1.91;
const INSTAGRAM_WIDTH = 1080;

function isCloudinaryUrl(url) {
  return url.includes("res.cloudinary.com") && url.includes("/upload/");
}

async function getCloudinaryImageDimensions(url) {
  const infoUrl = url.replace("/upload/", "/upload/fl_getinfo/");
  const res = await fetch(infoUrl);
  if (!res.ok) throw new Error("Failed to fetch image info");
  const data = await res.json();
  return { width: data.input.width, height: data.input.height };
}

function buildInstagramTransform(aspectRatio) {
  if (aspectRatio < INSTAGRAM_MIN_AR) {
    return `c_pad,ar_4:5,b_auto,w_${INSTAGRAM_WIDTH}`;
  }
  if (aspectRatio > INSTAGRAM_MAX_AR) {
    return `c_pad,ar_1.91:1,b_auto,w_${INSTAGRAM_WIDTH}`;
  }
  return `c_limit,w_${INSTAGRAM_WIDTH}`;
}

function insertCloudinaryTransform(url, transform) {
  if (url.includes("/upload/f_auto,q_auto/")) {
    return url.replace("/upload/f_auto,q_auto/", `/upload/${transform}/f_auto,q_auto/`);
  }
  return url.replace("/upload/", `/upload/${transform}/`);
}

export async function prepareImageForInstagram(url) {
  try {
    if (isVideoUrl(url) || !isCloudinaryUrl(url)) return url;

    const { width, height } = await getCloudinaryImageDimensions(url);
    const aspectRatio = width / height;
    const transform = buildInstagramTransform(aspectRatio);
    return insertCloudinaryTransform(url, transform);
  } catch {
    return url;
  }
}
