import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../components/Toast";
import { postAPI, ensureServerAwake } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";
import { addPending, removePending } from "../services/pendingPublishes";
import { TWITTER_CHAR_LIMIT } from "../components/platformLimits";
import { applyFont } from "../utils/unicodeFonts";
import { getPerPlatformEnabled } from "../constants/composePrefs";

const SELECTED_PLATFORMS_KEY = "@crosspost_selected_platforms";
const SELECTED_FONT_KEY = "@crosspost_selected_font";

export default function useCreatePost({
  connectedPlatforms,
  connectedPlatformObjects,
  allPlatforms,
  initialDraft,
  onClose,
  onSaveDraft,
  onPostPublished,
}) {
  const { showToast } = useToast();

  const getPlatformStyle = (identifier) => {
    const baseName = identifier.split(":")[0];
    return allPlatforms[baseName] || allPlatforms[identifier] || {};
  };

  const getPlatformUsername = (platformName) => {
    const obj = connectedPlatformObjects.find((p) => p.name === platformName);
    return obj?.platformUsername || null;
  };

  const getDisplayName = (identifier) => {
    return getPlatformUsername(identifier) || identifier.split(":")[0];
  };

  const [caption, setCaption] = useState(initialDraft?.caption || "");
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    initialDraft?.platforms || [],
  );
  const [platformsHydrated, setPlatformsHydrated] = useState(
    !!initialDraft?.platforms,
  );
  const [selectedMedia, setSelectedMedia] = useState(initialDraft?.media || []);
  const [mediaType, setMediaType] = useState(initialDraft?.mediaType || null);

  useEffect(() => {
    if (platformsHydrated) return;
    if (connectedPlatforms.length === 0) return;
    let cancelled = false;
    AsyncStorage.getItem(SELECTED_PLATFORMS_KEY)
      .then((raw) => {
        if (cancelled) return;
        let next = [...connectedPlatforms];
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const filtered = parsed.filter((p) => connectedPlatforms.includes(p));
              if (filtered.length > 0) next = filtered;
            }
          } catch {}
        }
        setSelectedPlatforms(next);
        setPlatformsHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedPlatforms([...connectedPlatforms]);
        setPlatformsHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [connectedPlatforms, platformsHydrated]);

  useEffect(() => {
    if (!platformsHydrated || initialDraft?.platforms) return;
    AsyncStorage.setItem(
      SELECTED_PLATFORMS_KEY,
      JSON.stringify(selectedPlatforms),
    ).catch(() => {});
  }, [selectedPlatforms, platformsHydrated, initialDraft]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRephraseModal, setShowRephraseModal] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [rephrasedText, setRephrasedText] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [isCopyrightChecking, setIsCopyrightChecking] = useState(false);
  const [copyrightResult, setCopyrightResult] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [selectedFont, setSelectedFont] = useState("plain");
  const [perPlatformEnabled, setPerPlatformEnabled] = useState(false);
  const [perPlatformCaptions, setPerPlatformCaptions] = useState({});
  const [showPerPlatformModal, setShowPerPlatformModal] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SELECTED_FONT_KEY)
      .then((stored) => {
        if (stored) setSelectedFont(stored);
      })
      .catch(() => {});
    getPerPlatformEnabled().then(setPerPlatformEnabled);
  }, []);

  const handleCaptionChange = (text) => {
    setCaption(
      selectedFont && selectedFont !== "plain"
        ? applyFont(text, selectedFont)
        : text,
    );
    setPerPlatformCaptions((prev) => (Object.keys(prev).length ? {} : prev));
  };

  const generatePerPlatform = async () => {
    if (!caption.trim()) {
      showToast({ type: "warning", title: "Nothing to tailor", message: "Write something first." });
      return;
    }
    if (selectedPlatforms.length === 0) {
      showToast({ type: "warning", title: "No platforms", message: "Select platforms first." });
      return;
    }
    setIsTailoring(true);
    setShowPerPlatformModal(true);
    try {
      const { data } = await postAPI.rephraseMulti(caption, selectedPlatforms);
      setPerPlatformCaptions(data.captions || {});
    } catch (err) {
      showToast({ type: "error", title: "Tailoring failed", message: err.message });
      setShowPerPlatformModal(false);
    } finally {
      setIsTailoring(false);
    }
  };

  const updatePerPlatformCaption = (base, text) =>
    setPerPlatformCaptions((prev) => ({ ...prev, [base]: text }));

  const selectFont = (key) => {
    setSelectedFont(key);
    AsyncStorage.setItem(SELECTED_FONT_KEY, key).catch(() => {});
    setCaption((prev) => applyFont(prev, key));
  };

  useEffect(() => {
    if (isPosting || isUploading) {
      activateKeepAwakeAsync("publishing").catch(() => {});
    } else {
      deactivateKeepAwake("publishing");
    }
    return () => deactivateKeepAwake("publishing");
  }, [isPosting, isUploading]);

  const hasTwitterSelected = selectedPlatforms.some((p) => p.split(":")[0] === "Twitter");

  const getTwitterCharLimit = () => {
    if (hasTwitterSelected && caption.length > TWITTER_CHAR_LIMIT)
      return TWITTER_CHAR_LIMIT;
    return null;
  };

  const handleShortenForTwitter = async () => {
    const textToShorten = rephrasedText || caption;
    if (!textToShorten.trim()) return;
    setIsRephrasing(true);
    try {
      const { data } = await postAPI.rephrase(textToShorten, selectedTone || "casual", TWITTER_CHAR_LIMIT);
      setRephrasedText(data.rephrased);
    } catch (err) {
      showToast({ type: "error", title: "Shorten failed", message: err.message });
    } finally {
      setIsRephrasing(false);
    }
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
  };

  const handleRephrase = async (tone) => {
    if (!caption.trim()) {
      showToast({ type: "warning", title: "Nothing to rephrase", message: "Write something first." });
      return;
    }
    setSelectedTone(tone);
    setIsRephrasing(true);
    setRephrasedText(null);
    try {
      const maxLength = getTwitterCharLimit();
      const { data } = await postAPI.rephrase(caption, tone, maxLength);
      setRephrasedText(data.rephrased);
    } catch (err) {
      showToast({ type: "error", title: "Rephrase failed", message: err.message });
    } finally {
      setIsRephrasing(false);
    }
  };

  const applyRephrase = () => {
    if (rephrasedText) handleCaptionChange(rephrasedText);
    setShowRephraseModal(false);
    setRephrasedText(null);
    setSelectedTone(null);
  };

  const openRephraseModal = () => {
    if (!caption.trim()) {
      showToast({ type: "warning", title: "Nothing to rephrase", message: "Write something first." });
      return;
    }
    setRephrasedText(null);
    setSelectedTone(null);
    setShowRephraseModal(true);
  };

  const publishNow = async () => {
    setShowScheduleModal(false);
    setIsPosting(true);
    let pendingPostId = null;
    try {
      const serverReady = await ensureServerAwake();
      if (!serverReady) {
        showToast({ type: "error", title: "Server unavailable", message: "Please try again in a moment.", duration: 5000 });
        setIsPosting(false);
        return;
      }
      const { data: createData } = await postAPI.create({
        caption, media: selectedMedia, platforms: selectedPlatforms, status: "draft",
        ...(Object.keys(perPlatformCaptions).length && { platformCaptions: perPlatformCaptions }),
      });
      pendingPostId = createData.post._id;
      await addPending(pendingPostId, {
        caption: (caption || "").slice(0, 80),
        platformCount: selectedPlatforms.length,
      });

      const { data: publishData } = await postAPI.publish(pendingPostId);
      await removePending(pendingPostId);
      const results = publishData.publishResults || [];
      const succeeded = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (failed.length === 0) {
        showToast({ type: "success", title: "Post published!", message: `Shared to ${selectedPlatforms.map(getDisplayName).join(", ")}.` });
      } else if (succeeded.length > 0) {
        showToast({ type: "warning", title: "Partially published", message: `Failed: ${failed.map((r) => r.platform).join(", ")}.`, duration: 5000 });
      } else {
        showToast({ type: "error", title: "Publish failed", message: failed[0]?.error || "Could not publish.", duration: 5000 });
      }
      onPostPublished?.(publishData.post);
      await new Promise((r) => setTimeout(r, 3000));
      onClose();
    } catch (err) {
      if (pendingPostId) {
        showToast({
          type: "warning",
          title: "Finishing in background",
          message: "We'll keep sending and update you when it's live.",
          duration: 4000,
        });
        onClose();
      } else {
        showToast({ type: "error", title: "Publish failed", message: err.message, duration: 5000 });
      }
    } finally {
      setIsPosting(false);
    }
  };

  const schedulePost = async (date, label) => {
    setShowScheduleModal(false);
    setIsPosting(true);
    try {
      const serverReady = await ensureServerAwake();
      if (!serverReady) {
        showToast({ type: "error", title: "Server unavailable", message: "Please try again in a moment.", duration: 5000 });
        setIsPosting(false);
        return;
      }
      const { data: createData } = await postAPI.create({
        caption, media: selectedMedia, platforms: selectedPlatforms, status: "draft",
        ...(Object.keys(perPlatformCaptions).length && { platformCaptions: perPlatformCaptions }),
      });
      await postAPI.schedule(createData.post._id, date.toISOString());
      showToast({ type: "info", title: "Post scheduled!", message: `Will publish on ${label}.`, duration: 4000 });
      onClose();
    } catch (err) {
      showToast({ type: "error", title: "Scheduling failed", message: err.message, duration: 5000 });
    } finally {
      setIsPosting(false);
    }
  };

  const runCopyrightCheck = async () => {
    const imageUrls = selectedMedia.filter((m) => m.type === "image" && m.cloudinaryUrl).map((m) => m.cloudinaryUrl);
    const hasCaption = caption?.trim().length > 0;
    const hasImages = imageUrls.length > 0;

    setShowCopyrightModal(true);
    setIsCopyrightChecking(true);
    setCopyrightResult(null);
    try {
      const { data } = await postAPI.copyrightCheck(hasCaption ? caption : null, hasImages ? imageUrls : null);
      setCopyrightResult(data);
    } catch {
      showToast({ type: "warning", title: "Copyright check unavailable", message: "Proceeding without analysis.", duration: 2000 });
      setShowCopyrightModal(false);
      setShowScheduleModal(true);
    } finally {
      setIsCopyrightChecking(false);
    }
  };

  const handlePostPress = async () => {
    if (selectedPlatforms.length === 0) {
      showToast({ type: "warning", title: "No platforms selected", message: "Select at least one platform." });
      return;
    }
    if (hasTwitterSelected && caption.length > TWITTER_CHAR_LIMIT) {
      showToast({
        type: "warning",
        title: "Too long for Twitter/X",
        message: `${caption.length}/${TWITTER_CHAR_LIMIT} characters. Tap Rephrase → "Shorten for Twitter", or unselect Twitter/X.`,
        duration: 5000,
      });
      return;
    }
    const imageUrls = selectedMedia.filter((m) => m.type === "image" && m.cloudinaryUrl).map((m) => m.cloudinaryUrl);
    const hasCaption = caption?.trim().length > 0;
    const hasImages = imageUrls.length > 0;
    if (!hasCaption && !hasImages) { setShowScheduleModal(true); return; }

    if (hasCaption) {
      try {
        const { data } = await postAPI.duplicateCheck(caption);
        if (data.duplicate) {
          setDuplicateInfo(data.existingPost);
          setShowDuplicateModal(true);
          return;
        }
      } catch {}
    }

    await runCopyrightCheck();
  };

  const handleDuplicateProceed = async () => {
    setShowDuplicateModal(false);
    setDuplicateInfo(null);
    await runCopyrightCheck();
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setDuplicateInfo(null);
  };

  const handleCopyrightProceed = () => { setShowCopyrightModal(false); setCopyrightResult(null); setShowScheduleModal(true); };
  const handleCopyrightEdit = () => { setShowCopyrightModal(false); setCopyrightResult(null); };
  const handleUseSafeVersion = () => {
    if (copyrightResult?.safeVersion) handleCaptionChange(copyrightResult.safeVersion);
    setShowCopyrightModal(false);
    setCopyrightResult(null);
  };
  const handleAddHashtag = (tag) => {
    const separator = caption.length > 0 && !caption.endsWith(" ") ? " " : "";
    setCaption((prev) => `${prev}${separator}${tag}`);
  };

  const handleSaveDraft = async () => {
    if (!caption && selectedMedia.length === 0) {
      showToast({ type: "warning", title: "Nothing to save", message: "Add a caption or media first." });
      return;
    }
    const preserveStatus = initialDraft?.status === "scheduled" ? "scheduled" : "draft";
    const mediaUrls = selectedMedia.filter((m) => m.cloudinaryUrl).map((m) => m.cloudinaryUrl);
    try {
      if (initialDraft?.serverId) {
        await postAPI.update(initialDraft.serverId, {
          caption, platforms: selectedPlatforms, status: preserveStatus,
          ...(mediaUrls.length > 0 && { media: mediaUrls }),
        });
      } else {
        await postAPI.create({ caption, media: selectedMedia, platforms: selectedPlatforms, status: "draft" });
      }
      onSaveDraft?.({ id: initialDraft?.id || Date.now(), caption, platforms: selectedPlatforms, media: selectedMedia, mediaType, savedAt: new Date().toLocaleString() });
      showToast({ type: "success", title: preserveStatus === "scheduled" ? "Scheduled post updated" : "Draft saved", message: "You can edit it later." });
      onClose();
    } catch {
      onSaveDraft?.({ id: initialDraft?.id || Date.now(), caption, platforms: selectedPlatforms, media: selectedMedia, mediaType, savedAt: new Date().toLocaleString() });
      showToast({ type: "warning", title: "Saved locally", message: "Server unavailable, draft saved on device." });
      onClose();
    }
  };

  const handleMediaSelect = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast({ type: "error", title: "Permission denied", message: "Camera roll access is required." });
      return;
    }
    if (mediaType === "video") {
      showToast({ type: "warning", title: "Video already selected", message: "Remove the video first." });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === "image" ? ["images"] : ["images", "videos"],
      allowsMultipleSelection: mediaType !== "video",
      selectionLimit: 10 - selectedMedia.length,
      allowsEditing: false, quality: 1, videoMaxDuration: 300,
    });
    if (result.canceled) return;

    const assets = result.assets;
    const hasVideo = assets.some((a) => a.type === "video");
    if (hasVideo && (assets.length > 1 || selectedMedia.length > 0)) {
      showToast({ type: "warning", title: "Video must be solo", message: "Videos can only be posted alone." });
      return;
    }

    const newItems = [];
    for (const asset of assets) {
      const type = asset.type === "video" ? "video" : "image";
      let thumbnail = null;
      if (type === "video") {
        try { const { uri } = await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 500 }); thumbnail = uri; } catch {}
      }
      newItems.push({ type, uri: asset.uri, thumbnail, name: asset.fileName || `selected_${type}.${type === "image" ? "jpg" : "mp4"}`, width: asset.width, height: asset.height, mimeType: asset.mimeType, fileName: asset.fileName });
    }

    const firstType = newItems[0].type;
    setMediaType(firstType);
    setIsUploading(true);
    const uploadResults = await Promise.allSettled(newItems.map((item) => uploadToCloudinary(item.uri, item.type, item.mimeType, item.fileName)));
    let failCount = 0;
    uploadResults.forEach((r, i) => { if (r.status === "fulfilled") { newItems[i].cloudinaryUrl = r.value.url; } else { failCount++; } });
    if (failCount > 0) showToast({ type: "warning", title: "Media upload issue", message: `${failCount} file(s) could not be optimized.` });
    setSelectedMedia((prev) => firstType === "video" ? newItems : [...prev, ...newItems]);
    setIsUploading(false);
  };

  const applyScorecard = (url) => {
    setMediaType("image");
    setSelectedMedia([
      { type: "image", uri: url, cloudinaryUrl: url, name: "scorecard.jpg" },
    ]);
  };

  const removeMedia = (index) => {
    setSelectedMedia((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setMediaType(null);
      return updated;
    });
    setIsUploading(false);
  };

  return {
    caption, setCaption, selectedPlatforms, selectedMedia, mediaType,
    isUploading, isPosting,
    showScheduleModal, setShowScheduleModal,
    showRephraseModal, setShowRephraseModal,
    isRephrasing, rephrasedText, selectedTone,
    showCopyrightModal, setShowCopyrightModal,
    isCopyrightChecking, copyrightResult,
    showDuplicateModal, setShowDuplicateModal, duplicateInfo,
    selectedFont, selectFont, handleCaptionChange,
    getPlatformStyle, getDisplayName, togglePlatform, hasTwitterSelected,
    handleRephrase, applyRephrase, openRephraseModal, handleShortenForTwitter,
    publishNow, schedulePost, handlePostPress,
    handleDuplicateProceed, handleDuplicateCancel,
    handleCopyrightProceed, handleCopyrightEdit, handleUseSafeVersion, handleAddHashtag,
    handleSaveDraft, handleMediaSelect, removeMedia, applyScorecard,
    perPlatformEnabled, perPlatformCaptions, showPerPlatformModal,
    setShowPerPlatformModal, isTailoring, generatePerPlatform,
    updatePerPlatformCaption,
  };
}
