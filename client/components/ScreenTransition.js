import { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";

export default function ScreenTransition({ children, activeKey }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;
  const scaleAnim = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(14);
    scaleAnim.setValue(0.985);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeKey]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}
