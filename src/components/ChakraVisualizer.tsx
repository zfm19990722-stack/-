import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass, Heart, Activity, Volume2, Zap } from 'lucide-react';

interface ChakraVisualizerProps {
  breathingPhase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
  breathingCountdown: number;
  isBgDark: boolean;
  currentPattern: {
    inhale: number;
    holdIn: number;
    exhale: number;
    holdOut: number;
  };
  language?: 'zh' | 'en';
}

interface ChakraNode {
  id: string;
  name: string;
  nameEn: string;
  sanskrit: string;
  color: string;
  glowColor: string;
  y: number; // Y coordinate on a 0-250 canvas
  affirmation: string;
  affirmationEn: string;
  desc: string;
  descEn: string;
  physicalLocation: string;
  physicalLocationEn: string;
  bijaMantra: string; // seed sound
  solfeggio: number;
}

const CHAKRAS_DATA: ChakraNode[] = [
  { 
    id: 'crown', 
    name: '顶轮 (Crown)', 
    nameEn: 'Crown (Sahasrara)',
    sanskrit: 'Sahasrara',
    color: '#d946ef', // Violet
    glowColor: 'rgba(217, 70, 239, 0.8)',
    y: 35,
    affirmation: '“我与宇宙无限的智慧与神圣连接，我即是无限的丰盛。”',
    affirmationEn: '"I am connected to the infinite wisdom and divine guidance of the universe. I am infinite abundance."',
    desc: '位于头顶。掌管灵性领悟、宇宙高维意识。吸气时，观想璀璨的紫色与金色光芒自头顶注入，连接宇宙无尽的保护与智慧之光。',
    descEn: 'Located at the crown of the head. Governs spiritual wisdom and universal cosmic consciousness. Inhale golden-violet light to receive endless cosmic protection.',
    physicalLocation: '百会穴 / 大脑皮层',
    physicalLocationEn: 'Crown / Cerebral Cortex',
    bijaMantra: 'AH / OM',
    solfeggio: 963
  },
  { 
    id: 'thirdEye', 
    name: '眉心轮 (Third Eye)', 
    nameEn: 'Third Eye (Ajna)',
    sanskrit: 'Ajna',
    color: '#6366f1', // Indigo
    glowColor: 'rgba(99, 102, 241, 0.8)',
    y: 65,
    affirmation: '“我相信我的直觉，我洞悉万物的本源与显化真理。”',
    affirmationEn: '"I trust my intuition. I perceive the ultimate truth and path of manifestation."',
    desc: '位于两眉之间（松果体）。掌管高维直觉、洞察力与灵感。观想深邃的靛蓝色光芒凝聚，开启智慧之眼，消融一切评判与迷茫。',
    descEn: 'Located between the eyebrows. Governs intuition, insight, and imagination. Focus on deep indigo light to dissolve judgments and doubts.',
    physicalLocation: '印堂穴 / 松果体',
    physicalLocationEn: 'Brow / Pineal Gland',
    bijaMantra: 'OM',
    solfeggio: 852
  },
  { 
    id: 'throat', 
    name: '喉轮 (Throat)', 
    nameEn: 'Throat (Vishuddha)',
    sanskrit: 'Vishuddha',
    color: '#0ea5e9', // Blue
    glowColor: 'rgba(14, 165, 233, 0.8)',
    y: 95,
    affirmation: '“我真实而优雅地表达，我轻松聆听并显化宇宙的指引。”',
    affirmationEn: '"I express my truth with grace. I easily listen to and manifest cosmic wisdom."',
    desc: '位于喉部。掌管真实沟通、艺术创造力与信念显化。观想蔚蓝色光芒如清泉洗涤喉部，让每一次发声 and 愿望表达都充满显化力量。',
    descEn: 'Located at the throat. Governs authentic expression, communication, and creative power. Imagine pale blue light clearing all self-limitations.',
    physicalLocation: '喉部 / 甲状腺',
    physicalLocationEn: 'Throat / Thyroid',
    bijaMantra: 'HAM',
    solfeggio: 741
  },
  { 
    id: 'heart', 
    name: '心轮 (Heart)', 
    nameEn: 'Heart (Anahata)',
    sanskrit: 'Anahata',
    color: '#22c55e', // Green
    glowColor: 'rgba(34, 197, 94, 0.8)',
    y: 125,
    affirmation: '“我无条件地爱与被爱，我的心灵无限敞开，容纳宇宙恩典。”',
    affirmationEn: '"I love and am loved unconditionally. My heart is open to receive the divine grace of the universe."',
    desc: '位于胸腔正中。掌管爱、慈悲、同理心与无条件接纳。在此处观想晶莹的翡翠绿或温柔粉光，消融往昔的伤痛，使身心沉浸于宇宙的绝对宠爱中。',
    descEn: 'Located at the center of the chest. Governs unconditional love, compassion, and acceptance. Imagine emerald green or rose-pink light healing past wounds.',
    physicalLocation: '膻中穴 / 胸腺',
    physicalLocationEn: 'Chest / Thymus Gland',
    bijaMantra: 'YAM',
    solfeggio: 639
  },
  { 
    id: 'solarPlexus', 
    name: '太阳轮 (Solar Plexus)', 
    nameEn: 'Solar Plexus (Manipura)',
    sanskrit: 'Manipura',
    color: '#eab308', // Yellow
    glowColor: 'rgba(234, 179, 8, 0.8)',
    y: 155,
    affirmation: '“我拥有无限的个人意志与显化力量，我是自信且坚实的。”',
    affirmationEn: '"I possess infinite personal power and manifestation will. I am confident, secure, and strong."',
    desc: '位于上腹部（太阳神经丛）。掌管个人力量、意志、自信与愿望的实体化。在此观想一颗耀眼的金色太阳正熊熊燃烧，为你的每一个奢华愿景源源不断地供给显化能量。',
    descEn: 'Located at the upper abdomen. Governs personal power, confidence, and desire actualization. Visualize a bright golden sun fueling your manifestations.',
    physicalLocation: '中脘穴 / 胰腺与太阳神经丛',
    physicalLocationEn: 'Solar Plexus / Pancreas',
    bijaMantra: 'RAM',
    solfeggio: 528
  },
  { 
    id: 'sacral', 
    name: '脐轮 (Sacral)', 
    nameEn: 'Sacral (Svadhisthana)',
    sanskrit: 'Svadhisthana',
    color: '#f97316', // Orange
    glowColor: 'rgba(249, 115, 22, 0.8)',
    y: 185,
    affirmation: '“我的生命充满生命热情与创造活力，我如水般自由流动。”',
    affirmationEn: '"My life is filled with passion and creativity. I flow freely like water."',
    desc: '位于下腹部。掌管情感流动、生命热情、享乐与创造潜能。观想温暖、流动的橙色光芒，带走一切紧绷与限制，接纳生命最自然、最喜悦的丰盛。',
    descEn: 'Located at the lower abdomen. Governs feelings, intimacy, and creative potential. Imagine warm flowing orange light melting away blocks.',
    physicalLocation: '关元穴 / 肾上腺与生殖腺',
    physicalLocationEn: 'Lower Abdomen / Adrenals',
    bijaMantra: 'VAM',
    solfeggio: 417
  },
  { 
    id: 'root', 
    name: '海底轮 (Root)', 
    nameEn: 'Root (Muladhara)',
    sanskrit: 'Muladhara',
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.8)',
    y: 215,
    affirmation: '“我深植于大地根基，我是绝对安全、稳定、丰饶与富足的。”',
    affirmationEn: '"I am safely rooted in the Earth. I am secure, stable, abundant, and grounded."',
    desc: '位于脊椎骨基座。掌管安全感、物理世界根基、生存本能。观想深红色的火焰光芒，如树根般穿透坐垫深扎于大地核心，为你提供无与伦比的安全防线。',
    descEn: 'Located at the base of the spine. Governs safety, physical foundation, and survival instinct. Visualize deep red light root deeply down to the Earth core.',
    physicalLocation: '会阴穴 / 尾骨',
    physicalLocationEn: 'Perineum / Tailbone',
    bijaMantra: 'LAM',
    solfeggio: 396
  }
];

