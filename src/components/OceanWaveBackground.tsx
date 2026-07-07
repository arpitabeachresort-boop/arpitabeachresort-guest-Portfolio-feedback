import React from 'react';

export default function OceanWaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Decorative luxury gradient ambient lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(197,160,89,0.12)_0%,transparent_70%)] animate-pulse-gentle" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(20,110,120,0.04)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(197,160,89,0.06)_0%,transparent_70%)]" />

      {/* Embedded waves */}
      <div className="absolute left-0 right-0 bottom-0 top-0 opacity-40 dark:opacity-55 transition-opacity duration-700">
        {/* Layer 1: Foreground receding wave (Warm Gold/Seafoam) */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[320px] text-gold/5 dark:text-gold/10"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,160 C320,300 640,100 960,220 C1280,340 1380,180 1440,160 L1440,320 L0,320 Z"
            className="animate-float"
          />
        </svg>

        {/* Layer 2: Midground ocean wave */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[260px] text-teal-600/5 dark:text-gold/5"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,120 C400,20 800,240 1200,100 C1320,30 1380,80 1440,120 L1440,260 L0,260 Z"
            className="animate-float-reverse"
          />
        </svg>

        {/* Layer 3: Deep tidal curve */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[180px] text-gold/10 dark:text-teal-950/20"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,80 C300,180 600,20 900,120 C1200,220 1350,110 1440,80 L1440,180 L0,180 Z"
            style={{ animation: 'float-slow 14s ease-in-out infinite' }}
          />
        </svg>
      </div>

      {/* Decorative luxury abstract lines (Chandipur Receding Tide lines) */}
      <div className="absolute top-[20%] right-[5%] w-72 h-72 border border-gold/10 dark:border-gold/20 rounded-full pointer-events-none select-none mix-blend-overlay animate-float opacity-30" />
      <div className="absolute bottom-[30%] left-[2%] w-96 h-96 border border-gold/5 dark:border-gold/10 rounded-full pointer-events-none select-none mix-blend-overlay animate-float-reverse opacity-40" />
    </div>
  );
}
