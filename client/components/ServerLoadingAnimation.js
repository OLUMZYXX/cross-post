import { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PLATFORMS = [
  { icon: "logo-twitter", color: "#4F573A" },
  { icon: "logo-instagram", color: "#B14026" },
  { icon: "logo-facebook", color: "#4F573A" },
  { icon: "logo-tiktok", color: "#e5e7eb" },
  { icon: "logo-youtube", color: "#B14026" },
  { icon: "logo-linkedin", color: "#4F573A" },
];

const RADIUS = 70;
const ICON_SIZE = 40;
const ORBIT_SIZE = (RADIUS + ICON_SIZE / 2) * 2;
const ORBIT_DURATION = 4000;

export default function ServerLoadingAnimation() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const platformOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(platformOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 300);

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: ORBIT_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.8,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ringOpacity, {
              toValue: 0.4,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(ringScale, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rotationDeg = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const counterRotationDeg = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });

  return (
    <View className="flex-1 bg-paper items-center justify-center">
      <View className="absolute w-64 h-64 rounded-full bg-terracotta/5" />
      <View className="absolute w-40 h-40 rounded-full bg-terracotta-soft/30" />

      <Animated.View
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: 60,
          borderWidth: 2,
          borderColor: "#B14026",
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />

      <Animated.View
        style={{
          width: ORBIT_SIZE,
          height: ORBIT_SIZE,
          opacity: platformOpacity,
          transform: [{ rotate: rotationDeg }],
        }}
      >
        {PLATFORMS.map((platform, i) => {
          const angle = (i * (360 / PLATFORMS.length) - 90) * (Math.PI / 180);
          const x = Math.cos(angle) * RADIUS;
          const y = Math.sin(angle) * RADIUS;

          return (
            <Animated.View
              key={platform.icon}
              style={{
                position: "absolute",
                left: ORBIT_SIZE / 2 - 20 + x,
                top: ORBIT_SIZE / 2 - 20 + y,
                transform: [{ rotate: counterRotationDeg }],
              }}
            >
              <View
                style={{ backgroundColor: `${platform.color}20` }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name={platform.icon} size={18} color={platform.color} />
              </View>
            </Animated.View>
          );
        })}
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          opacity: logoOpacity,
          transform: [{ scale: logoScale }, { scale: logoPulse }],
        }}
      >
        <View className="w-20 h-20 rounded-3xl bg-terracotta items-center justify-center shadow-lg">
          <Ionicons name="share-social" size={36} color="#E3DAC4" />
        </View>
      </Animated.View>
    </View>
  );
}
