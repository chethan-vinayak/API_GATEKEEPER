import React from 'react';

interface ApiGatekeeperLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const ApiGatekeeperLogo: React.FC<ApiGatekeeperLogoProps> = ({
  className = 'h-9 w-9',
  size = 36,
  glow = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient pulse & bloom */}
      {glow && (
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-red-600/30 via-red-500/20 to-transparent blur-md opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}

      {/* High-Fidelity Cyber Shield & Gateway SVG Emblem */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_2px_10px_rgba(220,38,38,0.45)]"
      >
        <defs>
          {/* Obsidian & Crimson Primary Gradient */}
          <linearGradient id="shieldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b2e" />
            <stop offset="40%" stopColor="#160c18" />
            <stop offset="100%" stopColor="#08020a" />
          </linearGradient>

          {/* Glowing Crimson Border Stroke Gradient */}
          <linearGradient id="neonRedBorder" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="35%" stopColor="#ef4444" />
            <stop offset="70%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* Inner Gateway Portal Light */}
          <linearGradient id="gatewayBeam" x1="24" y1="10" x2="24" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.2" />
          </linearGradient>

          {/* Core Reactor Glow */}
          <radialGradient id="reactorGlow" cx="24" cy="24" r="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f87171" />
            <stop offset="80%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
          </radialGradient>

          {/* Subtle Cyber Grid Pattern */}
          <linearGradient id="cyberPylon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Outer Faceted Shield Container */}
        <path
          d="M24 3L40 9V22C40 32.5 33.2 41.5 24 45C14.8 41.5 8 32.5 8 22V9L24 3Z"
          fill="url(#shieldGrad)"
          stroke="url(#neonRedBorder)"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        {/* Inner Security Chamber Facets */}
        <path
          d="M24 7L36 12V21C36 29.2 30.8 36.4 24 39.5C17.2 36.4 12 29.2 12 21V12L24 7Z"
          stroke="#450a0a"
          strokeWidth="1"
          strokeOpacity="0.6"
          fill="#1c070e"
          fillOpacity="0.45"
        />

        {/* Digital Gateway Arch & Defense Pillars */}
        {/* Left Pylon */}
        <path
          d="M17 17V30M17 21L21 24M17 27L21 24"
          stroke="url(#cyberPylon)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Pylon */}
        <path
          d="M31 17V30M31 21L27 24M31 27L27 24"
          stroke="url(#cyberPylon)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gate Beam Horizontal Barricades */}
        <path
          d="M19 15H29M20 33H28"
          stroke="#f87171"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        {/* Perimeter Gateway Center Keystones (Aegis Gate) */}
        <path
          d="M24 11V16M24 32V37"
          stroke="#fca5a5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Center Concentric Firewall Sensor Core */}
        <circle cx="24" cy="24" r="5" fill="#2a080c" stroke="#ef4444" strokeWidth="1.2" />
        <circle cx="24" cy="24" r="2.5" fill="url(#reactorGlow)" />
        <circle cx="24" cy="24" r="1" fill="#ffffff" />

        {/* Subtle Diagonal Security Scan Marks */}
        <circle cx="24" cy="7" r="1" fill="#fca5a5" />
        <circle cx="40" cy="9" r="0.8" fill="#ef4444" />
        <circle cx="8" cy="9" r="0.8" fill="#ef4444" />
      </svg>
    </div>
  );
};
