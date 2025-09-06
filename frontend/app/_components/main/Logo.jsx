import { Inter } from "next/font/google";
import Link from "next/link";
import React from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

// Professional Netflix-inspired EviDark logo
const EvidarkLogo = ({ className = "h-8" }) => (
  <svg
    viewBox="0 0 200 40"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="evidarkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="30%" stopColor="#f87171" />
        <stop offset="70%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      <linearGradient id="evidarkGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#f87171" stopOpacity="1" />
        <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
      </linearGradient>
      <filter
        id="professionalGlow"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
      >
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow
          dx="1"
          dy="1"
          stdDeviation="1"
          floodColor="#000000"
          floodOpacity="0.8"
        />
      </filter>
    </defs>

    {/* E */}
    <g>
      <rect x="12" y="8" width="18" height="3" fill="#ef4444" rx="1" />
      <rect x="12" y="8" width="3" height="24" fill="#ef4444" rx="1" />
      <rect x="12" y="18.5" width="14" height="3" fill="#ef4444" rx="1" />
      <rect x="12" y="29" width="18" height="3" fill="#ef4444" rx="1" />
    </g>

    {/* V */}
    <g>
      <polygon
        points="38,8 42,8 48,28 50,28 56,8 60,8 52,32 46,32"
        fill="#ef4444"
      />
    </g>

    {/* I */}
    <g>
      <rect x="70" y="8" width="3" height="24" fill="#ef4444" rx="1" />
      <circle cx="71.5" cy="4" r="1.5" fill="#ef4444" />
    </g>

    {/* D */}
    <g>
      <rect x="82" y="8" width="3" height="24" fill="#ef4444" rx="1" />
      <path
        d="M82,8 L95,8 Q103,8 103,20 Q103,32 95,32 L82,32"
        fill="#ef4444"
        stroke="none"
      />
    </g>

    {/* A */}
    <g>
      <polygon
        points="114,32 118,32 119,28 125,28 126,32 130,32 122,8 117,8"
        fill="#ef4444"
      />
      <rect x="120" y="22" width="4" height="3" fill="#ef4444" rx="1" />
    </g>

    {/* R */}
    <g>
      <rect x="140" y="8" width="3" height="24" fill="#ef4444" rx="1" />
      <path
        d="M140,8 L154,8 Q158,8 158,16 Q158,20 154,20 L140,20"
        fill="#ef4444"
      />
      <polygon points="150,20 154,20 158,32 154,32" fill="#ef4444" />
    </g>

    {/* K */}
    <g>
      <rect x="168" y="8" width="3" height="24" fill="#ef4444" rx="1" />
      <polygon
        points="171,20 178,8 182,8 175,20 182,32 178,32"
        fill="#ef4444"
      />
    </g>

    {/* Professional accent dot */}
    <circle
      cx="190"
      cy="12"
      r="2"
      fill="#f97316"
      opacity="0.9"
      filter="url(#professionalGlow)"
    />
  </svg>
);

const Logo = ({ size = "default", showText = true, compact = false }) => {
  const logoHeight =
    size === "small" ? "h-6" : size === "large" ? "h-10" : "h-8";

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
      <div className="flex items-center gap-2 transition-all duration-300">
        <EvidarkLogo className={`${logoHeight} transition-all duration-300`} />
      </div>
    </Link>
  );
};

export default Logo;
