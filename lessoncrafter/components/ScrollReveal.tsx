"use client";

import React, { useRef, useEffect, useState } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;         // ms
  duration?: number;      // ms
  direction?: Direction;
  distance?: number;      // px
  threshold?: number;
  rootMargin?: string;
  className?: string;
  once?: boolean;
}

const directionMap: Record<Direction, string> = {
  up:    "translateY(28px)",
  down:  "translateY(-28px)",
  left:  "translateX(-28px)",
  right: "translateX(28px)",
  fade:  "translateY(0px)",
};

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 600,
  direction = "up",
  distance,
  threshold = 0.12,
  rootMargin = "-30px",
  className = "",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  const transform = distance
    ? direction === "left"
      ? `translateX(-${distance}px)`
      : direction === "right"
      ? `translateX(${distance}px)`
      : direction === "down"
      ? `translateY(-${distance}px)`
      : `translateY(${distance}px)`
    : directionMap[direction];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : transform,
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

