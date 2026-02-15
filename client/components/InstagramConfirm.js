import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { platformAPI } from "../services/api";

export default function InstagramConfirm({ accountData, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await platformAPI.confirmInstagramConnection(accountData.stateId);
      onConfirm(accountData.username);
    } catch (err) {
      alert(err.message || "Failed to connect Instagram account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-950 items-center justify-center px-6">
      <View className="bg-gray-900 rounded-3xl p-8 w-full max-w-sm border border-gray-800 items-center">
        <View className="w-16 h-16 rounded-full bg-pink-500/20 items-center justify-center mb-4">
          <Ionicons name="logo-instagram" size={32} color="#ec4899" />
        </View>

        <Text className="text-white text-xl font-bold mb-2">
          Confirm Instagram Account
        </Text>
        <Text className="text-gray-400 text-sm text-center mb-6">
          Connect this account to CrossPost?
        </Text>

        {accountData.profilePic ? (
          <Image
            source={{ uri: accountData.profilePic }}
            className="w-20 h-20 rounded-full mb-4"
          />
        ) : (
          <View className="w-20 h-20 rounded-full bg-gray-700 items-center justify-center mb-4">
            <Ionicons name="person" size={36} color="#9ca3af" />
          </View>
        )}

        <Text className="text-white text-lg font-bold mb-1">
          @{accountData.username}
        </Text>

        {accountData.accountType ? (
          <Text className="text-gray-400 text-xs mb-1">
            {accountData.accountType} account
          </Text>
        ) : null}

        <Text className="text-gray-500 text-xs mb-6">
          ID: {accountData.userId}
        </Text>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={loading}
          className="bg-pink-500 w-full py-3.5 rounded-xl mb-3"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-bold">
              Connect This Account
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCancel}
          disabled={loading}
          className="bg-gray-800 w-full py-3.5 rounded-xl"
        >
          <Text className="text-gray-300 text-center font-medium">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
