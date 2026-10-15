import React from 'react';

interface ApiGatekeeperLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
  showText?: boolean;
}

export const ApiGatekeeperLogo: React.FC<ApiGatekeeperLogoProps> = ({
  className = 'h-10 w-10',
  size = 40,
  glow = true,
  showText = false,
}) => {
  return (
    <div className="inline-flex items-center gap-3.5 group cursor-pointer select-none">
      {/* High-Tech Shield Emblem Container */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-red-500/60 shadow-xl shadow-red-950/80 group-hover:border-red-400 group-hover:scale-105 transition-all duration-300 ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Ambient Neon Back-Glow */}
        {glow && (
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-red-600/40 via-red-500/20 to-amber-500/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}

        {/* High-Precision Cyber Vector SVG Logo */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full p-1.5 drop-shadow-[0_2px_12px_rgba(239,68,68,0.7)]"
        >
          <defs>
            {/* Primary Dark Obsidian Armor Gradient */}
            <linearGradient id="gkObsidianBase" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#31090f" />
              <stop offset="45%" stopColor="#140408" />
              <stop offset="100%" stopColor="#060102" />
            </linearGradient>

            {/* Glowing Crimson Perimeter Gradient */}
            <linearGradient id="gkCrimsonStroke" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="80%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Gateway Laser Stream */}
            <linearGradient id="gkLaserStream" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.3" />
            </linearGradient>

            {/* Core Fusion Reactor Glow */}
            <radialGradient id="gkCorePulse" cx="50" cy="50" r="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#f87171" />
              <stop offset="65%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Angular Cyber Aegis Crest */}
          <path
            d="M50 6L88 18V45C88 68 72 87 50 94C28 87 12 68 12 45V18L50 6Z"
            fill="url(#gkObsidianBase)"
            stroke="url(#gkCrimsonStroke)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Inset Defense Armor Plate */}
          <path
            d="M50 15L78 24V45C78 63 65 78 50 83C35 78 22 63 22 45V24L50 15Z"
            fill="#0f0205"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* Gatekeeper Symmetrical Laser Portal Pillars */}
          <path
            d="M36 28V72M36 38L43 44M36 50L43 44"
            stroke="url(#gkLaserStream)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M64 28V72M64 38L57 44M64 50L57 44"
            stroke="url(#gkLaserStream)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gateway Horizontal Energy Laser Beams */}
          <line x1="39" y1="26" x2="61" y2="26" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="39" y1="74" x2="61" y2="74" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" />

          {/* Center Firewall Neural Reactor Core */}
          <circle cx="50" cy="50" r="10" fill="#2a080c" stroke="#f87171" strokeWidth="2" />
          <circle cx="50" cy="50" r="6" fill="url(#gkCorePulse)" />
          <circle cx="50" cy="50" r="2" fill="#ffffff" />

          {/* Node Sensor Lights */}
          <circle cx="50" cy="11" r="2.5" fill="#fca5a5" />
          <circle cx="88" cy="18" r="2" fill="#ef4444" />
          <circle cx="12" cy="18" r="2" fill="#ef4444" />
        </svg>

        {/* Gloss Overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      </div>

      {/* Optional Integrated Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-base sm:text-lg font-black tracking-widest text-white uppercase font-mono leading-none drop-shadow-sm">
            API GATEKEEPER
          </span>
          <span className="text-[10px] sm:text-xs tracking-wider text-red-400 font-bold uppercase font-mono mt-1">
            Autonomous WAF Perimeter
          </span>
        </div>
      )}
    </div>
  );
};
