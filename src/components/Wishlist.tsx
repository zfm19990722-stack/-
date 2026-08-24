import { useState, FormEvent } from 'react';
import { Wish } from '../types';
import { Sparkles, Heart, DollarSign, Sparkle, Briefcase, Sofa, Plus, Trash2, Eye, EyeOff, Edit3, Save, X, ChevronDown, ChevronUp, Trash, Wand2 } from 'lucide-react';

interface WishlistProps {
  wishes: Wish[];
  onAddWish: (wish: Omit<Wish, 'id' | 'createdAt' | 'isManifested'>) => void;
  onDeleteWish: (id: string) => void;
  onGenerateDetails: (id: string, mode?: 'overwrite' | 'append', refinePrompt?: string) => Promise<void>;
  onStartSession: (wish: Wish) => void;
  isGeneratingMap: Record<string, boolean>;
  onUpdateWish: (id: string, updatedFields: Partial<Wish>) => void;
  language?: 'zh' | 'en';
}

export default function Wishlist({
  wishes,
  onAddWish,
  onDeleteWish,
  onGenerateDetails,
  onStartSession,
  isGeneratingMap,
  onUpdateWish,
  language = 'zh',
}: WishlistProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState<Record<string, 'zh' | 'en'>>({});
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'love' | 'wealth' | 'beauty' | 'career' | 'lifestyle'>('love');
  const [details, setDetails] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandError, setExpandError] = useState<string | null>(null);
  const [expandedDetailsMap, setExpandedDetailsMap] = useState<Record<string, boolean>>({});
  const [expandedVisualDetailsMap, setExpandedVisualDetailsMap] = useState<Record<string, boolean>>({});

  // Refinement, direct editing and stacking states
  const [refineInputs, setRefineInputs] = useState<Record<string, string>>({});
  const [isEditingAll, setIsEditingAll] = useState<Record<string, boolean>>({});
  const [editingText, setEditingText] = useState<Record<string, string>>({});
  const [editingTextEn, setEditingTextEn] = useState<Record<string, string>>({});
  const [isRefinementOpen, setIsRefinementOpen] = useState<Record<string, boolean>>({});

  // Splits text by double newlines and deletes the selected paragraph segment
  const handleDeleteSegment = (wishId: string, indexToDelete: number, lang: 'zh' | 'en') => {
    const targetWish = wishes.find(w => w.id === wishId);
    if (!targetWish) return;

    if (lang === 'zh') {
      const currentText = targetWish.visualizationDetails || '';
      const paragraphs = currentText.split('\n\n').filter(p => p.trim() !== '');
      const updatedParagraphs = paragraphs.filter((_, idx) => idx !== indexToDelete);
      onUpdateWish(wishId, { visualizationDetails: updatedParagraphs.join('\n\n') });
    } else {
      const currentText = targetWish.visualizationDetailsEn || '';
      const paragraphs = currentText.split('\n\n').filter(p => p.trim() !== '');
      const updatedParagraphs = paragraphs.filter((_, idx) => idx !== indexToDelete);
      onUpdateWish(wishId, { visualizationDetailsEn: updatedParagraphs.join('\n\n') });
    }
  };

  const handleStartEditAll = (wishId: string) => {
    const targetWish = wishes.find(w => w.id === wishId);
    if (!targetWish) return;
    setIsEditingAll(prev => ({ ...prev, [wishId]: true }));
    setEditingText(prev => ({ ...prev, [wishId]: targetWish.visualizationDetails || '' }));
    setEditingTextEn(prev => ({ ...prev, [wishId]: targetWish.visualizationDetailsEn || '' }));
  };

  const handleSaveEditAll = (wishId: string) => {
    onUpdateWish(wishId, {
      visualizationDetails: editingText[wishId] || '',
      visualizationDetailsEn: editingTextEn[wishId] || '',
    });
    setIsEditingAll(prev => ({ ...prev, [wishId]: false }));
  };

  const handleCancelEditAll = (wishId: string) => {
    setIsEditingAll(prev => ({ ...prev, [wishId]: false }));
  };

  const categoryIcons = {
    love: <Heart className="w-3.5 h-3.5 text-[#8e6d72]" />,
    wealth: <DollarSign className="w-3.5 h-3.5 text-amber-600" />,
    beauty: <Sparkle className="w-3.5 h-3.5 text-pink-500" />,
    career: <Briefcase className="w-3.5 h-3.5 text-purple-600" />,
    lifestyle: <Sofa className="w-3.5 h-3.5 text-emerald-600" />,
  };

  const categoryLabels = {
    love: language === 'en' ? 'Love & Harmony' : '浪漫情缘',
    wealth: language === 'en' ? 'Abundance & Wealth' : '丰盛财富',
    beauty: language === 'en' ? 'Beauty & Glow' : '健康焕颜',
    career: language === 'en' ? 'Graceful Career' : '优雅事业',
    lifestyle: language === 'en' ? 'Royal Lifestyle' : '理想生活',
  };

  // High-vibration preset templates for structural guidance
  const MANIFESTATION_TEMPLATES = language === 'en' ? {
    love: [
      { title: "Soulmate Connection", text: "【My Ultimate Manifestation State】\nAttract and nurture a soulmate relationship filled with deep understanding, tenderness, and loyalty.\n\n【Immersive Sensory Imagery】\nWe sit in a living room bathed in golden sunlight, holding warm cups of Darjeeling tea, with a subtle scent of white lilies in the air, smiling at each other.\n\n【My Affirmation of Deservedness】\nI naturally deserve the truest, most unconditional and sacred love in this life." },
      { title: "Elegant Harmony", text: "【My Ultimate Manifestation State】\nMaintain an open, romantic connection where every thought is met with care and appreciation.\n\n【Immersive Sensory Imagery】\nWaking up to a beautiful bouquet of white roses and a delicate breakfast, feeling absolute peace, pampered joy, and deep trust.\n\n【My Affirmation of Deservedness】\nI am a precious soul worthy of the world's finest care. I radiate noble, attracting magnetism." }
    ],
    wealth: [
      { title: "Flowing Abundance", text: "【My Ultimate Manifestation State】\nMoney and infinite abundance flow easily and unimpeded into my life.\n\n【Immersive Sensory Imagery】\nResting on a soft velvet chaise lounge, watching account balances steadily grow, feeling complete relaxation and financial freedom.\n\n://My Affirmation of Deservedness】\nWealth flows to me in the most effortless and honorable ways. I am always in harmony with the cosmos." },
      { title: "Lakeside Villa", text: "【My Ultimate Manifestation State】\nOwn a refined, tranquil garden estate overlooking a serene lake.\n\n【Immersive Sensory Imagery】\nWalking barefoot on warm plush rugs, watching sunlight scatter rainbows through a crystal chandelier, listening to soft piano notes.\n\n【My Affirmation of Deservedness】\nI fully deserve to live a life of comfort, elegance, and pristine leisure." }
    ],
    beauty: [
      { title: "Radiant Health", text: "【My Ultimate Manifestation State】\nRadiate flawless health, glowing skin, bright eyes, and a light, energized body.\n\n【Immersive Sensory Imagery】\nStanding before a carved baroque mirror, seeing a rosy, clear, collagen-rich reflection that glows with vibrant energy.\n\n【My Affirmation of Deservedness】\nMy body naturally renews its sacred beauty and vitality every day. I am a masterpiece." },
      { title: "Graceful Poise", text: "【My Ultimate Manifestation State】\nEmbody effortless posture and an elegant aura that inspires confidence.\n\n【Immersive Sensory Imagery】\nWearing a cream silk dress, walking confidently under soft warm lights, skin looking radiant, moving with timeless grace.\n\n【My Affirmation of Deservedness】\nI hold the deepest reverence for my own life. My beauty and confidence are natural birthrights." }
    ],
    career: [
      { title: "Joyful Success", text: "【My Ultimate Manifestation State】\nCreate amazing impact in my chosen field, completely free of anxiety or burnout.\n\n【Immersive Sensory Imagery】\nSitting at a clean, solid wood desk, reviewing inspired collaboration proposals, feeling deeply respected and supported.\n\n【My Affirmation of Deservedness】\nI achieve remarkable things in the most comfortable, self-assured way. My career nourishes my soul." },
      { title: "Aesthetic Brand", text: "【My Ultimate Manifestation State】\nSuccessfully run a premium aesthetic brand that brings artistic value and absolute financial freedom.\n\n【Immersive Sensory Imagery】\nInside a beautifully scented private gallery, welcoming guests who deeply admire our work, turning pure ideas into reality.\n\n【My Affirmation of Deservedness】\nI am a channel for infinite creative power. The universe supports all my dreams and decisions." }
    ],
    lifestyle: [
      { title: "Chateau Tea Party", text: "【My Ultimate Manifestation State】\nLive a peaceful, luxurious life filled with quiet afternoons and beautiful tea gatherings.\n\n【Immersive Sensory Imagery】\nA breeze sweeps in from a crystal-blue lake outside the castle balcony. Pouring fine tea from a silver pot, enjoying flowers in bloom.\n\n【My Affirmation of Deservedness】\nI don't need to struggle or rush. My life is naturally built on ease, dignity, and gentle beauty." },
      { title: "Nourished by Nature", text: "【My Ultimate Manifestation State】\nLive a life fully cherished and nurtured by nature and the cosmos.\n\n【Immersive Sensory Imagery】\nLooking up at a starry sky from an outdoor bath, breathing the scent of wild lilies and orange blossoms, feeling pure water on skin.\n\n【My Affirmation of Deservedness】\nThe universe is always arranging things perfectly for me. I welcome the magic of life." }
    ]
  } : {
    love: [
      { title: "灵魂契合相拥", text: "【我期望显化的终极状态】\n吸引并拥有一位灵魂契合、极尽温柔专一的伴侣。\n\n【令我身临其境的感官画面】\n我们坐在洒满金色阳光的起居室，手捧暖热的红茶，空气里浮动着淡淡的栀子花香，彼此温暖对视。\n\n【我的高配得感誓言】\n我天生配得享有这世间最真挚、无条件且神圣的宠溺与爱护。" },
      { title: "浪漫包容关系", text: "【我期望显化的终极状态】\n拥有一段充满包容与浪漫的宿命情缘，事事有回应。\n\n【令我身临其境的感官画面】\n清晨醒来收到精美的白色玫瑰花束与贴心早餐，内心充满全然的宁静、被偏爱的喜悦与信任。\n\n【我的高配得感誓言】\n我是值得被全世界温柔对待的纯真公主，我散发着高贵、温润的吸引磁场。" }
    ],
    wealth: [
      { title: "财富轻松流淌", text: "【我期望显化的终极状态】\n金钱与无限丰盛源源不断、无阻碍地流向我的生命。\n\n【令我身临其境的感官画面】\n半躺在柔软的天鹅绒榻椅上，看着专属信件与理财账户数字每天稳步增长，身心安适舒展。\n\n【我的高配得感誓言】\n金钱以最轻松、最尊贵的方式流向我，我和宇宙财富丰足磁场时刻完美同频。" },
      { title: "考究庄园洋房", text: "【我期望显化的终极状态】\n拥有一栋开满鲜花、考究惬意的专属花园大宅。\n\n【令我身临其境的感官画面】\n赤脚踏在温软的羊绒地毯上，看阳光洒在剔透水晶吊灯上折射出虹光，耳畔飘来轻柔钢琴声。\n\n【我的高配得感誓言】\n我全然配得享有奢华、安闲与至高无上的舒适享受。" }
    ],
    beauty: [
      { title: "神圣无瑕焕颜", text: "【我期望显化的终极状态】\n由内而外散发健康极致的亮白容颜、透亮双眸与轻盈体态。\n\n【令我身临其境的感官画面】\n立在巴洛克雕花等身镜前，看到镜中红润、无瑕、充满胶原蛋白的精致面容，神采奕奕。\n\n【我的高配得感誓言】\n我的身体每天都在自然焕发极致的青春与圣洁美感，我是不可替代的杰作。" },
      { title: "高贵公主体态", text: "【我期望显化的终极状态】\n拥有优雅挺拔的体态与绝妙温润的公主气场。\n\n【令我身临其境的感官画面】\n身穿奶油色丝缎长裙，在柔和的聚光灯下自信前行，皮肤自带细腻柔光，举手投足尽皆瞩目。\n\n【我的高配得感誓言】\n我充满对自我生命的最高崇敬，我的美丽与自信与生俱来，永不磨灭。" }
    ],
    career: [
      { title: "智慧无压事业", text: "【我期望显化的终极状态】\n在热爱的领域创造奇迹，没有半分焦虑与内耗。\n\n【令我身临其境的感官画面】\n优雅地坐在一尘不染的实木办公桌前，批阅富有远见的合作案，受到万众发自内心的尊重。\n\n【我的高配得感誓言】\n我以最舒适、最自信的方式取得骄人成就，工作是滋养我高贵灵魂的圣殿。" },
      { title: "高尚自主品牌", text: "【我期望显化的终极状态】\n轻松建立并运营属于自己的高端美学品牌，财务极致自由。\n\n【令我身临其境的感官画面】\n在充满艺术品香氛的私人展厅内，收获贵宾们由衷的赞叹，将每一个灵感化作闪耀的现实。\n\n【我的高配得感誓言】\n我是无穷创造力的源泉，宇宙完美承载着我的一切梦想与卓越决策。" }
    ],
    lifestyle: [
      { title: "城堡法式茶会", text: "【我期望显化的终极状态】\n过着没有任何世俗喧嚣、闲散尊贵的法式悠长下午茶人生。\n\n【令我身临其境的感官画面】\n古堡阳台外是如蓝宝石透亮的湖泊。微风拂过，手执银茶具，品尝极品大吉岭茶，花香四溢。\n\n【我的高配得感誓言】\n我不必辛勤追赶，我的生活生来便由闲适、尊贵与一切美好温柔筑起。" },
      { title: "宇宙极宠滋养", text: "【我期望显化的终极状态】\n被大自然与宇宙星辰全力宠溺、无条件包容的一生。\n\n【令我身临其境的感官画面】\n在露天温泉中仰望闪耀星空，呼吸间尽是野百合与初绽橙花的芬芳，享受纯粹的水波触感。\n\n【我的高配得感誓言】\n宇宙时时刻刻在温柔为我妥帖安排，我安享每一刻生命的奇迹，万物在爱我。" }
    ]
  };

  const applyTemplate = (tpl: { title: string, text: string }) => {
    setTitle(tpl.title);
    setDetails(tpl.text);
  };

  const insertFramework = () => {
    if (language === 'en') {
      setDetails(
        "【My Ultimate Manifestation State】\n" +
        "（e.g., Attracting a soulmate who truly loves me/轻松收获十万财富...）\n\n" +
        "【Immersive Sensory Imagery】\n" +
        "（Please describe visual, sound, smell, and touch details: e.g. morning sun, aroma of black tea, soft breeze...）\n\n" +
        "【My Affirmation of Deservedness】\n" +
        "（e.g., I am fully worthy of the world's most beautiful and overflowing love and luxury!）"
      );
    } else {
      setDetails(
        "【我期望显化的终极状态】\n" +
        "（举例：吸引到灵魂深处极度偏爱、无条件懂我的伴侣/轻松收获十万财富...）\n\n" +
        "【令我身临其境的感官画面】\n" +
        "（请描述视觉、声场、香气和触感细节：如晨光、大吉岭红茶的清香、温柔风铃...）\n\n" +
        "【我的高配得感宣言】\n" +
        "（举例：我完全配享有世间最温柔、尊贵、无限丰盛的宠爱与至美！）"
      );
    }
  };

  const handleExpandDetails = async () => {
    if (!details.trim()) {
      setExpandError(language === 'en' 
        ? "Please write some wish inspirations or keywords below first (e.g. drinking coffee by the beach, good mood every day)" 
        : "请先在下方输入框中写下您的一些心愿灵感/提示词（例如：在海边喝咖啡，每天都有好心情）");
      setTimeout(() => setExpandError(null), 4000);
      return;
    }

    setIsExpanding(true);
    setExpandError(null);
    try {
      const response = await fetch('/api/wish/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: details,
          category,
          language, // Pass language to API so it returns English if requested!
        }),
      });

      if (!response.ok) {
        throw new Error(language === 'en' ? 'AI expansion failed, please try again' : '智能描绘失败，请稍后重试');
      }

      const data = await response.json();
      if (data.expandedText) {
        setDetails(data.expandedText);
      }
    } catch (err: any) {
      console.error(err);
      setExpandError(err.message || (language === 'en' ? 'AI expansion failed' : '扩写失败，请稍后重试'));
      setTimeout(() => setExpandError(null), 4000);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddWish({
      title,
      category,
      details,
    });

    setTitle('');
    setDetails('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white/40 backdrop-blur-2xl rounded-[32px] p-6 md:p-8 border border-white/40 shadow-xl shadow-pink-100/10 space-y-6" id="manifestation-wishlist-module">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[#8e6d72] flex items-center gap-2">
            <span>Wishlist Palace</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-[#b49196] font-semibold">
            {language === 'en' ? 'My Royal Manifestation Board' : 'My Royal Manifestation Board • 梦幻愿望清单'}
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#8e6d72] hover:bg-[#8e6d72]/90 text-white font-sans text-xs font-bold shadow-lg shadow-pink-900/10 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          id="toggle-add-wish-btn"
        >
          <Plus className="w-4 h-4" />
          {language === 'en' ? 'New Wish' : '写下新愿望'}
        </button>
      </div>

      {/* Add Wish Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-[24px] bg-white/60 border border-white/60 shadow-sm space-y-4 animate-fadeIn"
          id="add-wish-form"
        >
          <div className="p-3 bg-[#8e6d72]/5 rounded-2xl border border-[#8e6d72]/10 text-[11px] text-[#6d5b5e] leading-relaxed">
            {language === 'en' ? (
              <>
                <span className="font-bold text-[#8e6d72]">✨ Guide</span>: Manifestation is not "wanting", but "having in advance". Pick a high-vibe template below, or click <strong>"✨ Import 3D Framework"</strong> to activate your subconscious!
              </>
            ) : (
              <>
                <span className="font-bold text-[#8e6d72]">✨ 显化指南</span>：显化并不是“期待”，而是“提前体验拥有”。在下方挑选一个高频模板，或者点击 <strong>“✨ 导入显化框架”</strong>，用具体的感官、温度、气息去唤醒潜意识吧！
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8e6d72] block">
                {language === 'en' ? '🌸 Wish Theme' : '🌸 愿望主题'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'en' ? 'e.g., Attract a soulmate companion' : '例如：收获灵魂契合的浪漫伴侣'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/40 bg-white/50 text-[#4a3a3a] placeholder-[#b49196]/60 focus:ring-2 focus:ring-[#8e6d72]/30 focus:outline-none transition-all"
                id="wish-title-input"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8e6d72] block">
                {language === 'en' ? '🎀 Wish Category' : '🎀 愿望分类'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/40 bg-white/50 text-[#4a3a3a] focus:ring-2 focus:ring-[#8e6d72]/30 focus:outline-none appearance-none transition-all"
                id="wish-category-select"
              >
                <option value="love">{language === 'en' ? 'Love & Harmony' : '浪漫情缘 (Love & Harmony)'}</option>
                <option value="wealth">{language === 'en' ? 'Abundance & Wealth' : '丰盛财富 (Abundance & Wealth)'}</option>
                <option value="beauty">{language === 'en' ? 'Beauty & Glow' : '健康焕颜 (Beauty & Glow)'}</option>
                <option value="career">{language === 'en' ? 'Graceful Career' : '优雅事业 (Graceful Career)'}</option>
                <option value="lifestyle">{language === 'en' ? 'Royal Lifestyle' : '理想生活 (Royal Lifestyle)'}</option>
              </select>
            </div>
          </div>

          {/* Quick High Vibration Seed Templates based on active Category */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#b49196] uppercase tracking-wider block">
              {language === 'en' ? '👑 High-Vibration Templates (Click to apply)' : '👑 推荐的高频显化范本 (点击一键填入并微调)'}
            </span>
            <div className="flex flex-wrap gap-2">
              {MANIFESTATION_TEMPLATES[category].map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-3.5 py-1.5 rounded-xl text-xs bg-white/45 hover:bg-[#8e6d72]/10 border border-[#8e6d72]/20 text-[#8e6d72] transition-all hover:scale-[1.02] flex items-center gap-1.5 font-medium shadow-sm active:scale-95"
                >
                  <span>✨</span>
                  <span>{tpl.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Raw Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#8e6d72] block">
                {language === 'en' ? '🕊️ Describe Your Wish' : '🕊️ 你的心愿描绘（写得越真切，显化越快哦）'}
              </label>
              <button
                type="button"
                onClick={insertFramework}
                className="text-[10px] font-bold text-[#8e6d72] hover:text-[#8e6d72]/80 flex items-center gap-1 bg-[#8e6d72]/5 px-2.5 py-1 rounded-lg border border-[#8e6d72]/10 transition-all hover:scale-105 active:scale-95"
              >
                <span>🖋️</span>
                <span>{language === 'en' ? '✨ Import 3D Framework' : '✨ 导入三维显化框架'}</span>
              </button>
            </div>
            <textarea
              placeholder={language === 'en' ? "Please describe the fine canvas of your heart. It is recommended to include the ultimate state and sensory details..." : "请描述您内心深处的精细画卷。建议包含期望达到的终极状态，以及画面感（如闻到红茶清香、温暖清风、心中的无限笃定与配得感等）..."}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={6}
              className="w-full text-xs p-3.5 rounded-xl border border-white/40 bg-white/50 text-[#4a3a3a] placeholder-[#b49196]/60 focus:ring-2 focus:ring-[#8e6d72]/30 focus:outline-none resize-none transition-all font-sans"
              id="wish-details-textarea"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1 px-1">
              <button
                type="button"
                onClick={handleExpandDetails}
                disabled={isExpanding}
                className="text-[10px] font-bold text-[#8e6d72] hover:text-white bg-[#8e6d72]/10 hover:bg-[#8e6d72] disabled:bg-[#8e6d72]/20 disabled:text-[#8e6d72]/50 px-3.5 py-1.5 rounded-xl border border-[#8e6d72]/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>🔮</span>
                <span>{isExpanding ? (language === 'en' ? 'AI drawing sensory details...' : '正在根据提示词深度描绘细节...') : (language === 'en' ? '🔮 AI Sensory Detailing: Expand description with AI' : '🔮 一键智能描绘：根据我的提示词扩写细节')}</span>
              </button>
              <span className="text-[9px] text-[#b49196] italic text-right">
                {language === 'en' ? 'Enter a simple prompt first, then click expand' : '输入简单提示词（如：在海边喝咖啡，每天都有好心情）后点击'}
              </span>
            </div>
            {expandError && (
              <p className="text-[10px] text-rose-500 font-medium animate-pulse mt-1.5 bg-rose-500/5 px-3 py-1.5 rounded-xl border border-rose-500/10">{expandError}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4.5 py-2 rounded-full border border-gray-200 text-[#8e6d72] text-xs font-medium hover:bg-white/40 transition-all"
              id="cancel-add-wish-btn"
            >
              {language === 'en' ? 'Cancel' : '取消'}
            </button>
            <button
              type="submit"
              className="px-5.5 py-2 rounded-full bg-[#8e6d72] hover:bg-[#8e6d72]/90 text-white text-xs font-semibold shadow-sm transition-all"
              id="submit-wish-btn"
            >
              {language === 'en' ? 'Add to Wishlist Palace' : '优雅注入愿望清单'}
            </button>
          </div>
        </form>
      )}

      {/* Wishes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {wishes.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-16 text-center bg-white/20 border border-dashed border-[#b49196]/40 rounded-3xl">
            <span className="text-3xl"> Swan </span>
            <p className="text-xs text-[#b49196] font-serif mt-3 tracking-wide">
              {language === 'en' ? 'Your Wishlist Palace is empty. Click New Wish above to start manifesting.' : '您还没有写下任何心愿，点击右上角开启显化吧'}
            </p>
          </div>
        ) : (
          wishes.map((wish) => {
            const isGenerating = isGeneratingMap[wish.id] || false;
            const isDetailsExpanded = expandedDetailsMap[wish.id] || false;
            const isVisualDetailsExpanded = expandedVisualDetailsMap[wish.id] || false;
            return (
              <div
                key={wish.id}
                className="p-5 rounded-[24px] bg-white/60 hover:bg-white/70 border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between min-h-[240px]"
                id={`wish-card-${wish.id}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#8e6d72] px-3 py-1 rounded-full bg-white/60 border border-white/60 uppercase tracking-wide">
                      {categoryIcons[wish.category]}
                      {categoryLabels[wish.category]}
                    </span>
                    <button
                      onClick={() => onDeleteWish(wish.id)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title={language === 'en' ? "Delete this wish" : "清除此心愿"}
                      id={`delete-wish-${wish.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#4a3a3a] leading-snug tracking-wide group-hover:text-[#8e6d72] transition-colors">
                    {wish.title}
                  </h3>

                  <div className="relative">
                    <div className={`text-xs text-[#6d5b5e] mt-2 leading-relaxed font-sans bg-white/30 p-2.5 rounded-xl border border-white/20 transition-all duration-300 overflow-y-auto custom-scrollbar ${isDetailsExpanded ? 'max-h-[250px]' : 'max-h-[85px]'}`}>
                      {wish.details || (language === 'en' ? '（No initial description written yet...）' : '（未写下初始描述，等待直接显化...）')}
                    </div>
                    {wish.details && wish.details.length > 80 && (
                      <button
                        type="button"
                        onClick={() => setExpandedDetailsMap(prev => ({ ...prev, [wish.id]: !isDetailsExpanded }))}
                        className="text-[10px] text-[#8e6d72] hover:underline font-semibold mt-1 flex items-center gap-0.5 ml-1"
                      >
                        {isDetailsExpanded ? (language === 'en' ? 'Collapse' : '收起描述') : (language === 'en' ? 'Show full description' : '展开全部描述')}
                      </button>
                    )}
                  </div>

                  {/* Enhanced Details */}
                  {wish.visualizationDetails ? (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-[#fcf0e2]/40 to-[#ffe4e9]/30 border border-[#b49196]/20">
                      <div className="flex items-center justify-between gap-1 border-b border-[#b49196]/10 pb-1.5 mb-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#8e6d72] uppercase tracking-widest">
                          <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                          <span>{language === 'en' ? 'Sensory Details (Manifestation Canvas)' : '显化感官细节 (Sensory Details)'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditAll(wish.id)}
                            className="p-1 text-[#8e6d72] hover:bg-white/60 rounded-md border border-transparent hover:border-[#b49196]/15 transition-all flex items-center gap-1 font-semibold"
                            title={language === 'en' ? 'Directly edit all texts' : '直接修改全部文本'}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span className="text-[9px] hidden sm:inline">{language === 'en' ? 'Edit All' : '修改全部'}</span>
                          </button>
                          
                          <div className="flex items-center gap-1 bg-white/40 p-0.5 rounded-lg border border-[#b49196]/15">
                            <button
                              type="button"
                              onClick={() => setSelectedLangs(prev => ({ ...prev, [wish.id]: 'zh' }))}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                                (selectedLangs[wish.id] || 'zh') === 'zh'
                                  ? 'bg-[#8e6d72]/15 text-[#8e6d72] font-semibold'
                                  : 'text-gray-400 hover:text-[#8e6d72]'
                              }`}
                            >
                              🇨🇳 中文
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedLangs(prev => ({ ...prev, [wish.id]: 'en' }))}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                                selectedLangs[wish.id] === 'en'
                                  ? 'bg-[#8e6d72]/15 text-[#8e6d72] font-semibold'
                                  : 'text-gray-400 hover:text-[#8e6d72]'
                              }`}
                            >
                              🇬🇧 English
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {isEditingAll[wish.id] ? (
                        <div className="space-y-3 p-1.5">
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-[#8e6d72] uppercase block">
                              {language === 'en' ? '🇨🇳 Chinese Scenario Content' : '🇨🇳 中文场景内容'}
                            </label>
                            <textarea
                              value={editingText[wish.id] || ''}
                              onChange={(e) => setEditingText(prev => ({ ...prev, [wish.id]: e.target.value }))}
                              rows={5}
                              className="w-full text-xs p-2.5 rounded-xl border border-gray-200/60 bg-white/80 text-[#4a3a3a] focus:ring-1 focus:ring-[#8e6d72] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-[#8e6d72] uppercase block">
                              {language === 'en' ? '🇬🇧 English Scenario Content' : '🇬🇧 英文场景内容 (English)'}
                            </label>
                            <textarea
                              value={editingTextEn[wish.id] || ''}
                              onChange={(e) => setEditingTextEn(prev => ({ ...prev, [wish.id]: e.target.value }))}
                              rows={5}
                              className="w-full text-xs p-2.5 rounded-xl border border-gray-200/60 bg-white/80 text-[#4a3a3a] focus:ring-1 focus:ring-[#8e6d72] focus:outline-none"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleCancelEditAll(wish.id)}
                              className="px-3 py-1.5 text-[10px] font-bold bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              {language === 'en' ? 'Cancel' : '取消'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditAll(wish.id)}
                              className="px-3 py-1.5 text-[10px] font-bold bg-[#8e6d72] text-white rounded-lg hover:bg-[#8e6d72]/90 transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Save className="w-3 h-3" />
                              <span>{language === 'en' ? 'Save Changes' : '保存修改'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`space-y-2.5 overflow-y-auto custom-scrollbar transition-all duration-300 pr-1 ${isVisualDetailsExpanded ? 'max-h-[350px]' : 'max-h-[140px]'}`}>
                            {((selectedLangs[wish.id] || 'zh') === 'zh' 
                              ? (wish.visualizationDetails || '')
                              : (wish.visualizationDetailsEn || (language === 'en' ? '【Please click Activate Sensory Details below to generate the English scenario with Gemini】' : '【Please click stack generation/regeneration to trigger English scenario】'))
                            ).split('\n\n').filter(p => p.trim() !== '').map((para, paraIdx) => {
                              const hasHeader = para.startsWith('【') && para.indexOf('】') !== -1;
                              let headerText = '';
                              let bodyText = para;
                              if (hasHeader) {
                                const closeBracket = para.indexOf('】');
                                headerText = para.substring(0, closeBracket + 1);
                                bodyText = para.substring(closeBracket + 1).trim();
                              }

                              return (
                                <div 
                                  key={paraIdx} 
                                  className="relative group/para p-2.5 rounded-xl bg-white/40 border border-white/30 hover:bg-white/70 hover:border-[#b49196]/20 transition-all duration-300 shadow-xs"
                                >
                                  {/* Hover Delete Button */}
                                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/para:opacity-100 transition-opacity duration-300 flex gap-1 z-10">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSegment(wish.id, paraIdx, selectedLangs[wish.id] || 'zh')}
                                      className="p-1 rounded bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors shadow-sm"
                                      title={language === 'en' ? "Delete this segment" : "删除此段落"}
                                    >
                                      <Trash className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {headerText && (
                                    <div className="text-[9.5px] font-bold text-[#8e6d72] mb-0.5 uppercase tracking-wide flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#8e6d72]/60 animate-pulse"></span>
                                      <span>{headerText}</span>
                                    </div>
                                  )}
                                  <p className="text-[11px] text-[#6d5b5e] leading-relaxed italic font-sans whitespace-pre-line">
                                    {bodyText}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          {wish.visualizationDetails && (
                            <button
                              type="button"
                              onClick={() => setExpandedVisualDetailsMap(prev => ({ ...prev, [wish.id]: !isVisualDetailsExpanded }))}
                              className="text-[10px] text-[#8e6d72] hover:underline font-semibold mt-1 flex items-center gap-0.5 ml-1"
                            >
                              {isVisualDetailsExpanded ? (language === 'en' ? 'Collapse details' : '收起感官细节') : (language === 'en' ? 'Show all details' : '展开全部感官细节')}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 text-center py-3 bg-white/20 border border-dashed border-[#b49196]/20 rounded-xl">
                      <p className="text-[10px] text-[#b49196] uppercase tracking-widest">
                        {language === 'en' ? 'Sensory details not active. Click below to manifest.' : '具体的细节还未开启，请激活显化'}
                      </p>
                    </div>
                  )}

                  {/* Stacking & Multiple Generations Panel */}
                  {wish.visualizationDetails && (
                    <div className="mt-3.5 border-t border-[#b49196]/15 pt-3 animate-fadeIn">
                      <button
                        type="button"
                        onClick={() => setIsRefinementOpen(prev => ({ ...prev, [wish.id]: !isRefinementOpen[wish.id] }))}
                        className="flex items-center justify-between w-full text-[10px] font-bold text-[#8e6d72] bg-white/40 hover:bg-white/70 px-3 py-1.5 rounded-lg border border-white/50 transition-all shadow-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <Wand2 className="w-3 h-3 text-pink-500 animate-pulse" />
                          <span>
                            {language === 'en' ? '🔮 Stack Generation Panel (Layer Sensory Details)' : '🔮 场景多次叠加与智能完善阁 (Stack Generation Panel)'}
                          </span>
                        </span>
                        {isRefinementOpen[wish.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {isRefinementOpen[wish.id] && (
                        <div className="mt-2 p-2.5 rounded-xl bg-white/50 border border-white/60 space-y-2.5 animate-slideDown">
                          <div className="text-[9px] text-[#6d5b5e] leading-normal font-semibold">
                            {language === 'en' ? (
                              <>
                                💡 <span className="text-[#8e6d72]">Instructions:</span> Write additional details below (e.g. "add sparkling morning sun, a cat purring on my lap"). Click <strong>"➕ Stack Append"</strong> to weave it dynamically into the end.
                              </>
                            ) : (
                              <>
                                💡 <span className="text-[#8e6d72]">操作指引：</span>在下方写下追加指定的感官/细节（如“增加几缕晨曦、手边有一只金斑波斯猫在打呼噜”），点击<strong>“➕ 叠加生成”</strong>可生成全新段落拼接至已有场景末尾，实现无限完善。
                              </>
                            )}
                          </div>

                          <textarea
                            placeholder={language === 'en' ? "(Optional) Describe additional feelings or elements to weave in..." : "（选填）在这里写下您希望追加的心境或感官意图描述..."}
                            value={refineInputs[wish.id] || ''}
                            onChange={(e) => setRefineInputs(prev => ({ ...prev, [wish.id]: e.target.value }))}
                            rows={2}
                            className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white/80 text-[#4a3a3a] placeholder-[#b49196]/40 focus:ring-1 focus:ring-[#8e6d72] focus:outline-none resize-none font-sans"
                          />

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onGenerateDetails(wish.id, 'overwrite', refineInputs[wish.id]);
                                setRefineInputs(prev => ({ ...prev, [wish.id]: '' }));
                              }}
                              disabled={isGenerating}
                              className="px-2.5 py-1.5 text-[9.5px] font-bold rounded-lg border border-[#b49196]/20 text-[#8e6d72] bg-white hover:bg-pink-50/10 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <span>{language === 'en' ? '🔮 Overwrite Generate' : '🔮 覆盖生成 (Replace)'}</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                onGenerateDetails(wish.id, 'append', refineInputs[wish.id]);
                                setRefineInputs(prev => ({ ...prev, [wish.id]: '' }));
                              }}
                              disabled={isGenerating}
                              className="px-2.5 py-1.5 text-[9.5px] font-bold rounded-lg bg-gradient-to-r from-[#b49196] to-[#8e6d72] text-white hover:opacity-95 transition-all flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <span>{language === 'en' ? '➕ Stack Append' : '➕ 叠加生成 (Stack Append)'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/50 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => onGenerateDetails(wish.id, 'overwrite')}
                    disabled={isGenerating}
                    className={`text-[10.5px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                      wish.visualizationDetails
                        ? 'border-amber-200 bg-amber-50/40 text-amber-800 hover:bg-amber-50'
                        : 'border-[#b49196]/30 bg-white/50 text-[#8e6d72] hover:bg-white/80'
                    } disabled:opacity-50`}
                    id={`generate-details-btn-${wish.id}`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin text-xs">✨</span> {language === 'en' ? 'Tuning into Universe...' : '宇宙感应中...'}
                      </span>
                    ) : wish.visualizationDetails ? (
                      language === 'en' ? '✨ Regenerate Luxury Details' : '✨ 重新感应奢华细节'
                    ) : (
                      language === 'en' ? '✨ Activate Sensory Details' : '✨ 激活具体显化细节'
                    )}
                  </button>

                  <button
                    disabled={!wish.visualizationDetails}
                    onClick={() => onStartSession(wish)}
                    className="text-[10.5px] font-bold text-white px-4 py-1.5 rounded-full bg-gradient-to-r from-[#b49196] to-[#8e6d72] hover:scale-105 active:scale-95 shadow-md shadow-pink-900/10 transition-all disabled:opacity-40 disabled:scale-100"
                    id={`start-session-btn-${wish.id}`}
                  >
                    {language === 'en' ? '🧘 Immerse in Manifestation' : '🧘 进入沉浸显化'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
