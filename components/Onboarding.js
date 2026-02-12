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

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    title: "Welcome to\nCross-Post",
    subtitle: "THE FUTURE OF SHARING",
    description:
      "Share your content across multiple social platforms with just one tap.",
    icon: "phone-portrait",
  },
  {
    title: "Connect Your\nAccounts",
    subtitle: "SEAMLESS INTEGRATION",
    description:
      "Link your favorite social media accounts like Twitter, Instagram, LinkedIn, and more.",
    icon: "link",
  },
  {
    title: "Post\nEverywhere",
    subtitle: "ONE TAP PUBLISHING",
    description:
      "Write your post once and publish it to all your connected platforms simultaneously.",
    icon: "rocket",
  },
];

export default function Onboarding({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(33.33)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ((currentIndex + 1) / onboardingData.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const animateTransition = (direction, callback) => {
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
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === "next" ? 50 : -50);
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
      ]).start(() => {
        setIsAnimating(false);
      });
    });
  };

  const goToNext = () => {
    if (currentIndex < onboardingData.length - 1 && !isAnimating) {
      setIsAnimating(true);
      animateTransition("next", () => {
        setCurrentIndex((prev) => prev + 1);
      });
    }
  };

  const goToBack = () => {
    if (currentIndex > 0 && !isAnimating) {
      setIsAnimating(true);
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

        if (!isAnimating) {
          const threshold = width * 0.2;
          if (
            gestureState.dx < -threshold &&
            currentIndex < onboardingData.length - 1
          ) {
            goToNext();
          } else if (gestureState.dx > threshold && currentIndex > 0) {
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

      <View style={styles.backgroundContainer}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
        <View style={[styles.bgCircle, styles.bgCircle3]} />
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{ flex: 1, transform: [{ translateX: swipeAnim }] }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(onboardingData.length).padStart(2, "0")}
            </Text>
            <TouchableOpacity onPress={onComplete}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBar, { width: progressWidth }]}
            />
          </View>

          <Animated.View
            className="flex-1 justify-center items-center"
            style={[
              styles.slideContent,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <View style={styles.iconOuter}>
                <View style={styles.iconInner}>
                  <Ionicons
                    name={currentSlide.icon}
                    size={48}
                    color="#4ade80"
                  />
                </View>
              </View>
              <View style={styles.iconDivider} />
            </View>

            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
                <Text style={styles.title}>{currentSlide.title}</Text>
                <View style={styles.titleDivider} />
                <Text style={styles.description}>
                  {currentSlide.description}
                </Text>
              </View>
            </View>

            <View style={styles.dotsContainer}>
              {onboardingData.map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex
                      ? styles.dotActive
                      : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </View>
        <View style={styles.footer}>
          {isLastSlide ? (
            <TouchableOpacity
              onPress={onComplete}
              style={styles.getStartedButton}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                onPress={goToBack}
                style={[styles.backButton, currentIndex === 0 && styles.hidden]}
                disabled={currentIndex === 0}
              >
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToNext}
                style={styles.continueButton}
              >
                <Text style={styles.continueText}>Continue</Text>
                <Text style={styles.arrow}>→</Text>
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
  bgCircle: {
    position: "absolute",
    borderRadius: 9999,
  },
  bgCircle1: {
    top: 80,
    left: -80,
    width: 256,
    height: 256,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  bgCircle2: {
    top: 160,
    right: -128,
    width: 320,
    height: 320,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  bgCircle3: {
    bottom: -80,
    left: 40,
    width: 288,
    height: 288,
    backgroundColor: "rgba(20, 184, 166, 0.1)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerText: {
    color: "#4ade80",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "500",
  },
  skipText: {
    color: "#6b7280",
    fontSize: 14,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#1f2937",
    borderRadius: 9999,
    marginBottom: 40,
    overflow: "hidden",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#4ade80",
    borderRadius: 9999,
  },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "rgba(34, 197, 94, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconDivider: {
    width: 160,
    height: 4,
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    borderRadius: 9999,
    marginTop: 16,
  },
  card: {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1f2937",
    width: "100%",
  },
  cardContent: {
    alignItems: "center",
  },
  subtitle: {
    color: "#4ade80",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
    lineHeight: 44,
    textAlign: "center",
  },
  titleDivider: {
    width: 64,
    height: 4,
    backgroundColor: "#22c55e",
    borderRadius: 9999,
    marginBottom: 16,
  },
  description: {
    color: "#9ca3af",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  dot: {
    height: 8,
    borderRadius: 9999,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: "#4ade80",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#374151",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4ade80",
  },
  getStartedText: {
    color: "#030712",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  hidden: {
    opacity: 0,
  },
  backText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4ade80",
  },
  continueText: {
    color: "#030712",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  arrow: {
    color: "#030712",
    fontSize: 18,
  },
});
