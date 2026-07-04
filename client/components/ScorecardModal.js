import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { useToast } from "./Toast";
import { scorecardAPI } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";

export default function ScorecardModal({ visible, onClose, user, baseImageUrl, onApply }) {
  const { showToast } = useToast();
  const [hasTemplate, setHasTemplate] = useState(!!user?.scorecardTemplate?.publicId);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleUploadTemplate = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast({ type: "error", title: "Permission denied", message: "Photo access is required." });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(asset.uri, "image", asset.mimeType, asset.fileName, { skipWatermark: true });
      await scorecardAPI.saveTemplate({ publicId: uploaded.publicId, url: uploaded.url });
      setHasTemplate(true);
      showToast({ type: "success", title: "Template saved", message: "Now enter the match details." });
    } catch (err) {
      showToast({ type: "error", title: "Upload failed", message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleApply = async () => {
    if (!baseImageUrl) {
      showToast({ type: "warning", title: "Add a photo", message: "Attach a match image first." });
      return;
    }
    if (homeScore === "" || awayScore === "") {
      showToast({ type: "warning", title: "Enter scores", message: "Both scores are required." });
      return;
    }
    setApplying(true);
    try {
      const { data } = await scorecardAPI.compose({
        imageUrl: baseImageUrl,
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        homeScore: homeScore.trim(),
        awayScore: awayScore.trim(),
      });
      if (!data.homeBadgeFound || !data.awayBadgeFound) {
        showToast({ type: "info", title: "Some badges not found", message: "Check the exact team names for missing crests." });
      }
      onApply(data.url);
      showToast({ type: "success", title: "Scorecard applied", message: "Added to your post." });
      onClose();
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    } finally {
      setApplying(false);
    }
  };

  const colors = getColors();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-1 justify-end bg-ink/60">
          <View className="bg-paper rounded-t-3xl px-6 pt-5 pb-8 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-ink text-xl font-serif-bold">Full-Time Scorecard</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {!hasTemplate ? (
                <View className="items-center py-4">
                  <Text className="text-ink-muted text-sm text-center mb-4 leading-5">
                    Upload your scorecard template once (PNG). It&apos;s reused for every match.
                  </Text>
                  <TouchableOpacity
                    onPress={handleUploadTemplate}
                    disabled={uploading}
                    className="flex-row items-center bg-olive rounded-xl px-6 py-3"
                  >
                    {uploading ? (
                      <ActivityIndicator color={colors.paperLight} />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={18} color={colors.paperLight} />
                        <Text className="text-paper-light font-sans-bold text-sm ml-2">Upload template</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text className="text-ink-muted text-xs mb-2 ml-1">HOME TEAM</Text>
                  <View className="flex-row gap-2 mb-4">
                    <TextInput
                      value={homeTeam}
                      onChangeText={setHomeTeam}
                      placeholder="e.g. Arsenal"
                      placeholderTextColor={colors.inkSoft}
                      className="flex-1 bg-paper-deep border border-rule rounded-xl px-4 py-3 text-ink"
                    />
                    <TextInput
                      value={homeScore}
                      onChangeText={setHomeScore}
                      placeholder="0"
                      placeholderTextColor={colors.inkSoft}
                      keyboardType="number-pad"
                      maxLength={2}
                      className="w-16 bg-paper-deep border border-rule rounded-xl px-4 py-3 text-ink text-center"
                    />
                  </View>

                  <Text className="text-ink-muted text-xs mb-2 ml-1">AWAY TEAM</Text>
                  <View className="flex-row gap-2 mb-6">
                    <TextInput
                      value={awayTeam}
                      onChangeText={setAwayTeam}
                      placeholder="e.g. Chelsea"
                      placeholderTextColor={colors.inkSoft}
                      className="flex-1 bg-paper-deep border border-rule rounded-xl px-4 py-3 text-ink"
                    />
                    <TextInput
                      value={awayScore}
                      onChangeText={setAwayScore}
                      placeholder="0"
                      placeholderTextColor={colors.inkSoft}
                      keyboardType="number-pad"
                      maxLength={2}
                      className="w-16 bg-paper-deep border border-rule rounded-xl px-4 py-3 text-ink text-center"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleApply}
                    disabled={applying}
                    className={`py-3.5 rounded-xl ${applying ? "bg-olive/40" : "bg-olive"}`}
                  >
                    {applying ? (
                      <ActivityIndicator color={colors.paperLight} />
                    ) : (
                      <Text className="text-paper-light text-center font-sans-bold text-sm">Apply scorecard</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleUploadTemplate} disabled={uploading} className="py-3 mt-1">
                    <Text className="text-ink-muted text-center text-xs">Replace template</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
