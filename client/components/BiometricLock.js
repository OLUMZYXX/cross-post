import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";

export default function BiometricLock({ onUnlock }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    authenticate();
  }, []);

  const authenticate = async () => {
    setFailed(false);
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock CrossPost",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });

    if (result.success) {
      onUnlock();
    } else {
      setFailed(true);
    }
  };

  return (
    <View className="absolute inset-0 z-50 bg-gray-950 items-center justify-center px-6">
      <View className="items-center">
        <View className="w-20 h-20 rounded-full bg-purple-500/20 items-center justify-center mb-6">
          <Ionicons name="lock-closed" size={36} color="#a855f7" />
        </View>

        <Text className="text-white text-xl font-bold mb-2">
          App Locked
        </Text>
        <Text className="text-gray-400 text-sm text-center mb-8">
          Authenticate to continue using CrossPost
        </Text>

        {failed && (
          <TouchableOpacity
            onPress={authenticate}
            className="bg-purple-500 px-8 py-4 rounded-xl"
          >
            <Text className="text-white font-bold text-base">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
