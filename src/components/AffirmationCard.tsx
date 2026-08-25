import { useState, useMemo } from 'react';
import { ABUNDANCE_BOOK_QUOTES, AbundanceQuote } from '../data/abundanceQuotes';
import {
  Sparkles,
  Volume2,
  RefreshCw,
  VolumeX,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Copy,
  Check,
  Search,
  X,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AffirmationCardProps {
  onSpeak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  language?: 'zh' | 'en';
}

export default function AffirmationCard({
  onSpeak,
  isSpeaking,
  onStopSpeaking,
  language = 'zh',
}: AffirmationCardProps) {
  const isEn = language === 'en';

  // Deterministic daily quote index based on day of year
  const defaultDailyIndex = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % ABUNDANCE_BOOK_QUOTES.length;
  }, []);

  const [currentIndex, setCurrentIndex] = useState(defaultDailyIndex);
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [speakProgress, setSpeakProgress] = useState(false);

  // Available themes for filtering
  const themes = useMemo(() => {
    const set = new Set<string>();
    ABUNDANCE_BOOK_QUOTES.forEach((q) => set.add(isEn ? q.themeEn : q.themeZh));
    return ['all', ...Array.from(set)];
  }, [isEn]);

  // Filtered quotes based on selected theme
  const filteredQuotes = useMemo(() => {
    if (selectedTheme === 'all') return ABUNDANCE_BOOK_QUOTES;
    return ABUNDANCE_BOOK_QUOTES.filter((q) =>
      isEn ? q.themeEn === selectedTheme : q.themeZh === selectedTheme
    );
  }, [selectedTheme, isEn]);

  // Ensure currentIndex stays within bounds if filtered
  const currentQuote: AbundanceQuote = ABUNDANCE_BOOK_QUOTES[currentIndex] || ABUNDANCE_BOOK_QUOTES[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ABUNDANCE_BOOK_QUOTES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ABUNDANCE_BOOK_QUOTES.length) % ABUNDANCE_BOOK_QUOTES.length);
  };

  const handleRandom = () => {
    let next = currentIndex;
    while (next === currentIndex && ABUNDANCE_BOOK_QUOTES.length > 1) {
      next = Math.floor(Math.random() * ABUNDANCE_BOOK_QUOTES.length);
    }
    setCurrentIndex(next);
  };

  const handleSpeakToggle = async () => {
    if (isSpeaking || speakProgress) {
      onStopSpeaking();
      return;
    }

    setSpeakProgress(true);
    try {
      const textToSpeak = isEn ? currentQuote.translation : currentQuote.text;
      await onSpeak(textToSpeak);
    } catch (err) {
      console.error('TTS play error:', err);
    } finally {
      setSpeakProgress(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = isEn
      ? `"${currentQuote.translation}" — Dr. Yang Ding-I, 《Abundance》`
      : `“${currentQuote.text}” —— 杨定一博士《丰盛》`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
  };

  // Search filtered quotes in the Library Modal
  const modalFilteredQuotes = useMemo(() => {
    return ABUNDANCE_BOOK_QUOTES.filter((q) => {
      const matchesSearch =
        q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.translation && q.translation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (q.themeZh && q.themeZh.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (q.bookChapter && q.bookChapter.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [searchQuery]);

  return (
    <>
      <div
        className="p-6 md:p-8 rounded-[32px] bg-white/40 backdrop-blur-2xl border border-white/40 shadow-xl shadow-pink-100/10 relative overflow-hidden flex flex-col justify-between"
        id="daily-affirmation-card"
      >
        {/* Decorative Ambient Radiance */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-radial from-[#ffe4e9]/50 via-transparent to-transparent -mr-12 -mt-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-radial from-[#fcf0e2]/60 via-transparent to-transparent -ml-12 -mb-12 pointer-events-none" />

        {/* Header with Title and Tools */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#8e6d72] animate-spin" style={{ animationDuration: '8s' }} />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8e6d72] font-bold block">
                  {isEn ? 'Daily Affirmation from 《Abundance》' : '每日正向暗示 • 《丰盛》精选'}
                </span>
                <span className="text-[9px] text-[#b49196] font-medium">
                  {isEn
                    ? `Quote ${currentIndex + 1} of ${ABUNDANCE_BOOK_QUOTES.length}`
                    : `第 ${currentIndex + 1} / ${ABUNDANCE_BOOK_QUOTES.length} 句 • 杨定一博士原书`}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/60 hover:bg-white border border-[#8e6d72]/15 text-[#8e6d72] text-[10px] font-bold transition-all shadow-2xs hover:scale-105 cursor-pointer"
                title={isEn ? 'Browse all 55+ quotes' : '浏览全部 55 句原书金句'}
                id="open-abundance-library-btn"
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">{isEn ? '55 Quotes Library' : '典藏书库 (55句)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-full hover:bg-white/60 text-[#8e6d72] transition-colors cursor-pointer"
                title={isEn ? 'Copy quote text' : '复制金句'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleRandom}
                className="p-1.5 rounded-full hover:bg-white/60 text-[#8e6d72] transition-colors cursor-pointer"
                title={isEn ? 'Random Affirmation' : '随机换一句'}
                id="rotate-affirmation-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Theme Tag & Book Chapter */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#8e6d72]/10 text-[#8e6d72] text-[9.5px] font-bold tracking-wide border border-[#8e6d72]/15">
              {isEn ? currentQuote.themeEn : currentQuote.themeZh}
            </span>
            {currentQuote.bookChapter && (
              <span className="text-[9.5px] text-[#b49196] italic">
                {isEn ? `Chapter: ${currentQuote.bookChapter}` : `篇章：${currentQuote.bookChapter}`}
              </span>
            )}
          </div>
        </div>

        {/* Main Quote Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="my-3 flex flex-col justify-center text-center px-1 md:px-3"
          >
            <blockquote className="font-serif italic text-base md:text-lg text-[#8e6d72] leading-relaxed tracking-wide font-medium">
              “ {isEn ? currentQuote.translation : currentQuote.text} ”
            </blockquote>

            {/* Translation & Insight */}
            <p className="text-[11px] text-[#b49196] font-medium mt-3 font-sans tracking-wide leading-relaxed">
              {isEn ? currentQuote.text : currentQuote.translation}
            </p>

            {/* Spiritual Insight Note */}
            {(currentQuote.insight || currentQuote.insightEn) && (
              <div className="mt-3.5 px-3 py-2 rounded-xl bg-white/40 border border-white/50 text-[10px] text-[#6d5b5e] italic leading-normal">
                <span className="text-[#8e6d72] font-semibold not-italic">
                  {isEn ? '💡 Wisdom Touch: ' : '💡 觉醒指引：'}
                </span>
                {isEn ? currentQuote.insightEn : currentQuote.insight}
              </div>
            )}

            {/* Source Attribution */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="h-px w-5 bg-[#8e6d72]/20" />
              <span className="text-[9.5px] font-bold text-[#8e6d72]/80 tracking-widest font-serif">
                {isEn ? `Dr. Yang Ding-I • ${currentQuote.source}` : `杨定一博士 • ${currentQuote.source}`}
              </span>
              <span className="h-px w-5 bg-[#8e6d72]/20" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Switcher & Audio Read-Aloud */}
        <div className="mt-4 pt-4 border-t border-white/40 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-full hover:bg-white/60 text-[#8e6d72] transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title={isEn ? 'Previous Quote' : '上一句'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-[#b49196] font-mono font-bold px-1">
              {currentIndex + 1} / {ABUNDANCE_BOOK_QUOTES.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-full hover:bg-white/60 text-[#8e6d72] transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title={isEn ? 'Next Quote' : '下一句'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Audio TTS Speech Button */}
          <button
            onClick={handleSpeakToggle}
            disabled={speakProgress}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isSpeaking
                ? 'bg-[#8e6d72] text-white hover:bg-[#8e6d72]/95 animate-pulse'
                : 'bg-white/70 text-[#8e6d72] hover:bg-white border border-[#8e6d72]/20 hover:scale-105'
            }`}
            id="affirmation-speech-btn"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 animate-bounce" />
                <span>{isEn ? 'Stop' : '停止朗读'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{speakProgress ? (isEn ? 'Connecting wave...' : '感应声波中...') : (isEn ? 'Listen' : '深沉女声朗读')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Full 55+ Quotes Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white/95 backdrop-blur-2xl rounded-[32px] p-6 md:p-8 shadow-2xl border border-white/80 overflow-hidden flex flex-col text-[#4a3a3a]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#8e6d72]/15">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#8e6d72]/10 flex items-center justify-center text-[#8e6d72]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#8e6d72]">
                    {isEn ? '《Abundance》 55 Golden Quotes Library' : '《丰盛》全书 55 句原书金句典藏'}
                  </h3>
                  <p className="text-[10px] text-[#b49196]">
                    {isEn
                      ? 'Select any quote to apply directly to your daily affirmation card'
                      : '杨定一博士经典灵性巨著 • 点击任意金句可直接切换至卡片与朗读'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 text-gray-400 hover:text-[#8e6d72] hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="my-4 relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#b49196]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search keywords, chapters, or themes...' : '搜索金句内容、篇章或主题（如：感恩、放手、配得感）...'}
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#8e6d72]/20 bg-white/80 focus:ring-2 focus:ring-[#8e6d72]/30 focus:outline-none"
              />
            </div>

            {/* Scrollable Quotes List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {modalFilteredQuotes.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#b49196]">
                  {isEn ? 'No quotes matching your search.' : '未找到匹配的金句'}
                </div>
              ) : (
                modalFilteredQuotes.map((quote, idx) => {
                  const originalIndex = ABUNDANCE_BOOK_QUOTES.findIndex((q) => q.id === quote.id);
                  const isSelected = originalIndex === currentIndex;

                  return (
                    <div
                      key={quote.id}
                      onClick={() => {
                        setCurrentIndex(originalIndex);
                        setIsLibraryOpen(false);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#8e6d72]/10 border-[#8e6d72] shadow-sm ring-1 ring-[#8e6d72]/30'
                          : 'bg-white/60 hover:bg-white border-white/60 hover:border-[#8e6d72]/30 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-bold text-[#8e6d72] px-2 py-0.5 rounded-full bg-white/70 border border-[#8e6d72]/10">
                            #{originalIndex + 1} {isEn ? quote.themeEn : quote.themeZh}
                          </span>
                          {quote.bookChapter && (
                            <span className="text-[9px] text-[#b49196] italic">
                              {quote.bookChapter}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <span className="text-[9.5px] font-bold text-[#8e6d72] flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {isEn ? 'Active' : '当前卡片展示中'}
                          </span>
                        )}
                      </div>

                      <blockquote className="font-serif text-xs md:text-sm text-[#4a3a3a] leading-relaxed mb-1">
                        “ {quote.text} ”
                      </blockquote>
                      {quote.translation && (
                        <p className="text-[10.5px] text-[#b49196] font-sans italic">
                          {quote.translation}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#8e6d72]/15 flex items-center justify-between text-xs text-[#b49196]">
              <span>
                {isEn
                  ? `Showing ${modalFilteredQuotes.length} of ${ABUNDANCE_BOOK_QUOTES.length} quotes`
                  : `共收录 ${ABUNDANCE_BOOK_QUOTES.length} 句《丰盛》原书经典金句`}
              </span>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="px-4 py-1.5 rounded-full bg-[#8e6d72] text-white text-xs font-semibold hover:bg-[#8e6d72]/90 cursor-pointer"
              >
                {isEn ? 'Close' : '关闭'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
