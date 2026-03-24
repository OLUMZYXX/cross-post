import { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Video, ResizeMode, Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

export default function VideoPlayerModal({ visible, videoUri, onClose }) {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      }).catch(() => {});
    }
  }, [visible]);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) setIsLoading(false);
    if (status.didJustFinish) videoRef.current?.replayAsync();
  };

  const handleClose = async () => {
    try {
      await videoRef.current?.stopAsync();
    } catch {}
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <StatusBar hidden />
      <View className="flex-1 bg-black items-center justify-center">
        <TouchableOpacity
          onPress={handleClose}
          className="absolute top-12 right-4 z-10 w-10 h-10 rounded-full bg-black/60 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        {isLoading && (
          <ActivityIndicator
            size="large"
            color="#4ade80"
            className="absolute z-10"
          />
        )}

        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isMuted={false}
          volume={1.0}
          useNativeControls
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      </View>
    </Modal>
  );
}
