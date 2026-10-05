"use client";

import useInView from "@/hooks/useInView";

const VARIANTS = {
  up: "",
  scale: "reveal-scale",
  left: "reveal-left",
  right: "reveal-right",
};

export default function Reveal({ as: Tag = "div", variant = "up", delay = 0, className = "", children }) {
  const [ref, inView] = useInView();

  return (
    <Tag
      ref={ref}
      className={`reveal ${VARIANTS[variant]} ${inView ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
