import { useRef } from "react";
import { Animated } from "react-native";

export default function useSpringScale() {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue, bounciness = 0) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 50, bounciness }).start();
  return { scale, animateTo };
}
