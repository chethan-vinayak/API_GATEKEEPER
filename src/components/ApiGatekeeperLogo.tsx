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
    <div className={`inline-flex items-center gap-3.5 group cursor-pointer select-none`}>
      {/* Icon Container with Precision Cyber Styling */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-b from-red-950/80 via-slate-950 to-black border border-red-500/60 shadow-lg shadow-red-950/80 group-hover:border-red-400 group-hover:shadow-red-600/30 transition-all duration-300 ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Ambient Neon Back-Glow */}
        {glow && (
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-red-600/40 via-red-500/20 to-amber-500/10 blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}

        {/* High-Contrast Vector Cyber Shield SVG */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full p-1.5 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]"
        >
          <defs>
            {/* Outer Armor Metallic Gradient */}
            <linearGradient id="gkShieldArmor" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2e0a0e" />
              <stop offset="50%" stopColor="#180407" />
              <stop offset="100%" stopColor="#080103" />
            </linearGradient>

            {/* Glowing Perimeter Crimson Stroke */}
            <linearGradient id="gkCrimsonRim" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="85%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>

            {/* Inner Portal Beam Light */}
            <linearGradient id="gkGateBeam" x1="32" y1="14" x2="32" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0.3" />
            </linearGradient>

            {/* Core Fusion Reactor Glow */}
            <radialGradient id="gkCoreReactor" cx="32" cy="32" r="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#f87171" />
              <stop offset="70%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Heavy Hexagonal Shield Crest */}
          <path
            d="M32 4L54 12V28C54 43.5 44.5 56 32 60C19.5 56 10 43.5 10 28V12L32 4Z"
            fill="url(#gkShieldArmor)"
            stroke="url(#gkCrimsonRim)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Layer 2 Armor Inset */}
          <path
            d="M32 10L48 16V28C48 40 41 50 32 53.5C23 50 16 40 16 28V16L32 10Z"
            fill="#120306"
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />

          {/* Gatekeeper Twin Portal Pillars / Pylons */}
          <path
            d="M23 20V42M23 26L28 30M23 34L28 30"
            stroke="url(#gkGateBeam)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M41 20V42M41 26L36 30M41 34L36 30"
            stroke="url(#gkGateBeam)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Gateway Energy Laser Grid Lines */}
          <line x1="32" y1="14" x2="32" y2="22" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="42" x2="32" y2="50" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
          <line x1="25" y1="18" x2="39" y2="18" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="25" y1="46" x2="39" y2="46" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />

          {/* Central Reactor Sensor Core */}
          <circle cx="32" cy="32" r="7" fill="#2a080c" stroke="#f87171" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="4" fill="url(#gkCoreReactor)" />
          <circle cx="32" cy="32" r="1.5" fill="#ffffff" />

          {/* Corner Sensor Node Lights */}
          <circle cx="32" cy="7" r="1.5" fill="#fca5a5" />
          <circle cx="54" cy="12" r="1.2" fill="#f87171" />
          <circle cx="10" cy="12" r="1.2" fill="#f87171" />
        </svg>

        {/* Gloss Overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      </div>

      {/* Optional Integrated Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-base sm:text-lg font-black tracking-widest text-white uppercase font-mono leading-none drop-shadow-sm">
            API GATEKEEPER
          </span>
          <span className="text-[10px] sm:text-xs tracking-wider text-red-400/90 font-bold uppercase font-mono mt-1">
            Autonomous WAF Perimeter
          </span>
        </div>
      )}
    </div>
  );
};
