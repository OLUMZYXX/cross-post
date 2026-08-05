import { friendlyFacebookError } from "./facebook.errors.js";

const GRAPH_URL = "https://graph.facebook.com/v18.0";

const isVideo = (url) =>
  url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) ||
  url.includes("/video/upload/");

function buildForm(obj) {
  const form = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, String(v));
  });
  return form;
}

async function postToSinglePage(finalPageId, finalPageToken, caption, media) {
  const mediaList = Array.isArray(media) ? [...media] : [];

  const imageUrls = mediaList.filter(
    (m) => typeof m === "string" && m.startsWith("http") && !isVideo(m),
  );

  const videoUrl = mediaList.find(
    (m) => typeof m === "string" && m.startsWith("http") && isVideo(m),
  );

  console.log("Facebook publish — media:", JSON.stringify(mediaList));
  console.log("Facebook publish — images:", imageUrls.length, "video:", !!videoUrl);

  let response;

  if (videoUrl) {
    response = await postVideo(finalPageId, finalPageToken, caption, videoUrl);
  } else if (imageUrls.length > 1) {
    response = await postMultiImage(finalPageId, finalPageToken, caption, imageUrls);
  } else if (imageUrls.length === 1) {
    response = await postSingleImage(finalPageId, finalPageToken, caption, imageUrls[0]);
  } else {
    response = await postTextOnly(finalPageId, finalPageToken, caption);
  }

  const data = await response.json();
  console.log("Facebook final response:", JSON.stringify(data));

  if (data.error) {
    throw new Error(friendlyFacebookError(data.error));
  }

  const postId = data.id || data.post_id;
  return {
    externalId: postId,
    externalUrl: `https://www.facebook.com/${postId}`,
  };
}

async function postVideo(pageId, token, caption, videoUrl) {
  return fetch(`${GRAPH_URL}/${pageId}/videos`, {
    method: "POST",
    body: buildForm({
      file_url: videoUrl,
      description: caption || "",
      access_token: token,
    }),
  });
}

async function postSingleImage(pageId, token, caption, imageUrl) {
  return fetch(`${GRAPH_URL}/${pageId}/photos`, {
    method: "POST",
    body: buildForm({
      url: imageUrl,
      caption: caption || "",
      access_token: token,
    }),
  });
}

async function postMultiImage(pageId, token, caption, imageUrls) {
  const photoIds = [];

  for (const url of imageUrls) {
    const photoRes = await fetch(`${GRAPH_URL}/${pageId}/photos`, {
      method: "POST",
      body: buildForm({
        url,
        published: "false",
        access_token: token,
      }),
    });
    const photoData = await photoRes.json();
    console.log("Facebook unpublished photo:", JSON.stringify(photoData));
    if (photoData.error) {
      throw new Error(
        friendlyFacebookError(photoData.error, "Failed to upload photo to Facebook"),
      );
    }
    photoIds.push(photoData.id);
  }

  const feedForm = buildForm({
    message: caption || "",
    access_token: token,
  });
  photoIds.forEach((id, i) => {
    feedForm.append(`attached_media[${i}]`, `{"media_fbid":"${id}"}`);
  });

  console.log("Facebook feed post — photoIds:", photoIds);
  return fetch(`${GRAPH_URL}/${pageId}/feed`, {
    method: "POST",
    body: feedForm,
  });
}

async function postTextOnly(pageId, token, caption) {
  return fetch(`${GRAPH_URL}/${pageId}/feed`, {
    method: "POST",
    body: buildForm({
      message: caption || "",
      access_token: token,
    }),
  });
}

export async function publishToFacebook(platform, post) {
  const { accessToken, pageId, pageAccessToken, pages, selectedPageIds } =
    platform;
  const { caption, media } = post;

  let pagesToPost = [];

  if (
    pages &&
    pages.length > 0 &&
    selectedPageIds &&
    selectedPageIds.length > 0
  ) {
    pagesToPost = pages.filter((p) => selectedPageIds.includes(p.pageId));
  }

  if (pagesToPost.length === 0) {
    if (pageId && pageAccessToken) {
      pagesToPost = [{ pageId, pageAccessToken }];
    } else {
      const pagesRes = await fetch(
        `${GRAPH_URL}/me/accounts?access_token=${accessToken}`,
      );
      const pagesData = await pagesRes.json();

      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error(
          "No Facebook Pages found. You need a Facebook Page to publish posts.",
        );
      }

      pagesToPost = [
        {
          pageId: pagesData.data[0].id,
          pageAccessToken: pagesData.data[0].access_token,
        },
      ];
    }
  }

  const results = [];
  const errors = [];

  for (const page of pagesToPost) {
    try {
      const result = await postToSinglePage(
        page.pageId,
        page.pageAccessToken,
        caption,
        media,
      );
      result.pageAccessToken = page.pageAccessToken;
      result.pageName = page.pageName || page.pageId;
      console.log(
        `Facebook: posted to page ${page.pageId} (${page.pageName || "unknown"})`,
      );
      results.push(result);
    } catch (err) {
      console.error(
        `Facebook: failed to post to page ${page.pageId}:`,
        err.message,
      );
      errors.push(`${page.pageName || page.pageId}: ${err.message}`);
    }
  }

  if (results.length === 0) {
    throw new Error(
      `Failed to post to all Facebook pages: ${errors.join("; ")}`,
    );
  }

  return results;
}

export async function deleteFromFacebook(
  platform,
  externalId,
  pageAccessToken,
) {
  const token =
    pageAccessToken || platform.pageAccessToken || platform.accessToken;
  if (!token)
    throw new Error(
      "No page or user access token available for Facebook deletion",
    );

  const res = await fetch(
    `${GRAPH_URL}/${externalId}?access_token=${token}`,
    { method: "DELETE" },
  );

  const data = await res.json().catch(() => null);
  if (!res.ok || (data && data.error)) {
    throw new Error(data?.error?.message || "Failed to delete Facebook post");
  }

  return true;
}
