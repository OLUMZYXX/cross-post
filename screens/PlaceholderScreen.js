import { View, Text, Platform, StatusBar } from "react-native";

export default function PlaceholderScreen() {
  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />
      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-10 -right-16 w-48 h-48 rounded-full bg-green-500/10" />
        <View className="absolute top-96 -left-20 w-64 h-64 rounded-full bg-emerald-500/10" />
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-white text-2xl font-bold mb-2">
          Welcome to Cross-Post
        </Text>
        <Text className="text-gray-400 text-center">
          iOS Liquid Glass Navigation Active
        </Text>
      </View>
    </View>
  );
}
