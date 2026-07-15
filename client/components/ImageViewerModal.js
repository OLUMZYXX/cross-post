import { View, Image, Modal, TouchableOpacity, Text, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ImageViewerModal({ visible, imageUri, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="flex-1 w-full"
            resizeMode="contain"
          />
        ) : null}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-14 right-5 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
        >
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <View className="absolute bottom-12 left-0 right-0 items-center">
          <Text className="text-white/70 text-xs">
            This is exactly how your image will be posted
          </Text>
        </View>
      </View>
    </Modal>
  );
}
