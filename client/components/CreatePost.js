import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useToast } from "./Toast";
import { postAPI, ensureServerAwake } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";
import PlatformPreview from "./PlatformPreview";
import PlatformSelector from "./PlatformSelector";

const TONE_OPTIONS = [
  { key: "professional", label: "Professional", icon: "briefcase-outline", color: "#3b82f6" },
  { key: "casual", label: "Casual", icon: "cafe-outline", color: "#f59e0b" },
  { key: "friendly", label: "Friendly", icon: "heart-outline", color: "#ec4899" },
  { key: "witty", label: "Witty", icon: "bulb-outline", color: "#a855f7" },
  { key: "bold", label: "Bold", icon: "flash-outline", color: "#ef4444" },
  { key: "inspirational", label: "Inspirational", icon: "sparkles-outline", color: "#14b8a6" },
  { key: "genz", label: "Gen Z", icon: "logo-snapchat", color: "#facc15" },
  { key: "sports", label: "Sports", icon: "football-outline", color: "#f97316" },
  { key: "music", label: "Music", icon: "musical-notes-outline", color: "#8b5cf6" },
  { key: "hype", label: "Hype", icon: "megaphone-outline", color: "#ef4444" },
  { key: "storyteller", label: "Storyteller", icon: "book-outline", color: "#06b6d4" },
  { key: "sarcastic", label: "Sarcastic", icon: "happy-outline", color: "#f472b6" },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function buildDateChips() {
  const chips = [];
  const now = new Date();
  const labels = ["Today", "Tomorrow"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    chips.push({
      label:
        labels[i] ||
        d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      date: d,
    });
  }
  return chips;
}

function ScheduleModal({ visible, onClose, onPostNow, onSchedule }) {
  const dateChips = buildDateChips();
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState("PM");

  const adjustHour = (delta) => {
    setHour((h) => {
      let next = h + delta;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      return next;
    });
  };

  const adjustMinute = (delta) => {
    setMinute((m) => {
      let next = m + delta;
      if (next < 0) next = 55;
      if (next > 55) next = 0;
      return next;
    });
  };

  const handleConfirmSchedule = () => {
    const base = new Date(dateChips[selectedDateIdx].date);
    let h = hour;
    if (ampm === "AM" && h === 12) h = 0;
    if (ampm === "PM" && h !== 12) h += 12;
    base.setHours(h, minute, 0, 0);

    if (base <= new Date()) {
      return;
    }

    const label = base.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    onSchedule(base, label);
  };

  const scheduledDate = (() => {
    const base = new Date(dateChips[selectedDateIdx].date);
    let h = hour;
    if (ampm === "AM" && h === 12) h = 0;
    if (ampm === "PM" && h !== 12) h += 12;
    base.setHours(h, minute, 0, 0);
    return base;
  })();
  const isPast = scheduledDate <= new Date();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/60 justify-end"
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View className="bg-gray-900 rounded-t-3xl px-6 pt-5 pb-10 border-t border-gray-800">
            <View className="w-10 h-1 bg-gray-700 rounded-full self-center mb-6" />

            <Text className="text-white text-lg font-bold mb-6">When do you want to post?</Text>

            <TouchableOpacity
              onPress={onPostNow}
              className="flex-row items-center bg-green-500 rounded-2xl p-4 mb-3"
            >
              <View className="w-10 h-10 rounded-full bg-green-600 items-center justify-center mr-4">
                <Ionicons name="send" size={18} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-950 font-bold text-base">Post Now</Text>
                <Text className="text-green-900 text-xs">Publish immediately to all platforms</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#14532d" />
            </TouchableOpacity>

            <View className="bg-gray-800 rounded-2xl p-4">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={18} color="#60a5fa" />
                </View>
                <Text className="text-white font-bold text-base">Schedule for Later</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
                contentContainerStyle={{ paddingRight: 8 }}
              >
                {dateChips.map((chip, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDateIdx(i)}
                    className={`mr-2 px-4 py-2 rounded-full border ${
                      selectedDateIdx === i
                        ? "bg-blue-500/20 border-blue-500"
                        : "bg-gray-700 border-gray-600"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedDateIdx === i ? "text-blue-400" : "text-gray-400"
                      }`}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="flex-row items-center justify-center mb-4">
                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => adjustHour(1)}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-up" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                  <View className="bg-gray-700 rounded-xl w-14 h-12 items-center justify-center">
                    <Text className="text-white text-xl font-bold">{pad(hour)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => adjustHour(-1)}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                <Text className="text-white text-2xl font-bold mx-2">:</Text>

                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => adjustMinute(5)}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-up" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                  <View className="bg-gray-700 rounded-xl w-14 h-12 items-center justify-center">
                    <Text className="text-white text-xl font-bold">{pad(minute)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => adjustMinute(-5)}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                <View className="ml-3 bg-gray-700 rounded-xl overflow-hidden">
                  {["AM", "PM"].map((period) => (
                    <TouchableOpacity
                      key={period}
                      onPress={() => setAmpm(period)}
                      className={`px-4 py-3 ${ampm === period ? "bg-blue-500" : ""}`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          ampm === period ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleConfirmSchedule}
                disabled={isPast}
                className={`py-3 rounded-xl items-center ${
                  isPast ? "bg-gray-700" : "bg-blue-500"
                }`}
              >
                <Text
                  className={`font-bold text-sm ${isPast ? "text-gray-500" : "text-white"}`}
                >
                  {isPast
                    ? "Pick a future time"
                    : `Schedule · ${scheduledDate.toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function CreatePost({
  connectedPlatforms,
  connectedPlatformObjects = [],
  allPlatforms,
  onClose,
  onSaveDraft,
  onPostPublished,
  initialDraft,
}) {
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
    initialDraft?.platforms || [...connectedPlatforms],
  );
  const [selectedMedia, setSelectedMedia] = useState(initialDraft?.media || []);
  const [mediaType, setMediaType] = useState(initialDraft?.mediaType || null);
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
  const { showToast } = useToast();

  const getTwitterCharLimit = () => {
    const hasTwitter = selectedPlatforms.some((p) => p.split(":")[0] === "Twitter");
    if (hasTwitter && caption.length > 280) return 280;
    return null;
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
    if (rephrasedText) {
      setCaption(rephrasedText);
    }
    setShowRephraseModal(false);
    setRephrasedText(null);
    setSelectedTone(null);
  };

  const togglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const validateBeforePost = () => {
    if (selectedPlatforms.length === 0) {
      showToast({
        type: "warning",
        title: "No platforms selected",
        message: "Please select at least one platform to post to.",
      });
      return false;
    }
    return true;
  };

  const publishNow = async () => {
    setShowScheduleModal(false);
    setIsPosting(true);

    try {
      // Ensure server is awake before posting (handles Render cold starts)
      const serverReady = await ensureServerAwake();
      if (!serverReady) {
        showToast({
          type: "error",
          title: "Server unavailable",
          message: "The server is taking too long to respond. Please try again in a moment.",
          duration: 5000,
        });
        setIsPosting(false);
        return;
      }

      const { data: createData } = await postAPI.create({
        caption,
        media: selectedMedia,
        platforms: selectedPlatforms,
        status: "draft",
      });

      const { data: publishData } = await postAPI.publish(createData.post._id);

      const results = publishData.publishResults || [];
      const succeeded = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (failed.length === 0) {
        showToast({
          type: "success",
          title: "Post published!",
          message: `Shared to ${selectedPlatforms.map((p) => getDisplayName(p)).join(", ")} successfully.`,
        });
      } else if (succeeded.length > 0) {
        showToast({
          type: "warning",
          title: "Partially published",
          message: `Published to ${succeeded.map((r) => r.platform).join(", ")}. Failed: ${failed.map((r) => r.platform).join(", ")}.`,
          duration: 5000,
        });
      } else {
        showToast({
          type: "error",
          title: "Publish failed",
          message: failed[0]?.error || "Could not publish to any platform.",
          duration: 5000,
        });
      }

      onPostPublished?.(publishData.post);
      await new Promise((r) => setTimeout(r, 3000));
      onClose();
    } catch (err) {
      showToast({
        type: "error",
        title: "Publish failed",
        message: err.message,
        duration: 5000,
      });
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
        showToast({
          type: "error",
          title: "Server unavailable",
          message: "The server is taking too long to respond. Please try again in a moment.",
          duration: 5000,
        });
        setIsPosting(false);
        return;
      }

      const { data: createData } = await postAPI.create({
        caption,
        media: selectedMedia,
        platforms: selectedPlatforms,
        status: "draft",
      });

      await postAPI.schedule(createData.post._id, date.toISOString());

      showToast({
        type: "info",
        title: "Post scheduled!",
        message: `Will publish on ${label}.`,
        duration: 4000,
      });
      onClose();
    } catch (err) {
      showToast({
        type: "error",
        title: "Scheduling failed",
        message: err.message,
        duration: 5000,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostPress = async () => {
    if (!validateBeforePost()) return;

    // Collect image URLs from uploaded media
    const imageUrls = selectedMedia
      .filter((m) => m.type === "image" && m.cloudinaryUrl)
      .map((m) => m.cloudinaryUrl);

    const hasCaption = caption && caption.trim().length > 0;
    const hasImages = imageUrls.length > 0;

    // Skip copyright check if no content to analyze
    if (!hasCaption && !hasImages) {
      setShowScheduleModal(true);
      return;
    }

    // Run copyright check
    setShowCopyrightModal(true);
    setIsCopyrightChecking(true);
    setCopyrightResult(null);

    try {
      const { data } = await postAPI.copyrightCheck(
        hasCaption ? caption : null,
        hasImages ? imageUrls : null,
      );
      setCopyrightResult(data);
    } catch {
      // On error, skip check and proceed
      showToast({
        type: "warning",
        title: "Copyright check unavailable",
        message: "Proceeding without copyright analysis.",
        duration: 2000,
      });
      setShowCopyrightModal(false);
      setShowScheduleModal(true);
    } finally {
      setIsCopyrightChecking(false);
    }
  };

  const handleCopyrightProceed = () => {
    setShowCopyrightModal(false);
    setCopyrightResult(null);
    setShowScheduleModal(true);
  };

  const handleCopyrightEdit = () => {
    setShowCopyrightModal(false);
    setCopyrightResult(null);
  };

  const handleUseSafeVersion = () => {
    if (copyrightResult?.safeVersion) {
      setCaption(copyrightResult.safeVersion);
    }
    setShowCopyrightModal(false);
    setCopyrightResult(null);
  };

  const handleSaveDraft = async () => {
    if (!caption && selectedMedia.length === 0) {
      showToast({
        type: "warning",
        title: "Nothing to save",
        message: "Add a caption or media before saving a draft.",
      });
      return;
    }

    const preserveStatus = initialDraft?.status === "scheduled" ? "scheduled" : "draft";
    const mediaUrls = selectedMedia
      .filter((m) => m.cloudinaryUrl)
      .map((m) => m.cloudinaryUrl);

    try {
      if (initialDraft?.serverId) {
        await postAPI.update(initialDraft.serverId, {
          caption,
          platforms: selectedPlatforms,
          status: preserveStatus,
          ...(mediaUrls.length > 0 && { media: mediaUrls }),
        });
      } else {
        await postAPI.create({
          caption,
          media: selectedMedia,
          platforms: selectedPlatforms,
          status: "draft",
        });
      }

      onSaveDraft?.({
        id: initialDraft?.id || Date.now(),
        caption,
        platforms: selectedPlatforms,
        media: selectedMedia,
        mediaType,
        savedAt: new Date().toLocaleString(),
      });

      const savedLabel = preserveStatus === "scheduled" ? "Scheduled post updated" : "Draft saved";
      showToast({ type: "success", title: savedLabel, message: "You can edit it later." });
      onClose();
    } catch (err) {
      onSaveDraft?.({
        id: initialDraft?.id || Date.now(),
        caption,
        platforms: selectedPlatforms,
        media: selectedMedia,
        mediaType,
        savedAt: new Date().toLocaleString(),
      });
      showToast({ type: "warning", title: "Saved locally", message: "Server unavailable, draft saved on device." });
      onClose();
    }
  };

  const handleMediaSelect = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast({
        type: "error",
        title: "Permission denied",
        message: "Camera roll access is required to add media.",
      });
      return;
    }

    // If we already have a video selected, don't allow adding more
    if (mediaType === "video") {
      showToast({
        type: "warning",
        title: "Video already selected",
        message: "Remove the video first to select different media.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === "image" ? ["images"] : ["images", "videos"],
      allowsMultipleSelection: mediaType !== "video",
      selectionLimit: 10 - selectedMedia.length,
      allowsEditing: false,
      quality: 1,
      videoMaxDuration: 300,
    });

    if (!result.canceled) {
      const assets = result.assets;

      // If any asset is a video, only allow that single video
      const hasVideo = assets.some((a) => a.type === "video");
      if (hasVideo && (assets.length > 1 || selectedMedia.length > 0)) {
        showToast({
          type: "warning",
          title: "Video must be solo",
          message: "Videos can only be posted alone, not with other media.",
        });
        return;
      }

      const newItems = [];
      for (const asset of assets) {
        const type = asset.type === "video" ? "video" : "image";

        let thumbnail = null;
        if (type === "video") {
          try {
            const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(
              asset.uri,
              { time: 500 },
            );
            thumbnail = thumbUri;
          } catch {}
        }

        newItems.push({
          type,
          uri: asset.uri,
          thumbnail,
          name: asset.fileName || `selected_${type}.${type === "image" ? "jpg" : "mp4"}`,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType,
          fileName: asset.fileName,
        });
      }

      const firstType = newItems[0].type;
      setMediaType(firstType);
      setIsUploading(true);

      // Upload all to Cloudinary in parallel
      const uploadResults = await Promise.allSettled(
        newItems.map((item) =>
          uploadToCloudinary(item.uri, item.type, item.mimeType, item.fileName),
        ),
      );

      let failCount = 0;
      uploadResults.forEach((result, i) => {
        if (result.status === "fulfilled") {
          newItems[i].cloudinaryUrl = result.value.url;
        } else {
          failCount++;
          console.warn("Cloudinary upload failed:", result.reason?.message || result.reason);
        }
      });

      if (failCount > 0) {
        showToast({
          type: "warning",
          title: "Media upload issue",
          message: `${failCount} file(s) could not be optimized. Will upload directly when posting.`,
        });
      }

      setSelectedMedia((prev) =>
        firstType === "video" ? newItems : [...prev, ...newItems],
      );
      setIsUploading(false);
    }
  };

  const removeMedia = (index) => {
    setSelectedMedia((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setMediaType(null);
      }
      return updated;
    });
    setIsUploading(false);
  };

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/5" />
        <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/5" />
      </View>

      <View className="px-5 pt-14 pb-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onClose}
            disabled={isPosting}
            className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleSaveDraft}
              disabled={isPosting}
              className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 mr-2"
            >
              <Text className="text-gray-300 font-medium text-sm">Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePostPress}
              disabled={isPosting || isUploading}
              className={`px-5 py-2.5 rounded-xl ${isPosting || isUploading ? "bg-green-500/50" : "bg-green-500"}`}
            >
              <Text className="text-gray-950 font-bold text-sm">
                {isPosting ? "Posting..." : isUploading ? "Wait..." : "Publish"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="bg-gray-900 rounded-2xl border border-gray-800/60 mb-4 overflow-hidden">
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="What do you want to share?"
            placeholderTextColor="#4b5563"
            multiline
            className="text-white text-base px-4 pt-4 pb-2 min-h-[120px]"
            textAlignVertical="top"
            editable={!isPosting}
          />
          {selectedPlatforms.some((p) => p.split(":")[0] === "Twitter") && (
            <View className="flex-row items-center px-4 pb-2">
              <View className={`h-1 flex-1 rounded-full mr-3 ${caption.length > 280 ? "bg-red-500/30" : "bg-gray-800"}`}>
                <View
                  className={`h-full rounded-full ${caption.length > 280 ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min((caption.length / 280) * 100, 100)}%` }}
                />
              </View>
              <Text
                className={`text-[11px] font-medium ${
                  caption.length > 280 ? "text-red-400" : "text-gray-600"
                }`}
              >
                {caption.length}/280
              </Text>
            </View>
          )}

          {selectedMedia.length > 0 && (
            <View className="px-4 pb-4">
              {mediaType === "video" ? (
                <View className="rounded-xl overflow-hidden bg-gray-800">
                  {selectedMedia[0].thumbnail ? (
                    <View className="w-full h-48">
                      <Image
                        source={{ uri: selectedMedia[0].thumbnail }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="w-14 h-14 rounded-full bg-black/50 items-center justify-center">
                          <Ionicons name="play" size={28} color="#fff" />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View className="w-full h-48 bg-gray-800 items-center justify-center">
                      <View className="w-14 h-14 rounded-full bg-gray-700 items-center justify-center">
                        <Ionicons name="play" size={28} color="#fff" />
                      </View>
                    </View>
                  )}
                  {isUploading && (
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                      <ActivityIndicator color="#4ade80" size="large" />
                      <Text className="text-white text-xs mt-2 font-medium">Optimizing...</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => removeMedia(0)}
                    disabled={isPosting}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 items-center justify-center"
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : selectedMedia.length === 1 ? (
                <View className="rounded-xl overflow-hidden bg-gray-800">
                  <Image
                    source={{ uri: selectedMedia[0].uri }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  {isUploading && (
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                      <ActivityIndicator color="#4ade80" size="large" />
                      <Text className="text-white text-xs mt-2 font-medium">Optimizing...</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => removeMedia(0)}
                    disabled={isPosting}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 items-center justify-center"
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 8 }}
                  >
                    {selectedMedia.map((item, index) => (
                      <View
                        key={index}
                        className="rounded-xl overflow-hidden bg-gray-800 mr-2"
                        style={{ width: 140, height: 140 }}
                      >
                        <Image
                          source={{ uri: item.uri }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removeMedia(index)}
                          disabled={isPosting}
                          className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 items-center justify-center"
                        >
                          <Ionicons name="close" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                  {isUploading && (
                    <View className="absolute inset-0 bg-black/40 rounded-xl items-center justify-center">
                      <ActivityIndicator color="#4ade80" size="large" />
                      <Text className="text-white text-xs mt-2 font-medium">Optimizing...</Text>
                    </View>
                  )}
                  <Text className="text-gray-500 text-xs mt-2">{selectedMedia.length} images selected</Text>
                </View>
              )}
            </View>
          )}

          <View className="flex-row items-center px-3 py-2.5 border-t border-gray-800/50">
            <TouchableOpacity
              onPress={handleMediaSelect}
              disabled={isPosting}
              className="flex-row items-center bg-green-500/10 rounded-lg px-3 py-2 mr-2"
            >
              <Ionicons name="image-outline" size={14} color="#4ade80" />
              <Text className="text-green-400 text-[11px] font-medium ml-1.5">Media</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!caption.trim()) {
                  showToast({ type: "warning", title: "Nothing to rephrase", message: "Write something first." });
                  return;
                }
                setRephrasedText(null);
                setSelectedTone(null);
                setShowRephraseModal(true);
              }}
              disabled={isPosting}
              className="flex-row items-center bg-purple-500/10 rounded-lg px-3 py-2 mr-2"
            >
              <Ionicons name="sparkles" size={14} color="#a855f7" />
              <Text className="text-purple-400 text-[11px] font-medium ml-1.5">AI Rephrase</Text>
            </TouchableOpacity>
            <View className="flex-1" />
            <Text className="text-gray-700 text-[10px]">{caption.length}</Text>
          </View>
        </View>

        <PlatformSelector
          connectedPlatforms={connectedPlatforms}
          selectedPlatforms={selectedPlatforms}
          onToggle={togglePlatform}
          getPlatformStyle={getPlatformStyle}
          getDisplayName={getDisplayName}
          disabled={isPosting}
        />

        <PlatformPreview
          selectedPlatforms={selectedPlatforms}
          caption={caption}
          selectedMedia={selectedMedia}
          mediaType={mediaType}
          getPlatformStyle={getPlatformStyle}
          getDisplayName={getDisplayName}
        />
      </ScrollView>

      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onPostNow={publishNow}
        onSchedule={schedulePost}
      />

      <Modal visible={showRephraseModal} transparent animationType="slide" onRequestClose={() => setShowRephraseModal(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowRephraseModal(false)}
          className="flex-1 bg-black/60 justify-end"
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View className="bg-gray-900 rounded-t-3xl px-6 pt-5 pb-10 border-t border-gray-800">
              <View className="w-10 h-1 bg-gray-700 rounded-full self-center mb-5" />
              <View className="flex-row items-center mb-5">
                <Ionicons name="sparkles" size={22} color="#a855f7" />
                <Text className="text-white text-lg font-bold ml-2">Rephrase with AI</Text>
              </View>

              <Text className="text-gray-400 text-xs mb-3">CHOOSE A TONE</Text>
              <View className="flex-row flex-wrap mb-4">
                {TONE_OPTIONS.map((tone) => (
                  <TouchableOpacity
                    key={tone.key}
                    onPress={() => handleRephrase(tone.key)}
                    disabled={isRephrasing}
                    className={`flex-row items-center mr-2 mb-2 px-3.5 py-2.5 rounded-full border ${
                      selectedTone === tone.key
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-gray-700 bg-gray-800"
                    }`}
                  >
                    <Ionicons
                      name={tone.icon}
                      size={14}
                      color={selectedTone === tone.key ? tone.color : "#9ca3af"}
                    />
                    <Text
                      className={`text-xs font-medium ml-1.5 ${
                        selectedTone === tone.key ? "text-purple-300" : "text-gray-400"
                      }`}
                    >
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {isRephrasing && (
                <View className="bg-gray-800 rounded-2xl p-5 items-center mb-4">
                  <ActivityIndicator color="#a855f7" />
                  <Text className="text-gray-400 text-xs mt-2">Rephrasing...</Text>
                </View>
              )}

              {rephrasedText && !isRephrasing && (
                <View className="mb-4">
                  <Text className="text-gray-400 text-xs mb-2">RESULT</Text>
                  <View className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                    <Text className="text-white text-sm leading-5">{rephrasedText}</Text>
                  </View>
                  <View className="flex-row mt-3">
                    <TouchableOpacity
                      onPress={applyRephrase}
                      className="flex-1 bg-purple-500 py-3 rounded-xl mr-2"
                    >
                      <Text className="text-white text-center font-bold text-sm">Use This</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRephrase(selectedTone)}
                      className="flex-1 bg-gray-800 py-3 rounded-xl border border-gray-700"
                    >
                      <Text className="text-gray-300 text-center font-bold text-sm">Try Again</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {!rephrasedText && !isRephrasing && (
                <View className="bg-gray-800/50 rounded-2xl p-4 items-center">
                  <Ionicons name="sparkles-outline" size={24} color="#6b7280" />
                  <Text className="text-gray-500 text-xs mt-2 text-center">
                    Pick a tone above to rephrase your post
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showCopyrightModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCopyrightModal(false);
          setCopyrightResult(null);
        }}
      >
        <View style={StyleSheet.absoluteFill} className="justify-end">
          <Pressable
            onPress={() => {
              if (!isCopyrightChecking) {
                setShowCopyrightModal(false);
                setCopyrightResult(null);
              }
            }}
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)" }]}
          />
          <View className="bg-gray-900 rounded-t-3xl px-6 pt-5 pb-10 border-t border-gray-800">
              <View className="w-10 h-1 bg-gray-700 rounded-full self-center mb-5" />

              <View className="flex-row items-center mb-5">
                <Ionicons name="shield-checkmark" size={22} color="#3b82f6" />
                <Text className="text-white text-lg font-bold ml-2">Copyright Check</Text>
              </View>

              {isCopyrightChecking && (
                <View className="bg-gray-800 rounded-2xl p-8 items-center">
                  <ActivityIndicator color="#3b82f6" size="large" />
                  <Text className="text-gray-400 text-sm mt-3">Analyzing your content...</Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Checking text and images for copyright issues
                  </Text>
                </View>
              )}

              {!isCopyrightChecking && copyrightResult && !copyrightResult.hasIssues && (
                <View>
                  <View className="bg-green-500/10 rounded-2xl p-5 items-center border border-green-500/20 mb-4">
                    <Ionicons name="checkmark-circle" size={48} color="#4ade80" />
                    <Text className="text-green-400 font-bold text-base mt-3">All Clear!</Text>
                    <Text className="text-gray-400 text-xs mt-1 text-center">
                      No copyright issues detected in your content
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCopyrightProceed}
                    className="bg-green-500 py-3.5 rounded-xl items-center"
                  >
                    <Text className="text-gray-950 font-bold text-sm">Continue to Post</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isCopyrightChecking && copyrightResult && copyrightResult.hasIssues && (
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  style={{ maxHeight: 400 }}
                >
                  {(() => {
                    const riskConfig = {
                      low: { color: "#4ade80", bg: "bg-green-500/20", border: "border-green-500/30", icon: "information-circle", label: "Low Risk" },
                      medium: { color: "#eab308", bg: "bg-yellow-500/20", border: "border-yellow-500/30", icon: "warning", label: "Medium Risk" },
                      high: { color: "#ef4444", bg: "bg-red-500/20", border: "border-red-500/30", icon: "alert-circle", label: "High Risk" },
                    };
                    const rc = riskConfig[copyrightResult.riskLevel] || riskConfig.low;
                    return (
                      <View
                        className={`${rc.bg} ${rc.border} border rounded-2xl p-4 flex-row items-center mb-4`}
                      >
                        <Ionicons name={rc.icon} size={24} color={rc.color} />
                        <View className="ml-3 flex-1">
                          <Text style={{ color: rc.color }} className="font-bold text-sm">
                            {rc.label}
                          </Text>
                          <Text className="text-gray-400 text-xs mt-0.5">
                            {copyrightResult.issues.length} potential issue
                            {copyrightResult.issues.length !== 1 ? "s" : ""} found
                          </Text>
                        </View>
                      </View>
                    );
                  })()}

                  <Text className="text-gray-400 text-xs mb-2 font-semibold">
                    ISSUES DETECTED
                  </Text>
                  {copyrightResult.issues.map((issue, index) => {
                    const issueTypeLabels = {
                      lyrics: "Song Lyrics",
                      quote: "Movie/TV Quote",
                      trademark: "Trademark",
                      text_copy: "Copied Text",
                      watermark: "Watermark",
                      stock_photo: "Stock Photo",
                      character: "Copyrighted Character",
                      logo: "Brand Logo",
                      artwork: "Copyrighted Artwork",
                      screenshot: "Screenshot",
                      repost: "Reposted Content",
                    };
                    return (
                      <View
                        key={index}
                        className="bg-gray-800 rounded-xl p-3.5 mb-2 border border-gray-700"
                      >
                        <View className="flex-row items-center mb-2">
                          <View
                            className={`px-2 py-0.5 rounded-full ${
                              issue.severity === "high"
                                ? "bg-red-500/20"
                                : issue.severity === "medium"
                                  ? "bg-yellow-500/20"
                                  : "bg-green-500/20"
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                issue.severity === "high"
                                  ? "text-red-400"
                                  : issue.severity === "medium"
                                    ? "text-yellow-400"
                                    : "text-green-400"
                              }`}
                            >
                              {issueTypeLabels[issue.type] || issue.type}
                            </Text>
                          </View>
                          {issue.source && (
                            <Text
                              className="text-gray-500 text-xs ml-2 flex-1"
                              numberOfLines={1}
                            >
                              {issue.source}
                            </Text>
                          )}
                        </View>
                        {issue.content && (
                          <Text className="text-white text-xs mb-1.5" numberOfLines={2}>
                            &quot;{issue.content}&quot;
                          </Text>
                        )}
                        <Text className="text-gray-400 text-xs">{issue.explanation}</Text>
                      </View>
                    );
                  })}

                  {copyrightResult.brandHashtags?.length > 0 && (
                    <View className="mt-3">
                      <Text className="text-gray-400 text-xs mb-2 font-semibold">
                        BRAND HASHTAGS
                      </Text>
                      <View className="bg-purple-500/10 rounded-xl p-3.5 border border-purple-500/20">
                        <Text className="text-gray-400 text-xs mb-2">
                          Reference these brands with hashtags instead:
                        </Text>
                        <View className="flex-row flex-wrap">
                          {copyrightResult.brandHashtags.map((tag, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => {
                                const separator = caption.length > 0 && !caption.endsWith(" ") ? " " : "";
                                setCaption((prev) => `${prev}${separator}${tag}`);
                              }}
                              className="bg-purple-500/20 rounded-full px-3 py-1.5 mr-2 mb-1.5"
                            >
                              <Text className="text-purple-300 text-xs font-bold">{tag}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}

                  {copyrightResult.suggestions?.length > 0 && (
                    <View className="mt-3">
                      <Text className="text-gray-400 text-xs mb-2 font-semibold">
                        SUGGESTIONS
                      </Text>
                      <View className="bg-blue-500/10 rounded-xl p-3.5 border border-blue-500/20">
                        {copyrightResult.suggestions.map((suggestion, index) => (
                          <View key={index} className="flex-row mb-1.5">
                            <Ionicons
                              name="bulb-outline"
                              size={14}
                              color="#60a5fa"
                              style={{ marginTop: 1 }}
                            />
                            <Text className="text-gray-300 text-xs ml-2 flex-1">
                              {suggestion}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {copyrightResult.safeVersion ? (
                    <View className="mt-3">
                      <Text className="text-gray-400 text-xs mb-2 font-semibold">
                        SAFE VERSION
                      </Text>
                      <View className="bg-green-500/10 rounded-xl p-3.5 border border-green-500/20 mb-4">
                        <Text className="text-gray-200 text-xs leading-5">
                          {copyrightResult.safeVersion}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={handleUseSafeVersion}
                        className="bg-green-500 py-3.5 rounded-xl items-center mb-2"
                      >
                        <Text className="text-gray-950 font-bold text-sm">
                          Use Safe Version
                        </Text>
                      </TouchableOpacity>
                      <View className="flex-row">
                        <TouchableOpacity
                          onPress={handleCopyrightEdit}
                          className="flex-1 bg-blue-500 py-3.5 rounded-xl mr-2 items-center"
                        >
                          <Text className="text-white font-bold text-sm">Edit Myself</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleCopyrightProceed}
                          className="flex-1 bg-gray-800 py-3.5 rounded-xl border border-gray-700 items-center"
                        >
                          <Text className="text-gray-300 font-bold text-sm">Post Anyway</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row mt-4">
                      <TouchableOpacity
                        onPress={handleCopyrightEdit}
                        className="flex-1 bg-blue-500 py-3.5 rounded-xl mr-2 items-center"
                      >
                        <Text className="text-white font-bold text-sm">Edit Content</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCopyrightProceed}
                        className="flex-1 bg-gray-800 py-3.5 rounded-xl border border-gray-700 items-center"
                      >
                        <Text className="text-gray-300 font-bold text-sm">Post Anyway</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {copyrightResult.riskLevel === "high" && (
                    <Text className="text-red-400/70 text-xs text-center mt-2">
                      Posting copyrighted content may result in account strikes or takedowns
                    </Text>
                  )}
                </ScrollView>
              )}
            </View>
        </View>
      </Modal>
    </View>
  );
}
