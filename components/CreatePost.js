import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { useState } from "react";

export default function CreatePost({
  connectedPlatforms,
  allPlatforms,
  onClose,
}) {
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    ...connectedPlatforms,
  ]);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [mediaType, setMediaType] = useState(null);

  const togglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleMediaSelect = (type) => {
    setMediaType(type);
    setSelectedMedia([
      {
        type,
        uri: "placeholder",
        name: `sample_${type}.${type === "image" ? "jpg" : "mp4"}`,
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/5" />
        <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/5" />
      </View>

      <View className="flex-1 px-6 pt-16">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-gray-400 text-lg">✕</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Create Post</Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-green-500 px-4 py-2 rounded-xl"
          >
            <Text className="text-gray-950 font-bold">Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-4">
            <Text className="text-white font-bold mb-3">Post to</Text>
            <View className="flex-row flex-wrap">
              {connectedPlatforms.map((platform) => (
                <TouchableOpacity
                  key={platform}
                  onPress={() => togglePlatform(platform)}
                  className={`flex-row items-center mr-2 mb-2 px-3 py-2 rounded-full border ${
                    selectedPlatforms.includes(platform)
                      ? "bg-green-500/20 border-green-500"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <Text className="text-lg mr-2">
                    {allPlatforms[platform].icon}
                  </Text>
                  <Text
                    className={`text-sm font-medium ${
                      selectedPlatforms.includes(platform)
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {platform}
                  </Text>
                  {selectedPlatforms.includes(platform) && (
                    <Text className="text-green-400 ml-2">✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {selectedPlatforms.length === 0 && (
              <Text className="text-red-400 text-xs mt-2">
                Select at least one platform
              </Text>
            )}
          </View>

          <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-4">
            <Text className="text-white font-bold mb-3">Caption</Text>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="What's on your mind?"
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={4}
              className="text-white text-base bg-gray-800 rounded-xl p-4 min-h-[120px]"
              textAlignVertical="top"
            />
            <Text className="text-gray-500 text-xs mt-2 text-right">
              {caption.length}/280
            </Text>
          </View>

          <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-4">
            <Text className="text-white font-bold mb-3">Add Media</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => handleMediaSelect("image")}
                className={`flex-1 mr-2 py-4 rounded-xl border items-center ${
                  mediaType === "image"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <Text className="text-2xl mb-1">🖼️</Text>
                <Text
                  className={`text-sm ${mediaType === "image" ? "text-green-400" : "text-gray-400"}`}
                >
                  Image
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleMediaSelect("video")}
                className={`flex-1 ml-2 py-4 rounded-xl border items-center ${
                  mediaType === "video"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <Text className="text-2xl mb-1">🎬</Text>
                <Text
                  className={`text-sm ${mediaType === "video" ? "text-green-400" : "text-gray-400"}`}
                >
                  Video
                </Text>
              </TouchableOpacity>
            </View>
            {selectedMedia.length > 0 && (
              <View className="mt-3 bg-gray-800 rounded-xl p-3 flex-row items-center">
                <Text className="text-2xl mr-3">
                  {mediaType === "image" ? "🖼️" : "🎬"}
                </Text>
                <View className="flex-1">
                  <Text className="text-white text-sm">
                    {selectedMedia[0].name}
                  </Text>
                  <Text className="text-gray-500 text-xs">Ready to upload</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedMedia([]);
                    setMediaType(null);
                  }}
                >
                  <Text className="text-red-400">✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {selectedPlatforms.length > 0 &&
            (caption.length > 0 || selectedMedia.length > 0) && (
              <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-4">
                <Text className="text-white font-bold mb-3">Preview</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedPlatforms.map((platform) => (
                    <View
                      key={platform}
                      className="bg-gray-800 rounded-2xl p-4 mr-3 w-72"
                    >
                      <View className="flex-row items-center mb-3">
                        <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center mr-3">
                          <Text className="text-xl">
                            {allPlatforms[platform].icon}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-white font-bold text-sm">
                            {platform}
                          </Text>
                          <Text className="text-gray-500 text-xs">
                            @yourhandle
                          </Text>
                        </View>
                      </View>
                      {caption.length > 0 && (
                        <Text
                          className="text-gray-300 text-sm mb-3"
                          numberOfLines={3}
                        >
                          {caption}
                        </Text>
                      )}
                      {selectedMedia.length > 0 && (
                        <View className="bg-gray-700 rounded-xl h-32 items-center justify-center">
                          <Text className="text-4xl">
                            {mediaType === "image" ? "🖼️" : "🎬"}
                          </Text>
                          <Text className="text-gray-400 text-xs mt-2">
                            Media Preview
                          </Text>
                        </View>
                      )}
                      <View className="flex-row mt-3 pt-3 border-t border-gray-700">
                        <Text className="text-gray-500 text-xs mr-4">
                          ❤️ Like
                        </Text>
                        <Text className="text-gray-500 text-xs mr-4">
                          💬 Comment
                        </Text>
                        <Text className="text-gray-500 text-xs">🔄 Share</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

          <View className="h-20" />
        </ScrollView>
      </View>
    </View>
  );
}
