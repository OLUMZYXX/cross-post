import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: {
    icon: "checkmark-circle",
    iconColor: getColors().terracotta,
    bg: "bg-paper-light",
    border: "border-terracotta/40",
    titleColor: "text-terracotta",
  },
  error: {
    icon: "close-circle",
    iconColor: getColors().terracotta,
    bg: "bg-paper-light",
    border: "border-terracotta/40",
    titleColor: "text-terracotta",
  },
  warning: {
    icon: "warning",
    iconColor: "#eab308",
    bg: "bg-paper-light",
    border: "border-yellow-500/30",
    titleColor: "text-terracotta-shadow",
  },
  info: {
    icon: "information-circle",
    iconColor: getColors().olive,
    bg: "bg-paper-light",
    border: "border-rule",
    titleColor: "text-olive",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const showToast = useCallback(({ type = "success", title, message, duration = 3000 }) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        className="absolute top-14 left-4 right-4"
        pointerEvents="box-none"
        style={{ zIndex: 9999 }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => dismiss(), toast.duration);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  return (
    <Animated.View
      style={{ transform: [{ translateY }], opacity, marginBottom: 8 }}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={dismiss}>
        <View
          className={`${config.bg} ${config.border} border rounded-2xl p-4 flex-row items-center`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="mr-3">
            <Ionicons name={config.icon} size={24} color={config.iconColor} />
          </View>
          <View className="flex-1">
            {toast.title && (
              <Text className={`${config.titleColor} font-sans-bold text-sm`}>
                {toast.title}
              </Text>
            )}
            {toast.message && (
              <Text className="text-ink-muted text-xs mt-0.5">
                {toast.message}
              </Text>
            )}
          </View>
          <Ionicons name="close" size={16} color={getColors().inkMuted} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}