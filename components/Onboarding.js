import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { useState, useRef, useEffect } from "react";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    title: "Welcome to\nCross-Post",
    subtitle: "THE FUTURE OF SHARING",
    description:
      "Share your content across multiple social platforms with just one tap.",
    icon: "📱",
  },
  {
    title: "Connect Your\nAccounts",
    subtitle: "SEAMLESS INTEGRATION",
    description:
      "Link your favorite social media accounts like Twitter, Instagram, LinkedIn, and more.",
    icon: "🔗",
  },
  {
    title: "Post\nEverywhere",
    subtitle: "ONE TAP PUBLISHING",
    description:
      "Write your post once and publish it to all your connected platforms simultaneously.",
    icon: "🚀",
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
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 bottom-0">
        <View className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-green-500/10" />
        <View className="absolute top-40 -right-32 w-80 h-80 rounded-full bg-emerald-500/10" />
        <View className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-teal-500/10" />
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{ flex: 1, transform: [{ translateX: swipeAnim }] }}
      >
        <View className="flex-1 px-6 pt-16">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-green-400 text-xs tracking-widest font-medium">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(onboardingData.length).padStart(2, "0")}
            </Text>
            <TouchableOpacity onPress={onComplete}>
              <Text className="text-gray-500 text-sm">Skip</Text>
            </TouchableOpacity>
          </View>

          <View className="h-1 bg-gray-800 rounded-full mb-10 overflow-hidden">
            <Animated.View
              className="h-1 bg-green-400 rounded-full"
              style={{ width: progressWidth }}
            />
          </View>

          <Animated.View
            className="flex-1 justify-center items-center"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            }}
          >
            <View className="items-center mb-6">
              <View className="w-32 h-32 rounded-full bg-gray-900 border-2 border-green-500/30 items-center justify-center">
                <View className="w-24 h-24 rounded-full bg-gray-800 border border-green-400/20 items-center justify-center">
                  <Text className="text-5xl">{currentSlide.icon}</Text>
                </View>
              </View>
              <View className="w-40 h-1 bg-green-400/20 rounded-full mt-4" />
            </View>

            <View className="bg-gray-900/80 rounded-3xl p-6 border border-gray-800 w-full">
              <View className="items-center">
                <Text className="text-green-400 text-xs tracking-widest mb-3 font-semibold text-center">
                  {currentSlide.subtitle}
                </Text>
                <Text className="text-4xl font-bold text-white mb-4 leading-tight text-center">
                  {currentSlide.title}
                </Text>
                <View className="w-16 h-1 bg-green-500 rounded-full mb-4" />
                <Text className="text-gray-400 text-base leading-6 text-center">
                  {currentSlide.description}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-center items-center mt-8">
              {onboardingData.map((_, index) => (
                <Animated.View
                  key={index}
                  className={`h-2 rounded-full mx-1 ${
                    index === currentIndex
                      ? "w-8 bg-green-400"
                      : "w-2 bg-gray-700"
                  }`}
                />
              ))}
            </View>
          </Animated.View>
        </View>

        <View className="px-6 pb-10">
          {isLastSlide ? (
            <TouchableOpacity
              onPress={onComplete}
              className="bg-green-500 py-5 rounded-2xl border border-green-400"
            >
              <Text className="text-gray-950 text-center text-lg font-bold tracking-wide">
                Get Started
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={goToBack}
                className={`py-4 px-6 ${currentIndex === 0 ? "opacity-0" : ""}`}
                disabled={currentIndex === 0}
              >
                <Text className="text-gray-500 text-base font-medium">
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToNext}
                className="bg-green-500 py-4 px-10 rounded-2xl flex-row items-center justify-center border border-green-400"
              >
                <Text className="text-gray-950 text-base font-bold mr-2">
                  Continue
                </Text>
                <Text className="text-gray-950 text-lg">→</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}
