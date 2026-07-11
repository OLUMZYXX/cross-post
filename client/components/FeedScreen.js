import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { useToast } from "./Toast";
import { feedAPI } from "../services/api";

const SOURCE_COLOR = {
  "BBC Sport": "#bb1919",
  "Sky Sports": "#0072c9",
  "The Guardian": "#c70000",
  ESPN: "#cc0000",
};

function timeAgo(iso) {
  if (!iso) return "";
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function Post({ item, onCompose, colors }) {
  const initial = (item.source || "?").charAt(0);
  return (
    <View className="px-5 py-4 border-b border-rule">
      <View className="flex-row items-center mb-2.5">
        <View
          className="w-9 h-9 rounded-full items-center justify-center mr-2.5"
          style={{ backgroundColor: SOURCE_COLOR[item.source] || colors.olive }}
        >
          <Text className="text-white font-sans-bold text-sm">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-ink font-sans-bold text-[13px]">{item.source}</Text>
          <Text className="text-ink-soft text-[11px]">{timeAgo(item.publishedAt)} ago</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={() => onCompose(item)}>
        <Text className="text-ink text-[15px] leading-6 font-sans-medium mb-3">
          {item.title}
        </Text>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            className="w-full h-52 rounded-2xl mb-1"
            resizeMode="cover"
          />
        ) : null}
      </TouchableOpacity>

      <View className="flex-row items-center justify-end mt-2">
        <TouchableOpacity
          onPress={() => onCompose(item)}
          className="flex-row items-center bg-olive rounded-full px-4 py-2"
          activeOpacity={0.85}
        >
          <Ionicons name="repeat" size={15} color={colors.paperLight} />
          <Text className="text-paper-light font-sans-bold text-xs ml-2">Cross-post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen({ onBack, onCompose }) {
  const { showToast } = useToast();
  const colors = getColors();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await feedAPI.football();
      setItems(data.items || []);
    } catch (err) {
      showToast({ type: "error", title: "Couldn't load feed", message: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleCompose = (item) => {
    onCompose({ caption: item.title });
  };

  return (
    <View className="flex-1 bg-paper pt-14">
      <View className="flex-row items-center px-5 pb-3 border-b border-rule">
        {onBack ? (
          <TouchableOpacity onPress={onBack} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </TouchableOpacity>
        ) : null}
        <Text className="text-ink text-2xl font-serif-bold flex-1">Feed</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color={colors.inkMuted} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.olive} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => `${item.link}-${i}`}
          renderItem={({ item }) => (
            <Post item={item} onCompose={handleCompose} colors={colors} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.olive}
              colors={[colors.olive]}
            />
          }
          ListEmptyComponent={
            <Text className="text-ink-muted text-sm text-center mt-10">
              No news right now — pull to refresh.
            </Text>
          }
        />
      )}
    </View>
  );
}
