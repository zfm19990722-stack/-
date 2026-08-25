import React from 'react';
import { motion } from 'motion/react';

interface BreathingRingWithParticlesProps {
  breathingPhase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
  breathingCountdown: number;
  breathingText: string;
  isBgDark: boolean;
  language?: 'zh' | 'en';
  patternType?: string;
  sohumStage?: 1 | 2;
  cycleText?: string;
  mantraSubtext?: string;
}

// Pre-calculate 24 particle angles to cover a full circle evenly
const PARTICLE_COUNT = 24;
const PARTICLE_INDICES = Array.from({ length: PARTICLE_COUNT }, (_, i) => i);

export const BreathingRingWithParticles: React.FC<BreathingRingWithParticlesProps> = ({
  breathingPhase,
  breathingCountdown,
  breathingText,
  isBgDark,
  language = 'zh',
  patternType,
  sohumStage,
  cycleText,
  mantraSubtext,
}) => {
  // Map particle index to a constant angle
  const getParticleAngle = (index: number) => {
    return (index / PARTICLE_COUNT) * 2 * Math.PI;
  };

  // Define particle colors matching the breathing phase aesthetic
  const getParticleColor = (phase: string, index: number) => {
    switch (phase) {
      case 'inhale':
        // Gentle pink, rose, and amber hues for inhale
        return index % 3 === 0 ? 'bg-rose-300' : index % 3 === 1 ? 'bg-pink-300' : 'bg-amber-200';
      case 'holdIn':
        // Shimmering gold and white sparkles for hold in
        return index % 2 === 0 ? 'bg-amber-300' : 'bg-yellow-200';
      case 'exhale':
        // Serene sky blue, azure, and ice blue tones for exhale
        return index % 3 === 0 ? 'bg-sky-300' : index % 3 === 1 ? 'bg-cyan-300' : 'bg-teal-200';
      case 'holdOut':
        // Cosmic violet and soft lilac for empty-lung hold
        return index % 2 === 0 ? 'bg-purple-300' : 'bg-fuchsia-300';
      default:
        return 'bg-white';
    }
  };

  // Radial particle animation variants using Framer Motion
  const particleVariants = {
    inhale: (i: number) => {
      const angle = getParticleAngle(i);
      // Introduce subtle random variation for high organic natural realism
      const randomFactor = 0.85 + (i % 4) * 0.1;
      const startRadius = 38;
      const endRadius = 115 * randomFactor;
      
      return {
        x: [Math.cos(angle) * startRadius, Math.cos(angle) * endRadius],
        y: [Math.sin(angle) * startRadius, Math.sin(angle) * endRadius],
        scale: [0.4, 1.25, 0],
        opacity: [0, 0.95, 0],
        transition: {
          duration: 3.8,
          repeat: Infinity,
          // Staggered launch delays for continuous wind-like dispersion flow
          delay: (i % 6) * 0.5,
          ease: 'easeOut',
        },
      };
    },
    exhale: (i: number) => {
      const angle = getParticleAngle(i);
      const randomFactor = 0.9 + (i % 4) * 0.1;
      const startRadius = 125 * randomFactor;
      const endRadius = 12;

      return {
        x: [Math.cos(angle) * startRadius, Math.cos(angle) * endRadius],
        y: [Math.sin(angle) * startRadius, Math.sin(angle) * endRadius],
        scale: [0, 1.15, 0.3],
        opacity: [0, 0.9, 0],
        transition: {
          duration: 3.5,
          repeat: Infinity,
          delay: ((i * 3) % 7) * 0.45,
          ease: 'easeIn',
        },
      };
    },
    holdIn: (i: number) => {
      const angle = getParticleAngle(i);
      const orbitRadius = 65 + (i % 3) * 6;
      return {
        // Floating/hovering shimmer orbit
        x: [
          Math.cos(angle) * orbitRadius,
          Math.cos(angle + 0.15) * (orbitRadius + 4),
          Math.cos(angle) * orbitRadius,
        ],
        y: [
          Math.sin(angle) * orbitRadius,
          Math.sin(angle + 0.15) * (orbitRadius + 4),
          Math.sin(angle) * orbitRadius,
        ],
        scale: [0.8, 1.3, 0.8],
        opacity: [0.4, 0.95, 0.4],
        transition: {
          duration: 2.2 + (i % 3) * 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    },
    holdOut: (i: number) => {
      const angle = getParticleAngle(i);
      const orbitRadius = 48 + (i % 2) * 5;
      return {
        x: [
          Math.cos(angle) * orbitRadius,
          Math.cos(angle - 0.1) * (orbitRadius - 3),
          Math.cos(angle) * orbitRadius,
        ],
        y: [
          Math.sin(angle) * orbitRadius,
          Math.sin(angle - 0.1) * (orbitRadius - 3),
          Math.sin(angle) * orbitRadius,
        ],
        scale: [0.7, 1.15, 0.7],
        opacity: [0.3, 0.85, 0.3],
        transition: {
          duration: 2.5 + (i % 2) * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    },
  };

  return (
    <div className="relative flex items-center justify-center w-72 h-72 md:w-80 md:h-80 select-none">
      
      {/* 1. OUTER AURAS (Ambient Ring Echoes) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Breathing expanding radial ring shadow */}
        <div 
          className={`absolute rounded-full border-2 transition-all duration-[4000ms] ease-in-out ${
            breathingPhase === 'inhale' ? 'w-[230px] h-[230px] opacity-25 border-pink-400 scale-105' :
            breathingPhase === 'holdIn' ? 'w-[245px] h-[245px] opacity-40 border-amber-300 scale-110 blur-sm animate-pulse' :
            breathingPhase === 'exhale' ? 'w-[200px] h-[200px] opacity-15 border-sky-400 scale-95' :
            'w-[185px] h-[185px] opacity-10 border-purple-400 scale-90'
          }`}
        />
        
        {/* Soft backdrop radial light beam flare */}
        <div 
          className={`absolute rounded-full blur-[40px] opacity-10 transition-all duration-[4000ms] ${
            breathingPhase === 'inhale' ? 'bg-pink-400 w-56 h-56' :
            breathingPhase === 'holdIn' ? 'bg-amber-300 w-64 h-64 opacity-20' :
            breathingPhase === 'exhale' ? 'bg-sky-400 w-48 h-48' :
            'bg-purple-400 w-40 h-40'
          }`}
        />
      </div>

      {/* 2. DYNAMIC FLOATING PARTICLE SYSTEM */}
      <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
        {PARTICLE_INDICES.map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={particleVariants}
            animate={breathingPhase}
            className={`absolute w-1.5 h-1.5 rounded-full filter blur-[0.4px] shadow-[0_0_8px_rgba(255,255,255,0.8)] ${getParticleColor(
              breathingPhase,
              i
            )}`}
          />
        ))}
      </div>

      {/* 3. CORE INTERACTIVE BREATHING RING (Guide Circle) */}
      <div
        className={`w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center border-2 shadow-2xl relative z-10 transition-all duration-[3500ms] ${
          patternType === 'sohum'
            ? breathingPhase === 'inhale'
              ? 'scale-110 border-amber-300 bg-amber-500/25 shadow-amber-300/30'
              : 'scale-90 border-sky-300 bg-sky-500/20 shadow-sky-300/30'
            : breathingPhase === 'inhale' 
            ? 'scale-110 border-pink-300 bg-pink-400/20 shadow-pink-300/25' 
            : breathingPhase === 'holdIn' 
            ? 'scale-115 border-amber-300 bg-amber-400/25 shadow-amber-300/40'
            : breathingPhase === 'exhale'
            ? 'scale-90 border-sky-300 bg-sky-400/15 shadow-sky-300/15'
            : 'scale-85 border-purple-300 bg-purple-400/15 shadow-purple-300/15'
        }`}
        style={{ 
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: breathingPhase === 'holdIn' ? '0 0 35px rgba(245, 158, 11, 0.35)' : undefined
        }}
      >
        {/* Soft internal shimmer ripple */}
        <div className={`absolute inset-1 rounded-full border border-white/5 bg-radial from-white/10 to-transparent transition-opacity duration-1000 ${
          breathingPhase === 'holdIn' ? 'opacity-100' : 'opacity-0'
        }`} />

        <div className="text-center z-10 px-2 flex flex-col items-center justify-center">
          {/* SOHUM Sanskrit Badge when active */}
          {patternType === 'sohum' && (
            <span className="text-[9px] tracking-widest text-amber-200/90 font-mono font-semibold uppercase block mb-0.5 animate-pulse">
              {sohumStage === 1 ? (language === 'en' ? '6 Breaths/Min' : '第1阶段 · 6次/分') : (language === 'en' ? '5 Breaths/Min' : '第2阶段 · 5次/分')}
            </span>
          )}

          {/* Dynamic state instruction text */}
          <span 
            className={`text-sm md:text-base font-serif font-bold block tracking-widest transition-all duration-700 ${
              patternType === 'sohum'
                ? breathingPhase === 'inhale' ? 'text-amber-100 drop-shadow-sm' : 'text-sky-100 drop-shadow-sm'
                : breathingPhase === 'inhale' ? 'text-pink-100' :
                breathingPhase === 'holdIn' ? 'text-amber-100' :
                breathingPhase === 'exhale' ? 'text-sky-100' : 'text-purple-100'
            }`}
          >
            {language === 'en' ? (
              patternType === 'sohum'
                ? breathingPhase === 'inhale' ? 'So (Inhale)' : 'Hum (Exhale)'
                : breathingPhase === 'inhale' ? 'Inhale...' :
                breathingPhase === 'holdIn' ? 'Hold Breath...' :
                breathingPhase === 'exhale' ? 'Exhale...' : 'Hold Breath...'
            ) : (
              breathingText
            )}
          </span>

          {/* Mantra Subtext if provided */}
          {mantraSubtext && (
            <span className="text-[9px] text-white/80 font-serif italic block mt-0.5 tracking-wider line-clamp-1 max-w-[120px]">
              {mantraSubtext}
            </span>
          )}
          
          {/* Detailed state label and count down */}
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className={`text-[9px] tracking-wider font-mono font-bold uppercase ${isBgDark ? 'text-white/60' : 'text-[#8e6d72]/70'}`}>
              {patternType === 'sohum' 
                ? (breathingPhase === 'inhale' ? 'SO' : 'HUM') 
                : (breathingPhase === 'inhale' ? 'Inhale' : breathingPhase === 'holdIn' ? 'Hold In' : breathingPhase === 'exhale' ? 'Exhale' : 'Hold Out')}
            </span>
            <span className={`text-xs font-mono font-bold ${
              patternType === 'sohum'
                ? breathingPhase === 'inhale' ? 'text-amber-200' : 'text-sky-200'
                : breathingPhase === 'inhale' ? 'text-pink-200' :
                breathingPhase === 'holdIn' ? 'text-amber-200' :
                breathingPhase === 'exhale' ? 'text-sky-200' : 'text-purple-200'
            }`}>
              ({breathingCountdown}s)
            </span>
          </div>

          {/* Cycle count / progress text */}
          {cycleText && (
            <span className="text-[8px] font-mono text-white/50 block mt-0.5 tracking-tighter">
              {cycleText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
