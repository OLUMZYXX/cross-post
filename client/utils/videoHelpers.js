const VIDEO_EXTENSIONS = /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i;

export const isVideoUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return VIDEO_EXTENSIONS.test(url) || url.includes("/video/upload/");
};

export const getCloudinaryThumbnail = (videoUrl) => {
  if (!videoUrl || !videoUrl.includes("/video/upload/")) return null;
  const withTransform = videoUrl.replace(
    "/video/upload/",
    "/video/upload/so_0,w_600,h_400,c_fill,f_jpg/",
  );
  return withTransform.replace(VIDEO_EXTENSIONS, ".jpg");
};
