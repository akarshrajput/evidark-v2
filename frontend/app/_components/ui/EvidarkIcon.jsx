import React from "react";

const EvidarkIcon = ({ 
  className = "w-10 h-10", 
  variant = "default",
  animated = false 
}) => {
  const animationClass = animated ? "animate-pulse" : "";
  
  if (variant === "minimal") {
    return (
      <svg
        viewBox="0 0 60 60"
        className={`${className} ${animationClass}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="minimalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>
        
        {/* Simple E shape */}
        <g transform="translate(15, 15)">
          <rect x="0" y="0" width="25" height="4" fill="url(#minimalGradient)" />
          <rect x="0" y="0" width="4" height="30" fill="url(#minimalGradient)" />
          <rect x="0" y="13" width="20" height="4" fill="url(#minimalGradient)" />
          <rect x="0" y="26" width="25" height="4" fill="url(#minimalGradient)" />
        </g>
      </svg>
    );
  }

  if (variant === "monogram") {
    return (
      <svg
        viewBox="0 0 80 80"
        className={`${className} ${animationClass}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="monogramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>
        
        {/* Circular background */}
        <circle cx="40" cy="40" r="35" fill="url(#monogramGradient)" opacity="0.1" />
        <circle cx="40" cy="40" r="35" fill="none" stroke="url(#monogramGradient)" strokeWidth="2" />
        
        {/* Stylized ED monogram */}
        <g transform="translate(20, 25)">
          {/* E */}
          <rect x="0" y="0" width="15" height="3" fill="url(#monogramGradient)" />
          <rect x="0" y="0" width="3" height="30" fill="url(#monogramGradient)" />
          <rect x="0" y="13.5" width="12" height="3" fill="url(#monogramGradient)" />
          <rect x="0" y="27" width="15" height="3" fill="url(#monogramGradient)" />
          
          {/* D */}
          <rect x="20" y="0" width="3" height="30" fill="url(#monogramGradient)" />
          <path d="M23 0 L35 0 Q40 0 40 15 Q40 30 35 30 L23 30 Z" fill="url(#monogramGradient)" />
          <path d="M26 3 L35 3 Q37 3 37 15 Q37 27 35 27 L26 27 Z" fill="#0a0a0b" />
        </g>
      </svg>
    );
  }

  // Default variant (the main logo icon)
  return (
    <svg
      viewBox="0 0 120 120"
      className={`${className} ${animationClass}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="30%" stopColor="#b91c1c" />
          <stop offset="70%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="sharpGlow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer hexagonal frame */}
      <path
        d="M60 10 L90 30 L90 90 L60 110 L30 90 L30 30 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        opacity="0.4"
        filter="url(#softGlow)"
      />
      
      {/* Inner geometric pattern - stylized "E" with modern twist */}
      <g transform="translate(35, 35)">
        {/* Main E structure */}
        <rect x="0" y="0" width="40" height="8" fill="url(#logoGradient)" filter="url(#sharpGlow)" />
        <rect x="0" y="0" width="8" height="50" fill="url(#logoGradient)" filter="url(#sharpGlow)" />
        <rect x="0" y="21" width="30" height="8" fill="url(#logoGradient)" filter="url(#sharpGlow)" />
        <rect x="0" y="42" width="40" height="8" fill="url(#logoGradient)" filter="url(#sharpGlow)" />
        
        {/* Accent elements for modern look */}
        <rect x="45" y="5" width="3" height="3" fill="url(#accentGradient)" filter="url(#sharpGlow)" />
        <rect x="45" y="26" width="3" height="3" fill="url(#accentGradient)" filter="url(#sharpGlow)" />
        <rect x="45" y="47" width="3" height="3" fill="url(#accentGradient)" filter="url(#sharpGlow)" />
      </g>
      
      {/* Decorative corner elements */}
      <circle cx="25" cy="25" r="2" fill="url(#accentGradient)" opacity="0.6" />
      <circle cx="95" cy="25" r="2" fill="url(#accentGradient)" opacity="0.6" />
      <circle cx="25" cy="95" r="2" fill="url(#accentGradient)" opacity="0.6" />
      <circle cx="95" cy="95" r="2" fill="url(#accentGradient)" opacity="0.6" />
      
      {/* Subtle inner glow effect */}
      <path
        d="M60 15 L85 32 L85 88 L60 105 L35 88 L35 32 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="1"
        opacity="0.2"
      />
    </svg>
  );
};

export default EvidarkIcon;
