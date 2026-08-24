import { useState, useEffect } from 'react';
import { Affirmation } from '../types';
import { Sparkles, Volume2, RefreshCw, VolumeX, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AffirmationCardProps {
  onSpeak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  language?: 'zh' | 'en';
}

const PREBUILT_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'ab-1',
    text: '真正的丰盛不是去占有什么，而是认出你本自具足的生命本质。',
    translation: 'True abundance is not about possessing anything, but recognizing that your essential nature is already complete and whole.',
    category: 'abundance_book',
    source: '《丰盛》'
  },
  {
    id: 'ab-2',
    text: '丰盛不是累积，而是放手。唯有当你放手，退回无限的整体，生命才会丰盛地涌来。',
    translation: 'Abundance is not about accumulation, but letting go. Only when you let go and step back into the infinite Whole, does life flow abundantly.',
    category: 'abundance_book',
    source: '《丰盛》'
  },
  {
    id: 'ab-3',
    text: '“谢谢”是消融一切匮乏、不满与恐惧最快、最直接的捷径。它与宇宙的完美脉动共鸣。',
    translation: '"Thank you" is the fastest and most direct shortcut to dissolve all scarcity, resentment, and fear. It resonates with the perfect pulse of the universe.',
    category: 'abundance_book',
    source: '《丰盛》'
  },
  {
    id: 'ab-4',
    text: '一切都是最完美的安排。当你活在“当下”，不带任何抗拒地臣服，万物都在为你默默效力。',
    translation: 'Everything is the most perfect arrangement. When you live in the "now" and surrender without any resistance, the whole universe serves you.',
    category: 'abundance_book',
    source: '《丰盛》'
  },
  {
    id: 'ab-5',
    text: '你不需要去创造丰盛，因为你本来就处于丰盛之中。你只需要认出这个实真，并全然安住。',
    translation: 'You do not need to create abundance, because you are already in it. You only need to recognize this reality and rest in it completely.',
    category: 'abundance_book',
    source: '《丰盛》'
  },
  {
    id: 'ab-6',
    text: '唯有当你停止与生命抗争、停止自我证明时，最纯粹的喜悦、自由与繁荣才会悄然降临。',
    translation: 'Only when you stop fighting with life and stop proving yourself, do the purest joy, freedom, and prosperity quietly descend.',
    category: 'abundance_book',
    source: '《丰盛》'
  },
  {
    id: 'ab-7',
    text: '当你从“我缺什么”的幻觉中醒来，每一刻、每一声呼吸都散发着大宇宙圆满无缺的荣光。',
    translation: 'When you wake up from the illusion of "what I lack", every moment and every breath emits the absolute completeness of the cosmos.',
    category: 'abundance_book',
    source: '《丰盛》'
  },
  {
    id: 'ab-8',
    text: '丰盛是一种绝对的心境，它来自你对生命无条件信赖而产生的神圣大配得感。',
    translation: 'Abundance is an absolute state of mind that stems from your divine sense of worthiness through unconditional trust in life.',
    category: 'abundance_book',
    source: '《丰盛》'
  },
  {
    id: 'ab-9',
    text: '不要试图用小我的焦虑去掌控未来。臣服于此时此刻的虚空，丰盛会在最合适的时间完美流露。',
    translation: 'Do not attempt to control the future with the anxiety of the ego. Surrender to the space of the present, and abundance will flow perfectly.',
    category: 'abundance_book',
    source: '《丰盛》'
  },
  {
    id: 'ab-10',
    text: '你的存在本身，就是奇迹。大自然从未缺少过繁花与细雨，宇宙对你的爱也从未缺席过丰盛。',
    translation: 'Your very existence is a miracle. Nature is never short of flowers and rain, and the universe\'s love for you is never absent of abundance.',
    category: 'abundance_book',
    source: '《丰盛》'
  }
];

