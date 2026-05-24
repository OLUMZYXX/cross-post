import { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BRAND, FONTS, useTheme } from "../constants/theme";
import SceneRenderer from "./OnboardingScenes";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    eyebrow: "WELCOME TO CROSSPOST",
    title: "Share once,\nsend everywhere.",
    description:
      "Stop posting the same thing on five apps. Compose one thought and ship it to every timeline at once.",
    scene: "welcome",
  },
  {
    eyebrow: "ONE INBOX",
    title: "All your\nplatforms united.",
    description:
      "Twitter, Instagram, LinkedIn, TikTok, YouTube, Threads — link them once, manage them together.",
    scene: "connect",
  },
  {
    eyebrow: "WHEN YOU'RE READY",
    title: "Publish now\nor later.",
    description:
      "Send instantly or schedule for tomorrow morning. Track what worked and grow without burning out.",
    scene: "publish",
  },
];

function Dots({ count, active, colors }) {
  return (
    <View className="flex-row items-center justify-center mt-7">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            marginHorizontal: 4,
            height: 7,
            width: i === active ? 28 : 7,
            borderRadius: 4,
            backgroundColor: i === active ? colors.terracotta : colors.paperDeep,
          }}
        />
      ))}
    </View>
  );
}

function ChunkyArrowButton({ label, onPress, colors }) {
  return (
    <Pressable onPress={onPress} android_ripple={{ color: colors.terracottaShadow + "55", borderless: false }}>
      <View
        style={{
          backgroundColor: colors.terracottaShadow,
          borderRadius: 18,
          paddingTop: 3,
        }}
      >
        <View
          style={{
            backgroundColor: colors.terracotta,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.terracottaShadow,
            transform: [{ translateY: -3 }],
          }}
        >
          <Text style={{ color: "#FFFFFF", fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: 0.4 }}>
            {label}
          </Text>
          <View style={{ marginLeft: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function Onboarding({ onComplete }) {
  const { colors, resolved } = useTheme();
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(1)).current;
  const textSlide = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(100 / SLIDES.length)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(index);
  const animatingRef = useRef(animating);
  indexRef.current = index;
  animatingRef.current = animating;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ((index + 1) / SLIDES.length) * 100,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [index]);

  const animateTo = (dir, cb) => {
    setAnimating(true);
    animatingRef.current = true;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir === "next" ? -40 : 40, duration: 150, useNativeDriver: true }),
      Animated.timing(textFade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(textSlide, { toValue: dir === "next" ? -26 : 26, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      cb();
      slideAnim.setValue(dir === "next" ? 40 : -40);
      textSlide.setValue(dir === "next" ? 26 : -26);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 50, useNativeDriver: true }),
        Animated.timing(textFade, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(textSlide, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
      ]).start(() => {
        setAnimating(false);
        animatingRef.current = false;
      });
    });
  };

  const next = () => {
    if (indexRef.current < SLIDES.length - 1 && !animatingRef.current) {
      animateTo("next", () => setIndex((i) => i + 1));
    }
  };
  const prev = () => {
    if (indexRef.current > 0 && !animatingRef.current) {
      animateTo("back", () => setIndex((i) => i - 1));
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
      onPanResponderMove: (_, g) => swipeAnim.setValue(g.dx * 0.3),
      onPanResponderRelease: (_, g) => {
        Animated.spring(swipeAnim, { toValue: 0, useNativeDriver: true }).start();
        const threshold = width * 0.15;
        if (animatingRef.current) return;
        if (g.dx < -threshold && indexRef.current < SLIDES.length - 1) next();
        else if (g.dx > threshold && indexRef.current > 0) prev();
      },
    }),
  ).current;

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />

      <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
        <View style={{ position: "absolute", top: 60, left: -100, width: 280, height: 280, borderRadius: 9999, backgroundColor: colors.terracottaSoft, opacity: resolved === "dark" ? 0.35 : 0.5 }} />
        <View style={{ position: "absolute", top: 220, right: -120, width: 300, height: 300, borderRadius: 9999, backgroundColor: colors.oliveSoft, opacity: resolved === "dark" ? 0.25 : 0.4 }} />
        <View style={{ position: "absolute", bottom: 40, left: -60, width: 250, height: 250, borderRadius: 9999, backgroundColor: colors.terracottaSoft, opacity: resolved === "dark" ? 0.2 : 0.35 }} />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <Animated.View {...panResponder.panHandlers} style={{ flex: 1, transform: [{ translateX: swipeAnim }] }}>
          <View className="px-6 pt-2 flex-1">
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-baseline">
                <Text className="text-ink font-serif-bold" style={{ fontSize: 22, lineHeight: 26 }}>
                  {BRAND.name}
                </Text>
                <Text className="text-terracotta font-serif-bold ml-1" style={{ fontSize: 22, lineHeight: 26 }}>
                  {BRAND.dot}
                </Text>
              </View>
              <TouchableOpacity onPress={onComplete} className="flex-row items-center py-1.5 px-2" activeOpacity={0.7}>
                <Text className="text-ink-muted font-sans-medium text-[13px] mr-1">Skip</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ height: 4, backgroundColor: colors.paperDeep, borderRadius: 9999, marginBottom: 32, overflow: "hidden" }}>
              <Animated.View style={{ height: 4, backgroundColor: colors.terracotta, borderRadius: 9999, width: progressWidth }} />
            </View>

            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }], alignItems: "center", justifyContent: "center" }}>
              <SceneRenderer key={index} scene={slide.scene} />
            </Animated.View>

            <Animated.View style={{ alignItems: "center", paddingHorizontal: 8, opacity: textFade, transform: [{ translateY: textSlide }] }}>
              <View className="flex-row items-center mb-4">
                <View style={{ width: 24, height: 1, backgroundColor: colors.rule }} />
                <Text className="text-terracotta font-sans-bold mx-3" style={{ fontSize: 11, letterSpacing: 2.5 }}>
                  {slide.eyebrow}
                </Text>
                <View style={{ width: 24, height: 1, backgroundColor: colors.rule }} />
              </View>
              <Text className="text-ink font-serif-bold text-center mb-3" style={{ fontSize: 30, lineHeight: 36 }}>
                {slide.title}
              </Text>
              <Text className="text-ink-muted font-sans text-center" style={{ fontSize: 14, lineHeight: 21, maxWidth: 300 }}>
                {slide.description}
              </Text>
            </Animated.View>

            <Dots count={SLIDES.length} active={index} colors={colors} />
          </View>

          <View className="px-6 pt-8 pb-6">
            {isLast ? (
              <ChunkyArrowButton label="Get Started" onPress={onComplete} colors={colors} />
            ) : (
              <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={prev} disabled={index === 0} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, opacity: index === 0 ? 0 : 1 }} activeOpacity={0.7}>
                  <Ionicons name="arrow-back" size={15} color={colors.inkMuted} />
                  <Text className="text-ink-muted font-sans-medium ml-2" style={{ fontSize: 14 }}>Back</Text>
                </TouchableOpacity>
                <ChunkyArrowButton label="Continue" onPress={next} colors={colors} />
              </View>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
