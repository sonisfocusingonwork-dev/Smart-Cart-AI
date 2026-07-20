import React from "react";

export function ClayCartLogo({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="-10 -10 125 120" xmlns="http://www.w3.org/2000/svg" className={className} overflow="visible">
      <defs>
        {/* Organic Green Gradient */}
        <linearGradient id="clayBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8CB867" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="claySparkle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4E6A9" />
          <stop offset="100%" stopColor="#65A30D" />
        </linearGradient>

        {/* Clay Filter (3D effect) */}
        <filter id="clay-effect" x="-20%" y="-20%" width="140%" height="140%">
          {/* Outer Drop Shadow */}
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F5E2D" floodOpacity="0.25" />
          
          {/* Top Inner Light (Soft white highlight) */}
          <feComponentTransfer in="SourceAlpha" result="alpha-light" />
          <feGaussianBlur stdDeviation="2" in="alpha-light" result="blur-light" />
          <feOffset dx="-2" dy="-3" in="blur-light" result="offset-light" />
          <feComposite operator="arithmetic" k2="-1" k3="1" result="diff-light" in="SourceAlpha" in2="offset-light" />
          <feFlood floodColor="#FFFFFF" floodOpacity="0.75" />
          <feComposite operator="in" in2="diff-light" />
          <feComposite operator="over" in2="SourceGraphic" result="mix-light" />
          
          {/* Bottom Inner Shadow (Dark green shade) */}
          <feGaussianBlur stdDeviation="2.5" in="SourceAlpha" result="blur-shadow" />
          <feOffset dx="3" dy="4" in="blur-shadow" result="offset-shadow" />
          <feComposite operator="arithmetic" k2="-1" k3="1" result="diff-shadow" in="SourceAlpha" in2="offset-shadow" />
          <feFlood floodColor="#064E3B" floodOpacity="0.5" />
          <feComposite operator="in" in2="diff-shadow" />
          <feComposite operator="over" in2="mix-light" />
        </filter>
      </defs>

      {/* Diffused floor shadow */}
      <ellipse cx="50" cy="94" rx="38" ry="5" fill="#334155" className="animate-pulse-shadow origin-[50px_94px]" />

      <g className="animate-bounce-cart">
        {/* Wheels (Chubby) */}
      <circle cx="36" cy="85" r="9" fill="#334155" />
      <circle cx="74" cy="85" r="9" fill="#334155" />
      {/* Wheel highlights */}
      <circle cx="33" cy="82" r="2.5" fill="#64748B" />
      <circle cx="71" cy="82" r="2.5" fill="#64748B" />

      {/* Base Chassis Bar */}
      <path d="M 28 75 L 82 75" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />

      {/* Handle (Push handle, angled up and back) */}
      <path d="M 25 35 C 15 35 10 25 12 16" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" fill="none" />

      {/* Main Basket Body (Slanted Shopping Cart Shape) */}
      <path 
        d="M 22 35 
           Q 20 25 30 25 
           L 85 25 
           Q 95 25 93 35 
           L 85 65 
           Q 83 72 75 72 
           L 35 72 
           Q 27 72 25 65 
           Z" 
        fill="url(#clayBody)" 
        filter="url(#clay-effect)" 
      />

      {/* Subtle Basket Grid Lines (Debossed effect wrapping the face) */}
      <g opacity="0.15">
        <path d="M 38 25 L 40 72 M 72 25 L 70 72" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 26 38 L 89 38 M 26 60 L 80 60" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Face Group */}
      {/* Blush */}
      <ellipse cx="42" cy="48" rx="6" ry="4" fill="#FFFFFF" opacity="0.35" />
      <ellipse cx="68" cy="48" rx="6" ry="4" fill="#FFFFFF" opacity="0.35" />
      {/* Eyes */}
      <circle cx="47" cy="42" r="4.5" fill="#1E293B" />
      <circle cx="63" cy="42" r="4.5" fill="#1E293B" />
      {/* Eye sparkles (Kawaii) */}
      <circle cx="48.5" cy="40.5" r="1.5" fill="#FFFFFF" />
      <circle cx="64.5" cy="40.5" r="1.5" fill="#FFFFFF" />
      {/* Smile */}
      <path d="M 52 48 Q 55 54 58 48" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
      
      {/* Sparkle 3D Emblem */}
      {/* Floating Sparkle top right */}
      <g filter="url(#clay-effect)" transform="rotate(15 90 15)">
        <path d="M 90 -2 Q 90 15 105 15 Q 90 15 90 32 Q 90 15 75 15 Q 90 15 90 -2 Z" fill="url(#claySparkle)" />
      </g>
      </g>
    </svg>
  );
}
