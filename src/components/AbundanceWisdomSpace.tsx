import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Heart, Compass, BookOpen, Send, RefreshCw, Check, ArrowRight,
  Volume2, Eye, Hand, Ear, Wind, ShieldCheck, Flame, Layers, Clock, Sun, Feather
} from 'lucide-react';
import AbundanceChapterNotes from './AbundanceChapterNotes';

interface AbundanceWisdomSpaceProps {
  language?: 'zh' | 'en';
  onSpeak?: (text: string) => Promise<void>;
  onAddCustomWish?: (title: string, details: string, category: 'wealth' | 'love' | 'beauty' | 'career' | 'lifestyle') => void;
}

export interface MindsetCard {
  id: string;
  category: 'wealth' | 'worth' | 'health' | 'career' | 'time';
  categoryLabelZh: string;
  categoryLabelEn: string;
  scarcityZh: string;
  scarcityEn: string;
  surrenderZh: string;
  surrenderEn: string;
  abundanceZh: string;
  abundanceEn: string;
  quoteZh: string;
  quoteEn: string;
}

const MINDSET_CARDS: MindsetCard[] = [
  {
    id: 'm1',
    category: 'wealth',
    categoryLabelZh: '财富与金钱',
    categoryLabelEn: 'Wealth & Money',
    scarcityZh: '我总是赚不够钱，觉得物质生活很紧绷，对未来的财务充满恐慌。',
    scarcityEn: 'I never have enough money; material life feels tight and full of scarcity.',
    surrenderZh: '承认我对金钱的紧抓与焦虑。深深呼气，将对数字的执着完全交托给宇宙生命整体。',
    surrenderEn: 'Acknowledge my anxious grip on money. Exhale deeply and surrender all numbers to the Whole.',
    abundanceZh: '金钱只是生命能量的流动。我的存在本身就是宇宙最天然、最无缺的丰盛显化。只要内心安住于富足，资粮自然顺流汇聚。',
    abundanceEn: 'Money is simply the flow of life force. My existence itself is cosmic abundance. When resting in inner fullness, resources flow effortlessly.',
    quoteZh: '“真正的丰盛不是去占有什么，而是认出你本自具足的生命本质。” ——《丰盛》',
    quoteEn: '"True abundance is not possessing anything, but recognizing that your essence is already complete." — Abundance'
  },
  {
    id: 'm2',
    category: 'worth',
    categoryLabelZh: '神圣配得感',
    categoryLabelEn: 'Divine Worthiness',
    scarcityZh: '我有太多的缺陷和不完美，过去犯过很多错误，不配得到无条件的宠爱与极奢的美好。',
    scarcityEn: 'I have too many flaws; I made mistakes and feel unworthy of unconditional love and beauty.',
    surrenderZh: '接纳过去的每一个伤痕。对自己说：对不起，请原谅我，谢谢你，我爱你。放手自我批判。',
    surrenderEn: 'Accept every wound. Say: I am sorry, please forgive me, thank you, I love you. Release self-judgment.',
    abundanceZh: '我生来就是神圣不可分割的一部分。认出自己的不完美本身就是造化最极致的完美，我理所当然值得这世间的一切庄严与温柔。',
    abundanceEn: 'I am an inseparable facet of the Divine. Embracing imperfections is true perfection; I am unconditionally worthy of all elegance.',
    quoteZh: '“神圣的配得感，来自认清你从未离开过造物主的源头。” ——《唯识》',
    quoteEn: '"Sacred worthiness stems from realizing you have never left the Source." — Consciousness'
  },
  {
    id: 'm3',
    category: 'career',
    categoryLabelZh: '事业与竞争',
    categoryLabelEn: 'Career & Success',
    scarcityZh: '行业竞争太残酷，资源极其有限，别人成功了就意味着属于我的机会越来越少。',
    scarcityEn: 'Competition is fierce; resources are scarce. If others succeed, my opportunities vanish.',
    surrenderZh: '放下与任何人的比较。退后一步，认出“竞争”只是小我制造的匮乏幻觉。',
    surrenderEn: 'Drop all comparisons. Step back and recognize that competition is just the ego’s scarcity illusion.',
    abundanceZh: '无限的宇宙中没有匮乏与争夺，只有永无止境的共同绽放。属于我的神圣天命与灵感，任何人都不可能夺走。',
    abundanceEn: 'In the infinite Whole, there is no competition—only endless co-blooming. Nothing aligned with my destiny can ever be taken away.',
    quoteZh: '“在无限的整体中，没有竞争，只有永无止境的绽放和分享。” ——《丰盛》',
    quoteEn: '"In the infinite Whole, there is no competition—only endless blooming and mutual sharing." — Abundance'
  },
  {
    id: 'm4',
    category: 'health',
    categoryLabelZh: '身心与健康',
    categoryLabelEn: 'Body & Vitality',
    scarcityZh: '我的身体经常疲惫紧绷，容易生病衰老，总觉得自己的精力远远不够用。',
    scarcityEn: 'My body is constantly tired and stressed; I worry about aging and insufficient vitality.',
    surrenderZh: '感谢身体细胞每一秒的辛劳付出。放下对疾病的抗拒，在全然的静默中允许身体自我修复。',
    surrenderEn: 'Thank every cell for its tireless service. Release all resistance and allow the body to heal in stillness.',
    abundanceZh: '生命深处蕴藏着无限的原初生机（Prana）。当我全然放松并深呼吸，宇宙的大能正在每一个细胞中自愈与焕新。',
    abundanceEn: 'Infinite primal life force (Prana) dwells within. When relaxing deeply, cosmic vitality regenerates every cell.',
    quoteZh: '“身体本就是宇宙的圣殿，全然臣服是最好的疗愈。” ——《真原医》',
    quoteEn: '"The body is a sacred temple; total surrender is the ultimate medicine." — Primordial Medicine'
  },
  {
    id: 'm5',
    category: 'time',
    categoryLabelZh: '时间与未来',
    categoryLabelEn: 'Time & Future',
    scarcityZh: '时间总是不够用，我落后同龄人太多了，一想到未知的明天就感到无比焦虑。',
    scarcityEn: 'I am running out of time and falling behind; the thought of tomorrow fills me with anxiety.',
    surrenderZh: '放弃对未来的焦虑预设。回到呼吸，认出“过去”与“未来”都只是头脑投射的虚影。',
    surrenderEn: 'Release anxious forecasting. Return to the breath and see that past and future are merely mental shadows.',
    abundanceZh: '真正的生命只有“此时，此地，此刻”。在当下的永恒静止中，宇宙早已把最完美、最周全的丰盛安排就绪。',
    abundanceEn: 'Life exists solely in the Here and Now. In the timeless present, the universe has already arranged the most complete abundance.',
    quoteZh: '“活在当下，一切都在最好的安排中展开。” ——《活在当下》',
    quoteEn: '"Living in the present moment, everything unfolds in perfect divine order." — Here and Now'
  }
];

