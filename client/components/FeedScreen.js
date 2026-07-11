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

function timeAgo(iso) {
  if (!iso) return "";
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NewsCard({ item, onCompose, colors }) {
  return (
    <View className="bg-paper-light rounded-2xl border border-rule mb-3 overflow-hidden">
      {item.image ? (
        <Image source={{ uri: item.image }} className="w-full h-40" resizeMode="cover" />
      ) : null}
      <View className="p-4">
        <View className="flex-row items-center mb-1.5">
          <Text className="text-olive text-[10px] font-sans-bold uppercase tracking-wide">
            {item.source}
          </Text>
          <Text className="text-ink-soft text-[10px] mx-1.5">·</Text>
          <Text className="text-ink-soft text-[10px]">{timeAgo(item.publishedAt)}</Text>
        </View>
        <Text className="text-ink text-sm font-sans-bold leading-5 mb-3">{item.title}</Text>
        <TouchableOpacity
          onPress={() => onCompose(item)}
          className="flex-row items-center justify-center bg-olive rounded-xl py-2.5"
          activeOpacity={0.85}
        >
          <Ionicons name="send" size={14} color={colors.paperLight} />
          <Text className="text-paper-light font-sans-bold text-xs ml-2">Cross-post this</Text>
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
    onCompose({ caption: `${item.title}\n\n${item.link}` });
  };

  return (
    <View className="flex-1 bg-paper px-5 pt-14">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text className="text-ink text-xl font-serif-bold flex-1">Football News</Text>
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
            <NewsCard item={item} onCompose={handleCompose} colors={colors} />
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