export const ChakraVisualizer: React.FC<ChakraVisualizerProps> = ({
  breathingPhase,
  breathingCountdown,
  isBgDark,
  currentPattern,
  language = 'zh',
}) => {
  const [selectedChakraId, setSelectedChakraId] = useState<string>('heart');
  const [channelFlowPos, setChannelFlowPos] = useState<number>(125);
  const [isResonating, setIsResonating] = useState<boolean>(false);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'central' | 'left' | 'right'>('all');

  useEffect(() => {
    setIsResonating(false);
  }, [selectedChakraId]);

  // Crystal singing bowl sound synthesizer using pure Web Audio API
  const playResonance = (freq: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator(); // second warm harmonic
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 1.5, ctx.currentTime); // Perfect fifth harmonic for divine warmth
      
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(freq * 2.2, ctx.currentTime);
      
      // Gentle bloom and organic long decay
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.6); // slow attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.8); // elegant resonance decay
      
      osc.connect(filterNode);
      oscHarmonic.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      oscHarmonic.start();
      
      osc.stop(ctx.currentTime + 5.0);
      oscHarmonic.stop(ctx.currentTime + 5.0);
    } catch (e) {
      console.error('Audio Context Error:', e);
    }
  };

  const selectedChakra = CHAKRAS_DATA.find((c) => c.id === selectedChakraId) || CHAKRAS_DATA[3];

  // Dynamically calculate flow dot or gradient position inside the Central Channel
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathingPhase === 'inhale') {
      // Inhale: energy flows UP from Root (215) to Crown (35)
      const duration = currentPattern.inhale;
      const step = (215 - 35) / (duration * 20); // 20 ticks per second
      let currentY = 215;
      interval = setInterval(() => {
        currentY = Math.max(35, currentY - step);
        setChannelFlowPos(currentY);
      }, 50);
    } else if (breathingPhase === 'exhale') {
      // Exhale: energy radiates DOWN from Crown (35) to Root (215)
      const duration = currentPattern.exhale;
      const step = (215 - 35) / (duration * 20);
      let currentY = 35;
      interval = setInterval(() => {
        currentY = Math.min(215, currentY + step);
        setChannelFlowPos(currentY);
      }, 50);
    } else if (breathingPhase === 'holdIn') {
      // Hold In: static high point (Heart/Crown energy pooling)
      setChannelFlowPos(35);
    } else if (breathingPhase === 'holdOut') {
      // Hold Out: energy rests at root center
      setChannelFlowPos(215);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breathingPhase, currentPattern.inhale, currentPattern.exhale]);

  // Determine glow intensities based on breathing phase
  const getCentralChannelGlowClass = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'stroke-pink-400 opacity-80 shadow-lg';
      case 'holdIn':
        return 'stroke-amber-400 opacity-100 shadow-2xl animate-pulse scale-x-110';
      case 'exhale':
        return 'stroke-sky-400 opacity-80 shadow-md';
      case 'holdOut':
        return 'stroke-purple-300 opacity-60';
      default:
        return 'stroke-white opacity-40';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-6 p-4 rounded-[32px] border backdrop-blur-xl transition-all duration-1000 bg-white/10 border-white/15 shadow-xl">
      
      {/* LEFT: Chakra Vector Diagram with Central Channel */}
      <div className="relative w-full md:w-1/2 flex flex-col items-center justify-center p-2">
        <span className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isBgDark ? 'text-pink-200' : 'text-[#8e6d72]'}`}>
          {language === 'en' ? '🕉️ Sushumna Channel & 7 Chakras' : '🕉️ 中脉与七轮观想 (Sushumna Map)'}
        </span>
        <div className="relative w-[210px] h-[280px]">
          <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <defs>
              {/* Radial glow filter for the central channel and chakras */}
              <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Dynamic Aura Glow Filter specifically for the body silhouette */}
              <filter id="aura-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComponentTransfer in="blur" result="glow1">
                  <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="glow1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              <linearGradient id="centralChannelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d946ef" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#22c55e" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
              </linearGradient>

              {/* Divine Rainbow Aura Gradient representing 7-chakra spectrum */}
              <linearGradient id="bodyGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d946ef" stopOpacity="0.16" /> {/* Sahasrara / Violet */}
                <stop offset="25%" stopColor="#3b82f6" stopOpacity="0.12" /> {/* Vishuddha / Blue */}
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.12" /> {/* Anahata / Green */}
                <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.12" /> {/* Manipura / Yellow */}
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.16" /> {/* Muladhara / Red */}
              </linearGradient>
            </defs>

            {/* MULTI-LAYERED GLOWING HUMAN SILHOUETTE (中脉能量人体观想) */}
            <g style={{ transformOrigin: '100px 115px' }}>
              {/* Layer 1: Etheric Pranic Aura (Outer soft glowing outline) */}
              <motion.path 
                d="M100,18 C107,18 111,24 111,31 C111,38 107,44 100,44 C93,44 89,38 89,31 C89,24 93,18 100,18 Z M100,48 C110,48 116,52 118,60 C120,68 116,77 116,85 L122,98 L130,111 L138,128 L150,154 L162,171 C168,180 166,189 157,193 C148,197 131,197 118,193 C109,190 104,188 100,188 C96,188 91,190 82,193 C69,197 52,197 43,193 C34,189 32,180 38,171 L50,154 L62,128 L70,111 L78,98 L84,85 C84,77 80,68 82,60 C84,52 90,48 100,48 Z" 
                fill="none" 
                stroke={isBgDark ? "rgba(244, 114, 182, 0.3)" : "rgba(142, 109, 114, 0.35)"} 
                strokeWidth="4.5" 
                strokeLinejoin="round" 
                filter="url(#aura-glow)"
                animate={{ 
                  scale: breathingPhase === 'inhale' ? 1.04 : breathingPhase === 'exhale' ? 0.98 : 1.01,
                  opacity: [0.55, 0.85, 0.55] 
                }}
                transition={{ 
                  scale: { type: "spring", stiffness: 35, damping: 12 },
                  opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ transformOrigin: '100px 115px' }}
              />

              {/* Layer 2: Subtle Energy Density Fill (Rainbow Prana Gradient Body) */}
              <motion.path 
                d="M100,18 C107,18 111,24 111,31 C111,38 107,44 100,44 C93,44 89,38 89,31 C89,24 93,18 100,18 Z M100,48 C110,48 116,52 118,60 C120,68 116,77 116,85 L122,98 L130,111 L138,128 L150,154 L162,171 C168,180 166,189 157,193 C148,197 131,197 118,193 C109,190 104,188 100,188 C96,188 91,190 82,193 C69,197 52,197 43,193 C34,189 32,180 38,171 L50,154 L62,128 L70,111 L78,98 L84,85 C84,77 80,68 82,60 C84,52 90,48 100,48 Z" 
                fill="url(#bodyGlowGrad)"
                stroke="none"
                animate={{ 
                  scale: breathingPhase === 'inhale' ? 1.02 : breathingPhase === 'exhale' ? 0.99 : 1.0,
                  opacity: breathingPhase === 'holdIn' ? 0.95 : 0.75
                }}
                transition={{ type: "spring", stiffness: 35, damping: 12 }}
                style={{ transformOrigin: '100px 115px' }}
              />

              {/* Layer 3: Sharp High-Fidelity Front Outline (Delicate Golden/Plum Line) */}
              <motion.path 
                d="M100,18 C107,18 111,24 111,31 C111,38 107,44 100,44 C93,44 89,38 89,31 C89,24 93,18 100,18 Z M100,48 C110,48 116,52 118,60 C120,68 116,77 116,85 L122,98 L130,111 L138,128 L150,154 L162,171 C168,180 166,189 157,193 C148,197 131,197 118,193 C109,190 104,188 100,188 C96,188 91,190 82,193 C69,197 52,197 43,193 C34,189 32,180 38,171 L50,154 L62,128 L70,111 L78,98 L84,85 C84,77 80,68 82,60 C84,52 90,48 100,48 Z" 
                fill="none" 
                stroke={isBgDark ? "rgba(255, 255, 255, 0.42)" : "rgba(142, 109, 114, 0.55)"} 
                strokeWidth="1.45" 
                strokeLinejoin="round" 
                animate={{ 
                  scale: breathingPhase === 'inhale' ? 1.02 : breathingPhase === 'exhale' ? 0.99 : 1.0,
                  stroke: isBgDark ? "rgba(255,255,255,0.48)" : "rgba(142,109,114,0.65)"
                }}
                transition={{ type: "spring", stiffness: 35, damping: 12 }}
                style={{ transformOrigin: '100px 115px' }}
              />
            </g>

            {/* GLOWING PRANA/QI COSMIC PARTICLES (RISING/FALLING ACCORDING TO BREATH) */}
            {Array.from({ length: 6 }).map((_, i) => {
              const delay = i * 0.9;
              const isEven = i % 2 === 0;
              // Float upward during Inhale, downward during Exhale
              const ySequence = breathingPhase === 'exhale' 
                ? [35, 215] 
                : [215, 35];
                
              const particleColor = isEven ? '#fde047' : '#f472b6'; // Gold or Pink

              return (
                <motion.circle
                  key={`prana-${i}`}
                  cx={100 + (isEven ? 8 : -8) * Math.sin(i * 1.5)}
                  cy={ySequence[0]}
                  r={1.0 + (i % 3) * 0.4}
                  fill={particleColor}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{
                    cy: ySequence,
                    opacity: [0, 0.8, 0.8, 0]
                  }}
                  transition={{
                    duration: breathingPhase === 'holdIn' || breathingPhase === 'holdOut' ? 5 : 4.5,
                    repeat: Infinity,
                    delay: delay,
                    ease: "easeInOut"
                  }}
                  style={{
                    filter: `drop-shadow(0 0 2.5px ${particleColor})`
                  }}
                />
              );
            })}

            {/* Background static central channel path line */}
            <line 
              x1="100" 
              y1="35" 
              x2="100" 
              y2="215" 
              stroke={isBgDark ? "rgba(255, 255, 255, 0.08)" : "rgba(142, 109, 114, 0.12)"} 
              strokeWidth="2.5" 
              strokeLinecap="round"
              opacity={selectedChannel === 'central' || selectedChannel === 'all' ? 1.0 : 0.25}
            />

            {/* THE GLOWING CENTRAL CHANNEL (中脉发光) */}
            <line 
              x1="100" 
              y1="35" 
              x2="100" 
              y2="215" 
              stroke="url(#centralChannelGrad)" 
              strokeWidth={
                selectedChannel === 'central'
                  ? '9.5'
                  : selectedChannel === 'all'
                    ? (breathingPhase === 'holdIn' ? '6.5' : '4.5')
                    : '1.2'
              } 
              strokeLinecap="round"
              filter="url(#glow-filter)"
              className={`transition-all duration-[400ms] ${getCentralChannelGlowClass()}`}
              opacity={selectedChannel === 'central' ? 1.0 : selectedChannel === 'all' ? 0.85 : 0.12}
            />

            {/* Glowing Flowing Energy Prana/Qi dot inside Central Channel */}
            <circle 
              cx="100" 
              cy={channelFlowPos} 
              r={breathingPhase === 'holdIn' ? '8' : '5.5'} 
              fill={
                breathingPhase === 'inhale' ? '#f472b6' : 
                breathingPhase === 'holdIn' ? '#fbbf24' : 
                breathingPhase === 'exhale' ? '#38bdf8' : '#c084fc'
              }
              filter="url(#glow-filter)"
              className="transition-all duration-100 ease-out animate-pulse"
              opacity={selectedChannel === 'central' || selectedChannel === 'all' ? 1.0 : 0.2}
            />

            {/* Sinuous Left/Right nadis (Ida & Pingala) wrapping around the central column */}
            <motion.path
              d="M100,35 C118,50 118,50 100,65 C82,80 82,80 100,95 C118,110 118,110 100,125 C82,140 82,140 100,155 C118,170 118,170 100,185 C82,200 82,200 100,215"
              fill="none"
              stroke="#38bdf8" // Ida (Moon Channel - Cool Blue)
              strokeWidth={
                selectedChannel === 'left' 
                  ? '3.5' 
                  : selectedChannel === 'all' 
                    ? (breathingPhase === 'exhale' ? '1.5' : '0.8') 
                    : '0.4'
              }
              strokeDasharray="4 3"
              animate={
                selectedChannel === 'left'
                  ? { strokeDashoffset: [0, 20] }
                  : breathingPhase === 'exhale'
                    ? { strokeDashoffset: [0, 20] }
                    : { strokeDashoffset: [0, -20] }
              }
              transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              opacity={selectedChannel === 'left' ? 1.0 : selectedChannel === 'all' ? (breathingPhase === 'exhale' ? 0.75 : 0.25) : 0.08}
              style={{
                filter: selectedChannel === 'left'
                  ? 'drop-shadow(0 0 4.5px rgba(56, 189, 248, 0.85))'
                  : breathingPhase === 'exhale'
                    ? 'drop-shadow(0 0 3px rgba(56, 189, 248, 0.45))'
                    : 'none'
              }}
            />
            <motion.path
              d="M100,35 C82,50 82,50 100,65 C118,80 118,80 100,95 C82,110 82,110 100,125 C118,140 118,140 100,155 C82,170 82,170 100,185 C118,200 118,200 100,215"
              fill="none"
              stroke="#fb923c" // Pingala (Sun Channel - Warm Gold)
              strokeWidth={
                selectedChannel === 'right' 
                  ? '3.5' 
                  : selectedChannel === 'all' 
                    ? (breathingPhase === 'inhale' ? '1.5' : '0.8') 
                    : '0.4'
              }
              strokeDasharray="4 3"
              animate={
                selectedChannel === 'right'
                  ? { strokeDashoffset: [0, -20] }
                  : breathingPhase === 'inhale'
                    ? { strokeDashoffset: [0, -20] }
                    : { strokeDashoffset: [0, 20] }
              }
              transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              opacity={selectedChannel === 'right' ? 1.0 : selectedChannel === 'all' ? (breathingPhase === 'inhale' ? 0.75 : 0.25) : 0.08}
              style={{
                filter: selectedChannel === 'right'
                  ? 'drop-shadow(0 0 4.5px rgba(249, 115, 22, 0.85))'
                  : breathingPhase === 'inhale'
                    ? 'drop-shadow(0 0 3px rgba(249, 115, 22, 0.45))'
                    : 'none'
              }}
            />

            {/* CHANNEL INFORMATIVE TEXT LABELS DIRECTLY ON CANVAS */}
            {(selectedChannel === 'left' || selectedChannel === 'all') && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedChannel === 'left' ? 1 : 0.4 }}
                transition={{ duration: 0.4 }}
              >
                <text x="14" y="105" fill="#38bdf8" className="text-[7px] font-mono font-extrabold select-none">
                  {language === 'en' ? '◀ LEFT IDA' : '◀ 左脉 IDA'}
                </text>
                <text x="14" y="113" fill="#38bdf8" className="text-[5px] font-mono opacity-85 select-none">
                  {language === 'en' ? 'COOL / MOON' : '阴/月亮/宁静'}
                </text>
              </motion.g>
            )}

            {(selectedChannel === 'right' || selectedChannel === 'all') && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedChannel === 'right' ? 1 : 0.4 }}
                transition={{ duration: 0.4 }}
              >
                <text x="145" y="105" fill="#fb923c" className="text-[7px] font-mono font-extrabold select-none">
                  {language === 'en' ? 'RIGHT PINGALA ▶' : '右脉 PINGALA ▶'}
                </text>
                <text x="145" y="113" fill="#fb923c" className="text-[5px] font-mono opacity-85 select-none">
                  {language === 'en' ? 'WARM / SUN' : '阳/太阳/行动'}
                </text>
              </motion.g>
            )}

            {(selectedChannel === 'central' || selectedChannel === 'all') && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedChannel === 'central' ? 1 : 0.5 }}
                transition={{ duration: 0.4 }}
              >
                <text x="100" y="242" fill="#d946ef" textAnchor="middle" className="text-[7.5px] font-mono font-extrabold tracking-widest select-none animate-pulse">
                  {language === 'en' ? '◆ SUSHUMNA CENTRAL ◆' : '◆ 中脉 SUSHUMNA ◆'}
                </text>
              </motion.g>
            )}

            {/* Interactive Chakra Circles along the central channel */}
            {CHAKRAS_DATA.map((chakra) => {
              const isSelected = selectedChakraId === chakra.id;
              
              // Determine if this specific chakra is "activated" by the flowing prana
              const isActivated = 
                selectedChakraId === chakra.id ||
                breathingPhase === 'holdIn' ||
                (breathingPhase === 'inhale' && channelFlowPos <= chakra.y) ||
                (breathingPhase === 'exhale' && channelFlowPos >= chakra.y);

              // Calculate dynamic breathing phase scale modifier
              let phaseScale = 1.0;
              if (breathingPhase === 'inhale') {
                const total = currentPattern.inhale || 4;
                const progress = Math.min(1, Math.max(0, (total - breathingCountdown) / total));
                phaseScale = 1.0 + progress * 0.4; // Smoothly swell up to 1.4
              } else if (breathingPhase === 'holdIn') {
                phaseScale = 1.4; // Shimmer at peak expansion
              } else if (breathingPhase === 'exhale') {
                const total = currentPattern.exhale || 4;
                const progress = Math.min(1, Math.max(0, (total - breathingCountdown) / total));
                phaseScale = 1.4 - progress * 0.45; // Smoothly shrink back to 0.95
              } else if (breathingPhase === 'holdOut') {
                phaseScale = 0.95; // Resting empty state
              }

              // Dynamic calculated radiuses for the multi-layered breathing halos
              const innerRadius = (isSelected ? 5.5 : 4.0);
              const baseAuraRadius = (isSelected ? 10 : 7);
              const halo1Radius = (isActivated ? (isSelected ? 24 : 18) : (isSelected ? 14 : 9)) * phaseScale;
              const halo2Radius = (isActivated ? (isSelected ? 38 : 30) : (isSelected ? 22 : 14)) * phaseScale;

              // Secondary fine-tuned accent color to simulate energy density changes
              const getChakraSecondaryColor = (id: string) => {
                switch (id) {
                  case 'crown': return '#f472b6'; // Rose pink
                  case 'thirdEye': return '#818cf8'; // Soft indigo
                  case 'throat': return '#38bdf8'; // Pale blue
                  case 'heart': return '#4ade80'; // Emerald lime
                  case 'solarPlexus': return '#fef08a'; // Sun gold
                  case 'sacral': return '#fdba74'; // Coral orange
                  case 'root': return '#f87171'; // Warm rose
                  default: return '#ffffff';
                }
              };

              const secondaryColor = getChakraSecondaryColor(chakra.id);

              return (
                <motion.g 
                  key={chakra.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedChakraId(chakra.id)}
                  animate={{
                    // Significantly enhanced breathing-sync scale oscillation (swelling up dynamically)
                    scale: isActivated ? (0.85 + (phaseScale - 0.85) * 0.9) : 1.0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 40,
                    damping: 12
                  }}
                  style={{
                    transformOrigin: `100px ${chakra.y}px`
                  }}
                >
                  {/* Invisible generous click boundary */}
                  <circle 
                    cx="100" 
                    cy={chakra.y} 
                    r="16" 
                    fill="transparent" 
                  />

                  {/* GEOMETRIC SACRED SPINNING LOTUS MANDALA */}
                  {(() => {
                    const getPetalCount = (id: string) => {
                      switch (id) {
                        case 'crown': return 24; // clean and dense representation of Sahasrara
                        case 'thirdEye': return 2; // Ajna traditional 2 wings
                        case 'throat': return 16;
                        case 'heart': return 12;
                        case 'solarPlexus': return 10;
                        case 'sacral': return 6;
                        case 'root': return 4;
                        default: return 8;
                      }
                    };
                    const numPetals = getPetalCount(chakra.id);
                    return isActivated ? (
                      <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: isSelected ? 16 : 26, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: `100px ${chakra.y}px` }}
                        className="pointer-events-none"
                      >
                        {Array.from({ length: numPetals }).map((_, pIdx) => {
                          const rotation = (pIdx * 360) / numPetals;
                          return (
                            <path
                              key={pIdx}
                              d={`M 100 ${chakra.y} C 103 ${chakra.y - 12} 97 ${chakra.y - 12} 100 ${chakra.y}`}
                              fill="none"
                              stroke={chakra.color}
                              strokeWidth={isSelected ? "0.8" : "0.45"}
                              opacity={isSelected ? "0.65" : "0.25"}
                              transform={`rotate(${rotation}, 100, ${chakra.y})`}
                              style={{
                                filter: `drop-shadow(0 0 1.5px ${chakra.color})`
                              }}
                            />
                          );
                        })}
                      </motion.g>
                    ) : null;
                  })()}

                  {/* ACTIVE CHAKRA DYNAMIC RADIAL ERUPTION PARTICLES (FOUNTAIN) */}
                  {isActivated && (
                    <g className="pointer-events-none">
                      {Array.from({ length: 8 }).map((_, pIdx) => {
                        const chakraIdx = CHAKRAS_DATA.indexOf(chakra);
                        const angleOffset = (chakraIdx * Math.PI) / 7;
                        const angle = (pIdx * 2 * Math.PI) / 8 + angleOffset + (pIdx % 2 ? 0.15 : -0.15);
                        
                        // Distance expands smoothly according to phaseScale
                        const baseDistance = breathingPhase === 'holdIn' ? 38 : 28;
                        const distance = (baseDistance + (pIdx % 3) * 7) * (phaseScale * 0.85);
                        
                        const targetX = 100 + Math.cos(angle) * distance;
                        const targetY = chakra.y + Math.sin(angle) * distance;
                        const particleColor = pIdx % 2 === 0 ? chakra.color : secondaryColor;

                        return (
                          <motion.circle
                            key={pIdx}
                            cx="100"
                            cy={chakra.y}
                            r="2"
                            fill={particleColor}
                            initial={{ cx: 100, cy: chakra.y, opacity: 0, scale: 0.4 }}
                            animate={{
                              cx: [100, targetX],
                              cy: [chakra.y, targetY],
                              opacity: [0, 1, 0.7, 0],
                              scale: [0.4, 1.3, 0.8, 0.2],
                            }}
                            transition={{
                              duration: breathingPhase === 'holdIn' ? 2.2 : 1.8,
                              repeat: Infinity,
                              delay: pIdx * 0.2,
                              ease: "easeOut",
                            }}
                            style={{
                              filter: `drop-shadow(0 0 3px ${particleColor})`,
                            }}
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* FLAT BREATHING-TYPE PULSATING HALO (RIPPLE EFFECT FROM CENTER) */}
                  {isActivated && (
                    <motion.circle
                      cx="100"
                      cy={chakra.y}
                      r={innerRadius + 4}
                      fill="none"
                      stroke={secondaryColor}
                      strokeWidth="1.25"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{
                        scale: [1, 3.0],
                        opacity: [0.8, 0],
                        stroke: [chakra.color, secondaryColor, chakra.color]
                      }}
                      transition={{
                        duration: breathingPhase === 'inhale' ? 2.5 : breathingPhase === 'exhale' ? 3.0 : 2.0,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      style={{
                        transformOrigin: `100px ${chakra.y}px`,
                        filter: `drop-shadow(0 0 5px ${chakra.color})`,
                      }}
                    />
                  )}

                  {/* LAYER 1: OUTERMOST ULTRA-SOFT BREATHING HALO */}
                  <circle
                    cx="100"
                    cy={chakra.y}
                    r={halo2Radius}
                    fill="none"
                    stroke={chakra.color}
                    strokeWidth={isActivated ? "0.75" : "0.25"}
                    strokeDasharray={breathingPhase === 'holdIn' ? "none" : "3 3"}
                    opacity={isActivated ? (breathingPhase === 'holdIn' ? "0.35" : "0.25") : "0.08"}
                    className="transition-all duration-1000 ease-out origin-center"
                    style={{
                      transformOrigin: `100px ${chakra.y}px`,
                      filter: `blur(1px) drop-shadow(0 0 4px ${chakra.color})`,
                    }}
                  />

                  {/* LAYER 2: INTERMEDIATE INTENSE PULSING GLOW FLARE */}
                  <circle
                    cx="100"
                    cy={chakra.y}
                    r={halo1Radius}
                    fill={chakra.color}
                    opacity={isActivated ? (breathingPhase === 'holdIn' ? "0.18" : "0.12") : "0.03"}
                    className="transition-all duration-1000 ease-out origin-center"
                    style={{
                      transformOrigin: `100px ${chakra.y}px`,
                      filter: 'blur(3px)',
                    }}
                  />

                  {/* LAYER 3: INNER ACTIVE RING ECHO */}
                  <circle 
                    cx="100" 
                    cy={chakra.y} 
                    r={baseAuraRadius} 
                    fill="none" 
                    stroke={chakra.color} 
                    strokeWidth={isSelected ? "1.5" : "1"} 
                    opacity={isSelected ? "0.9" : "0.4"}
                    className={isSelected && breathingPhase === 'holdIn' ? "animate-pulse origin-center" : "transition-transform"}
                    style={{ transformOrigin: `100px ${chakra.y}px` }}
                  />

                  {/* LAYER 4: SOFT STEADY CORE GLOW */}
                  <circle 
                    cx="100" 
                    cy={chakra.y} 
                    r={innerRadius + 2} 
                    fill={chakra.color} 
                    opacity={isActivated ? "0.45" : "0.2"}
                    filter="url(#glow-filter)"
                    className="transition-all duration-500"
                  />

                  {/* LAYER 5: SOLID PHYSICAL SPHERE CORE */}
                  <circle 
                    cx="100" 
                    cy={chakra.y} 
                    r={innerRadius} 
                    fill={chakra.color} 
                    stroke="#ffffff" 
                    strokeWidth={isSelected ? "1.5" : "0.75"}
                    className="transition-all duration-300 shadow-sm"
                  />

                  {/* Pulsing indicator connection line for the selected focus chakra */}
                  {isSelected && (
                    <line 
                      x1="100" 
                      y1={chakra.y} 
                      x2="135" 
                      y2={chakra.y} 
                      stroke={chakra.color} 
                      strokeWidth="0.75" 
                      strokeDasharray="2 2"
                      opacity="0.7"
                    />
                  )}
                </motion.g>
              );
            })}
          </svg>

          {/* Quick UI Labels next to the visual body */}
          <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-5 pointer-events-none text-[8.5px] font-mono font-bold opacity-60">
            {CHAKRAS_DATA.map((c) => (
              <div 
                key={c.id} 
                style={{ position: 'absolute', top: `${(c.y / 250) * 100}%`, transform: 'translateY(-50%)', right: '-12px' }}
                className={`flex items-center gap-1 transition-all duration-300 ${selectedChakraId === c.id ? 'opacity-100 scale-105 font-bold text-white' : 'opacity-40'}`}
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{language === 'en' ? c.nameEn.split(' ')[0] : c.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Phase Helper Text */}
        <div className={`mt-2.5 px-3 py-1 rounded-full text-[10.5px] font-medium flex items-center gap-1.5 backdrop-blur-md border ${
          breathingPhase === 'inhale' ? 'bg-pink-500/10 border-pink-500/20 text-pink-300' :
          breathingPhase === 'holdIn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
          breathingPhase === 'exhale' ? 'bg-sky-500/10 border-sky-500/20 text-sky-200' :
          'bg-purple-500/10 border-purple-500/20 text-purple-200'
        }`}>
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>
            {language === 'en' ? (
              <>
                {breathingPhase === 'inhale' && '🧬 Focus on Root, guide energy upward...'}
                {breathingPhase === 'holdIn' && '☀️ Pool energy at Crown, illuminating all chakras...'}
                {breathingPhase === 'exhale' && '💧 Radiate energy throughout, dissolving blockages...'}
                {breathingPhase === 'holdOut' && '🌌 Pure awareness in absolute emptiness...'}
              </>
            ) : (
              <>
                {breathingPhase === 'inhale' && '🧬 意守海底轮，引能循中脉上升...'}
                {breathingPhase === 'holdIn' && '☀️ 气聚顶轮，全身脉轮融汇金光...'}
                {breathingPhase === 'exhale' && '💧 能量循全身辐射，消融执念与阻碍...'}
                {breathingPhase === 'holdOut' && '🌌 万物归空，安住于纯然觉知...'}
              </>
            )}
          </span>
        </div>

        {/* 三脉观想通道 (Nadis & Channels) Interactive Selector */}
        <div className={`mt-3 w-full p-2.5 rounded-xl border ${isBgDark ? 'bg-white/5 border-white/10' : 'bg-[#8e6d72]/5 border-[#8e6d72]/10'} flex flex-col gap-2 text-left`}>
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider opacity-90">
            <span>{language === 'en' ? '🧘‍♂️ THREE NADIS (ENERGY CHANNELS)' : '🧘‍♂️ 三脉观想通道 (Nadis & Channels)'}</span>
            <span className="text-[9px] opacity-60 font-mono">Pranic Channels</span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => setSelectedChannel('all')}
              className={`py-1 px-1.5 rounded text-[10px] font-semibold transition-all select-none border text-center ${
                selectedChannel === 'all'
                  ? 'bg-purple-500 text-white border-transparent shadow-sm'
                  : isBgDark 
                    ? 'bg-white/5 border-white/5 hover:bg-white/10 text-pink-100' 
                    : 'bg-[#8e6d72]/5 border-[#8e6d72]/5 hover:bg-[#8e6d72]/10 text-[#61454a]'
              }`}
            >
              {language === 'en' ? 'All' : '全部'}
            </button>
            <button
              onClick={() => setSelectedChannel('central')}
              className={`py-1 px-1.5 rounded text-[10px] font-semibold transition-all select-none border text-center ${
                selectedChannel === 'central'
                  ? 'bg-fuchsia-500 text-white border-transparent shadow-sm'
                  : isBgDark 
                    ? 'bg-white/5 border-white/5 hover:bg-white/10 text-pink-100' 
                    : 'bg-[#8e6d72]/5 border-[#8e6d72]/5 hover:bg-[#8e6d72]/10 text-[#61454a]'
              }`}
            >
              {language === 'en' ? 'Sushumna' : '中脉'}
            </button>
            <button
              onClick={() => setSelectedChannel('left')}
              className={`py-1 px-1.5 rounded text-[10px] font-semibold transition-all select-none border text-center ${
                selectedChannel === 'left'
                  ? 'bg-sky-500 text-white border-transparent shadow-sm'
                  : isBgDark 
                    ? 'bg-white/5 border-white/5 hover:bg-white/10 text-pink-100' 
                    : 'bg-[#8e6d72]/5 border-[#8e6d72]/5 hover:bg-[#8e6d72]/10 text-[#61454a]'
              }`}
            >
              {language === 'en' ? 'Ida' : '左脉'}
            </button>
            <button
              onClick={() => setSelectedChannel('right')}
              className={`py-1 px-1.5 rounded text-[10px] font-semibold transition-all select-none border text-center ${
                selectedChannel === 'right'
                  ? 'bg-orange-500 text-white border-transparent shadow-sm'
                  : isBgDark 
                    ? 'bg-white/5 border-white/5 hover:bg-white/10 text-pink-100' 
                    : 'bg-[#8e6d72]/5 border-[#8e6d72]/5 hover:bg-[#8e6d72]/10 text-[#61454a]'
              }`}
            >
              {language === 'en' ? 'Pingala' : '右脉'}
            </button>
          </div>

          {/* Contextual Description of the channels */}
          <div className="text-[9.5px] leading-relaxed opacity-85 px-1 py-0.5 font-mono">
            {selectedChannel === 'all' && (
              language === 'en'
                ? 'Three channels balance life force: Left (calming), Right (active), Central (pure cosmic presence).'
                : '三脉平衡生命之能：左脉掌管宁静直觉，右脉掌管行动理性，中脉汇聚纯粹宇宙觉知。'
            )}
            {selectedChannel === 'central' && (
              language === 'en'
                ? 'Sushumna: The central spine path of spiritual awakening. Pure non-dual presence, alignment & ascension.'
                : '中脉 (Sushumna)：灵性觉醒之主干。贯穿脊髓至头顶，代表空性、纯粹觉知与梵我合一。'
            )}
            {selectedChannel === 'left' && (
              language === 'en'
                ? 'Ida (Moon): The cool, feminine channel. Governs introspection, creativity, rest, and mental rejuvenation.'
                : '左脉 (Ida)：月亮与阴性之河。代表清凉、直觉、宁静与内在反省，调和心智、消融焦虑。'
            )}
            {selectedChannel === 'right' && (
              language === 'en'
                ? 'Pingala (Sun): The warm, masculine channel. Governs physical vitality, logical focus, dynamic power, and action.'
                : '右脉 (Pingala)：太阳与阳性之河。代表温暖、理性、行动、活力与创造力，驱策外在显化。'
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Selected Chakra Detail Cards */}
      <div className={`w-full md:w-1/2 flex flex-col p-4 rounded-2xl border backdrop-blur-md ${
        isBgDark 
          ? 'bg-black/20 border-white/10' 
          : 'bg-white/50 border-[#8e6d72]/15 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🕉️</span>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase opacity-70 block">
                {selectedChakra.sanskrit} • {language === 'en' ? 'Seed Sound' : '种子音'}: <span className="font-bold underline">{selectedChakra.bijaMantra}</span>
              </span>
              <h3 className="text-sm font-bold font-serif" style={{ color: selectedChakra.color }}>
                {language === 'en' ? selectedChakra.nameEn : selectedChakra.name}
              </h3>
            </div>
          </div>
          <span className="text-[9.5px] px-2 py-0.5 rounded-full border border-white/10 font-mono opacity-80 bg-white/5">
            📍 {language === 'en' ? selectedChakra.physicalLocationEn : selectedChakra.physicalLocation}
          </span>
        </div>

        {/* Description */}
        <p className={`text-[11px] leading-relaxed mb-3 transition-colors ${isBgDark ? 'text-pink-100/80' : 'text-[#61454a]'}`}>
          {language === 'en' ? selectedChakra.descEn : selectedChakra.desc}
        </p>

        {/* Sacred Affirmation Board */}
        <div className="p-3 rounded-xl border border-white/5 bg-gradient-to-r from-pink-500/5 to-purple-500/5 relative overflow-hidden mb-3">
          <div className="absolute top-1 right-1 opacity-10">
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          <span className={`text-[8.5px] font-bold tracking-widest uppercase block mb-1 ${isBgDark ? 'text-pink-300' : 'text-[#8e6d72]'}`}>
            {language === 'en' ? '🔮 CHAKRA AFFIRMATION' : '🔮 脉轮显化宣言 (Affirmation)'}
          </span>
          <p className="text-xs font-serif font-bold italic tracking-wide text-center leading-relaxed text-yellow-300 dark:text-yellow-100 py-1">
            {language === 'en' ? selectedChakra.affirmationEn : selectedChakra.affirmation}
          </p>
        </div>

        {/* SOLFEGGIO ACOUSTIC RESONANCE CALIBRATION (NEW EXPERIENTIAL WIDGET) */}
        <div className={`p-3 rounded-xl border ${isBgDark ? 'bg-white/5 border-white/10' : 'bg-[#8e6d72]/5 border-[#8e6d72]/10'} flex flex-col gap-2`}>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="opacity-80 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" style={{ color: selectedChakra.color }} />
              {language === 'en' ? 'Solfeggio Frequency' : '索尔菲乔频率 (Solfeggio)'}
            </span>
            <span className="font-bold font-mono tracking-wider" style={{ color: selectedChakra.color }}>
              {selectedChakra.solfeggio} Hz
            </span>
          </div>

          {/* Smooth dynamic multi-bar equalizer animation */}
          {isResonating && (
            <div className="flex items-end justify-center gap-1.5 py-1.5 h-7">
              {Array.from({ length: 14 }).map((_, waveIdx) => (
                <motion.div
                  key={waveIdx}
                  className="w-1 rounded-full"
                  animate={{
                    height: [4, 20, 4],
                  }}
                  transition={{
                    duration: 0.5 + (waveIdx % 4) * 0.12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: waveIdx * 0.04,
                  }}
                  style={{ backgroundColor: selectedChakra.color }}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => {
              playResonance(selectedChakra.solfeggio);
              setIsResonating(true);
              setTimeout(() => setIsResonating(false), 5000);
            }}
            disabled={isResonating}
            className="relative w-full py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wide transition-all shadow-sm select-none overflow-hidden text-white"
            style={{
              background: isResonating 
                ? `linear-gradient(90deg, ${selectedChakra.color}25, ${selectedChakra.color}45)`
                : `linear-gradient(135deg, ${selectedChakra.color}dd, ${selectedChakra.color})`,
              border: `1px solid ${isResonating ? `${selectedChakra.color}60` : 'transparent'}`,
              cursor: isResonating ? 'default' : 'pointer'
            }}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isResonating ? 'animate-pulse' : 'animate-bounce'}`} />
            <span>
              {isResonating 
                ? (language === 'en' ? 'Acoustic Resonance Active...' : '磬钟声波能量共鸣中...') 
                : (language === 'en' ? `Play ${selectedChakra.solfeggio}Hz Core Resonance` : `播放 ${selectedChakra.solfeggio}Hz 磬钟共振`)}
            </span>
            {isResonating && (
              <span className="absolute inset-0 bg-white/10 animate-ping pointer-events-none" />
            )}
          </button>
        </div>

        {/* Quick Interaction Notice */}
        <span className="text-[9px] text-center italic opacity-50 mt-2 block">
          {language === 'en' ? '💡 Click any circle on the left map to explore and align with other chakras' : '💡 点击左图中的任意圆圈可切换查看并对齐观想其他脉轮'}
        </span>
      </div>

    </div>
  );
};
