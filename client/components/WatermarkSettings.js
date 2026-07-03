import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { useToast } from "./Toast";
import { authAPI } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";

const POSITIONS = [
  { key: "top-left", icon: "arrow-up", label: "Top left" },
  { key: "top-right", icon: "arrow-up", label: "Top right" },
  { key: "bottom-left", icon: "arrow-down", label: "Bottom left" },
  { key: "bottom-right", icon: "arrow-down", label: "Bottom right" },
];

const SIZES = [
  { label: "Small", value: 12 },
  { label: "Medium", value: 18 },
  { label: "Large", value: 26 },
];

const OPACITIES = [
  { label: "Light", value: 60 },
  { label: "Medium", value: 85 },
  { label: "Full", value: 100 },
];

const CORNER_STYLE = {
  "top-left": { top: 10, left: 10 },
  "top-right": { top: 10, right: 10 },
  "bottom-left": { bottom: 10, left: 10 },
  "bottom-right": { bottom: 10, right: 10 },
};

function Chip({ active, label, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-2.5 rounded-xl border ${active ? "bg-olive/15 border-olive" : "bg-paper-deep border-rule"}`}
    >
      <Text className={`text-center text-xs font-sans-semibold ${active ? "text-olive" : "text-ink-muted"}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function WatermarkSettings({ user, onBack, onUpdateUser }) {
  const { showToast } = useToast();
  const wm = user?.watermark || {};
  const [enabled, setEnabled] = useState(!!wm.enabled);
  const [url, setUrl] = useState(wm.url || null);
  const [publicId, setPublicId] = useState(wm.publicId || null);
  const [position, setPosition] = useState(wm.position || "top-right");
  const [size, setSize] = useState(wm.size || 18);
  const [opacity, setOpacity] = useState(wm.opacity || 85);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast({ type: "error", title: "Permission denied", message: "Photo access is required." });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(
        asset.uri,
        "image",
        asset.mimeType,
        asset.fileName,
        { skipWatermark: true },
      );
      setUrl(uploaded.url);
      setPublicId(uploaded.publicId);
      showToast({ type: "success", title: "Watermark uploaded", message: "Position it, then save." });
    } catch (err) {
      showToast({ type: "error", title: "Upload failed", message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (enabled && !publicId) {
      showToast({ type: "warning", title: "No watermark", message: "Upload a watermark image first." });
      return;
    }
    setSaving(true);
    try {
      const { data } = await authAPI.updateWatermark({ enabled, publicId, url, position, size, opacity });
      onUpdateUser?.(data.user);
      showToast({ type: "success", title: "Saved", message: "Watermark settings updated." });
      onBack();
    } catch (err) {
      showToast({ type: "error", title: "Save failed", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-paper px-6 pt-16">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={getColors().ink} />
        </TouchableOpacity>
        <Text className="text-ink text-xl font-serif-bold">Watermark</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between bg-paper-light rounded-2xl border border-rule p-4 mb-5">
          <View className="flex-1 mr-3">
            <Text className="text-ink font-sans-bold text-sm">Auto-apply watermark</Text>
            <Text className="text-ink-muted text-xs mt-0.5">Added to every image you upload</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ true: getColors().olive, false: getColors().rule }}
            thumbColor={getColors().paperLight}
          />
        </View>

        <View className="bg-paper-deep rounded-2xl border border-rule mb-4 overflow-hidden" style={{ aspectRatio: 16 / 10 }}>
          <View className="flex-1 items-center justify-center">
            <Ionicons name="image-outline" size={40} color={getColors().inkSoft} />
            <Text className="text-ink-soft text-[11px] mt-2">Preview</Text>
          </View>
          {url && (
            <Image
              source={{ uri: url }}
              resizeMode="contain"
              style={{
                position: "absolute",
                width: `${size * 1.6}%`,
                height: `${size * 1.6}%`,
                opacity: opacity / 100,
                ...CORNER_STYLE[position],
              }}
            />
          )}
        </View>

        <TouchableOpacity
          onPress={handlePick}
          disabled={uploading}
          className="flex-row items-center justify-center bg-paper-light border border-rule rounded-xl py-3 mb-6"
        >
          {uploading ? (
            <ActivityIndicator color={getColors().olive} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color={getColors().olive} />
              <Text className="text-ink font-sans-semibold text-sm ml-2">
                {url ? "Replace watermark (PNG)" : "Upload watermark (PNG)"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="text-ink-muted text-xs mb-2 ml-1">POSITION</Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {POSITIONS.map((p) => (
            <View key={p.key} style={{ width: "48%" }}>
              <Chip active={position === p.key} label={p.label} onPress={() => setPosition(p.key)} />
            </View>
          ))}
        </View>

        <Text className="text-ink-muted text-xs mb-2 ml-1">SIZE</Text>
        <View className="flex-row gap-2 mb-5">
          {SIZES.map((s) => (
            <Chip key={s.value} active={size === s.value} label={s.label} onPress={() => setSize(s.value)} />
          ))}
        </View>

        <Text className="text-ink-muted text-xs mb-2 ml-1">OPACITY</Text>
        <View className="flex-row gap-2 mb-8">
          {OPACITIES.map((o) => (
            <Chip key={o.value} active={opacity === o.value} label={o.label} onPress={() => setOpacity(o.value)} />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`py-3.5 rounded-xl ${saving ? "bg-olive/40" : "bg-olive"}`}
        >
          {saving ? (
            <ActivityIndicator color={getColors().paperLight} />
          ) : (
            <Text className="text-paper-light text-center font-sans-bold text-sm">Save watermark</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
