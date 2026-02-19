import { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PLATFORMS = [
  { icon: "logo-twitter", color: "#3b82f6" },
  { icon: "logo-instagram", color: "#ec4899" },
  { icon: "logo-facebook", color: "#2563eb" },
  { icon: "logo-tiktok", color: "#e5e7eb" },
  { icon: "logo-youtube", color: "#ef4444" },
  { icon: "logo-linkedin", color: "#2563eb" },
];

export default function PageLoadingAnimation({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const platformAnims = useRef(
    PLATFORMS.map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    })),
  ).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1: Logo appears with spring
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

    // Phase 2: Ring pulse
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.6,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0.4,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 300);

    // Phase 3: Platform icons pop in with stagger
    setTimeout(() => {
      Animated.stagger(
        80,
        platformAnims.map((anim) =>
          Animated.parallel([
            Animated.spring(anim.scale, {
              toValue: 1,
              friction: 5,
              tension: 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ),
      ).start();
    }, 400);

    // Phase 4: Fade out everything
    setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        onFinish?.();
      });
    }, 4000);
  }, []);

  const iconPositions = PLATFORMS.map((_, i) => {
    const angle = (i * (360 / PLATFORMS.length) - 90) * (Math.PI / 180);
    const radius = 70;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  return (
    <Animated.View
      style={{ opacity: fadeOut }}
      className="absolute inset-0 z-50 bg-gray-950 items-center justify-center"
    >
      {/* Background glow */}
      <View className="absolute w-64 h-64 rounded-full bg-green-500/5" />
      <View className="absolute w-40 h-40 rounded-full bg-green-500/10" />

      {/* Expanding ring */}
      <Animated.View
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: 60,
          borderWidth: 2,
          borderColor: "#4ade80",
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />

      {/* Platform icons orbiting — centered around the logo */}
      {PLATFORMS.map((platform, i) => (
        <Animated.View
          key={platform.icon}
          style={{
            position: "absolute",
            opacity: platformAnims[i].opacity,
            transform: [
              { translateX: iconPositions[i].x },
              { translateY: iconPositions[i].y },
              { scale: platformAnims[i].scale },
            ],
          }}
        >
          <View
            style={{ backgroundColor: `${platform.color}20` }}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name={platform.icon} size={18} color={platform.color} />
          </View>
        </Animated.View>
      ))}

      {/* Center logo */}
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
      >
        <View className="w-20 h-20 rounded-3xl bg-green-500 items-center justify-center shadow-lg">
          <Ionicons name="share-social" size={36} color="#030712" />
        </View>
      </Animated.View>
    </Animated.View>
  );
}