export default function AffirmationCard({ onSpeak, isSpeaking, onStopSpeaking, language = 'zh' }: AffirmationCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [speakProgress, setSpeakProgress] = useState(false);

  // Rotate to a new affirmation daily or on refresh
  const rotateAffirmation = () => {
    let next = currentIndex;
    while (next === currentIndex && PREBUILT_AFFIRMATIONS.length > 1) {
      next = Math.floor(Math.random() * PREBUILT_AFFIRMATIONS.length);
    }
    setCurrentIndex(next);
  };

  const currentAff = PREBUILT_AFFIRMATIONS[currentIndex];

  const handleSpeakToggle = async () => {
    if (isSpeaking || speakProgress) {
      onStopSpeaking();
      return;
    }

    setSpeakProgress(true);
    try {
      const textToSpeak = language === 'en' ? currentAff.translation : currentAff.text;
      await onSpeak(textToSpeak);
    } catch (err) {
      console.error("TTS play error:", err);
    } finally {
      setSpeakProgress(false);
    }
  };

  const isEn = language === 'en';

  return (
    <div
      className="p-6 md:p-8 rounded-[32px] bg-white/40 backdrop-blur-2xl border border-white/40 shadow-xl shadow-pink-100/10 relative overflow-hidden"
      id="daily-affirmation-card"
    >
      {/* Decorative Elegant Sparkle elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#ffe4e9]/50 via-transparent to-transparent -mr-12 -mt-12 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-radial from-[#f3e5f5]/50 via-transparent to-transparent -ml-12 -mb-12 pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#8e6d72] animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[10px] uppercase tracking-widest text-[#8e6d72] font-bold block">
            {isEn ? 'Daily Affirmation' : '每日正向暗示 • Daily Affirmation'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={rotateAffirmation}
            className="p-2 rounded-full hover:bg-white/40 text-[#8e6d72] hover:text-[#8e6d72]/80 transition-colors duration-200"
            title={isEn ? 'Next Affirmation' : '更换暗示'}
            id="rotate-affirmation-btn"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentAff.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="min-h-[140px] flex flex-col justify-center text-center px-2"
        >
          {/* Main big luxurious affirmation */}
          <blockquote className="font-serif italic text-lg md:text-xl text-[#8e6d72] leading-relaxed tracking-wide">
            “ {isEn ? currentAff.translation : currentAff.text} ”
          </blockquote>
          
          {/* Translation underneath */}
          <p className="text-[11px] text-[#b49196] font-medium mt-4 font-sans tracking-wide">
            {isEn ? currentAff.text : currentAff.translation}
          </p>

          {/* Elegant Source Attribution */}
          {currentAff.source && (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span className="h-px w-6 bg-[#8e6d72]/20" />
              <span className="text-[10px] font-bold text-[#8e6d72]/80 uppercase tracking-widest font-serif">
                {isEn ? `Dr. Yang Ding-I • ${currentAff.source}` : `杨定一博士 • ${currentAff.source}金句`}
              </span>
              <span className="h-px w-6 bg-[#8e6d72]/20" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-5 border-t border-white/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#b49196] font-semibold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#8e6d72]" />
          {isEn ? 'Subconscious tuning...' : '潜意识注入中...'}
        </div>

        {/* Floating audio control */}
        <button
          onClick={handleSpeakToggle}
          disabled={speakProgress}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full font-sans text-xs font-bold transition-all shadow-md ${
            isSpeaking 
              ? 'bg-[#8e6d72] text-white hover:bg-[#8e6d72]/95 animate-pulse'
              : 'bg-white/60 text-[#8e6d72] hover:bg-white/80 border border-white/60'
          }`}
          id="affirmation-speech-btn"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4 animate-bounce" />
              <span>{isEn ? 'Stop' : '停止朗读'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>{speakProgress ? (isEn ? 'Connecting wave...' : '宇宙声波感应中...') : (isEn ? 'Listen Deeply' : '深沉女声朗读')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
