import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "./Toast";
import { platformAPI } from "../services/api";

const PLATFORM_STYLES = {
  Twitter: { icon: "logo-twitter", bg: "bg-blue-500/20", color: "#3b82f6" },
  Instagram: { icon: "logo-instagram", bg: "bg-pink-500/20", color: "#ec4899" },
  LinkedIn: { icon: "logo-linkedin", bg: "bg-blue-600/20", color: "#2563eb" },
  Facebook: { icon: "logo-facebook", bg: "bg-blue-700/20", color: "#1d4ed8" },
  TikTok: { icon: "logo-tiktok", bg: "bg-gray-800", color: "#e5e7eb" },
  YouTube: { icon: "logo-youtube", bg: "bg-red-500/20", color: "#ef4444" },
  Reddit: { icon: "logo-reddit", bg: "bg-orange-500/20", color: "#f97316" },
};

export default function ConnectedAccounts({ onBack, onOpenConnectModal }) {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPlatforms = useCallback(async () => {
    try {
      const { data } = await platformAPI.list();
      setPlatforms(data.platforms);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const handleDisconnect = async (platform) => {
    try {
      await platformAPI.disconnect(platform._id);
      setPlatforms((prev) => prev.filter((p) => p._id !== platform._id));
      showToast({ type: "success", title: `${platform.name} disconnected` });
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    }
  };

  return (
    <View className="flex-1 bg-gray-950 px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">
          Connected Accounts
        </Text>
        <Text className="text-gray-500 text-sm">{platforms.length}</Text>
      </View>

      {loading ? (
        <View className="items-center py-12">
          <ActivityIndicator color="#4ade80" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {platforms.map((platform) => {
            const style = PLATFORM_STYLES[platform.name] || {};
            return (
              <View
                key={platform._id}
                className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3 flex-row items-center"
              >
                <View className={`w-11 h-11 rounded-full ${style.bg || "bg-gray-700"} items-center justify-center mr-3`}>
                  <Ionicons name={style.icon || "globe-outline"} size={22} color={style.color || "#fff"} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>
                    {platform.platformUsername || platform.name}
                  </Text>
                  <Text className="text-gray-500 text-xs">{platform.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDisconnect(platform)}
                  className="bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
                >
                  <Text className="text-red-400 text-xs font-medium">Disconnect</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <TouchableOpacity
            onPress={onOpenConnectModal}
            className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3 flex-row items-center"
            style={{ borderStyle: "dashed" }}
          >
            <View className="w-11 h-11 rounded-full bg-green-500/20 items-center justify-center mr-3">
              <Ionicons name="add" size={22} color="#4ade80" />
            </View>
            <Text className="text-green-400 font-medium">Add New Account</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
