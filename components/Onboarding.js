import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  StyleSheet,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    title: "Share Once,\nPost Everywhere",
    subtitle: "WELCOME TO CROSS-POST",
    description:
      "Stop wasting time posting the same content on every platform. Do it all in one tap.",
    scene: "welcome",
  },
  {
    title: "All Your\nPlatforms United",
    subtitle: "SEAMLESS CONNECTIONS",
    description:
      "Twitter, Instagram, LinkedIn, TikTok, YouTube — connect them all and manage from one place.",
    scene: "connect",
  },
  {
    title: "Schedule &\nPublish Instantly",
    subtitle: "SMART PUBLISHING",
    description:
      "Post now or schedule for later. Track performance and grow your audience effortlessly.",
    scene: "publish",
  },
];

function FloatingIcon({ name, size, color, style, delay = 0, floatRange = 8 }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-floatRange, floatRange],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeIn,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

function GlowDot({ size, color, style, delay = 0 }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500 + Math.random() * 800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1500 + Math.random() * 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

function WelcomeScene() {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[styles.sceneContainer, { transform: [{ scale: scaleAnim }] }]}
    >
      {/* Center phone */}
      <View style={styles.centerDevice}>
        <View style={styles.deviceScreen}>
          <Ionicons name="grid" size={24} color="#4ade80" />
          <View style={styles.deviceLines}>
            <View style={[styles.deviceLine, { width: 40 }]} />
            <View style={[styles.deviceLine, { width: 28 }]} />
          </View>
        </View>
      </View>

      {/* Floating social icons */}
      <FloatingIcon
        name="logo-twitter"
        size={26}
        color="#60a5fa"
        style={{ position: "absolute", top: 15, left: width * 0.12 }}
        delay={100}
        floatRange={6}
      />
      <FloatingIcon
        name="logo-instagram"
        size={28}
        color="#f472b6"
        style={{ position: "absolute", top: 30, right: width * 0.1 }}
        delay={300}
        floatRange={10}
      />
      <FloatingIcon
        name="logo-linkedin"
        size={24}
        color="#38bdf8"
        style={{ position: "absolute", bottom: 40, left: width * 0.08 }}
        delay={200}
        floatRange={8}
      />
      <FloatingIcon
        name="logo-youtube"
        size={26}
        color="#f87171"
        style={{ position: "absolute", bottom: 25, right: width * 0.12 }}
        delay={400}
        floatRange={7}
      />
      <FloatingIcon
        name="logo-tiktok"
        size={22}
        color="#e2e8f0"
        style={{ position: "absolute", top: 70, left: width * 0.04 }}
        delay={500}
        floatRange={5}
      />
      <FloatingIcon
        name="logo-facebook"
        size={22}
        color="#60a5fa"
        style={{ position: "absolute", top: 60, right: width * 0.02 }}
        delay={350}
        floatRange={9}
      />

      {/* Connection lines */}
      <View style={[styles.connectionLine, { top: 55, left: width * 0.22, width: 30, transform: [{ rotate: "-20deg" }] }]} />
      <View style={[styles.connectionLine, { top: 65, right: width * 0.2, width: 35, transform: [{ rotate: "15deg" }] }]} />
      <View style={[styles.connectionLine, { bottom: 60, left: width * 0.2, width: 25, transform: [{ rotate: "25deg" }] }]} />
      <View style={[styles.connectionLine, { bottom: 55, right: width * 0.22, width: 30, transform: [{ rotate: "-10deg" }] }]} />

      {/* Glow dots */}
      <GlowDot size={6} color="#4ade80" style={{ position: "absolute", top: 5, left: width * 0.25 }} delay={200} />
      <GlowDot size={4} color="#22d3ee" style={{ position: "absolute", top: 90, right: width * 0.06 }} delay={500} />
      <GlowDot size={5} color="#a78bfa" style={{ position: "absolute", bottom: 15, left: width * 0.3 }} delay={800} />
      <GlowDot size={4} color="#fbbf24" style={{ position: "absolute", bottom: 70, right: width * 0.28 }} delay={400} />
    </Animated.View>
  );
}