const GRATITUDE_QUOTES = [
  {
    zh: '“唯有通过‘谢谢’，你才能彻底消融‘不够’的幻觉，瞬间与无限的宇宙丰盛对齐。”',
    en: '"Only through saying \'Thank you\' can you fully dissolve the illusion of scarcity and align instantly with infinite cosmic abundance."'
  },
  {
    zh: '“不要去想谢什么，只是连续不断地念‘谢谢’，它是最纯粹、最神圣的生命振动。”',
    en: '"Don\'t think about what you are thanking; simply chant \'Thank you\' continuously. It is the purest and most sacred vibration of life."'
  },
  {
    zh: '“把所有的担忧、不满、愤怒交付给‘谢谢’。‘谢谢’会把它们带回源头，转化为最完美的安排。”',
    en: '"Hand over all worries, resentments, and anger to \'Thank you\'. It will return them to the Source and transmute them into the perfect plan."'
  }
];

export default function AbundanceWisdomSpace({ language = 'zh', onSpeak, onAddCustomWish }: AbundanceWisdomSpaceProps) {
  const [activeTab, setActiveTab] = useState<'alchemy' | 'now' | 'chapters' | 'gratitude' | 'surrender'>('chapters');
  
  // Gratitude Resonance states
  const [resonanceScore, setResonanceScore] = useState(108);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [gratitudeQuoteIndex, setGratitudeQuoteIndex] = useState(0);

  // Surrender states
  const [worryInput, setWorryInput] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [surrenderedState, setSurrenderedState] = useState(false);

  // Mindset Alchemy states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [alchemyCompleted, setAlchemyCompleted] = useState<Record<string, boolean>>({});
  
  // Custom AI Alchemy states
  const [customLimitingThought, setCustomLimitingThought] = useState('');
  const [isAlchemizingAI, setIsAlchemizingAI] = useState(false);
  const [customAlchemyResult, setCustomAlchemyResult] = useState<{
    scarcityFilter: string;
    surrenderRelease: string;
    abundanceReality: string;
    mantra: string;
    quote: string;
  } | null>(null);

  // Here & Now Grounding states
  const [groundingMode, setGroundingMode] = useState<'quick-15s' | 'sensory-1m' | 'presence-3m'>('sensory-1m');
  const [isGroundingActive, setIsGroundingActive] = useState(false);
  const [groundingTimeRemaining, setGroundingTimeRemaining] = useState(60);
  const [sensoryChecklist, setSensoryChecklist] = useState<Record<number, boolean>>({});
  const [presenceBreathPhase, setPresenceBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [presenceQuoteIdx, setPresenceQuoteIdx] = useState(0);

  const groundingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isEn = language === 'en';

  // Tibetan Singing Bowl Web Audio Synth
  const playBellChime = (type: 'bowl' | 'chime' | 'deep' = 'bowl') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      if (type === 'bowl') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // 210Hz & 315Hz sacred Tibetan harmonic
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(210, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(315, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.28, now + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 4.5);
        osc2.stop(now + 4.5);
      } else if (type === 'chime') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(528, now + 0.3);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.6);
      }
    } catch (e) {
      console.warn("Audio Context chime not available:", e);
    }
  };

  // 1. Gratitude Chanting Handler
  const handleGratitudeChant = (e: React.MouseEvent<HTMLButtonElement>) => {
    playBellChime('bowl');
    setResonanceScore(prev => prev + 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left || 120;
    const y = e.clientY - rect.top || 40;

    const newBubble = { id: Date.now() + Math.random(), x, y };
    setBubbles(prev => [...prev, newBubble]);

    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
    }, 1500);

    if (Math.random() < 0.3) {
      setGratitudeQuoteIndex(prev => (prev + 1) % GRATITUDE_QUOTES.length);
    }
  };

  // 2. Surrender Submit Handler
  const handleSurrenderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worryInput.trim()) return;

    setIsDissolving(true);
    setTimeout(() => {
      setIsDissolving(false);
      setSurrenderedState(true);
      setWorryInput('');
      playBellChime('bowl');
    }, 1800);
  };

  // 3. Flip Preset Mindset Card
  const handleAlchemizeCard = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
    setAlchemyCompleted(prev => ({ ...prev, [id]: true }));
    playBellChime('bowl');
  };

  // 4. Custom AI Mindset Transmutation
  const handleCustomAlchemy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customLimitingThought.trim() || isAlchemizingAI) return;

    setIsAlchemizingAI(true);
    playBellChime('chime');

    try {
      const response = await fetch('/api/wisdom/alchemize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitingThought: customLimitingThought }),
      });

      if (!response.ok) {
        throw new Error('Alchemy server returned error');
      }

      const data = await response.json();
      setCustomAlchemyResult(data);
      playBellChime('bowl');
    } catch (err) {
      console.warn("AI Alchemy offline fallback:", err);
      // Fallback
      setCustomAlchemyResult({
        scarcityFilter: "小我将局部的暂时现象当成了生命的全部，产生了‘我不够’或‘外界正在剥夺我’的认知错觉。",
        surrenderRelease: "深呼吸，闭上眼对自己的焦虑说：对不起，请原谅我，谢谢你，我爱你。我放下紧抓不放的抗拒。",
        abundanceReality: "宇宙在每一个瞬间都在无条件滋养着你。当你认出你就是生命本身，外在的丰足与奇迹便会自然显现。",
        mantra: "我放手，我允许，我安住在本自圆满的丰盛中。",
        quote: "“真正的丰盛不是占有什么，而是认出你本自具足的生命本质。” ——《丰盛》"
      });
    } finally {
      setIsAlchemizingAI(false);
    }
  };

  // 5. Here & Now Grounding Engine
  const startGroundingSession = (mode: 'quick-15s' | 'sensory-1m' | 'presence-3m') => {
    if (groundingIntervalRef.current) clearInterval(groundingIntervalRef.current);
    
    setGroundingMode(mode);
    setIsGroundingActive(true);
    setSensoryChecklist({});
    playBellChime('bowl');

    const totalSeconds = mode === 'quick-15s' ? 15 : mode === 'sensory-1m' ? 60 : 180;
    setGroundingTimeRemaining(totalSeconds);

    let sec = totalSeconds;
    groundingIntervalRef.current = setInterval(() => {
      sec--;
      setGroundingTimeRemaining(sec);

      // In 3m mode, toggle breath guide every 6s
      if (sec % 6 === 0) {
        setPresenceBreathPhase(p => (p === 'inhale' ? 'exhale' : 'inhale'));
      }
      if (sec % 20 === 0) {
        setPresenceQuoteIdx(i => (i + 1) % 4);
      }

      if (sec <= 0) {
        if (groundingIntervalRef.current) clearInterval(groundingIntervalRef.current);
        setIsGroundingActive(false);
        playBellChime('bowl');
      }
    }, 1000);
  };

  const stopGroundingSession = () => {
    if (groundingIntervalRef.current) clearInterval(groundingIntervalRef.current);
    setIsGroundingActive(false);
  };

  useEffect(() => {
    return () => {
      if (groundingIntervalRef.current) clearInterval(groundingIntervalRef.current);
    };
  }, []);

  const toggleSensoryItem = (index: number) => {
    playBellChime('chime');
    setSensoryChecklist(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const filteredCards = selectedCategory === 'all' 
    ? MINDSET_CARDS 
    : MINDSET_CARDS.filter(c => c.category === selectedCategory);

  const PRESENCE_QUOTES = [
    {
      zh: '“丰盛从来不属于过去或未来。唯有在此时、此地、此刻，你才是无限的。”',
      en: '"Abundance never belongs to past or future. Only Here and Now are you truly infinite."'
    },
    {
      zh: '“把注意力从脑海中的杂念，轻轻带回到身体的呼吸与胸口的空间。”',
      en: '"Gently redirect your attention from head-chatter back to the breath in your chest."'
    },
    {
      zh: '“在静默的背景中，你早已拥有一切，无需证明，无需争夺。”',
      en: '"In the background silence, you already possess everything—no striving, no proving."'
    },
    {
      zh: '“允许这一刻如其所是。这一刻就是造化给您最完美的礼物。”',
      en: '"Allow this moment to be exactly as it is. It is the ultimate divine gift to you."'
    }
  ];

  return (
    <div
      className="p-5 md:p-8 rounded-[32px] bg-white/45 backdrop-blur-2xl border border-white/40 shadow-xl shadow-pink-100/10 relative overflow-hidden text-left"
      id="abundance-wisdom-space"
    >
      {/* Visual Header Decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-100/40 via-pink-100/20 to-transparent pointer-events-none rounded-full blur-2xl" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-[#8e6d72]/15 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 text-[10px] font-mono font-bold tracking-wider uppercase">
              {isEn ? 'Dr. Jan Ding-I Wisdom' : '杨定一博士《全部生命系列》'}
            </span>
            <span className="text-[10px] text-[#8e6d72]/70 font-semibold">
              {isEn ? 'Abundance • Consciousness • Now' : '《丰盛》《唯识》《活在当下》'}
            </span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl text-[#8e6d72] font-bold flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '12s' }} />
            <span>{isEn ? 'The Abundance Sanctuary' : '丰盛智慧觉醒空间'}</span>
          </h3>
        </div>

        {/* Top Feature Nav Tabs */}
        <div className="flex flex-wrap gap-1 bg-[#8e6d72]/5 p-1 rounded-2xl border border-[#8e6d72]/10 w-full md:w-auto">
          {[
            { id: 'chapters', label: isEn ? '📖 Chapters & Notes' : '📖 篇章要义与读书笔记' },
            { id: 'alchemy', label: isEn ? '✨ Mindset Alchemy' : '✨ 唯识转念' },
            { id: 'now', label: isEn ? '🧘 Here & Now' : '🧘 活在当下' },
            { id: 'gratitude', label: isEn ? '💖 Gratitude' : '💖 感恩共振' },
            { id: 'surrender', label: isEn ? '🕊️ Surrender' : '🕊️ 全然臣服' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex-1 md:flex-none text-center cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#8e6d72] text-white shadow-md shadow-pink-900/10'
                  : 'text-[#8e6d72]/80 hover:bg-white/40'
              }`}
              id={`wisdom-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tab Content */}
      <div className="min-h-[300px]">
        
        {/* ========================================================
            TAB 0: CHAPTERS & READING NOTES (全书篇章要义与读书笔记)
        ======================================================== */}
        {activeTab === 'chapters' && (
          <div className="space-y-6 animate-fadeIn" id="tab-chapters-notes">
            <AbundanceChapterNotes
              language={language}
              onSpeak={onSpeak}
              onAddCustomWish={onAddCustomWish}
            />
          </div>
        )}

        {/* ========================================================
            TAB 1: 唯识转念 (Mindset Alchemy) - DEEP OPTIMIZATION
        ======================================================== */}
        {activeTab === 'alchemy' && (
          <div className="space-y-6 animate-fadeIn" id="tab-mindset-alchemy">
            
            {/* Top Concept Banner */}
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-amber-50/60 border border-amber-200/50 leading-relaxed text-xs text-[#6d5b5e]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-700 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>{isEn ? 'Consciousness Transmutation Alchemy' : '唯识转念炼金术 • 破除小我匮乏幻象'}</span>
                </span>
                <span className="text-[10px] text-[#8e6d72] font-mono bg-white/70 px-2 py-0.5 rounded-full border border-amber-200/50">
                  {isEn ? 'Ego Filter ➜ Surrender ➜ True Abundance' : '小我滤镜 ➜ 全然臣服 ➜ 显露真如'}
                </span>
              </div>
              <p className="opacity-90 leading-relaxed">
                {isEn
                  ? 'Dr. Jan explains that scarcity, competition, and anxiety are merely filters projected by the ego. Through Consciousness (Wei-Shi), once we observe the filter and surrender, our original infinite abundance is instantly restored.'
                  : '杨定一博士在《唯识》《丰盛》中揭示：所有的匮乏、攀比与焦虑，都只是小我编织的“认知滤镜”。只要借由觉察看破妄念、承认并臣服交付，生命的真实丰盛实相便会不求自来。'}
              </p>
            </div>

            {/* AI Custom Mindset Transmuter Box */}
            <div className="p-5 rounded-2xl bg-white/70 border border-[#8e6d72]/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8e6d72] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isEn ? 'AI Wei-Shi Mindset Transmutation Forge' : '✨ 自定义念头 • AI 唯识转念炼金炉'}</span>
                </span>
                <span className="text-[10px] text-[#8e6d72]/60 font-medium">
                  {isEn ? 'Transform any personal limiting belief' : '输入任何困扰您的现实焦虑或匮乏念头'}
                </span>
              </div>

              {/* Quick Prompt Ideas */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="text-[#8e6d72]/60 font-semibold py-0.5">{isEn ? 'Try:' : '一键填入常见妄念：'}</span>
                {[
                  '担心存款不够，下个月开销很大',
                  '觉得自己年纪大了，错过了最好赚钱的时机',
                  '身边优秀的人太多，我随时可能被淘汰',
                  '我有太多缺点，不配过上轻盈奢华的生活'
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomLimitingThought(promptText)}
                    className="px-2 py-1 rounded-lg bg-[#8e6d72]/5 hover:bg-[#8e6d72]/15 text-[#8e6d72] font-medium transition-colors cursor-pointer border border-[#8e6d72]/10 text-left truncate max-w-[200px] sm:max-w-none"
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>

              <form onSubmit={handleCustomAlchemy} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={customLimitingThought}
                    onChange={(e) => setCustomLimitingThought(e.target.value)}
                    placeholder={isEn ? "Enter your anxious thought (e.g. 'I fear I will never earn enough...')" : "输入您的限制性念头（例如：‘我很害怕投资失败，觉得自己能力不够，经常彻夜失眠...’）"}
                    rows={2}
                    className="w-full p-3.5 rounded-xl border border-[#8e6d72]/20 focus:border-[#8e6d72] focus:ring-1 focus:ring-[#8e6d72]/20 bg-white text-xs text-[#4a2e31] placeholder:text-[#8e6d72]/40 resize-none transition-all"
                  />
                  {isAlchemizingAI && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-amber-700">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isEn ? 'Alchemizing Ego Illusion with Wei-Shi Wisdom...' : '正在以杨定一唯识心法解构小我妄念并注入真如实相...'}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8e6d72]/60 italic">
                    {isEn ? 'Converts scarcity illusion into divine abundance reality' : '以唯识观照，破除妄念，显发本具圆满'}
                  </span>
                  <button
                    type="submit"
                    disabled={isAlchemizingAI || !customLimitingThought.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-[#8e6d72] hover:from-amber-700 hover:to-[#7e5d62] text-white text-xs font-bold font-sans transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                    id="submit-ai-alchemy-btn"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-200" />
                    <span>{isEn ? 'Alchemize with Wei-Shi' : '启动唯识转念'}</span>
                  </button>
                </div>
              </form>

              {/* AI Transmutation Result Card */}
              {customAlchemyResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-rose-50/70 border border-amber-200/80 shadow-md space-y-4 mt-3"
                >
                  <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5 font-serif">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{isEn ? 'Consciousness Alchemy Result' : '唯识转念实相报告 • 觉醒回响'}</span>
                    </span>
                    {onSpeak && (
                      <button
                        type="button"
                        onClick={() => onSpeak(`${customAlchemyResult.abundanceReality}。${customAlchemyResult.mantra}`)}
                        className="px-2.5 py-1 rounded-lg bg-amber-100/70 hover:bg-amber-200/70 text-amber-800 text-[10.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="深沉女声朗读实相真言"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Listen' : '真声朗诵'}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* 1. Scarcity Filter */}
                    <div className="p-3 rounded-xl bg-white/70 border border-rose-100 space-y-1">
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                        ❌ 1. 小我匮乏滤镜 (Ego Illusion)
                      </span>
                      <p className="text-[#6d5b5e] leading-relaxed">
                        {customAlchemyResult.scarcityFilter}
                      </p>
                    </div>

                    {/* 2. Surrender Release */}
                    <div className="p-3 rounded-xl bg-white/70 border border-amber-100 space-y-1">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                        🕊️ 2. 承认放手臣服 (Surrender)
                      </span>
                      <p className="text-[#6d5b5e] leading-relaxed">
                        {customAlchemyResult.surrenderRelease}
                      </p>
                    </div>

                    {/* 3. True Abundance Reality */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/40 space-y-1">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                        👑 3. 唯识真如丰盛 (True Reality)
                      </span>
                      <p className="text-[#4a2e31] font-semibold font-serif leading-relaxed">
                        {customAlchemyResult.abundanceReality}
                      </p>
                    </div>
                  </div>

                  {/* Mantra Banner */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#8e6d72]/10 to-amber-500/15 border border-amber-300/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-[#8e6d72] font-bold block mb-0.5">
                        🌸 即刻转化随身真言 (Somatic Mantra)
                      </span>
                      <p className="text-sm font-serif font-bold text-[#8e6d72]">
                        “{customAlchemyResult.mantra}”
                      </p>
                    </div>

                    {onAddCustomWish && (
                      <button
                        type="button"
                        onClick={() => {
                          onAddCustomWish(
                            `唯识真言：${customAlchemyResult.mantra.slice(0, 16)}`,
                            `【唯识真如实相】\n${customAlchemyResult.abundanceReality}\n\n【随身转化口诀】\n${customAlchemyResult.mantra}`,
                            'wealth'
                          );
                          playBellChime('chime');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#8e6d72] text-white hover:bg-[#7e5d62] text-[10.5px] font-bold shrink-0 transition-colors shadow-sm cursor-pointer"
                      >
                        + 保存为心愿卡片
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-[#8e6d72]/70 italic text-center">
                    {customAlchemyResult.quote}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Category Filter for Mindset Library */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#8e6d72] uppercase tracking-wider">
                  {isEn ? 'Dr. Jan’s Classic Wei-Shi Mindset Library' : '《丰盛》原书经典唯识转念典藏库 (3D 翻转卡片)'}
                </span>
                
                {/* Category Pills */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'all', label: isEn ? 'All' : '全部维度' },
                    { id: 'wealth', label: isEn ? 'Wealth' : '财富金钱' },
                    { id: 'worth', label: isEn ? 'Worth' : '神圣配得' },
                    { id: 'career', label: isEn ? 'Career' : '事业竞争' },
                    { id: 'health', label: isEn ? 'Health' : '身心活力' },
                    { id: 'time', label: isEn ? 'Time' : '时间当下' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white/60 text-[#8e6d72] hover:bg-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Mindset Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCards.map((card) => {
                  const isFlipped = flippedCards[card.id];
                  
                  return (
                    <div
                      key={card.id}
                      className="relative min-h-[190px] perspective-1000 group cursor-pointer"
                      onClick={() => handleAlchemizeCard(card.id)}
                    >
                      <motion.div
                        className="w-full h-full duration-500 preserve-3d"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        {/* FRONT CARD: Scarcity Filter (小我匮乏) */}
                        <div className="absolute inset-0 backface-hidden p-5 rounded-2xl bg-white/70 border border-[#8e6d72]/15 flex flex-col justify-between hover:border-amber-400/50 hover:shadow-md transition-all shadow-xs">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                {isEn ? '❌ SCARCITY ILLUSION' : '❌ 小我匮乏滤镜'}
                              </span>
                              <span className="text-[10px] font-mono text-[#8e6d72]/60 font-semibold">
                                {card.categoryLabelZh}
                              </span>
                            </div>
                            <p className="text-xs text-[#6d5b5e] font-sans leading-relaxed pt-1">
                              {isEn ? card.scarcityEn : card.scarcityZh}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-[#8e6d72]/10 mt-2">
                            <span className="text-[9.5px] text-[#8e6d72]/60 italic">
                              {isEn ? 'Click to Transmute' : '轻点卡片启动 3D 翻转'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 py-1 px-3 rounded-full hover:bg-amber-600 hover:text-white transition-all shadow-xs">
                              <Flame className="w-3 h-3 text-amber-500" />
                              <span>{isEn ? 'Alchemize' : '启动转念'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>

                        {/* BACK CARD: True Abundance Reality (唯识真如) */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100/50 border border-amber-300/70 flex flex-col justify-between shadow-md">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                                {isEn ? '👑 TRUE ABUNDANCE REALITY' : '👑 唯识真如丰盛实相'}
                              </span>
                              <span className="text-[10px] text-amber-700 font-mono font-bold">
                                {card.categoryLabelZh}
                              </span>
                            </div>
                            <p className="text-xs text-[#8e6d72] font-serif font-bold leading-relaxed pt-1">
                              {isEn ? card.abundanceEn : card.abundanceZh}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between">
                            <span className="text-[9.5px] italic text-amber-800/80 truncate max-w-[200px]">
                              {isEn ? card.quoteEn : card.quoteZh}
                            </span>
                            {onSpeak && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSpeak(card.abundanceZh);
                                }}
                                className="p-1.5 rounded-lg bg-amber-200/60 hover:bg-amber-300 text-amber-900 text-xs transition-colors cursor-pointer"
                                title="真声朗诵实相"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {/* Progress counter */}
              <div className="flex items-center justify-between text-[11px] font-bold text-[#8e6d72] bg-[#8e6d72]/5 px-4 py-2.5 rounded-2xl border border-[#8e6d72]/10">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{isEn ? 'CONSCIOUS TRANSITION PROGRESS' : '当前唯识转念觉醒实修完成度'}</span>
                </span>
                <span className="font-mono bg-white px-2.5 py-0.5 rounded-lg border border-[#8e6d72]/15 text-amber-700 font-bold">
                  {Object.keys(alchemyCompleted).length} / {MINDSET_CARDS.length}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: 活在当下 (Here and Now Grounding) - DEEP OPTIMIZATION
        ======================================================== */}
        {activeTab === 'now' && (
          <div className="space-y-6 animate-fadeIn" id="tab-here-and-now">
            
            {/* Top Concept Banner */}
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-teal-50/70 via-sky-50/40 to-amber-50/60 border border-teal-200/50 leading-relaxed text-xs text-[#526366]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-teal-800 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '20s' }} />
                  <span>{isEn ? 'The Eternal Present Moment' : '活在当下 • 此时·此地·此刻'}</span>
                </span>
                <span className="text-[10px] text-teal-800 font-mono bg-white/70 px-2 py-0.5 rounded-full border border-teal-200/50">
                  {isEn ? 'Sensory Grounding & Pure Presence' : '感官锚定 ➜ 止息妄念 ➜ 安住当下'}
                </span>
              </div>
              <p className="opacity-90 leading-relaxed text-[#5c6d70]">
                {isEn
                  ? 'Abundance never dwells in yesterday’s regrets or tomorrow’s fears. It exists exclusively in the infinite "Here and Now." Ground your senses into the present to access spontaneous grace.'
                  : '杨定一博士在《活在当下》《一切都好》中指出：丰盛从来不属于昨天的悔恨或明天的忧虑，它只存在于唯一真实的“此时此地”。通过五感锚定与纯粹觉知，瞬间切断头脑妄想，回到生命的源头。'}
              </p>
            </div>

            {/* Mode Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'quick-15s',
                  title: isEn ? '15s Instant Reset' : '⚡ 15秒 极速心智清空',
                  desc: isEn ? 'Rapid 3-step sensory awareness to snap out of panic.' : '三步快速视觉、触觉与静默观照，瞬间切断焦虑。',
                  icon: Clock
                },
                {
                  id: 'sensory-1m',
                  title: isEn ? '1m 5-4-3-2-1 Grounding' : '🌟 1分钟 5-4-3-2-1 丰盛感官锚定',
                  desc: isEn ? '5 sights, 4 touches, 3 sounds, 2 breaths, 1 pure I-AM.' : '视觉、触觉、听觉、深呼吸与本我觉知的五维实修。',
                  icon: Layers
                },
                {
                  id: 'presence-3m',
                  title: isEn ? '3m Pure Presence Flow' : '🧘 3分钟 “此时此刻” 纯粹观照',
                  desc: isEn ? 'Synced breath guide with singing bowl harmonic soundscapes.' : '同步呼吸律动、颂钵共振与深层潜意识觉知浸润。',
                  icon: Compass
                }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => startGroundingSession(m.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isGroundingActive && groundingMode === m.id
                      ? 'bg-teal-50/90 border-teal-400 shadow-md ring-2 ring-teal-300/40'
                      : 'bg-white/70 border-[#8e6d72]/15 hover:bg-white hover:border-[#8e6d72]/30 shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#8e6d72] block flex items-center gap-1.5">
                      <m.icon className="w-4 h-4 text-amber-600" />
                      <span>{m.title}</span>
                    </span>
                    <p className="text-[10.5px] text-[#6d5b5e] leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isGroundingActive && groundingMode === m.id
                        ? 'bg-teal-600 text-white animate-pulse'
                        : 'bg-[#8e6d72]/10 text-[#8e6d72]'
                    }`}>
                      {isGroundingActive && groundingMode === m.id ? '正在进行中...' : '点击启动'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Grounding Stage Container */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/70 border border-white/80 shadow-md space-y-6 text-center">
              
              {!isGroundingActive ? (
                <div className="py-6 space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-100 to-teal-100 flex items-center justify-center mx-auto shadow-inner">
                    <Sun className="w-8 h-8 text-amber-600 animate-spin" style={{ animationDuration: '16s' }} />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-bold text-[#8e6d72]">
                      {isEn ? 'Enter the Sanctuary of "Here and Now"' : '随时回到当下 • 找回内心的定海神针'}
                    </h4>
                    <p className="text-xs text-[#6d5b5e] leading-relaxed">
                      {isEn
                        ? 'Select any practice above. Allow gentle Tibetan singing bowl acoustics and sensory awareness to melt away time and fatigue.'
                        : '请选择上方任一种当下实修模式。在真实的铜钵磬音与感官锚定中，让漂泊的念头瞬间安歇在永恒的丰盛实相里。'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startGroundingSession('sensory-1m')}
                    className="px-6 py-2.5 rounded-full bg-[#8e6d72] hover:bg-[#7e5d62] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{isEn ? 'Begin 1-Minute Sensory Grounding' : '开启 1 分钟 5-4-3-2-1 丰盛感官锚定'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Timer & Controls Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#8e6d72]/15">
                    <div className="flex items-center gap-2 text-left">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                      <div>
                        <span className="text-xs font-bold text-[#8e6d72] block">
                          {groundingMode === 'quick-15s' ? '⚡ 15秒 极速心智清空' : groundingMode === 'sensory-1m' ? '🌟 1分钟 5-4-3-2-1 感官锚定' : '🧘 3分钟 “此时此刻” 深度观照'}
                        </span>
                        <span className="text-[10px] text-[#8e6d72]/70 font-mono">
                          剩余时间：{groundingTimeRemaining} 秒
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={stopGroundingSession}
                      className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10.5px] font-bold transition-colors cursor-pointer"
                    >
                      结束练习
                    </button>
                  </div>

                  {/* MODE A: 5-4-3-2-1 SENSORY CHECKLIST */}
                  {groundingMode === 'sensory-1m' && (
                    <div className="space-y-3 text-left">
                      <p className="text-xs text-[#8e6d72] font-semibold text-center pb-1">
                        {isEn ? 'Tap each sensory anchor as you notice it in your surroundings:' : '请跟随指引，每在当下觉察到一个感官维度，轻点将其点亮：'}
                      </p>

                      <div className="grid grid-cols-1 gap-2.5 max-w-xl mx-auto">
                        {[
                          { step: 5, icon: Eye, title: '5 种看见的颜色与光影 (Vision)', desc: '环顾四周，看见5种不同质感、充满生机的光影与色彩。', color: 'text-amber-600' },
                          { step: 4, icon: Hand, title: '4 处触手可及的身体支撑 (Touch)', desc: '感受座椅的承托、脚掌贴合地面、衣物贴着皮肤的微温。', color: 'text-teal-600' },
                          { step: 3, icon: Ear, title: '3 种背景中若隐若现的声音 (Hearing)', desc: '倾听微风、环境音、以及所有声音背后的广阔寂静。', color: 'text-sky-600' },
                          { step: 2, icon: Wind, title: '2 次悠长舒展的纯净深呼吸 (Breath)', desc: '深吸气感受清凉空气涌入腹部，长呼气释放所有紧绷。', color: 'text-rose-600' },
                          { step: 1, icon: Heart, title: '1 份如如不动的本我觉知 (I-AM Presence)', desc: '安住在“我-是”的纯粹空间中。此时此地，你本自圆满。', color: 'text-purple-600' },
                        ].map((item, idx) => {
                          const isDone = sensoryChecklist[item.step];
                          return (
                            <button
                              key={item.step}
                              type="button"
                              onClick={() => toggleSensoryItem(item.step)}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                                isDone
                                  ? 'bg-teal-50/90 border-teal-300 shadow-sm'
                                  : 'bg-white/80 border-[#8e6d72]/15 hover:border-[#8e6d72]/30'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                  isDone ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                  <span className={`text-xs font-bold block ${isDone ? 'text-teal-900' : 'text-[#4a2e31]'}`}>
                                    {item.title}
                                  </span>
                                  <span className="text-[10px] text-[#6d5b5e] block">
                                    {item.desc}
                                  </span>
                                </div>
                              </div>

                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                                isDone ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-300 text-transparent'
                              }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* MODE B: 3-MINUTE PURE PRESENCE */}
                  {groundingMode === 'presence-3m' && (
                    <div className="space-y-6 max-w-lg mx-auto py-2">
                      {/* Synchronized Pulsing Breath Circle */}
                      <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: presenceBreathPhase === 'inhale' ? 1.25 : 0.85,
                            opacity: presenceBreathPhase === 'inhale' ? 0.9 : 0.4
                          }}
                          transition={{ duration: 5.5, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-300/40 via-amber-200/50 to-pink-300/40 blur-xl"
                        />
                        <div className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center z-10 transition-all duration-1000 ${
                          presenceBreathPhase === 'inhale'
                            ? 'border-teal-400 bg-teal-50/80 shadow-teal-200/50'
                            : 'border-amber-400 bg-amber-50/80 shadow-amber-200/50'
                        }`}>
                          <span className="text-xs font-serif font-bold text-[#8e6d72] tracking-wider block">
                            {presenceBreathPhase === 'inhale' ? '吸气 · 连系源头' : '呼气 · 安住当下'}
                          </span>
                          <span className="text-[9px] font-mono text-[#8e6d72]/60 mt-0.5">
                            {presenceBreathPhase === 'inhale' ? 'Inhale Peace' : 'Exhale Striving'}
                          </span>
                        </div>
                      </div>

                      {/* Rotating Presence Quote */}
                      <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-1">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-teal-800 block">
                          《活在当下》杨定一原著心印指引
                        </span>
                        <p className="text-xs font-serif font-bold text-[#8e6d72] leading-relaxed">
                          {PRESENCE_QUOTES[presenceQuoteIdx][language]}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* MODE C: 15-SECOND INSTANT RESET */}
                  {groundingMode === 'quick-15s' && (
                    <div className="space-y-4 max-w-md mx-auto py-2">
                      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl font-bold font-mono shadow-inner animate-pulse">
                        {groundingTimeRemaining}s
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-[#8e6d72] block">
                          {groundingTimeRemaining > 10
                            ? '👁️ 第 1 步：睁开眼，观照周围最柔和的一束光'
                            : groundingTimeRemaining > 5
                            ? '✋ 第 2 步：闭上眼，感受拂过肌肤的温热呼吸'
                            : '💖 第 3 步：深深呼气，安住在最纯粹的“我-是”'}
                        </span>
                        <p className="text-[11px] text-[#6d5b5e] leading-relaxed italic">
                          “放下对过去的所有纠结，放下对未来的所有担忧。此时此刻，您与宇宙的大丰盛完全同频。”
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================
            TAB 3: GRATITUDE RESONANCE ("谢谢"练习)
        ======================================================== */}
        {activeTab === 'gratitude' && (
          <div className="space-y-5 animate-fadeIn" id="tab-gratitude-resonance">
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/60 leading-relaxed text-xs text-[#6d5b5e]">
              <p className="font-serif italic text-sm text-[#8e6d72] mb-2 font-semibold">
                {GRATITUDE_QUOTES[gratitudeQuoteIndex][language]}
              </p>
              <p className="opacity-80">
                {isEn 
                  ? 'Continuous chanting of "Thank you" is the quickest shortcut to align with the core frequency of the universe. It removes the illusion of "not enough".' 
                  : '杨定一博士指出：不断地念“谢谢”，是在意识最深处与无限整体唱和。它没有任何交换条件，只是认出并肯定此时此刻生命本就完美，从而自然显化物质与精神上的双重丰盛。'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-white/50 border border-white/60">
              <div className="text-center sm:text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-60 font-bold block">{isEn ? 'Abundance Resonance Score' : '当前丰盛宇宙能量共振值'}</span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <span className="text-3xl font-serif font-bold text-amber-600 font-mono">{resonanceScore}</span>
                  <span className="text-xs font-semibold text-amber-500">Hz</span>
                </div>
                <p className="text-[10px] text-[#b49196] font-medium mt-1">
                  {isEn ? 'Each "Thank you" amplifies your sensory attraction pool' : '每一次点击与默念“谢谢”，都在强力调谐潜意识财富频率'}
                </p>
              </div>

              {/* Chanting button with live floating bubbles */}
              <button
                onClick={handleGratitudeChant}
                className="relative py-6 px-10 rounded-full bg-gradient-to-r from-[#8e6d72] to-[#b49196] hover:from-[#7e5d62] hover:to-[#a48186] text-white font-serif font-bold text-lg tracking-widest shadow-xl shadow-pink-100/30 active:scale-95 transition-all duration-150 overflow-hidden shrink-0 group cursor-pointer"
                id="chant-thank-you-btn"
              >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {bubbles.map(b => (
                    <motion.span
                      key={b.id}
                      initial={{ opacity: 0.9, scale: 0.5, x: b.x, y: b.y }}
                      animate={{ opacity: 0, scale: 2, y: b.y - 100 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="absolute w-6 h-6 rounded-full bg-white/30 border border-white/40 flex items-center justify-center font-sans text-[8px] font-bold text-white shadow-inner"
                    >
                      谢谢
                    </motion.span>
                  ))}
                </div>
                
                <span className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-200">
                  <Heart className="w-5 h-5 fill-white/10 text-white animate-pulse" />
                  <span>{isEn ? 'Thank You • 谢谢' : '谢谢 • 谢谢'}</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: TOTAL SURRENDER (全然臣服)
        ======================================================== */}
        {activeTab === 'surrender' && (
          <div className="space-y-5 animate-fadeIn" id="tab-total-surrender">
            <div className="p-4 rounded-2xl bg-[#8e6d72]/5 border border-[#8e6d72]/10 leading-relaxed text-xs text-[#6d5b5e]">
              <p className="font-serif italic text-sm text-[#8e6d72] mb-1.5 font-bold">
                {isEn 
                  ? '“Surrender is not giving up; it is stepping back and letting the supreme intelligence of the universe lead.”' 
                  : '“臣服不是委曲求全，而是放手、退一步，将人生的掌控权交还给比大我更恢弘的生命洪流。”'}
              </p>
              <p className="opacity-80">
                {isEn
                  ? 'Input whatever blocks your flow (fear, debt, self-doubt) and surrender it cleanly. Watch it dissolve into nothingness and be replaced by the ultimate divine arrangement.'
                  : '写下你当前感到忧虑、抗拒、或觉得匮乏的事。点击臣服，让这些纠结的字符在眼前消融回归虚无，调频并承接生命最完美、无懈可击的馈赠。'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!surrenderedState ? (
                <motion.form
                  key="surrender-form"
                  onSubmit={handleSurrenderSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative">
                    <textarea
                      value={worryInput}
                      onChange={(e) => setWorryInput(e.target.value)}
                      disabled={isDissolving}
                      placeholder={isEn ? "Type what you are resisting (e.g. 'I am terrified about money...')" : "例如：‘我很焦虑下个月的房租与账单，觉得自己无法负担任何奢侈的事物...’"}
                      className={`w-full p-4 rounded-2xl border bg-white/50 text-xs font-sans focus:outline-none transition-all resize-none h-24 ${
                        isDissolving 
                          ? 'opacity-40 animate-pulse border-gray-200' 
                          : 'border-[#8e6d72]/20 focus:border-[#8e6d72] focus:ring-1 focus:ring-[#8e6d72]/30'
                      }`}
                    />
                    
                    {isDissolving && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px] rounded-2xl">
                        <span className="text-xs font-bold text-[#8e6d72] tracking-widest animate-bounce">
                          {isEn ? '🌌 Dissolving Scarcity into Light...' : '🌌 匮乏心智消融，化为尘埃与光束...'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isDissolving || !worryInput.trim()}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#8e6d72] hover:bg-[#7e5d62] text-white text-xs font-bold font-sans transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      id="surrender-action-btn"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Surrender to the Universe' : '交付：全然臣服并接纳'}</span>
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="surrendered-result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/40 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100/60 text-amber-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                    <Check className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif text-[#8e6d72] font-semibold text-base">
                      {isEn ? 'Released & Dissolved Into Infinite Being' : '已交付 • 心界清凉，万物顺流'}
                    </h4>
                    <p className="text-xs text-[#6d5b5e] leading-relaxed max-w-lg mx-auto">
                      {isEn
                        ? 'Everything you typed has been dissolved. You are now aligned with Dr. Jan’s ultimate surrender realization:'
                        : '您所抗拒的已被虚无同化。现在，让这句至关重要的丰盛密语在心中回响：'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/80 border border-white max-w-md mx-auto">
                    <blockquote className="font-serif italic text-sm text-[#8e6d72] leading-relaxed">
                      {isEn
                        ? '“Everything is the most perfect arrangement. I am sorry, please forgive me, thank you, I love you. Let go, and step back.”'
                        : '“这一切都是最完美的安排。对不起，请原谅我，谢谢你，我爱你。放手，退后，让丰盛生命为您做主。”'}
                    </blockquote>
                  </div>

                  <button
                    onClick={() => setSurrenderedState(false)}
                    className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#8e6d72] hover:text-[#7e5d62] underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isEn ? 'Surrender Another Worry' : '再次写下抗拒，解脱心念'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
