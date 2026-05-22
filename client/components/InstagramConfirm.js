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
    <View className="flex-1 bg-paper items-center justify-center px-6">
      <View className="bg-paper-light rounded-3xl p-8 w-full max-w-sm border border-rule items-center">
        <View className="w-16 h-16 rounded-full bg-paper-deep items-center justify-center mb-4">
          <Ionicons name="logo-instagram" size={32} color="#B14026" />
        </View>

        <Text className="text-ink text-xl font-serif-bold mb-2">
          Connect Instagram
        </Text>
        <Text className="text-ink-muted text-sm text-center mb-6">
          Connect this account to CrossPost?
        </Text>

        {fetching ? (
          <View className="py-8">
            <ActivityIndicator color="#B14026" />
          </View>
        ) : fetchError ? (
          <View className="py-4">
            <Text className="text-terracotta text-sm text-center mb-4">
              {fetchError}
            </Text>
            <TouchableOpacity
              onPress={onCancel}
              className="bg-paper-deep w-full py-3.5 rounded-xl"
            >
              <Text className="text-ink text-center font-sans-medium">
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
              <View className="w-20 h-20 rounded-full bg-paper-deep items-center justify-center mb-4">
                <Ionicons name="person" size={36} color="#564B3F" />
              </View>
            )}

            <Text className="text-ink text-lg font-serif-bold mb-1">
              @{info?.username}
            </Text>

            {info?.accountType ? (
              <Text className="text-ink-muted text-xs mb-6 capitalize">
                {info.accountType.toLowerCase().replace("_", " ")} account
              </Text>
            ) : (
              <View className="mb-6" />
            )}

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={loading}
              className="bg-terracotta w-full py-3.5 rounded-xl mb-3"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-ink text-center font-sans-bold">
                  Connect This Account
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              className="bg-paper-deep w-full py-3.5 rounded-xl"
            >
              <Text className="text-ink text-center font-sans-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
