import { useRef, useEffect } from "react";
import { PanResponder } from "react-native";

const EDGE_WIDTH = 60;
const TRIGGER_DISTANCE = 70;
const START_SLOP = 12;

export default function useSwipeBack(onBack, enabled = true) {
  const onBackRef = useRef(onBack);
  const enabledRef = useRef(enabled);
  const startX = useRef(0);
  const fired = useRef(false);

  useEffect(() => {
    onBackRef.current = onBack;
    enabledRef.current = enabled;
  }, [onBack, enabled]);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt) => {
        startX.current = evt.nativeEvent.pageX;
        fired.current = false;
        return false;
      },
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        enabledRef.current &&
        startX.current <= EDGE_WIDTH &&
        gesture.dx > START_SLOP &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2,
      onPanResponderMove: (_evt, gesture) => {
        if (fired.current || !enabledRef.current) return;
        if (gesture.dx > TRIGGER_DISTANCE && Math.abs(gesture.dy) < 80) {
          fired.current = true;
          onBackRef.current?.();
        }
      },
      onPanResponderRelease: () => {
        fired.current = false;
      },
      onPanResponderTerminationRequest: () => true,
    }),
  ).current;

  return responder.panHandlers;
}
