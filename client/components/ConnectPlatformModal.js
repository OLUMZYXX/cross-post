import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";

export default function ConnectPlatformModal({
  visible,
  platforms,
  platformStyles,
  connecting,
  onSelect,
  onClose,
}) {
  const busy = Boolean(connecting);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={busy ? undefined : onClose}
    >
      <View className="flex-1 justify-center items-center bg-ink/60 px-6">
        <View className="bg-paper-light rounded-3xl border border-rule p-6 w-full max-w-sm">
          <Text className="text-terracotta text-[10px] font-sans-bold tracking-[2px] mb-1">
            CONNECT
          </Text>
          <Text className="text-ink text-2xl font-serif-bold mb-5">
            Add a platform
          </Text>

          {platforms.map((platform) => {
            const isConnecting = connecting === platform;
            return (
              <TouchableOpacity
                key={platform}
                onPress={() => onSelect(platform)}
                disabled={busy}
                style={{ opacity: busy && !isConnecting ? 0.4 : 1 }}
                className="flex-row items-center mb-2 bg-paper border border-rule rounded-2xl p-3"
                activeOpacity={0.75}
              >
                <View className="w-10 h-10 rounded-xl bg-paper-deep items-center justify-center mr-3">
                  <Ionicons
                    name={platformStyles[platform]?.icon}
                    size={18}
                    color={getColors().ink}
                  />
                </View>
                <Text className="text-ink font-sans-semibold flex-1">
                  {platform}
                </Text>
                {isConnecting ? (
                  <ActivityIndicator
                    size="small"
                    color={getColors().terracotta}
                  />
                ) : (
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={getColors().terracotta}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={onClose}
            disabled={busy}
            style={{ opacity: busy ? 0.4 : 1 }}
            className="py-3 rounded-2xl mt-3 border border-rule"
          >
            <Text className="text-ink-muted text-center font-sans-semibold">
              {busy ? `Connecting to ${connecting}...` : "Close"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
