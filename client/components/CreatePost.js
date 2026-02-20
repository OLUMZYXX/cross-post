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
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useToast } from "./Toast";
import { postAPI, ensureServerAwake } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";

const TONE_OPTIONS = [
  { key: "professional", label: "Professional", icon: "briefcase-outline", color: "#3b82f6" },
  { key: "casual", label: "Casual", icon: "cafe-outline", color: "#f59e0b" },
  { key: "friendly", label: "Friendly", icon: "heart-outline", color: "#ec4899" },
  { key: "witty", label: "Witty", icon: "bulb-outline", color: "#a855f7" },
  { key: "bold", label: "Bold", icon: "flash-outline", color: "#ef4444" },
  { key: "inspirational", label: "Inspirational", icon: "sparkles-outline", color: "#14b8a6" },
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
  const { showToast } = useToast();

  const handleRephrase = async (tone) => {
    if (!caption.trim()) {
      showToast({ type: "warning", title: "Nothing to rephrase", message: "Write something first." });
      return;
    }
    setSelectedTone(tone);
    setIsRephrasing(true);
    setRephrasedText(null);
    try {
      const { data } = await postAPI.rephrase(caption, tone);
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
      console.log("[Publish] Waking up server...");
      const serverReady = await ensureServerAwake();
      if (!serverReady) {
        console.log("[Publish] Server did not respond to health check");
        showToast({
          type: "error",
          title: "Server unavailable",
          message: "The server is taking too long to respond. Please try again in a moment.",
          duration: 5000,
        });
        setIsPosting(false);
        return;
      }
      console.log("[Publish] Server is awake, creating post...");

      const { data: createData } = await postAPI.create({
        caption,
        media: selectedMedia,
        platforms: selectedPlatforms,
        status: "draft",
      });
      console.log("[Publish] Post created:", createData.post._id);

      const { data: publishData } = await postAPI.publish(createData.post._id);
      console.log("[Publish] Publish results:", JSON.stringify(publishData.publishResults));

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
      onClose();
    } catch (err) {
      console.log("[Publish] Error:", err.code, err.message, err.status);
      showToast({
        type: "error",
        title: "Publish failed",
        message: `${err.message}${err.code ? ` (${err.code})` : ""}`,
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
      console.log("[Schedule] Waking up server...");
      const serverReady = await ensureServerAwake();
      if (!serverReady) {
        console.log("[Schedule] Server did not respond to health check");
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
      console.log("[Schedule] Error:", err.code, err.message, err.status);
      showToast({
        type: "error",
        title: "Scheduling failed",
        message: `${err.message}${err.code ? ` (${err.code})` : ""}`,
        duration: 5000,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostPress = () => {
    if (!validateBeforePost()) return;
    setShowScheduleModal(true);
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

    try {
      if (initialDraft?.serverId) {
        await postAPI.update(initialDraft.serverId, {
          caption,
          media: selectedMedia,
          platforms: selectedPlatforms,
          status: "draft",
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

      showToast({ type: "success", title: "Draft saved", message: "You can edit it later." });
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const type = asset.type === "video" ? "video" : "image";

      // Generate thumbnail for videos
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

      const mediaItem = {
        type,
        uri: asset.uri,
        thumbnail,
        name: asset.fileName || `selected_${type}.${type === "image" ? "jpg" : "mp4"}`,
        width: asset.width,
        height: asset.height,
      };

      setMediaType(type);
      setIsUploading(true);

      // Upload to Cloudinary for optimization
      try {
        const { url } = await uploadToCloudinary(asset.uri, type, asset.mimeType, asset.fileName);
        mediaItem.cloudinaryUrl = url;
      } catch {
        // Cloudinary upload failed — keep local URI as fallback
      }

      setSelectedMedia([mediaItem]);
      setIsUploading(false);
    }
  };

  const removeMedia = () => {
    setSelectedMedia([]);
    setMediaType(null);
    setIsUploading(false);
  };

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/5" />
        <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/5" />
      </View>

      <View className="px-6 pt-16 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onClose}
            disabled={isPosting}
            className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Create Post</Text>
          <TouchableOpacity
            onPress={handlePostPress}
            disabled={isPosting || isUploading}
            className={`px-5 py-2.5 rounded-xl ${isPosting || isUploading ? "bg-green-500/50" : "bg-green-500"}`}
          >
            <Text className="text-gray-950 font-bold text-sm">
              {isPosting ? "Posting..." : isUploading ? "Uploading..." : "Post"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="bg-gray-900/80 rounded-2xl border border-gray-800 mb-4 overflow-hidden">
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="What's on your mind?"
            placeholderTextColor="#6b7280"
            multiline
            className="text-white text-base p-4 min-h-[140px]"
            textAlignVertical="top"
            maxLength={500}
            editable={!isPosting}
          />

          {selectedMedia.length > 0 && (
            <View className="px-4 pb-4">
              <View className="rounded-xl overflow-hidden bg-gray-800">
                {mediaType === "image" ? (
                  <Image
                    source={{ uri: selectedMedia[0].uri }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                ) : selectedMedia[0].thumbnail ? (
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
                  onPress={removeMedia}
                  disabled={isPosting}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View className="flex-row items-center justify-between px-4 py-3 border-t border-gray-800">
            <Text className="text-gray-500 text-xs">{caption.length}/500</Text>
            <View className="flex-row items-center">
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
                className="flex-row items-center bg-purple-500/20 rounded-full px-4 py-2 mr-2"
              >
                <Ionicons name="sparkles" size={18} color="#a855f7" />
                <Text className="text-purple-400 text-xs font-medium ml-2">Rephrase</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMediaSelect}
                disabled={isPosting}
                className="flex-row items-center bg-gray-800 rounded-full px-4 py-2 mr-2"
              >
                <Ionicons name="images-outline" size={18} color="#4ade80" />
                <Text className="text-green-400 text-xs font-medium ml-2">Media</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveDraft}
                disabled={isPosting}
                className="flex-row items-center bg-gray-800 rounded-full px-4 py-2"
              >
                <Ionicons name="bookmark-outline" size={18} color="#f59e0b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-4">
          <Text className="text-white font-bold mb-3">Post to</Text>
          <View className="flex-row flex-wrap">
            {connectedPlatforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform);
              const style = getPlatformStyle(platform);
              return (
                <TouchableOpacity
                  key={platform}
                  onPress={() => togglePlatform(platform)}
                  disabled={isPosting}
                  className={`flex-row items-center mr-2 mb-2 px-3 py-2 rounded-full border ${
                    isSelected
                      ? "bg-green-500/20 border-green-500"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <Ionicons
                    name={style.icon || "globe-outline"}
                    size={16}
                    color={isSelected ? "#22c55e" : "#9ca3af"}
                  />
                  <Text
                    className={`text-sm font-medium ml-1.5 ${
                      isSelected ? "text-green-400" : "text-gray-400"
                    }`}
                    numberOfLines={1}
                  >
                    {getDisplayName(platform)}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color="#22c55e" style={{ marginLeft: 6 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedPlatforms.length === 0 && (
            <Text className="text-red-400 text-xs mt-2">Select at least one platform</Text>
          )}
        </View>

        {selectedPlatforms.length > 0 &&
          (caption.length > 0 || selectedMedia.length > 0) && (
            <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-4">
              <Text className="text-white font-bold mb-3">Preview</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedPlatforms.map((platform) => {
                  const style = getPlatformStyle(platform);
                  return (
                  <View key={platform} className="bg-gray-800 rounded-2xl p-4 mr-3 w-72">
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center mr-3">
                        <Ionicons name={style.icon || "globe-outline"} size={20} color="#fff" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold text-sm" numberOfLines={1}>
                          {getDisplayName(platform)}
                        </Text>
                        <Text className="text-gray-500 text-xs">{platform.split(":")[0]}</Text>
                      </View>
                    </View>
                    {caption.length > 0 && (
                      <Text className="text-gray-300 text-sm mb-3" numberOfLines={3}>
                        {caption}
                      </Text>
                    )}
                    {selectedMedia.length > 0 && (
                      <View className="bg-gray-700 rounded-xl h-32 items-center justify-center overflow-hidden">
                        {mediaType === "image" ? (
                          <Image
                            source={{ uri: selectedMedia[0].uri }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : selectedMedia[0].thumbnail ? (
                          <View className="w-full h-full">
                            <Image
                              source={{ uri: selectedMedia[0].thumbnail }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                            <View className="absolute inset-0 items-center justify-center">
                              <View className="w-10 h-10 rounded-full bg-black/50 items-center justify-center">
                                <Ionicons name="play" size={20} color="#fff" />
                              </View>
                            </View>
                          </View>
                        ) : (
                          <View className="items-center">
                            <Ionicons name="videocam" size={36} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs mt-1">Video</Text>
                          </View>
                        )}
                      </View>
                    )}
                    <View className="flex-row mt-3 pt-3 border-t border-gray-700">
                      <Text className="text-gray-500 text-xs mr-4">❤️ Like</Text>
                      <Text className="text-gray-500 text-xs mr-4">💬 Comment</Text>
                      <Text className="text-gray-500 text-xs">🔄 Share</Text>
                    </View>
                  </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
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
    </View>
  );
}
