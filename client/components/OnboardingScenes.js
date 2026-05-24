import { useRef, useEffect } from "react";
import { View, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/theme";

const { width, height } = Dimensions.get("window");

export function FloatingIcon({ name, size, color, style, delay = 0, floatRange = 8 }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000 + Math.random() * 1000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000 + Math.random() * 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-floatRange, floatRange] });
  return (
    <Animated.View style={[style, { opacity: fadeIn, transform: [{ translateY }] }]}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

export function GlowDot({ size, color, style, delay = 0 }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500 + Math.random() * 800, delay, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1500 + Math.random() * 800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: pulseAnim },
        style,
      ]}
    />
  );
}

function deviceCardStyle(colors) {
  return {
    width: 84,
    height: 110,
    borderRadius: 18,
    backgroundColor: colors.paperLight,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.terracottaShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  };
}

export function WelcomeScene() {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[sceneWrap, { transform: [{ scale: scaleAnim }] }]}>
      <View style={deviceCardStyle(colors)}>
        <Ionicons name="grid" size={26} color={colors.terracotta} />
        <View style={{ marginTop: 10, gap: 5 }}>
          <View style={{ width: 44, height: 3, borderRadius: 2, backgroundColor: colors.terracottaSoft }} />
          <View style={{ width: 28, height: 3, borderRadius: 2, backgroundColor: colors.terracottaSoft }} />
        </View>
      </View>

      <FloatingIcon name="logo-twitter" size={26} color={colors.olive} style={{ position: "absolute", top: 8, left: width * 0.12 }} delay={100} floatRange={6} />
      <FloatingIcon name="logo-instagram" size={28} color={colors.terracotta} style={{ position: "absolute", top: 24, right: width * 0.1 }} delay={300} floatRange={10} />
      <FloatingIcon name="logo-linkedin" size={24} color={colors.olive} style={{ position: "absolute", bottom: 36, left: width * 0.08 }} delay={200} floatRange={8} />
      <FloatingIcon name="logo-youtube" size={26} color={colors.terracotta} style={{ position: "absolute", bottom: 18, right: width * 0.12 }} delay={400} floatRange={7} />
      <FloatingIcon name="logo-tiktok" size={22} color={colors.ink} style={{ position: "absolute", top: 64, left: width * 0.04 }} delay={500} floatRange={5} />
      <FloatingIcon name="logo-facebook" size={22} color={colors.olive} style={{ position: "absolute", top: 56, right: width * 0.02 }} delay={350} floatRange={9} />

      <GlowDot size={6} color={colors.terracotta} style={{ position: "absolute", top: 0, left: width * 0.25 }} delay={200} />
      <GlowDot size={5} color={colors.olive} style={{ position: "absolute", top: 86, right: width * 0.06 }} delay={500} />
      <GlowDot size={4} color={colors.terracottaShadow} style={{ position: "absolute", bottom: 66, right: width * 0.28 }} delay={400} />
    </Animated.View>
  );
}

export function ConnectScene() {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 20000, useNativeDriver: true })).start();
  }, []);
  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const counterSpin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });
  const platforms = [
    { icon: "logo-twitter", color: colors.olive, angle: 0 },
    { icon: "logo-instagram", color: colors.terracotta, angle: 60 },
    { icon: "logo-linkedin", color: colors.olive, angle: 120 },
    { icon: "logo-youtube", color: colors.terracotta, angle: 180 },
    { icon: "logo-tiktok", color: colors.ink, angle: 240 },
    { icon: "logo-facebook", color: colors.olive, angle: 300 },
  ];
  const orbitRadius = 85;
  const hubStyle = {
    width: 68, height: 68, borderRadius: 34, backgroundColor: colors.paperLight,
    borderWidth: 1.5, borderColor: colors.terracotta, alignItems: "center", justifyContent: "center",
    zIndex: 10, shadowColor: colors.terracotta, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 10,
  };

  return (
    <Animated.View style={[sceneWrap, { transform: [{ scale: scaleAnim }] }]}>
      <View style={hubStyle}>
        <Ionicons name="link" size={28} color={colors.terracotta} />
      </View>
      <View style={{ position: "absolute", width: 170, height: 170, borderRadius: 85, borderWidth: 1, borderColor: colors.rule }} />
      <View style={{ position: "absolute", width: 220, height: 220, borderRadius: 110, borderWidth: 0.5, borderColor: colors.ruleSoft }} />

      <Animated.View style={{ position: "absolute", width: 170, height: 170, alignItems: "center", justifyContent: "center", transform: [{ rotate: spin }] }}>
        {platforms.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = Math.cos(rad) * orbitRadius;
          const y = Math.sin(rad) * orbitRadius;
          return (
            <Animated.View key={i} style={{ position: "absolute", width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: colors.paperLight, borderWidth: 1, borderColor: colors.rule, transform: [{ translateX: x }, { translateY: y }, { rotate: counterSpin }] }}>
              <Ionicons name={p.icon} size={18} color={p.color} />
            </Animated.View>
          );
        })}
      </Animated.View>

      <GlowDot size={8} color={colors.terracotta} style={{ position: "absolute", top: 0, left: width * 0.2 }} delay={100} />
      <GlowDot size={5} color={colors.olive} style={{ position: "absolute", top: 20, right: width * 0.08 }} delay={300} />
      <GlowDot size={4} color={colors.terracottaShadow} style={{ position: "absolute", bottom: 30, right: width * 0.15 }} delay={400} />
    </Animated.View>
  );
}

