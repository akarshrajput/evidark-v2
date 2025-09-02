import { Inter } from "next/font/google";
import Link from "next/link";
import React from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

// Netflix-inspired compact logo with spooky theme
const EvidarkLogo = ({ className = "h-8" }) => (
  <svg
    viewBox="0 0 200 40"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="netflixGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="50%" stopColor="#b91c1c" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <filter id="subtleGlow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* E */}
    <rect
      x="10"
      y="8"
      width="20"
      height="4"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <rect
      x="10"
      y="8"
      width="4"
      height="24"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <rect
      x="10"
      y="18"
      width="16"
      height="4"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <rect
      x="10"
      y="28"
      width="20"
      height="4"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />

    {/* V */}
    <polygon
      points="40,8 44,8 50,28 52,28 58,8 62,8 54,32 48,32"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />

    {/* I */}
    <rect
      x="72"
      y="8"
      width="4"
      height="24"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <circle
      cx="74"
      cy="4"
      r="2"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />

    {/* D */}
    <rect
      x="86"
      y="8"
      width="4"
      height="24"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <path
      d="M90 8 L102 8 Q108 8 108 20 Q108 32 102 32 L90 32 Z"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <path
      d="M94 12 L102 12 Q104 12 104 20 Q104 28 102 28 L94 28 Z"
      fill="#0a0a0b"
    />

    {/* A */}
    <polygon
      points="118,32 122,32 124,26 132,26 134,32 138,32 130,8 126,8"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <rect x="125" y="20" width="6" height="3" fill="#0a0a0b" />

    {/* R */}
    <rect
      x="148"
      y="8"
      width="4"
      height="24"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <path
      d="M152 8 L162 8 Q166 8 166 16 Q166 20 162 20 L152 20 Z"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <path
      d="M156 12 L162 12 Q162 12 162 16 Q162 16 162 16 L156 16 Z"
      fill="#0a0a0b"
    />
    <polygon
      points="160,20 164,20 168,32 172,32 166,20"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />

    {/* K */}
    <rect
      x="182"
      y="8"
      width="4"
      height="24"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />
    <polygon
      points="186,20 190,8 194,8 188,22 194,32 190,32"
      fill="url(#netflixGradient)"
      filter="url(#subtleGlow)"
    />

    {/* Subtle accent dot */}
    <circle
      cx="196"
      cy="12"
      r="1.5"
      fill="#fbbf24"
      opacity="0.8"
      filter="url(#subtleGlow)"
    />
  </svg>
);

const Logo = ({ size = "default", showText = true, compact = false }) => {
  const logoHeight =
    size === "small" ? "h-6" : size === "large" ? "h-10" : "h-8";
  const textSize =
    size === "small" ? "text-lg" : size === "large" ? "text-2xl" : "text-xl";

  if (compact) {
    return (
      <Link href="/" className="group">
        <div className="transition-all duration-300 hover:scale-105">
          <EvidarkLogo
            className={`${logoHeight} transition-all duration-300 group-hover:drop-shadow-lg group-hover:drop-shadow-red-500/30`}
          />
        </div>
      </Link>
    );
  }

  return (
    <Link href="/" className="group">
      <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
        <EvidarkLogo
          className={`${logoHeight} transition-all duration-300 group-hover:drop-shadow-lg group-hover:drop-shadow-red-500/30`}
        />
      </div>
    </Link>
  );
};

export default Logo;
