import Post from "../models/Post.js";
import { Errors } from "../utils/AppError.js";
import {
  publishToAllPlatforms,
  deleteFromAllPlatforms,
} from "../services/publishPost.js";
import {
  notifyPublishResults,
  createNotification,
} from "../services/notificationService.js";
import { SERVER_URL, OPENAI_API_KEY } from "../config/env.js";
import { uploadToGridFS, deleteFromGridFS } from "../utils/gridfs.js";

export async function listPosts(req, res) {
  const posts = await Post.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  res.json({ success: true, data: { posts } });
}

export async function getPost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  res.json({ success: true, data: { post } });
}

export async function createPost(req, res) {
  const { caption, platforms, status, mediaUrls: cloudinaryUrls } = req.body;

  const mediaUrls = [];
  if (cloudinaryUrls && cloudinaryUrls.length > 0) {
    mediaUrls.push(...cloudinaryUrls);
  } else {
    for (const file of req.files || []) {
      const { fileId } = await uploadToGridFS(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
      mediaUrls.push(`${SERVER_URL}/media/${fileId}`);
    }
  }

  const platformList = Array.isArray(platforms)
    ? platforms
    : platforms
      ? [platforms]
      : [];

  const post = new Post({
    userId: req.user.id,
    caption: caption || "",
    media: mediaUrls,
    platforms: platformList,
    status: status || "draft",
  });

  await post.save();

  res.status(201).json({ success: true, data: { post } });
}

export async function updatePost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  if (post.status === "published") {
    throw Errors.badRequest("Cannot edit a published post");
  }

  const { caption, media, platforms, status } = req.body;

  if (caption !== undefined) post.caption = caption;
  if (media !== undefined)
    post.media = media.map((item) =>
      typeof item === "string" ? item : item.uri,
    );
  if (platforms !== undefined) post.platforms = platforms;
  if (status !== undefined) post.status = status;

  await post.save();

  res.json({ success: true, data: { post } });
}

export async function deletePost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  try {
    await deleteFromAllPlatforms(req.user.id, post);
  } catch (err) {}

  for (const url of post.media || []) {
    const match = url.match(/\/media\/([a-f0-9]{24})$/);
    if (match) {
      try {
        await deleteFromGridFS(match[1]);
      } catch {}
    }
  }

  await Post.deleteOne({ _id: post._id });

  res.json({ success: true, data: null });
}

export async function publishPost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  if (post.platforms.length === 0) {
    throw Errors.badRequest("Select at least one platform to publish");
  }

  const results = await publishToAllPlatforms(req.user.id, post);

  const anySuccess = results.some((r) => r.success);

  post.publishResults = results;
  post.publishedAt = new Date();
  post.status = anySuccess ? "published" : "draft";

  await post.save();

  await notifyPublishResults(req.user.id, post, results).catch(() => {});

  res.json({ success: true, data: { post, publishResults: results } });
}

export async function retryPublish(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  const { platforms: retryPlatforms } = req.body;
  if (
    !retryPlatforms ||
    !Array.isArray(retryPlatforms) ||
    retryPlatforms.length === 0
  ) {
    throw Errors.badRequest("Specify which platforms to retry");
  }

  const originalPlatforms = post.platforms;
  post.platforms = retryPlatforms;

  const retryResults = await publishToAllPlatforms(req.user.id, post);

  post.platforms = originalPlatforms;

  const existing = post.publishResults || [];
  for (const retryResult of retryResults) {
    const idx = existing.findIndex((r) => r.platform === retryResult.platform);
    if (idx >= 0) {
      existing[idx] = retryResult;
    } else {
      existing.push(retryResult);
    }
  }

  post.publishResults = existing;
  post.status = existing.some((r) => r.success) ? "published" : post.status;
  if (!post.publishedAt) post.publishedAt = new Date();

  await post.save();

  await notifyPublishResults(req.user.id, post, retryResults).catch(() => {});

  res.json({ success: true, data: { post, publishResults: existing } });
}

export async function schedulePost(req, res) {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });

  if (!post) {
    throw Errors.notFound("Post not found");
  }

  const { scheduledAt } = req.body;
  if (!scheduledAt) {
    throw Errors.badRequest("scheduledAt is required");
  }

  const scheduledDate = new Date(scheduledAt);
  if (scheduledDate <= new Date()) {
    throw Errors.badRequest("Scheduled time must be in the future");
  }

  post.status = "scheduled";
  post.scheduledAt = scheduledDate;

  await post.save();

  const scheduleLabel = scheduledDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  await createNotification(req.user.id, {
    type: "post_scheduled",
    title: "Post Scheduled",
    message: `Your post is scheduled for ${scheduleLabel}`,
    postId: post._id,
  }).catch(() => {});

  res.json({ success: true, data: { post } });
}

