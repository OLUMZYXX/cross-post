import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { platformAPI } from "../services/api";

export default function InstagramConfirm({ accountData, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [info, setInfo] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await platformAPI.getInstagramPendingInfo(accountData.stateId);
        setInfo(res.data);
      } catch (err) {
        setFetchError(err.message || "Could not load account info.");
      } finally {
        setFetching(false);
      }
    })();
  }, [accountData.stateId]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await platformAPI.confirmInstagramConnection(accountData.stateId);
      onConfirm(info?.username || "Instagram");
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
          Connect Instagram
        </Text>
        <Text className="text-gray-400 text-sm text-center mb-6">
          Connect this account to CrossPost?
        </Text>

        {fetching ? (
          <View className="py-8">
            <ActivityIndicator color="#ec4899" />
          </View>
        ) : fetchError ? (
          <View className="py-4">
            <Text className="text-red-400 text-sm text-center mb-4">
              {fetchError}
            </Text>
            <TouchableOpacity
              onPress={onCancel}
              className="bg-gray-800 w-full py-3.5 rounded-xl"
            >
              <Text className="text-gray-300 text-center font-medium">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {info?.profilePic ? (
              <Image
                source={{ uri: info.profilePic }}
                className="w-20 h-20 rounded-full mb-4"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-gray-700 items-center justify-center mb-4">
                <Ionicons name="person" size={36} color="#9ca3af" />
              </View>
            )}

            <Text className="text-white text-lg font-bold mb-1">
              @{info?.username}
            </Text>

            {info?.accountType ? (
              <Text className="text-gray-400 text-xs mb-6 capitalize">
                {info.accountType.toLowerCase().replace("_", " ")} account
              </Text>
            ) : (
              <View className="mb-6" />
            )}

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
              <Text className="text-gray-300 text-center font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