function ConnectScene() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const counterSpin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });

  const platforms = [
    { icon: "logo-twitter", color: "#60a5fa", angle: 0 },
    { icon: "logo-instagram", color: "#f472b6", angle: 60 },
    { icon: "logo-linkedin", color: "#38bdf8", angle: 120 },
    { icon: "logo-youtube", color: "#f87171", angle: 180 },
    { icon: "logo-tiktok", color: "#e2e8f0", angle: 240 },
    { icon: "logo-facebook", color: "#818cf8", angle: 300 },
  ];

  const orbitRadius = 85;

  return (
    <Animated.View
      style={[styles.sceneContainer, { transform: [{ scale: scaleAnim }] }]}
    >
      {/* Center hub */}
      <View style={styles.hubCenter}>
        <View style={styles.hubInner}>
          <Ionicons name="link" size={28} color="#4ade80" />
        </View>
      </View>

      {/* Orbit ring */}
      <View style={styles.orbitRing} />
      <View style={styles.orbitRingOuter} />

      {/* Orbiting platforms */}
      <Animated.View
        style={[styles.orbitContainer, { transform: [{ rotate: spin }] }]}
      >
        {platforms.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = Math.cos(rad) * orbitRadius;
          const y = Math.sin(rad) * orbitRadius;
          return (
            <Animated.View
              key={i}
              style={[
                styles.orbitIcon,
                {
                  transform: [
                    { translateX: x },
                    { translateY: y },
                    { rotate: counterSpin },
                  ],
                  backgroundColor: `${p.color}20`,
                  borderColor: `${p.color}40`,
                },
              ]}
            >
              <Ionicons name={p.icon} size={18} color={p.color} />
            </Animated.View>
          );
        })}
      </Animated.View>

      {/* Glow effects */}
      <GlowDot size={8} color="#4ade80" style={{ position: "absolute", top: 0, left: width * 0.2 }} delay={100} />
      <GlowDot size={5} color="#f472b6" style={{ position: "absolute", top: 20, right: width * 0.08 }} delay={300} />
      <GlowDot size={6} color="#60a5fa" style={{ position: "absolute", bottom: 10, left: width * 0.15 }} delay={600} />
      <GlowDot size={4} color="#fbbf24" style={{ position: "absolute", bottom: 30, right: width * 0.15 }} delay={400} />
    </Animated.View>
  );
}

function PublishScene() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rocketAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rocketAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(rocketAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rocketY = rocketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, -6],
  });

  return (
    <Animated.View
      style={[styles.sceneContainer, { transform: [{ scale: scaleAnim }] }]}
    >
      {/* Rocket */}
      <Animated.View
        style={[
          styles.rocketContainer,
          { transform: [{ translateY: rocketY }, { rotate: "-30deg" }] },
        ]}
      >
        <View style={styles.rocketBody}>
          <Ionicons name="rocket" size={44} color="#4ade80" />
        </View>
      </Animated.View>

      {/* Trail particles */}
      <FloatingIcon
        name="sparkles"
        size={16}
        color="#fbbf24"
        style={{ position: "absolute", bottom: 55, left: width * 0.15 }}
        delay={100}
        floatRange={4}
      />
      <FloatingIcon
        name="sparkles"
        size={12}
        color="#f472b6"
        style={{ position: "absolute", bottom: 75, left: width * 0.22 }}
        delay={300}
        floatRange={6}
      />
      <FloatingIcon
        name="star"
        size={14}
        color="#fbbf24"
        style={{ position: "absolute", bottom: 40, left: width * 0.08 }}
        delay={500}
        floatRange={5}
      />

      {/* Clock & calendar for scheduling */}
      <FloatingIcon
        name="time"
        size={26}
        color="#a78bfa"
        style={{ position: "absolute", top: 25, left: width * 0.08 }}
        delay={200}
        floatRange={7}
      />
      <FloatingIcon
        name="calendar"
        size={24}
        color="#38bdf8"
        style={{ position: "absolute", top: 20, right: width * 0.1 }}
        delay={400}
        floatRange={6}
      />

      {/* Analytics icons */}
      <FloatingIcon
        name="trending-up"
        size={24}
        color="#4ade80"
        style={{ position: "absolute", bottom: 30, right: width * 0.08 }}
        delay={350}
        floatRange={8}
      />
      <FloatingIcon
        name="bar-chart"
        size={20}
        color="#22d3ee"
        style={{ position: "absolute", top: 75, right: width * 0.04 }}
        delay={250}
        floatRange={5}
      />

      {/* Send icons */}
      <FloatingIcon
        name="send"
        size={18}
        color="#60a5fa"
        style={{ position: "absolute", top: 10, left: width * 0.3 }}
        delay={150}
        floatRange={9}
      />
      <FloatingIcon
        name="paper-plane"
        size={16}
        color="#c084fc"
        style={{ position: "absolute", top: 55, left: width * 0.02 }}
        delay={600}
        floatRange={4}
      />

      {/* Glow dots */}
      <GlowDot size={6} color="#4ade80" style={{ position: "absolute", top: 5, right: width * 0.25 }} delay={200} />
      <GlowDot size={5} color="#fbbf24" style={{ position: "absolute", bottom: 60, right: width * 0.2 }} delay={500} />
      <GlowDot size={4} color="#f472b6" style={{ position: "absolute", top: 85, left: width * 0.28 }} delay={700} />
    </Animated.View>
  );
}