export function PublishScene() {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rocketAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(rocketAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(rocketAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  const rocketY = rocketAnim.interpolate({ inputRange: [0, 1], outputRange: [6, -6] });
  const rocketBodyStyle = {
    width: 84, height: 84, borderRadius: 42, backgroundColor: colors.paperLight,
    borderWidth: 1.5, borderColor: colors.terracotta, alignItems: "center", justifyContent: "center",
    shadowColor: colors.terracotta, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28, shadowRadius: 22, elevation: 10,
  };

  return (
    <Animated.View style={[sceneWrap, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={{ zIndex: 10, transform: [{ translateY: rocketY }, { rotate: "-30deg" }] }}>
        <View style={rocketBodyStyle}>
          <Ionicons name="rocket" size={44} color={colors.terracotta} />
        </View>
      </Animated.View>

      <FloatingIcon name="sparkles" size={16} color={colors.terracottaShadow} style={{ position: "absolute", bottom: 55, left: width * 0.15 }} delay={100} floatRange={4} />
      <FloatingIcon name="sparkles" size={12} color={colors.terracotta} style={{ position: "absolute", bottom: 75, left: width * 0.22 }} delay={300} floatRange={6} />
      <FloatingIcon name="star" size={14} color={colors.olive} style={{ position: "absolute", bottom: 40, left: width * 0.08 }} delay={500} floatRange={5} />
      <FloatingIcon name="time" size={26} color={colors.olive} style={{ position: "absolute", top: 25, left: width * 0.08 }} delay={200} floatRange={7} />
      <FloatingIcon name="calendar" size={24} color={colors.olive} style={{ position: "absolute", top: 20, right: width * 0.1 }} delay={400} floatRange={6} />
      <FloatingIcon name="trending-up" size={24} color={colors.terracotta} style={{ position: "absolute", bottom: 30, right: width * 0.08 }} delay={350} floatRange={8} />
      <FloatingIcon name="bar-chart" size={20} color={colors.olive} style={{ position: "absolute", top: 75, right: width * 0.04 }} delay={250} floatRange={5} />
      <FloatingIcon name="send" size={18} color={colors.terracotta} style={{ position: "absolute", top: 10, left: width * 0.3 }} delay={150} floatRange={9} />
      <FloatingIcon name="paper-plane" size={16} color={colors.olive} style={{ position: "absolute", top: 55, left: width * 0.02 }} delay={600} floatRange={4} />

      <GlowDot size={6} color={colors.terracotta} style={{ position: "absolute", top: 5, right: width * 0.25 }} delay={200} />
      <GlowDot size={5} color={colors.terracottaShadow} style={{ position: "absolute", bottom: 60, right: width * 0.2 }} delay={500} />
      <GlowDot size={4} color={colors.olive} style={{ position: "absolute", top: 85, left: width * 0.28 }} delay={700} />
    </Animated.View>
  );
}

const sceneWrap = {
  width: width * 0.75,
  height: height * 0.25,
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
};

export default function SceneRenderer({ scene }) {
  switch (scene) {
    case "welcome": return <WelcomeScene />;
    case "connect": return <ConnectScene />;
    case "publish": return <PublishScene />;
    default: return <WelcomeScene />;
  }
}
