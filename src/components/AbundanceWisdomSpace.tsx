import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Compass, BookOpen, Send, RefreshCw, Check, ArrowRight } from 'lucide-react';

interface AbundanceWisdomSpaceProps {
  language?: 'zh' | 'en';
  onSpeak?: (text: string) => Promise<void>;
}

interface MindsetCard {
  id: string;
  scarcityZh: string;
  scarcityEn: string;
  abundanceZh: string;
  abundanceEn: string;
  quoteZh: string;
  quoteEn: string;
}

const MINDSET_CARDS: MindsetCard[] = [
  {
    id: 'm1',
    scarcityZh: '我总是赚不够钱，觉得物质生活很紧绷、充满匮乏。',
    scarcityEn: 'I never have enough money; material life feels extremely tight and scarce.',
    abundanceZh: '钱只是生命能量的流动。我的存在本身，就是宇宙最天然、最完美的丰盛显化。',
    abundanceEn: 'Money is simply the flow of life force energy. My very existence is the most natural and perfect manifestation of cosmic abundance.',
    quoteZh: '“真正的丰盛不是去占有什么，而是认出你本自具足的生命本质。”',
    quoteEn: '"True abundance is not about possessing anything, but recognizing that your essential nature is already complete and whole."'
  },
  {
    id: 'm2',
    scarcityZh: '社会资源太少，别人拿走了属于我的成功，机会稍纵即逝。',
    scarcityEn: 'Resources are limited; others are taking my success, and opportunities slip away.',
    abundanceZh: '宇宙是无限的，属于我的丰盛永远不会被任何人夺走，也永远不会枯竭。',
    abundanceEn: 'The universe is infinite; the abundance aligned with me can never be snatched by anyone, nor will it ever run dry.',
    quoteZh: '“在无限的整体中，没有竞争，只有永无止境的绽放和分享。”',
    quoteEn: '"In the infinite Whole, there is no competition—only endless blooming and mutual sharing."'
  },
  {
    id: 'm3',
    scarcityZh: '我必须极度拼搏、牺牲身体和快乐，才能换取微不足道的安全感。',
    scarcityEn: 'I must work myself to exhaustion and sacrifice my joy to trade for minor security.',
    abundanceZh: '丰盛是自然顺流的，它来自内心的优雅、喜悦与全然放松，而非焦虑的挣扎。',
    abundanceEn: 'Abundance flows naturally; it blossoms from inner grace, joy, and deep relaxation, not from anxious struggles.',
    quoteZh: '“当你退一步，放手并安住在喜悦中，生命自然会为你推开最完美的门扉。”',
    quoteEn: '"When you step back, let go, and rest in joy, life naturally swings open the most perfect doors for you."'
  },
  {
    id: 'm4',
    scarcityZh: '我有太多的不完美和缺陷，不配得到这世间极致的美好。',
    scarcityEn: 'I have too many flaws and imperfections; I am unworthy of the ultimate beauty of life.',
    abundanceZh: '我生来就是神圣的一部分。每一个经历、每一次伤痛都是丰盛能量的独特礼物。',
    abundanceEn: 'I am born as an block of the divine. Every experience and every wound is a unique gift of abundance.',
    quoteZh: '“认出自己的不完美本身就是完美的，这就是大配得感。”',
    quoteEn: '"Recognizing that your imperfection is itself perfect is the ultimate sense of worthiness."'
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

export default function AbundanceWisdomSpace({ language = 'zh', onSpeak }: AbundanceWisdomSpaceProps) {
  const [activeTab, setActiveTab] = useState<'gratitude' | 'surrender' | 'alchemy' | 'now'>('gratitude');
  
  // Gratitude Resonance states
  const [resonanceScore, setResonanceScore] = useState(108);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [gratitudeQuoteIndex, setGratitudeQuoteIndex] = useState(0);

  // Surrender states
  const [worryInput, setWorryInput] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [surrenderedState, setSurrenderedState] = useState(false);

  // Alchemy states
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [alchemyCompleted, setAlchemyCompleted] = useState<Record<string, boolean>>({});

  // Grounding states
  const [groundingStep, setGroundingStep] = useState(0);
  const [isGroundingActive, setIsGroundingActive] = useState(false);
  const [groundingTimer, setGroundingTimer] = useState(5);
  const groundingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio API pure bell synthesizer for authentic Tibetan bowl sound
  const playBellChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Tibetan singing bowl signature frequency harmonics:
      // Base around 168Hz or 210Hz (very centering, solfeggio-like)
      const baseFreq = 210;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      // Warm overtones for organic texture
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime); // Perfect fifth overtone
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1); // soft attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5); // long warm decay

      osc.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc2.start();

      osc.stop(ctx.currentTime + 5);
      osc2.stop(ctx.currentTime + 5);
    } catch (e) {
      console.warn("Audio Context chime not supported or blocked by user gesture yet:", e);
    }
  };

  const handleGratitudeChant = (e: React.MouseEvent<HTMLButtonElement>) => {
    playBellChime();
    setResonanceScore(prev => prev + 1);

    // Create a beautiful bubble where clicked or randomly inside button bounds
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left || 120;
    const y = e.clientY - rect.top || 40;

    const newBubble = { id: Date.now() + Math.random(), x, y };
    setBubbles(prev => [...prev, newBubble]);

    // Cleanup bubble
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
    }, 1500);

    // Rotate quote every 5 clicks
    if (Math.random() < 0.25) {
      setGratitudeQuoteIndex(prev => (prev + 1) % GRATITUDE_QUOTES.length);
    }
  };

  const handleSurrenderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worryInput.trim()) return;

    setIsDissolving(true);
    // Simulate text particles dissolving over 1.5 seconds
    setTimeout(() => {
      setIsDissolving(false);
      setSurrenderedState(true);
      setWorryInput('');
      playBellChime();
    }, 1800);
  };

  const handleResetSurrender = () => {
    setSurrenderedState(false);
  };

  const handleAlchemizeCard = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: true }));
    setAlchemyCompleted(prev => ({ ...prev, [id]: true }));
    playBellChime();
  };

  const startGrounding = () => {
    if (groundingIntervalRef.current) clearInterval(groundingIntervalRef.current);
    setIsGroundingActive(true);
    setGroundingStep(1);
    setGroundingTimer(5);

    groundingIntervalRef.current = setInterval(() => {
      setGroundingTimer(prev => {
        if (prev <= 1) {
          setGroundingStep(step => {
            if (step >= 3) {
              clearInterval(groundingIntervalRef.current!);
              setIsGroundingActive(false);
              playBellChime();
              return 0; // complete
            }
            return step + 1;
          });
          return 5; // Reset step timer
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isEn = language === 'en';

  return (
    <div
      className="p-6 md:p-8 rounded-[32px] bg-white/40 backdrop-blur-2xl border border-white/40 shadow-xl shadow-pink-100/10 relative overflow-hidden text-left"
      id="abundance-wisdom-space"
    >
      {/* Visual Header Decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-100/40 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-[#8e6d72]/15 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#8e6d72] font-bold block mb-1">
            {isEn ? 'Dr. Jan’s Abundance Wisdom Series' : '杨定一博士《丰盛》全部生命系列智慧专区'}
          </span>
          <h3 className="font-serif text-xl md:text-2xl text-[#8e6d72] font-semibold flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
            <span>{isEn ? 'The Abundance Sanctuary' : '丰盛意识觉醒空间'}</span>
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 bg-[#8e6d72]/5 p-1 rounded-full border border-[#8e6d72]/10 w-full md:w-auto">
          {[
            { id: 'gratitude', label: isEn ? 'Gratitude' : '感恩共振' },
            { id: 'surrender', label: isEn ? 'Surrender' : '全然臣服' },
            { id: 'alchemy', label: isEn ? 'Alchemy' : '唯识转念' },
            { id: 'now', label: isEn ? 'Here & Now' : '活在当下' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 flex-1 md:flex-none text-center ${
                activeTab === tab.id
                  ? 'bg-[#8e6d72] text-white shadow-sm'
                  : 'text-[#8e6d72]/70 hover:bg-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tab Body */}
      <div className="min-h-[280px]">
        
        {/* TAB 1: GRATITUDE RESONANCE ("谢谢"练习) */}
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

              {/* The big elegant chanting button with live floating bubbles */}
              <button
                onClick={handleGratitudeChant}
                className="relative py-6 px-10 rounded-full bg-gradient-to-r from-[#8e6d72] to-[#b49196] hover:from-[#7e5d62] hover:to-[#a48186] text-white font-serif font-bold text-lg tracking-widest shadow-xl shadow-pink-100/30 active:scale-95 transition-all duration-150 overflow-hidden shrink-0 group"
                id="chant-thank-you-btn"
              >
                {/* Bubble container inside button boundaries */}
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
            
            <p className="text-[10px] italic opacity-60 text-center">
              {isEn ? 'Tip: Click the button to emit an organic Tibetan bowl chime and chant along quietly.' : '提示：轻点按钮，将激发出真实的颂钵磬音声波，闭上双眼，在心中一同默念“谢谢你”。'}
            </p>
          </div>
        )}

        {/* TAB 2: TOTAL SURRENDER (全然臣服) */}
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
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#8e6d72] hover:bg-[#7e5d62] text-white text-xs font-bold font-sans transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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

                  {/* Abundance alignment card */}
                  <div className="p-4 rounded-xl bg-white/80 border border-white max-w-md mx-auto">
                    <blockquote className="font-serif italic text-sm text-[#8e6d72] leading-relaxed">
                      {isEn
                        ? '“Everything is the most perfect arrangement. I am sorry, please forgive me, thank you, I love you. Let go, and step back.”'
                        : '“这一切都是最完美的安排。对不起，请原谅我，谢谢你，我爱你。放手，退后，让丰盛生命为您做主。”'}
                    </blockquote>
                  </div>

                  <button
                    onClick={handleResetSurrender}
                    className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#8e6d72] hover:text-[#7e5d62] underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isEn ? 'Surrender Another Worry' : '再次写下抗拒，解脱心念'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 3: MINDSET ALCHEMY (唯识转念) */}
        {activeTab === 'alchemy' && (
          <div className="space-y-5 animate-fadeIn" id="tab-mindset-alchemy">
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 leading-relaxed text-xs text-[#6d5b5e]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 block mb-1">
                {isEn ? 'Alchemize Your Scarcity Beliefs' : '唯识转念炼金术 • Consciousness Transmutation'}
              </span>
              <p className="opacity-80">
                {isEn
                  ? 'Dr. Jan notes that scarcity is merely a filter of the anxious ego. Click "Alchemize" on any limiting card to flip it over and activate the expansive consciousness of Abundance.'
                  : '杨定一博士在《丰盛》中强调：匮乏只是小我编织的局限幻象。点击任一匮乏卡片背后的“启动转念”，以3D晶体翻转共鸣，注入生命的真实丰盛意识。'}
              </p>
            </div>

            {/* Mindset cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MINDSET_CARDS.map((card) => {
                const isFlipped = flippedCards[card.id];
                const isDone = alchemyCompleted[card.id];
                
                return (
                  <div
                    key={card.id}
                    className="relative min-h-[140px] perspective-1000 group cursor-pointer"
                    onClick={() => !isFlipped && handleAlchemizeCard(card.id)}
                  >
                    <motion.div
                      className="w-full h-full duration-500 preserve-3d"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      {/* FRONT CARD (Scarcity / 匮乏) */}
                      <div className="absolute inset-0 backface-hidden p-4 rounded-2xl bg-white/60 border border-[#8e6d72]/10 flex flex-col justify-between hover:border-[#8e6d72]/40 transition-colors shadow-sm">
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-[#b49196] block">
                            {isEn ? 'SCARCITY FILTER' : '❌ 匮乏念头 (Scarcity Belief)'}
                          </span>
                          <p className="text-xs text-[#6d5b5e] font-sans leading-relaxed">
                            {isEn ? card.scarcityEn : card.scarcityZh}
                          </p>
                        </div>
                        
                        <div className="flex justify-end">
                          <span className="inline-flex items-center gap-1.5 text-[9.5px] font-bold text-[#8e6d72] bg-[#8e6d72]/10 py-1 px-2.5 rounded-full hover:bg-[#8e6d72] hover:text-white transition-all">
                            <span>✨ {isEn ? 'Alchemize' : '启动转念'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>

                      {/* BACK CARD (Abundance / 丰盛) */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-[#fff8f0] border border-amber-200/60 flex flex-col justify-between shadow-inner">
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-amber-600 block">
                            {isEn ? 'ABUNDANCE REALITY' : '👑 丰盛实相 (Abundance Reality)'}
                          </span>
                          <p className="text-xs text-[#8e6d72] font-serif font-semibold leading-relaxed">
                            {isEn ? card.abundanceEn : card.abundanceZh}
                          </p>
                        </div>

                        <div className="text-[9.5px] italic text-[#b49196] border-t border-amber-100 pt-1.5">
                          {isEn ? card.quoteEn : card.quoteZh}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Overall progress indicator */}
            <div className="flex items-center justify-between text-[10px] font-bold text-[#8e6d72] bg-[#8e6d72]/5 px-3 py-2 rounded-xl">
              <span>{isEn ? 'TRANSITION COMPLETENESS' : '丰盛转念心智蜕变进度'}</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#8e6d72]/15">
                {Object.keys(alchemyCompleted).length} / {MINDSET_CARDS.length}
              </span>
            </div>
          </div>
        )}

        {/* TAB 4: HERE & NOW GROUNDING (活在当下) */}
        {activeTab === 'now' && (
          <div className="space-y-5 animate-fadeIn" id="tab-here-and-now">
            <div className="p-4 rounded-2xl bg-[#8e6d72]/5 border border-[#8e6d72]/10 leading-relaxed text-xs text-[#6d5b5e]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8e6d72] block mb-1">
                {isEn ? 'The Eternal Present Moment' : '瞬间回到当下 • Anchor in the "Here and Now"'}
              </span>
              <p className="opacity-80">
                {isEn
                  ? 'Abundance has no future or past. It is only accessible in the "Here and Now." Follow this rapid 3-step conscious grounding practice to dissolve anxious expectations.'
                  : '杨定一博士强调：丰盛从来不属于未来，也不属于过去。生命唯一的丰盛就在“这里，现在”。点击下方启动锚定，在15秒内快速沉淀心智。'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 border border-white/80 text-center space-y-6">
              {!isGroundingActive && groundingStep === 0 ? (
                <div className="py-4 space-y-4">
                  <span className="text-3xl block animate-bounce" style={{ animationDuration: '3s' }}>🧘</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-[#8e6d72]">
                      {isEn ? 'Start 15-Second Grounding Sequence' : '开启 15 秒当下意识锚定'}
                    </h4>
                    <p className="text-[10.5px] text-[#6d5b5e] max-w-sm mx-auto leading-relaxed">
                      {isEn
                        ? 'Follow three visual sensory alignments coupled with gentle breathing to instantly shift your state.'
                        : '跟随着精美视觉引导、温和声波，以及三次呼吸，瞬间将漂泊的小我心智锁死在此时此刻。'}
                    </p>
                  </div>

                  <button
                    onClick={startGrounding}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8e6d72] hover:bg-[#7e5d62] text-white text-xs font-bold font-sans transition-all shadow-md active:scale-95"
                    id="start-grounding-btn"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{isEn ? 'Begin Alignment' : '开始锚定对齐'}</span>
                  </button>
                </div>
              ) : (
                <div className="py-2 space-y-5">
                  {/* Step Indicators */}
                  <div className="flex justify-center items-center gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          groundingStep === step
                            ? 'w-10 bg-amber-500'
                            : groundingStep > step
                              ? 'w-3 bg-[#8e6d72]'
                              : 'w-3 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Breathing & Visual instruction container */}
                  <div className="min-h-[100px] flex flex-col justify-center items-center px-4">
                    <AnimatePresence mode="wait">
                      {groundingStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-2"
                        >
                          <span className="text-xs uppercase tracking-widest text-[#8e6d72] font-bold block">
                            {isEn ? 'STEP 1: SIGHT' : '第 1 步：眼睛观照 (Sight)'}
                          </span>
                          <blockquote className="font-serif italic text-sm text-[#8e6d72] font-semibold leading-relaxed">
                            {isEn
                              ? '“Open your eyes gently. Observe 3 colors in your screen or room representing the sheer abundance of life.”'
                              : '“温柔睁眼。环顾或凝视屏幕，观察周围3种闪烁着微光、代表着生命繁茂丰厚色彩的物体。”'}
                          </blockquote>
                        </motion.div>
                      )}

                      {groundingStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-2"
                        >
                          <span className="text-xs uppercase tracking-widest text-amber-600 font-bold block">
                            {isEn ? 'STEP 2: TOUCH' : '第 2 步：触觉感应 (Touch)'}
                          </span>
                          <blockquote className="font-serif italic text-sm text-[#8e6d72] font-semibold leading-relaxed">
                            {isEn
                              ? '“Close your eyes. Feel the temperature of the air touching your skin—the universe’s unconditional support.”'
                              : '“轻轻闭眼。感受拂过皮肤的微风或空气的温度——那是宇宙对你无条件的包容与支撑。”'}
                          </blockquote>
                        </motion.div>
                      )}

                      {groundingStep === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-2"
                        >
                          <span className="text-xs uppercase tracking-widest text-purple-600 font-bold block">
                            {isEn ? 'STEP 3: EMBODIMENT' : '第 3 步：安住“我-是” (Embodiment)'}
                          </span>
                          <blockquote className="font-serif italic text-sm text-[#8e6d72] font-semibold leading-relaxed">
                            {isEn
                              ? '“Listen to the background silence. Rest in the pure state of ‘I-AM’. You already possess everything.”'
                              : '“倾听喧嚣背后的静默。深深呼气，安住在最纯粹的‘我-是’空间里。此时此地，你早已圆满。”'}
                          </blockquote>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Giant circular breathing countdown */}
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-gray-100 fill-none"
                        strokeWidth="3"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-amber-500 fill-none transition-all duration-1000"
                        strokeWidth="3.5"
                        strokeDasharray={175.92}
                        strokeDashoffset={175.92 - (175.92 * groundingTimer) / 5}
                      />
                    </svg>
                    <span className="text-base font-bold font-mono text-[#8e6d72]">
                      {groundingTimer}s
                    </span>
                  </div>

                  <p className="text-[10px] text-[#b49196] font-medium italic">
                    {isEn ? 'Breath naturally and deeply...' : '自然、深沉、悠长地呼吸...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
