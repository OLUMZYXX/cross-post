"use client";

import { useCallback, useEffect, useState } from "react";

export default function useAutoCycle(length, intervalMs = 5000) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || length < 2) return undefined;
    const timer = setTimeout(() => setActiveIndex((index) => (index + 1) % length), intervalMs);
    return () => clearTimeout(timer);
  }, [activeIndex, paused, length, intervalMs]);

  const select = useCallback((index) => setActiveIndex(index), []);
  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  return { activeIndex, paused, select, pause, resume };
}
