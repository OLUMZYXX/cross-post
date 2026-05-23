import { useState } from "react";
import { getColors } from "../constants/theme";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "./Toast";
import { platformAPI } from "../services/api";

export default function TelegramConnectModal({ visible, onClose, onConnected }) {
  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [connecting, setConnecting] = useState(false);
  const { showToast } = useToast();

  const handleConnect = async () => {
    if (!botToken.trim() || !channelId.trim()) {
      showToast({
        type: "error",
        title: "Missing fields",
        message: "Please enter both bot token and channel username.",
      });
      return;
    }

    setConnecting(true);
    try {
      const { data } = await platformAPI.connectTelegram(
        botToken.trim(),
        channelId.trim(),
      );
      showToast({
        type: "success",
        title: "Telegram connected!",
        message: data.channelTitle,
      });
      setBotToken("");
      setChannelId("");
      onConnected();
    } catch (err) {
      let message = err.message || "Something went wrong.";
      if (err.status === 404 || message.includes("not found")) {
        message = "Server does not support Telegram yet. Please redeploy your server.";
      } else if (err.code === "NETWORK_ERROR") {
        message = "Unable to reach the server. Check your connection.";
      }
      showToast({
        type: "error",
        title: "Telegram connection failed",
        message,
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleClose = () => {
    setBotToken("");
    setChannelId("");
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-ink/50">
        <View className="bg-paper-light rounded-3xl p-6 w-80">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-paper-deep items-center justify-center mr-3">
              <Ionicons name="paper-plane" size={20} color="#0ea5e9" />
            </View>
            <Text className="text-ink text-lg font-serif-bold flex-1">
              Connect Telegram
            </Text>
          </View>

          <Text className="text-ink-muted text-xs mb-4">
            Create a bot with @BotFather on Telegram, then add it as an admin to
            your channel.
          </Text>

          <Text className="text-ink text-xs font-sans-medium mb-1.5">
            Bot Token
          </Text>
          <TextInput
            value={botToken}
            onChangeText={setBotToken}
            placeholder="123456:ABC-DEF..."
            placeholderTextColor={getColors().inkMuted}
            className="bg-paper-deep text-ink rounded-xl px-4 py-3 mb-3 text-sm border border-rule"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text className="text-ink text-xs font-sans-medium mb-1.5">
            Channel Username
          </Text>
          <TextInput
            value={channelId}
            onChangeText={setChannelId}
            placeholder="@yourchannel"
            placeholderTextColor={getColors().inkMuted}
            className="bg-paper-deep text-ink rounded-xl px-4 py-3 mb-4 text-sm border border-rule"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            onPress={handleConnect}
            disabled={connecting}
            className="bg-olive py-3 rounded-xl mb-3 flex-row items-center justify-center"
          >
            {connecting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="link" size={16} color="#fff" />
                <Text className="text-ink font-sans-bold ml-2">Connect</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL("https://t.me/BotFather")}
            className="py-2 flex-row items-center justify-center mb-2"
          >
            <Ionicons name="open-outline" size={14} color="#0ea5e9" />
            <Text className="text-sky-400 text-xs font-sans-medium ml-1.5">
              Open @BotFather
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClose}
            className="bg-paper-deep py-3 rounded-xl"
          >
            <Text className="text-ink text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
