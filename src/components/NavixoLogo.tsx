// src/components/NavixoLogo.tsx
/**
 * NAVIXO Logo Component
 * Futuristic neon wordmark with glowing compass/arrow X
 */

import React from "react";

interface NavixoLogoProps {
  className?: string;
  size?: number;
  variant?: "default" | "white";
}

export function NavixoLogo({
  className = "",
  size = 24,
  variant = "default",
}: NavixoLogoProps) {
  const baseColor = variant === "white" ? "#FFFFFF" : "#FFFFFF";

  return (
    <svg
      width={size * 5}
      height={size}
      viewBox="0 0 140 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradient for the X */}
        <linearGradient
          id="x-glow-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#14F4C9" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Glow filter for X */}
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* N */}
      <path
        d="M 2 22 L 2 6 L 4.5 6 L 11 16 L 11 6 L 13.5 6 L 13.5 22 L 11 22 L 4.5 12 L 4.5 22 Z"
        fill={baseColor}
      />

      {/* A */}
      <path
        d="M 20 22 L 18.5 18 L 25 18 L 23.5 22 L 26 22 L 31 6 L 28.5 6 L 21.75 22 Z M 22 8 L 24.5 16 L 19 16 Z"
        fill={baseColor}
        transform="translate(-1, 0)"
      />

      {/* V */}
      <path
        d="M 33 6 L 36.5 18 L 40 6 L 42.5 6 L 38 22 L 35 22 L 30.5 6 Z"
        fill={baseColor}
      />

      {/* I */}
      <path d="M 46 6 L 46 22 L 48.5 22 L 48.5 6 Z" fill={baseColor} />

      {/* Special X - Compass/Arrow with Neon Glow */}
      <g filter="url(#neon-glow)">
        {/* X as crossed arrows forming compass direction */}
        <path
          d="M 62 6 L 59.5 8.5 L 55 13 L 50.5 8.5 L 48 11 L 52.5 15.5 L 48 20 L 50.5 22.5 L 55 18 L 59.5 22.5 L 62 20 L 57.5 15.5 L 62 11 Z"
          fill="url(#x-glow-gradient)"
          stroke="#3B82F6"
          strokeWidth="0.5"
        />

        {/* Compass direction points */}
        <circle cx="62" cy="6" r="1" fill="#3B82F6" />
        <circle cx="48" cy="11" r="0.8" fill="#14F4C9" />
        <circle cx="62" cy="20" r="0.8" fill="#8B5CF6" />
        <circle cx="48" cy="20" r="1" fill="#3B82F6" />

        {/* Center navigation point */}
        <circle cx="55" cy="14" r="1" fill="#14F4C9" opacity="0.8" />
      </g>

      {/* O */}
      <path
        d="M 75 6 C 71 6 68 9 68 14 C 68 19 71 22 75 22 C 79 22 82 19 82 14 C 82 9 79 6 75 6 Z M 75 8.5 C 77.5 8.5 79.5 10.5 79.5 14 C 79.5 17.5 77.5 19.5 75 19.5 C 72.5 19.5 70.5 17.5 70.5 14 C 70.5 10.5 72.5 8.5 75 8.5 Z"
        fill={baseColor}
      />
    </svg>
  );
}

// Text-only version for smaller spaces
export function NavixoWordmark({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "white";
}) {
  const color = variant === "white" ? "text-white" : "text-white";

  return (
    <span
      className={`tracking-tight ${color} ${className}`}
      style={{
        fontFamily: "Space Grotesk, Inter, system-ui, sans-serif",
        fontWeight: 700,
        fontSize: "1.25rem",
      }}
    >
      NAVI
      <span
        className="relative inline-block bg-gradient-to-r from-[#3B82F6] via-[#14F4C9] to-[#8B5CF6] bg-clip-text text-transparent"
        style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))" }}
      >
        X
      </span>
      O
    </span>
  );
}