export async function rephraseCaption(req, res) {
  const { caption, tone, maxLength } = req.body;

  if (!caption || !caption.trim()) {
    throw Errors.badRequest("Caption is required");
  }

  if (!OPENAI_API_KEY) {
    throw Errors.badRequest(
      "AI rephrasing is not configured. Add OPENAI_API_KEY to your environment variables.",
    );
  }

  const toneInstructions = {
    professional:
      "Rewrite in a professional, polished tone. Business-appropriate but add a few relevant emojis.",
    casual:
      "Rewrite in a casual, relaxed tone like talking to a friend. Add fun relevant emojis throughout.",
    friendly:
      "Rewrite in a warm, friendly and approachable tone. Add welcoming emojis throughout.",
    witty:
      "Rewrite in a witty, clever tone with humor. Add playful emojis that match the wit.",
    bold: "Rewrite in a bold, confident, attention-grabbing tone. Add strong impactful emojis.",
    inspirational:
      "Rewrite in an inspirational, motivating tone. Add uplifting emojis throughout.",
    genz: "Rewrite in a Gen Z internet slang style — use 'no cap', 'lowkey', 'slay', 'it's giving', 'fr fr', 'based'. Keep it short, punchy, and trendy with relevant emojis.",
    sports:
      "Rewrite like an excited sports commentator — use action words, hype energy, competitive spirit. Add sports-related emojis throughout.",
    music:
      "Rewrite with musical vibes — use rhythm, flow, and melody references. Make it sound like lyrics or a music lover's caption with music emojis.",
    hype: "Rewrite with maximum hype and excitement — ALL CAPS for emphasis, lots of energy, exclamation marks, fire emojis. Make it feel like an epic announcement.",
    storyteller:
      "Rewrite as a short, captivating story or narrative — draw the reader in with vivid language, a hook, and emotional depth. Add subtle emojis.",
    sarcastic:
      "Rewrite with dry sarcasm and irony — witty, slightly roasting, tongue-in-cheek humor. Add emojis that play into the sarcasm.",
  };

  const instruction =
    toneInstructions[tone] ||
    "Rewrite this social media post to sound better while keeping the same meaning.";

  const charLimit = maxLength && maxLength > 0 ? maxLength : 500;
  const isShortenMode =
    maxLength && maxLength > 0 && caption.length > maxLength;
  const limitNote = isShortenMode
    ? `CRITICAL: The text is currently ${caption.length} characters and MUST be shortened to UNDER ${charLimit} characters. Cut aggressively — remove filler words, shorten sentences, use abbreviations. The final result MUST be ${charLimit} characters or fewer. Count every character including emojis and spaces.`
    : `You MUST keep the result strictly under ${charLimit} characters (including emojis and spaces). Count carefully.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a social media copywriter. Add relevant emojis naturally throughout the text. Ensure the rewritten text is 100% original and free of copyrighted content — no song lyrics, trademarked slogans, or quoted material. If the original references a brand, use the brand name with a hashtag (e.g. #Nike) instead of trademarked slogans. Return only the rewritten text — no quotes, no explanation. ${limitNote}`,
        },
        {
          role: "user",
          content: `${instruction}\n\nOriginal post:\n${caption}`,
        },
      ],
      max_tokens: isShortenMode ? 150 : 300,
      temperature: isShortenMode ? 0.5 : 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw Errors.badRequest(err?.error?.message || "AI service request failed");
  }

  const data = await response.json();
  const rephrased = data.choices?.[0]?.message?.content?.trim();

  if (!rephrased) {
    throw Errors.badRequest("AI returned an empty response. Try again.");
  }

  res.json({ success: true, data: { rephrased } });
}

