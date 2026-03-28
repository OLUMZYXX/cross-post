const isVideoUrl = (url) =>
  url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) ||
  url.includes("/video/upload/");

async function uploadImageToLinkedIn(accessToken, personUrn, imageUrl) {
  const registerRes = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: personUrn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    },
  );

  if (!registerRes.ok) {
    throw new Error("Failed to register image upload with LinkedIn");
  }

  const registerData = await registerRes.json();
  const uploadUrl =
    registerData.value?.uploadMechanism?.[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ]?.uploadUrl;
  const asset = registerData.value?.asset;

  if (!uploadUrl || !asset) {
    throw new Error("LinkedIn did not return upload URL or asset");
  }

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    throw new Error(`Failed to download image from ${imageUrl}`);
  }
  const imageBuffer = await imageRes.arrayBuffer();

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
    },
    body: Buffer.from(imageBuffer),
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image to LinkedIn");
  }

  return asset;
}

export async function publishToLinkedIn(platform, post) {
  const { accessToken, platformUserId } = platform;
  const { caption, media } = post;

  if (!platformUserId) {
    throw new Error(
      "LinkedIn user ID not found. Please reconnect your LinkedIn account.",
    );
  }

  const personUrn = `urn:li:person:${platformUserId}`;

  const imageUrls =
    media
      ?.map((m) => (typeof m === "string" ? m : m?.uri))
      .filter((url) => url && url.startsWith("http") && !isVideoUrl(url)) || [];

  let postBody;

  if (imageUrls.length > 0) {
    const assets = [];
    for (const url of imageUrls) {
      try {
        const asset = await uploadImageToLinkedIn(accessToken, personUrn, url);
        assets.push(asset);
      } catch (err) {
        console.error("LinkedIn image upload failed:", err.message);
      }
    }

    if (assets.length > 0) {
      postBody = {
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: caption || "",
            },
            shareMediaCategory: "IMAGE",
            media: assets.map((asset) => ({
              status: "READY",
              media: asset,
            })),
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };
    } else {
      postBody = {
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: caption || "",
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };
    }
  } else {
    postBody = {
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: caption || "",
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };
  }

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(postBody),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.message || `LinkedIn API error: ${response.status}`,
    );
  }

  const postId = response.headers.get("x-restli-id") || "";

  return {
    externalId: postId,
    externalUrl: postId
      ? `https://www.linkedin.com/feed/update/${postId}`
      : "https://www.linkedin.com/feed/",
  };
}

export async function deleteFromLinkedIn(platform, externalId) {
  const { accessToken } = platform;
  if (!accessToken) throw new Error("No access token for LinkedIn deletion");
  if (!externalId)
    throw new Error("No externalId provided for LinkedIn deletion");

  const res = await fetch(
    `https://api.linkedin.com/v2/ugcPosts/${externalId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.message || `Failed to delete LinkedIn post: ${res.status}`,
    );
  }

  return true;
}
