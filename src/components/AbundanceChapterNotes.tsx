import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Feather, Sparkles, Volume2, Bookmark, Star, Plus, 
  Trash2, Edit3, Copy, Check, Search, Filter, Tag, Compass,
  ChevronDown, ChevronUp, Share2, ArrowRight, Lightbulb, MessageSquare, Download
} from 'lucide-react';
import { ABUNDANCE_CHAPTERS_DATA, INITIAL_USER_NOTES, ChapterEssence, UserBookNote } from '../data/abundanceBookStructure';

interface AbundanceChapterNotesProps {
  language?: 'zh' | 'en';
  onSpeak?: (text: string) => Promise<void>;
  onAddCustomWish?: (title: string, details: string, category: 'wealth' | 'love' | 'beauty' | 'career' | 'lifestyle') => void;
}

const STORAGE_KEY = 'ABUNDANCE_USER_READING_NOTES_V1';

export default function AbundanceChapterNotes({ language = 'zh', onSpeak, onAddCustomWish }: AbundanceChapterNotesProps) {
  const isEn = language === 'en';

  // Sub-view toggle: 'chapters' (全书篇章要义) | 'notes' (我的读书笔记)
  const [subView, setSubView] = useState<'chapters' | 'notes'>('chapters');

  // Chapter selected / expanded
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ch-1');
  const selectedChapter = ABUNDANCE_CHAPTERS_DATA.find(c => c.id === selectedChapterId) || ABUNDANCE_CHAPTERS_DATA[0];

  // Notes state (localStorage backed)
  const [notes, setNotes] = useState<UserBookNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user notes from storage', e);
    }
    return INITIAL_USER_NOTES;
  });

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to persist user notes', e);
    }
  }, [notes]);

  // Note editor form modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formChapterId, setFormChapterId] = useState<string>('ch-1');
  const [formQuote, setFormQuote] = useState<string>('');
  const [formReflection, setFormReflection] = useState<string>('');
  const [formCategory, setFormCategory] = useState<'wealth' | 'worth' | 'surrender' | 'gratitude' | 'now' | 'general'>('worth');
  const [formTags, setFormTags] = useState<string>('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Copy notification state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedWishId, setAddedWishId] = useState<string | null>(null);

  // Open note editor
  const handleOpenAddNote = (prefillChapterId?: string, prefillQuote?: string) => {
    setEditingNoteId(null);
    setFormChapterId(prefillChapterId || selectedChapterId || 'ch-1');
    setFormQuote(prefillQuote || '');
    setFormReflection('');
    setFormCategory('worth');
    setFormTags(prefillChapterId ? (isEn ? 'Insight, Practice' : '觉醒要义, 日常践行') : '');
    setIsEditorOpen(true);
  };

  const handleOpenEditNote = (note: UserBookNote) => {
    setEditingNoteId(note.id);
    setFormChapterId(note.chapterId || 'ch-1');
    setFormQuote(note.quoteOrTitle);
    setFormReflection(note.reflection);
    setFormCategory(note.category);
    setFormTags(note.tags.join(', '));
    setIsEditorOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuote.trim() && !formReflection.trim()) return;

    const chapterObj = ABUNDANCE_CHAPTERS_DATA.find(c => c.id === formChapterId);
    const chapterTitleStr = chapterObj ? `${isEn ? 'Chapter ' + chapterObj.chapterNumber : '第' + chapterObj.chapterNumber + '章'}：${isEn ? chapterObj.titleEn : chapterObj.titleZh}` : undefined;

    const tagsArr = formTags
      .split(/[,，#\s]+/)
      .map(t => t.trim())
      .filter(Boolean);

    if (editingNoteId) {
      // Update existing
      setNotes(prev => prev.map(n => {
        if (n.id === editingNoteId) {
          return {
            ...n,
            chapterId: formChapterId,
            chapterTitle: chapterTitleStr,
            quoteOrTitle: formQuote.trim(),
            reflection: formReflection.trim(),
            category: formCategory,
            tags: tagsArr.length > 0 ? tagsArr : ['丰盛笔记'],
            updatedAt: new Date().toISOString()
          };
        }
        return n;
      }));
    } else {
      // Create new
      const newNote: UserBookNote = {
        id: `note-${Date.now()}`,
        chapterId: formChapterId,
        chapterTitle: chapterTitleStr,
        quoteOrTitle: formQuote.trim() || (isEn ? 'Personal Awakening Insight' : '个人觉醒与读书感悟'),
        reflection: formReflection.trim(),
        category: formCategory,
        tags: tagsArr.length > 0 ? tagsArr : [isEn ? 'Abundance' : '丰盛笔记'],
        isFavorite: false,
        createdAt: new Date().toISOString()
      };
      setNotes(prev => [newNote, ...prev]);
    }

    setIsEditorOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm(isEn ? 'Delete this reading note?' : '确定要删除这条读书笔记吗？')) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  const handleCopyNote = (note: UserBookNote) => {
    const text = `📖 《丰盛》读书心得笔记\n【金句/主题】${note.quoteOrTitle}\n【章节】${note.chapterTitle || '全书通论'}\n【觉醒感悟】${note.reflection}\n【标签】${note.tags.map(t => '#' + t).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyNoteToWish = (note: UserBookNote) => {
    if (!onAddCustomWish) return;
    const catMap: Record<string, 'wealth' | 'love' | 'beauty' | 'career' | 'lifestyle'> = {
      wealth: 'wealth',
      worth: 'lifestyle',
      surrender: 'lifestyle',
      gratitude: 'love',
      now: 'lifestyle',
      general: 'wealth'
    };
    const targetCat = catMap[note.category] || 'lifestyle';
    const title = note.quoteOrTitle.length > 25 ? note.quoteOrTitle.slice(0, 25) + '...' : note.quoteOrTitle;
    const details = `《丰盛》金句感悟：${note.quoteOrTitle}\n我的践行觉醒：${note.reflection}`;
    
    onAddCustomWish(title, details, targetCat);
    setAddedWishId(note.id);
    setTimeout(() => setAddedWishId(null), 2500);
  };

  const handleExportAllNotes = () => {
    const content = `# 《丰盛》全书伴读笔记与个人金句心得宝库\n\n导出时间：${new Date().toLocaleString()}\n总条数：${notes.length} 条\n\n---\n\n` +
      notes.map((n, i) => {
        return `## ${i + 1}. ${n.quoteOrTitle}\n\n- **章节归属**：${n.chapterTitle || '全部篇章'}\n- **分类**：${n.category}\n- **记录时间**：${new Date(n.createdAt).toLocaleDateString()}\n- **标签**：${n.tags.map(t => '#' + t).join(' ')}\n\n> 💡 **觉醒感悟与实修**：\n> ${n.reflection.replace(/\n/g, '\n> ')}\n\n---`;
      }).join('\n\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `丰盛读书笔记_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered notes list
  const filteredNotes = notes.filter(note => {
    if (onlyFavorites && !note.isFavorite) return false;
    if (filterCategory !== 'all' && note.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQuote = note.quoteOrTitle.toLowerCase().includes(q);
      const matchReflection = note.reflection.toLowerCase().includes(q);
      const matchTags = note.tags.some(t => t.toLowerCase().includes(q));
      const matchChapter = note.chapterTitle?.toLowerCase().includes(q);
      return matchQuote || matchReflection || matchTags || matchChapter;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left" id="abundance-chapter-notes-root">
      {/* Sub Header & Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#8e6d72]/5 border border-[#8e6d72]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold text-sm shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#8e6d72]">
              {isEn ? '《Abundance》Comprehensive Chapters & Notebook' : '《丰盛》全书核心要义与个人读书心得'}
            </h4>
            <p className="text-[11px] text-[#6d5b5e]/75">
              {isEn 
                ? 'Systematic spiritual themes, awakening keys & custom personal reflection journal' 
                : '提炼全书核心章节主旨与觉醒要义，随时录入个人喜爱金句与实修笔记'}
            </p>
          </div>
        </div>

        {/* Switch Sub-View Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSubView('chapters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subView === 'chapters'
                ? 'bg-[#8e6d72] text-white shadow-xs'
                : 'bg-white/60 text-[#8e6d72] hover:bg-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isEn ? 'Chapter Essence' : '全书篇章要义'}</span>
          </button>

          <button
            onClick={() => setSubView('notes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
              subView === 'notes'
                ? 'bg-[#8e6d72] text-white shadow-xs'
                : 'bg-white/60 text-[#8e6d72] hover:bg-white'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>{isEn ? `My Notes (${notes.length})` : `我的读书笔记 (${notes.length})`}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-VIEW 1: CHAPTERS ESSENCE (全书篇章要义)
      ======================================================== */}
      {subView === 'chapters' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Chapter Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {ABUNDANCE_CHAPTERS_DATA.map(ch => {
              const isSelected = ch.id === selectedChapterId;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#8e6d72] to-[#7e5d62] text-white border-[#8e6d72] shadow-md scale-105 font-bold'
                      : 'bg-white/60 text-[#8e6d72] border-white/60 hover:bg-white/90'
                  }`}
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                    {isEn ? `Ch.${ch.chapterNumber}` : `第 ${ch.chapterNumber} 章`}
                  </span>
                  <span className="text-[11px] font-serif line-clamp-1">
                    {isEn ? ch.titleEn : ch.titleZh}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Chapter Deep Dive Card */}
          <div className="p-5 md:p-6 rounded-3xl bg-white/75 border border-white shadow-md shadow-pink-100/10 space-y-6 relative overflow-hidden">
            {/* Chapter Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#8e6d72]/15">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                    {isEn ? `CHAPTER ${selectedChapter.chapterNumber}` : `第 ${selectedChapter.chapterNumber} 章核心主旨`}
                  </span>
                  <span className="text-xs text-[#8e6d72] font-semibold italic">
                    {isEn ? selectedChapter.subtitleEn : selectedChapter.subtitleZh}
                  </span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-[#8e6d72]">
                  {isEn ? selectedChapter.titleEn : selectedChapter.titleZh}
                </h3>
              </div>

              {/* Action Buttons for Chapter */}
              <div className="flex items-center gap-2">
                {onSpeak && (
                  <button
                    onClick={() => {
                      const text = `${isEn ? selectedChapter.titleEn : selectedChapter.titleZh}。精神主旨：${isEn ? selectedChapter.corePhilosophyEn : selectedChapter.corePhilosophyZh}。觉醒要义：${isEn ? selectedChapter.awakeningEssenceEn : selectedChapter.awakeningEssenceZh}。实修心法：${isEn ? selectedChapter.practiceKeyEn : selectedChapter.practiceKeyZh}`;
                      onSpeak(text);
                    }}
                    className="p-2.5 rounded-2xl bg-amber-100/80 hover:bg-amber-200 text-amber-900 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title={isEn ? 'Listen chapter summary' : '语音朗诵本章要义'}
                  >
                    <Volume2 className="w-4 h-4 text-amber-700" />
                    <span className="hidden sm:inline">{isEn ? 'Listen' : '朗诵要义'}</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenAddNote(selectedChapter.id, selectedChapter.goldenMantras[0]?.textZh)}
                  className="px-4 py-2.5 rounded-2xl bg-[#8e6d72] hover:bg-[#7e5d62] text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Record Note for this Chapter' : '为本章写读书心得'}</span>
                </button>
              </div>
            </div>

            {/* Core Philosophy & Awakening Essence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Core Philosophy */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200/50 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs font-serif">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>{isEn ? 'Spiritual Essence & Core Philosophy' : '🌟 核心精神主旨 (Core Philosophy)'}</span>
                </div>
                <p className="text-xs text-[#5c4a4e] leading-relaxed">
                  {isEn ? selectedChapter.corePhilosophyEn : selectedChapter.corePhilosophyZh}
                </p>
              </div>

              {/* Awakening Essence */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/70 to-purple-50/40 border border-pink-200/50 space-y-2">
                <div className="flex items-center gap-2 text-[#8e6d72] font-bold text-xs font-serif">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span>{isEn ? 'Awakening Key & Realization' : '✨ 觉醒要义与维度跃迁 (Awakening Essence)'}</span>
                </div>
                <p className="text-xs text-[#5c4a4e] leading-relaxed">
                  {isEn ? selectedChapter.awakeningEssenceEn : selectedChapter.awakeningEssenceZh}
                </p>
              </div>
            </div>

            {/* Practice & Integration Key */}
            <div className="p-4 rounded-2xl bg-[#8e6d72]/5 border border-[#8e6d72]/15 space-y-1.5">
              <div className="flex items-center gap-2 text-[#8e6d72] font-bold text-xs font-serif">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>{isEn ? 'Daily Practice & Grounding' : '🧘 日常实修落地心法 (Living the Teaching)'}</span>
              </div>
              <p className="text-xs text-[#5c4a4e] leading-relaxed">
                {isEn ? selectedChapter.practiceKeyEn : selectedChapter.practiceKeyZh}
              </p>
            </div>

            {/* Golden Mantras Carousel / Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#8e6d72] uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEn ? 'Chapter Representative Golden Mantras' : '📖 本章代表性真理金句与心咒'}</span>
                </h4>
                <span className="text-[10px] text-[#8e6d72]/70 font-mono">
                  {selectedChapter.goldenMantras.length} {isEn ? 'Golden Mantras' : '条精粹'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedChapter.goldenMantras.map((mantra, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/90 border border-[#8e6d72]/15 hover:border-[#8e6d72]/40 transition-all flex flex-col justify-between gap-3 shadow-xs group"
                  >
                    <div className="space-y-1.5">
                      <p className="font-serif italic font-semibold text-xs md:text-sm text-[#8e6d72] leading-relaxed">
                        “{isEn ? mantra.textEn : mantra.textZh}”
                      </p>
                      <p className="text-[10.5px] text-[#6d5b5e]/80">
                        💡 {mantra.insightZh}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#8e6d72]/10 text-[10.5px]">
                      {onSpeak && (
                        <button
                          onClick={() => onSpeak(isEn ? mantra.textEn : mantra.textZh)}
                          className="text-[#8e6d72] hover:text-[#7e5d62] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isEn ? 'Listen' : '朗读'}</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAddNote(selectedChapter.id, mantra.textZh)}
                          className="text-[#8e6d72] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Feather className="w-3 h-3" />
                          <span>{isEn ? 'Note this' : '记感悟'}</span>
                        </button>

                        {onAddCustomWish && (
                          <button
                            onClick={() => {
                              onAddCustomWish(
                                mantra.textZh.length > 20 ? mantra.textZh.slice(0, 20) + '...' : mantra.textZh,
                                `《丰盛》第${selectedChapter.chapterNumber}章金句真言：${mantra.textZh}\n心法解析：${mantra.insightZh}`,
                                'wealth'
                              );
                              setAddedWishId(`mantra-${selectedChapter.id}-${idx}`);
                              setTimeout(() => setAddedWishId(null), 2000);
                            }}
                            className="px-2.5 py-1 rounded-full bg-pink-100 hover:bg-pink-200 text-[#8e6d72] font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {addedWishId === `mantra-${selectedChapter.id}-${idx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">{isEn ? 'Added' : '已加入心愿'}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-pink-600" />
                                <span>{isEn ? 'Add to Wish' : '存为心愿'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Reflection Prompts */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 font-serif">
                <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                <span>{isEn ? 'Guided Reflection Prompts for You' : '💭 觉察与反思伴读指引 (Self-Inquiry Prompts)'}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#5c4a4e]">
                {selectedChapter.reflectionPrompts.map((prompt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-VIEW 2: USER NOTES (我的读书笔记与金句库)
      ======================================================== */}
      {subView === 'notes' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Notes Top Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/70 p-3 rounded-2xl border border-white">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8e6d72]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search notes, quotes, or tags..." : "搜索我的读书笔记、金句摘录、心得或标签..."}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white/80 border border-[#8e6d72]/20 focus:outline-none focus:border-[#8e6d72]"
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-2.5 py-2 rounded-xl text-xs bg-white/80 border border-[#8e6d72]/20 text-[#8e6d72] font-semibold focus:outline-none"
              >
                <option value="all">{isEn ? 'All Categories' : '全部分类'}</option>
                <option value="wealth">{isEn ? 'Wealth & Flow' : '财富与金钱'}</option>
                <option value="worth">{isEn ? 'Divine Worth' : '神圣配得感'}</option>
                <option value="surrender">{isEn ? 'Total Surrender' : '全然臣服'}</option>
                <option value="gratitude">{isEn ? 'Gratitude' : '无条件感恩'}</option>
                <option value="now">{isEn ? 'Here & Now' : '活在当下'}</option>
                <option value="general">{isEn ? 'General' : '综合心得'}</option>
              </select>

              <button
                onClick={() => setOnlyFavorites(prev => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  onlyFavorites
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white/80 text-[#8e6d72] border border-[#8e6d72]/20 hover:bg-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : 'text-amber-500'}`} />
                <span>{isEn ? 'Favorites' : '已收藏'}</span>
              </button>

              <button
                onClick={handleExportAllNotes}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white/80 hover:bg-white text-[#8e6d72] border border-[#8e6d72]/20 transition-all flex items-center gap-1 cursor-pointer"
                title={isEn ? 'Export notes as Markdown' : '导出全部笔记为Markdown'}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isEn ? 'Export' : '导出笔记'}</span>
              </button>

              <button
                onClick={() => handleOpenAddNote()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#8e6d72] hover:bg-[#7e5d62] text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isEn ? 'New Note' : '记新笔记'}</span>
              </button>
            </div>
          </div>

          {/* Notes Cards List */}
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/40 border border-white/60 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100/60 text-amber-800 flex items-center justify-center mx-auto">
                <Feather className="w-6 h-6" />
              </div>
              <h5 className="font-serif text-[#8e6d72] font-semibold text-sm">
                {isEn ? 'No reading notes found' : '暂无匹配的读书笔记'}
              </h5>
              <p className="text-xs text-[#6d5b5e]/75 max-w-sm mx-auto">
                {isEn 
                  ? 'Click "New Note" or explore the chapters above to record your personal insights from 《Abundance》.' 
                  : '点击“记新笔记”，或在上方篇章中挑选您喜爱的金句，开始记录您的《丰盛》觉醒日记与感悟。'}
              </p>
              <button
                onClick={() => handleOpenAddNote()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8e6d72] text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEn ? 'Write First Note' : '立即写下第一篇心得'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-3xl bg-white/85 border border-white/80 hover:border-[#8e6d72]/30 shadow-md shadow-pink-100/10 transition-all flex flex-col justify-between gap-3 group relative"
                >
                  {/* Note Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {note.chapterTitle && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                            {note.chapterTitle}
                          </span>
                        )}
                        <span className="text-[10px] text-[#8e6d72]/60 font-mono">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Favorite button */}
                      <button
                        onClick={() => handleToggleFavorite(note.id)}
                        className="p-1 rounded-full text-amber-400 hover:text-amber-500 cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    </div>

                    {/* Quote / Title */}
                    <h5 className="font-serif italic font-bold text-sm md:text-base text-[#8e6d72] leading-snug">
                      “{note.quoteOrTitle}”
                    </h5>

                    {/* Reflection Body */}
                    {note.reflection && (
                      <p className="text-xs text-[#5c4a4e] leading-relaxed whitespace-pre-line bg-[#8e6d72]/5 p-3 rounded-2xl border border-[#8e6d72]/10">
                        {note.reflection}
                      </p>
                    )}

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {note.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-full bg-[#8e6d72]/8 text-[#8e6d72] text-[9.5px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Note Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#8e6d72]/10 text-xs">
                    <div className="flex items-center gap-2">
                      {onSpeak && (
                        <button
                          onClick={() => onSpeak(`金句：${note.quoteOrTitle}。我的感悟：${note.reflection}`)}
                          className="p-1.5 rounded-xl hover:bg-amber-100/80 text-[#8e6d72] transition-all cursor-pointer"
                          title={isEn ? 'Read aloud' : '朗读笔记'}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyNote(note)}
                        className="p-1.5 rounded-xl hover:bg-amber-100/80 text-[#8e6d72] transition-all cursor-pointer"
                        title={isEn ? 'Copy note' : '复制笔记内容'}
                      >
                        {copiedId === note.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {onAddCustomWish && (
                        <button
                          onClick={() => handleApplyNoteToWish(note)}
                          className="px-2.5 py-1 rounded-full bg-pink-100/80 hover:bg-pink-200 text-[#8e6d72] text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title={isEn ? 'Save as wish card' : '将笔记金句同步为显化心愿'}
                        >
                          {addedWishId === note.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">{isEn ? 'Added' : '已转心愿'}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-pink-600" />
                              <span>{isEn ? 'As Wish' : '转为心愿'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditNote(note)}
                        className="p-1.5 rounded-xl hover:bg-amber-100/80 text-[#8e6d72] transition-all cursor-pointer"
                        title={isEn ? 'Edit note' : '编辑笔记'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all cursor-pointer"
                        title={isEn ? 'Delete note' : '删除笔记'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          NOTE CREATOR & EDITOR MODAL DIALOG
      ======================================================== */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 backdrop-blur-2xl p-6 md:p-7 rounded-[28px] border border-white shadow-2xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#8e6d72]/15">
                <div className="flex items-center gap-2">
                  <Feather className="w-5 h-5 text-amber-600" />
                  <h4 className="font-serif text-lg font-bold text-[#8e6d72]">
                    {editingNoteId ? (isEn ? 'Edit Reading Note' : '编辑读书心得笔记') : (isEn ? 'Record 《Abundance》 Note' : '录入《丰盛》金句与个人心得')}
                  </h4>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-4 text-left">
                {/* Chapter Association */}
                <div>
                  <label className="block text-xs font-bold text-[#8e6d72] mb-1">
                    {isEn ? 'Associated Chapter' : '关联《丰盛》核心章节'}
                  </label>
                  <select
                    value={formChapterId}
                    onChange={e => setFormChapterId(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-[#8e6d72]/20 text-[#5c4a4e] focus:outline-none focus:border-[#8e6d72]"
                  >
                    {ABUNDANCE_CHAPTERS_DATA.map(ch => (
                      <option key={ch.id} value={ch.id}>
                        {isEn ? `Chapter ${ch.chapterNumber}: ${ch.titleEn}` : `第 ${ch.chapterNumber} 章：${ch.titleZh} (${ch.subtitleZh})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Golden Quote or Excerpt */}
                <div>
                  <label className="block text-xs font-bold text-[#8e6d72] mb-1">
                    {isEn ? 'Golden Quote / Excerpt' : '喜爱金句原文或心得标题 *'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formQuote}
                    onChange={e => setFormQuote(e.target.value)}
                    placeholder={isEn ? "e.g. 'True abundance is inherent wholeness, not accumulation...'" : "例如：‘真正的丰盛不是去占有什么，而是认出你本自具足的生命本质。’"}
                    className="w-full p-3 rounded-xl text-xs bg-white border border-[#8e6d72]/20 text-[#5c4a4e] focus:outline-none focus:border-[#8e6d72] resize-none"
                  />
                </div>

                {/* Personal Reflection & Practice */}
                <div>
                  <label className="block text-xs font-bold text-[#8e6d72] mb-1">
                    {isEn ? 'Personal Realization & Daily Practice' : '我的觉醒感悟与日常践行 (How this transforms my life)'}
                  </label>
                  <textarea
                    rows={4}
                    value={formReflection}
                    onChange={e => setFormReflection(e.target.value)}
                    placeholder={isEn ? "Write how this teaching touches your heart or how you apply it in daily life..." : "写下这句话如何触动您的心灵，或您在日常生活中打算如何放手、臣服、感恩与践行..."}
                    className="w-full p-3 rounded-xl text-xs bg-white border border-[#8e6d72]/20 text-[#5c4a4e] focus:outline-none focus:border-[#8e6d72] resize-none"
                  />
                </div>

                {/* Category & Tags in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#8e6d72] mb-1">
                      {isEn ? 'Category' : '心智分类'}
                    </label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl text-xs bg-white border border-[#8e6d72]/20 text-[#5c4a4e] focus:outline-none focus:border-[#8e6d72]"
                    >
                      <option value="worth">{isEn ? 'Divine Worth' : '神圣配得感'}</option>
                      <option value="wealth">{isEn ? 'Wealth & Flow' : '财富与金钱'}</option>
                      <option value="surrender">{isEn ? 'Total Surrender' : '全然臣服'}</option>
                      <option value="gratitude">{isEn ? 'Gratitude' : '无条件感恩'}</option>
                      <option value="now">{isEn ? 'Here & Now' : '活在当下'}</option>
                      <option value="general">{isEn ? 'General' : '综合心得'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8e6d72] mb-1">
                      {isEn ? 'Tags (comma separated)' : '标签 (逗号或空格隔开)'}
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      placeholder={isEn ? "e.g. #surrender #thankyou" : "例如：本自具足 顺流 谢谢你"}
                      className="w-full p-2.5 rounded-xl text-xs bg-white border border-[#8e6d72]/20 text-[#5c4a4e] focus:outline-none focus:border-[#8e6d72]"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#8e6d72]/15">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8e6d72] hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    {isEn ? 'Cancel' : '取消'}
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#8e6d72] hover:bg-[#7e5d62] text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Save Note' : '保存读书笔记'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