function SceneRenderer({ scene }) {
  switch (scene) {
    case "welcome":
      return <WelcomeScene />;
    case "connect":
      return <ConnectScene />;
    case "publish":
      return <PublishScene />;
    default:
      return <WelcomeScene />;
  }
}

export default function Onboarding({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(33.33)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(1)).current;
  const textSlide = useRef(new Animated.Value(0)).current;

  // Refs so PanResponder always sees latest values
  const currentIndexRef = useRef(currentIndex);
  const isAnimatingRef = useRef(isAnimating);
  currentIndexRef.current = currentIndex;
  isAnimatingRef.current = isAnimating;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ((currentIndex + 1) / onboardingData.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const animateTransition = (direction, callback) => {
    setIsAnimating(true);
    isAnimatingRef.current = true;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === "next" ? -50 : 50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(textFade, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(textSlide, {
        toValue: direction === "next" ? -30 : 30,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === "next" ? 50 : -50);
      textSlide.setValue(direction === "next" ? 30 : -30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(textFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
        isAnimatingRef.current = false;
      });
    });
  };

  const goToNext = () => {
    if (currentIndexRef.current < onboardingData.length - 1 && !isAnimatingRef.current) {
      animateTransition("next", () => {
        setCurrentIndex((prev) => prev + 1);
      });
    }
  };

  const goToBack = () => {
    if (currentIndexRef.current > 0 && !isAnimatingRef.current) {
      animateTransition("back", () => {
        setCurrentIndex((prev) => prev - 1);
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        swipeAnim.setValue(gestureState.dx * 0.3);
      },
      onPanResponderRelease: (_, gestureState) => {
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();

        const threshold = width * 0.15;
        if (!isAnimatingRef.current) {
          if (
            gestureState.dx < -threshold &&
            currentIndexRef.current < onboardingData.length - 1
          ) {
            goToNext();
          } else if (gestureState.dx > threshold && currentIndexRef.current > 0) {
            goToBack();
          }
        }
      },
    }),
  ).current;

  const currentSlide = onboardingData[currentIndex];
  const isLastSlide = currentIndex === onboardingData.length - 1;

  if (!currentSlide) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Ambient background */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.bgGlow, styles.bgGlow1]} />
        <View style={[styles.bgGlow, styles.bgGlow2]} />
        <View style={[styles.bgGlow, styles.bgGlow3]} />
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{ flex: 1, transform: [{ translateX: swipeAnim }] }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepPill}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>
                Step {currentIndex + 1} of {onboardingData.length}
              </Text>
            </View>
            <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
              <Ionicons name="arrow-forward" size={14} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBar, { width: progressWidth }]}
            />
          </View>

          {/* Scene illustration */}
          <Animated.View
            style={[
              styles.sceneWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <SceneRenderer key={currentIndex} scene={currentSlide.scene} />
          </Animated.View>

          {/* Text content */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textFade,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            <View style={styles.subtitleRow}>
              <View style={styles.subtitleLine} />
              <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
              <View style={styles.subtitleLine} />
            </View>

            <Text style={styles.title}>{currentSlide.title}</Text>

            <Text style={styles.description}>{currentSlide.description}</Text>
          </Animated.View>

          {/* Dots */}
          <View style={styles.dotsContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {isLastSlide ? (
            <TouchableOpacity onPress={onComplete} style={styles.getStartedButton}>
              <Text style={styles.getStartedText}>Get Started</Text>
              <View style={styles.getStartedIcon}>
                <Ionicons name="arrow-forward" size={20} color="#030712" />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                onPress={goToBack}
                style={[styles.backButton, currentIndex === 0 && styles.hidden]}
                disabled={currentIndex === 0}
              >
                <Ionicons name="arrow-back" size={16} color="#6b7280" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goToNext} style={styles.continueButton}>
                <Text style={styles.continueText}>Continue</Text>
                <Ionicons name="arrow-forward" size={16} color="#030712" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgGlow: {
    position: "absolute",
    borderRadius: 9999,
  },
  bgGlow1: {
    top: height * 0.08,
    left: -100,
    width: 280,
    height: 280,
    backgroundColor: "rgba(34, 197, 94, 0.06)",
  },
  bgGlow2: {
    top: height * 0.25,
    right: -120,
    width: 300,
    height: 300,
    backgroundColor: "rgba(56, 189, 248, 0.04)",
  },
  bgGlow3: {
    bottom: height * 0.05,
    left: -60,
    width: 250,
    height: 250,
    backgroundColor: "rgba(167, 139, 250, 0.04)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.15)",
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
    marginRight: 8,
  },
  stepText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: 9999,
    marginBottom: 32,
    overflow: "hidden",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#4ade80",
    borderRadius: 9999,
  },
  sceneWrapper: {
    height: height * 0.28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  sceneContainer: {
    width: width * 0.75,
    height: height * 0.25,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  // Welcome scene
  centerDevice: {
    width: 72,
    height: 100,
    borderRadius: 16,
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderWidth: 1.5,
    borderColor: "rgba(74, 222, 128, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  deviceScreen: {
    alignItems: "center",
    gap: 8,
  },
  deviceLines: {
    gap: 4,
  },
  deviceLine: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(74, 222, 128, 0.2)",
  },
  connectionLine: {
    position: "absolute",
    height: 1.5,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderRadius: 1,
  },

  // Connect scene
  hubCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderWidth: 2,
    borderColor: "rgba(74, 222, 128, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  hubInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  orbitRing: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.08)",
  },
  orbitRingOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 0.5,
    borderColor: "rgba(74, 222, 128, 0.04)",
  },
  orbitContainer: {
    position: "absolute",
    width: 170,
    height: 170,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitIcon: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Publish scene
  rocketContainer: {
    zIndex: 10,
  },
  rocketBody: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderWidth: 1.5,
    borderColor: "rgba(74, 222, 128, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  // Text area
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  subtitleLine: {
    width: 24,
    height: 1,
    backgroundColor: "rgba(74, 222, 128, 0.3)",
  },
  subtitle: {
    color: "#4ade80",
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
    textAlign: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 16,
    lineHeight: 42,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  description: {
    color: "#9ca3af",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 300,
  },

  // Dots
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    gap: 8,
  },
  dot: {
    borderRadius: 9999,
  },
  dotActive: {
    width: 28,
    height: 8,
    backgroundColor: "#4ade80",
    borderRadius: 4,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: "#1f2937",
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 44,
  },
  getStartedButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedText: {
    color: "#030712",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  getStartedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(3, 7, 18, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 6,
  },
  hidden: {
    opacity: 0,
  },
  backText: {
    color: "#6b7280",
    fontSize: 15,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  continueText: {
    color: "#030712",
    fontSize: 15,
    fontWeight: "700",
  },
});