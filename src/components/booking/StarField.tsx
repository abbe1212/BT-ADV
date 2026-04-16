"use client";

import { useMemo } from "react";

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

/* Pre-generate stars once — no Math.random() in render */
function generateStars(count: number, seed = 0): Star[] {
  // Simple seeded pseudo-random to avoid hydration mismatch
  let s = seed + 1;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${rand() * 100}%`,
    left: `${rand() * 100}%`,
    size: rand() < 0.6 ? 1 : rand() < 0.85 ? 2 : 3,
    delay: `${(rand() * 8).toFixed(2)}s`,
    duration: `${(3 + rand() * 5).toFixed(2)}s`,
    opacity: 0.3 + rand() * 0.7,
  }));
}

export default function StarField({ count = 180 }: { count?: number }) {
  const stars = useMemo(() => generateStars(count, 42), [count]);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationName: "starTwinkle",
            animationDuration: star.duration,
            animationDelay: star.delay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
          }}
        />
      ))}

      {/* Shooting stars (CSS only) */}
      {[1, 2, 3].map((i) => (
        <span
          key={`shoot-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
          style={{
            top: `${i * 25}%`,
            left: "-20%",
            width: "120px",
            animationName: "shootingStar",
            animationDuration: `${6 + i * 4}s`,
            animationDelay: `${i * 3}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            opacity: 0,
            transform: "rotate(-25deg)",
          }}
        />
      ))}
    </div>
  );
}