export async function copyrightCheck(req, res) {
  const { caption, imageUrls } = req.body;

  if ((!caption || !caption.trim()) && (!imageUrls || imageUrls.length === 0)) {
    throw Errors.badRequest("Provide a caption or images to check.");
  }

  if (!OPENAI_API_KEY) {
    throw Errors.badRequest(
      "AI copyright check is not configured. Add OPENAI_API_KEY to your environment variables.",
    );
  }

  const issues = [];
  const suggestions = [];
  let brandHashtags = [];
  let safeVersion = "";

  if (caption && caption.trim()) {
    const textResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a copyright and intellectual property analysis assistant. Analyze the given social media post text for potential copyright issues.

Check for:
1. Song lyrics (even partial lines from known songs)
2. Movie or TV show quotes (verbatim or near-verbatim)
3. Book passages or poem excerpts
4. Trademarked slogans or catchphrases (e.g. "Just Do It", "I'm Lovin' It")
5. Copyrighted characters or franchise references used in a way that implies ownership
6. News article text copied verbatim
7. Brand names used with trademarked phrases

Respond ONLY with valid JSON in this exact format:
{
  "hasIssues": boolean,
  "issues": [
    {
      "type": "lyrics" | "quote" | "trademark" | "text_copy",
      "content": "the specific problematic text",
      "source": "the likely original source",
      "severity": "low" | "medium" | "high",
      "explanation": "brief explanation of why this is a concern"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "brandHashtags": ["#BrandName"],
  "safeVersion": "a copyright-free rewritten version of the post that keeps the same meaning, adds relevant emojis, and uses brand hashtags instead of trademarked slogans"
}

IMPORTANT for suggestions:
- If trademarked slogans or brand references are found, suggest using the brand as a hashtag instead (e.g. use #Nike instead of "Just Do It")
- Include ALL detected brand names as hashtags in the brandHashtags array
- Always provide a safeVersion that rewrites the text to avoid all copyright issues while keeping the same meaning

If no issues are found, return {"hasIssues": false, "issues": [], "suggestions": [], "brandHashtags": [], "safeVersion": ""}.
Be thorough but avoid false positives for common everyday phrases.`,
            },
            {
              role: "user",
              content: `Analyze this social media post for copyright concerns:\n\n${caption}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!textResponse.ok) {
      const err = await textResponse.json().catch(() => ({}));
      throw Errors.badRequest(err?.error?.message || "AI text analysis failed");
    }

    const textData = await textResponse.json();
    let textResult;
    try {
      textResult = JSON.parse(textData.choices?.[0]?.message?.content || "{}");
    } catch {
      textResult = { hasIssues: false, issues: [], suggestions: [] };
    }

    if (textResult.hasIssues && textResult.issues) {
      issues.push(...textResult.issues);
    }
    if (textResult.suggestions) {
      suggestions.push(...textResult.suggestions);
    }
    if (textResult.brandHashtags) {
      brandHashtags.push(...textResult.brandHashtags);
    }
    if (textResult.safeVersion) {
      safeVersion = textResult.safeVersion;
    }
  }

  if (imageUrls && imageUrls.length > 0) {
    const imagesToCheck = imageUrls.slice(0, 4);

    const imagePromises = imagesToCheck.map(async (url) => {
      try {
        const imgResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: `You are a visual copyright analysis assistant. Analyze images for potential copyright issues on social media platforms.

Check for:
1. Visible watermarks (stock photo sites like Getty, Shutterstock, Adobe Stock, iStock, etc.)
2. Stock photo identification markers or metadata overlays
3. Recognizable copyrighted characters (Disney, Marvel, DC, anime characters, etc.)
4. Brand logos prominently featured (not incidental background logos)
5. Known copyrighted artwork, paintings, or photographs
6. Screenshots from movies, TV shows, or video games
7. Other creators' social media content (visible usernames/watermarks from TikTok, Instagram, etc.)

Respond ONLY with valid JSON:
{
  "hasIssues": boolean,
  "issues": [
    {
      "type": "watermark" | "stock_photo" | "character" | "logo" | "artwork" | "screenshot" | "repost",
      "content": "what was detected",
      "source": "likely owner/source if identifiable",
      "severity": "low" | "medium" | "high",
      "explanation": "brief explanation"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "brandHashtags": ["#BrandName"]
}

IMPORTANT: If brand logos are detected, include them as hashtags in brandHashtags (e.g. #Nike, #Apple). Suggest mentioning the brand with a hashtag in the caption instead of showing copyrighted logos.
If no issues found, return {"hasIssues": false, "issues": [], "suggestions": [], "brandHashtags": []}.
Only flag clear issues. Do not flag generic objects, common symbols, or incidental branding.`,
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Analyze this image for copyright concerns:",
                    },
                    { type: "image_url", image_url: { url, detail: "low" } },
                  ],
                },
              ],
              max_tokens: 400,
              temperature: 0.2,
              response_format: { type: "json_object" },
            }),
          },
        );

        if (!imgResponse.ok) return null;

        const imgData = await imgResponse.json();
        try {
          return JSON.parse(imgData.choices?.[0]?.message?.content || "{}");
        } catch {
          return null;
        }
      } catch {
        return null;
      }
    });

    const imageResults = await Promise.allSettled(imagePromises);

    for (const result of imageResults) {
      if (result.status === "fulfilled" && result.value) {
        if (result.value.hasIssues) {
          issues.push(...(result.value.issues || []));
          suggestions.push(...(result.value.suggestions || []));
        }
        if (result.value.brandHashtags) {
          brandHashtags.push(...result.value.brandHashtags);
        }
      }
    }
  }

  let riskLevel = "none";
  if (issues.some((i) => i.severity === "high")) {
    riskLevel = "high";
  } else if (issues.some((i) => i.severity === "medium")) {
    riskLevel = "medium";
  } else if (issues.length > 0) {
    riskLevel = "low";
  }

  const uniqueSuggestions = [...new Set(suggestions)];
  const uniqueHashtags = [...new Set(brandHashtags)];

  res.json({
    success: true,
    data: {
      riskLevel,
      hasIssues: issues.length > 0,
      issues,
      suggestions: uniqueSuggestions,
      brandHashtags: uniqueHashtags,
      safeVersion,
    },
  });
}
