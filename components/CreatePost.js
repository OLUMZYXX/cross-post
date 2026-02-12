import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "./Toast";

// ─── helpers ─────────────────────────────────────────────────────────────────
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

// ─── Scheduling modal ─────────────────────────────────────────────────────────
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
      return; // can't schedule in the past — button will be disabled
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
            {/* handle */}
            <View className="w-10 h-1 bg-gray-700 rounded-full self-center mb-6" />

            <Text className="text-white text-lg font-bold mb-6">When do you want to post?</Text>

            {/* ── Post Now ───────────────────────────────────────────── */}
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

            {/* ── Schedule ───────────────────────────────────────────── */}
            <View className="bg-gray-800 rounded-2xl p-4">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={18} color="#60a5fa" />
                </View>
                <Text className="text-white font-bold text-base">Schedule for Later</Text>
              </View>

              {/* Date chips */}
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

              {/* Time picker */}
              <View className="flex-row items-center justify-center mb-4">
                {/* Hour */}
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

                {/* Minute */}
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

                {/* AM/PM */}
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

              {/* Confirm schedule button */}
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function CreatePost({
  connectedPlatforms,
  allPlatforms,
  onClose,
  onSaveDraft,
  initialDraft,
}) {
  const [caption, setCaption] = useState(initialDraft?.caption || "");
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    initialDraft?.platforms || [...connectedPlatforms],
  );
  const [selectedMedia, setSelectedMedia] = useState(initialDraft?.media || []);
  const [mediaType, setMediaType] = useState(initialDraft?.mediaType || null);
  const [isPosting, setIsPosting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { showToast } = useToast();

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

    for (const platform of selectedPlatforms) {
      let postType = "post";
      if (mediaType === "video") {
        postType =
          platform === "Facebook" || platform === "Instagram" ? "reel" : "video";
      }
      console.log(`Posting to ${platform} as ${postType}:`, {
        caption,
        media: selectedMedia[0] ?? null,
      });
      await new Promise((r) => setTimeout(r, 800));
    }

    setIsPosting(false);
    showToast({
      type: "success",
      title: "Post published!",
      message: `Shared to ${selectedPlatforms.join(", ")} successfully.`,
    });
    onClose();
  };

  const schedulePost = (_date, label) => {
    setShowScheduleModal(false);
    showToast({
      type: "info",
      title: "Post scheduled!",
      message: `Will publish on ${label}.`,
      duration: 4000,
    });
    onClose();
  };

  const handlePostPress = () => {
    if (!validateBeforePost()) return;
    setShowScheduleModal(true);
  };

  const handleSaveDraft = () => {
    if (!caption && selectedMedia.length === 0) {
      showToast({
        type: "warning",
        title: "Nothing to save",
        message: "Add a caption or media before saving a draft.",
      });
      return;
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
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const type = asset.type === "video" ? "video" : "image";
      setMediaType(type);
      setSelectedMedia([
        {
          type,
          uri: asset.uri,
          name: asset.fileName || `selected_${type}.${type === "image" ? "jpg" : "mp4"}`,
          width: asset.width,
          height: asset.height,
        },
      ]);
    }
  };

  const removeMedia = () => {
    setSelectedMedia([]);
    setMediaType(null);
  };

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/5" />
        <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/5" />
      </View>

      {/* Header */}
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Create Post</Text>
          <TouchableOpacity
            onPress={handlePostPress}
            disabled={isPosting}
            className={`px-5 py-2.5 rounded-xl ${isPosting ? "bg-green-500/50" : "bg-green-500"}`}
          >
            <Text className="text-gray-950 font-bold text-sm">
              {isPosting ? "Posting..." : "Post"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Caption + media card */}
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
                ) : (
                  <View className="w-full h-48 bg-gray-800 items-center justify-center">
                    <View className="w-16 h-16 rounded-full bg-gray-700 items-center justify-center mb-2">
                      <Ionicons name="play" size={32} color="#fff" />
                    </View>
                    <Text className="text-gray-400 text-xs">{selectedMedia[0].name}</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={removeMedia}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action bar */}
          <View className="flex-row items-center justify-between px-4 py-3 border-t border-gray-800">
            <Text className="text-gray-500 text-xs">{caption.length}/500</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleMediaSelect}
                className="flex-row items-center bg-gray-800 rounded-full px-4 py-2 mr-2"
              >
                <Ionicons name="images-outline" size={18} color="#4ade80" />
                <Text className="text-green-400 text-xs font-medium ml-2">Add Media</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveDraft}
                className="flex-row items-center bg-gray-800 rounded-full px-4 py-2"
              >
                <Ionicons name="bookmark-outline" size={18} color="#f59e0b" />
                <Text className="text-yellow-400 text-xs font-medium ml-2">Draft</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Platform selection */}
        <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-4">
          <Text className="text-white font-bold mb-3">Post to</Text>
          <View className="flex-row flex-wrap">
            {connectedPlatforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform);
              return (
                <TouchableOpacity
                  key={platform}
                  onPress={() => togglePlatform(platform)}
                  className={`flex-row items-center mr-2 mb-2 px-3 py-2 rounded-full border ${
                    isSelected
                      ? "bg-green-500/20 border-green-500"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <Ionicons
                    name={allPlatforms[platform].icon}
                    size={16}
                    color={isSelected ? "#22c55e" : "#9ca3af"}
                  />
                  <Text
                    className={`text-sm font-medium ml-1.5 ${
                      isSelected ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {platform}
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

        {/* Preview */}
        {selectedPlatforms.length > 0 &&
          (caption.length > 0 || selectedMedia.length > 0) && (
            <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-4">
              <Text className="text-white font-bold mb-3">Preview</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedPlatforms.map((platform) => (
                  <View key={platform} className="bg-gray-800 rounded-2xl p-4 mr-3 w-72">
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center mr-3">
                        <Ionicons name={allPlatforms[platform].icon} size={20} color="#fff" />
                      </View>
                      <View>
                        <Text className="text-white font-bold text-sm">{platform}</Text>
                        <Text className="text-gray-500 text-xs">@yourhandle</Text>
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
                ))}
              </ScrollView>
            </View>
          )}
      </ScrollView>

      {/* Schedule modal */}
      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onPostNow={publishNow}
        onSchedule={schedulePost}
      />
    </View>
  );
}