import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import {
  subscribeToUserWishes,
  syncSaveWish,
  syncDeleteWish,
  syncUpdateWish,
  mergeLocalWishesToCloud,
  SyncState
} from './services/wishSyncService';
import UserAuthModal from './components/UserAuthModal';
import UserSyncBar from './components/UserSyncBar';
import { Wish, MusicTrack, VisualBackground, VisualBackgroundType } from './types';
import VisualizationBackground from './components/VisualizationBackground';
import AudioPlayer from './components/AudioPlayer';
import AffirmationCard from './components/AffirmationCard';
import Wishlist from './components/Wishlist';
import AbundanceWisdomSpace from './components/AbundanceWisdomSpace';
import { ChakraVisualizer } from './components/ChakraVisualizer';
import { BreathingRingWithParticles } from './components/BreathingRingWithParticles';
import {
  Sparkles,
  Heart,
  Sofa,
  Volume2,
  VolumeX,
  X,
  Compass,
  ArrowLeft,
  ChevronRight,
  Eye,
  Info,
  RotateCcw,
  Play,
  Pause,
  SlidersHorizontal
} from 'lucide-react';

const BACKGROUNDS_THEMES: VisualBackground[] = [
  {
    id: 'sparkling-sky',
    name: '金色星空',
    nameEn: 'Golden Starlight',
    emoji: '✨',
    primaryColor: '#FFFDF9',
    secondaryColor: '#FFF5E6',
    textColor: 'text-amber-900',
    glowColor: 'amber-400'
  },
  {
    id: 'royal-garden',
    name: '玫瑰花海',
    nameEn: 'Rose Garden',
    emoji: '🌸',
    primaryColor: '#FFF5F5',
    secondaryColor: '#FFE3E3',
    textColor: 'text-rose-900',
    glowColor: 'pink-400'
  },
  {
    id: 'glowing-crystal',
    name: '梦幻冰晶',
    nameEn: 'Dreamy Crystals',
    emoji: '💎',
    primaryColor: '#F0F9FF',
    secondaryColor: '#E0F2FE',
    textColor: 'text-sky-900',
    glowColor: 'sky-400'
  },
  {
    id: 'dreamy-cloud',
    name: '落日晚霞',
    nameEn: 'Sunset Clouds',
    emoji: '🍑',
    primaryColor: '#FFF7ED',
    secondaryColor: '#FFE4E6',
    textColor: 'text-pink-950',
    glowColor: 'amber-300'
  },
];

const GRATITUDE_WHISPERS = [
  "感谢宇宙的指引，感谢当下深沉的静谧，万物已在我的呼吸中完美显现。",
  "感恩我的身心，感恩我拥有接纳爱与财富的无限容器，一切的美好均是应许之物。",
  "怀着深深的感恩，我将意图托付给浩瀚的宇宙。我深信，所有发生皆是最好的安排。",
  "谢谢每一个清晨与暮色，谢谢流淌在我生命中的爱，一切丰盛正以其最完美的方式绽放。",
  "感恩这一刻的全然放松，我以喜悦之心接纳生命给予的每一份精致礼物。"
];

const GRATITUDE_WHISPERS_EN = [
  "Thank you, universe, for your divine guidance and deep peace. All is perfectly manifesting in my breath.",
  "I am deeply grateful for my body and mind, an infinite vessel of love and abundance. All beauty belongs to me.",
  "With deep gratitude, I trust my intentions to the universe. Everything is unfolding in perfect order.",
  "Thank you for every morning and night, and the love flowing through me. Abundance blooms beautifully.",
  "Grateful for this moment of deep release. I receive every elegant gift of life with absolute joy."
];

const PREBUILT_MUSIC: MusicTrack[] = [
  { id: 'princess-synth', name: '✨ 圣洁公主琴音 (Web 实时合成)', nameEn: '✨ Sacred Princess Chords (Web Synth)', url: '' },
  { id: 'track-rose', name: '🎵 玫瑰古堡钢琴曲 (舒适冥想)', nameEn: '🎵 Rose Castle Piano (Comfort Meditation)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'track-ambient', name: '🎵 水晶风铃之歌 (空灵声场)', nameEn: '🎵 Crystal Chimes Symphony (Ethereal Sound)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

interface SentenceSegment {
  text: string;
  startIndex: number;
  fullTextFromHere: string;
}

const getSentenceSegments = (text: string): SentenceSegment[] => {
  if (!text) return [];
  // Split by sentence terminators (Chinese and English) or newlines, keeping the punctuation
  const rawSegments = text.split(/(?<=[。！？\n])|(?<=[.!?]\s+)/).filter(Boolean);
  
  let accumulatedIndex = 0;
  return rawSegments.map((segment) => {
    const startIndex = accumulatedIndex;
    accumulatedIndex += segment.length;
    return {
      text: segment,
      startIndex,
      fullTextFromHere: text.slice(startIndex)
    };
  });
};

export default function App() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isGeneratingMap, setIsGeneratingMap] = useState<Record<string, boolean>>({});
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(PREBUILT_MUSIC[0]);
  const [tracks, setTracks] = useState<MusicTrack[]>(PREBUILT_MUSIC);
  const [visualBg, setVisualBg] = useState<VisualBackgroundType>('royal-garden');

  // Background CSS Filter states
  const [bgSaturation, setBgSaturation] = useState<number>(100); // 0% to 200%
  const [bgBrightness, setBgBrightness] = useState<number>(100); // 50% to 150%
  const [bgBlur, setBgBlur] = useState<number>(0); // 0px to 15px
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);

  // Lifted AudioPlayer states
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);

  // Meditation Countdown Timer states
  const [timerDuration, setTimerDuration] = useState<number>(10 * 60); // Default 10 minutes in seconds
  const [timerRemaining, setTimerRemaining] = useState<number>(10 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showFinishedOverlay, setShowFinishedOverlay] = useState<boolean>(false);
  
  // Immersive active session wish
  const [activeWishSession, setActiveWishSession] = useState<Wish | null>(null);
  const [activeSessionLang, setActiveSessionLang] = useState<'zh' | 'en'>('zh');
  
  // Breathing presets
  const breathingPatterns = [
    { id: 'classic-4-4-4', name: language === 'en' ? 'Classic Balance' : '经典舒缓呼吸', code: '4-4-4', type: 'classic', inhale: 4, holdIn: 4, exhale: 4, holdOut: 0, desc: language === 'en' ? 'Balance body & mind, stabilize field' : '平衡身心，安稳场域' },
    { id: 'box-4-4-4-4', name: language === 'en' ? 'Box Breathing' : '方盒平衡呼吸', code: '4-4-4-4', type: 'box', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, desc: language === 'en' ? 'Symmetrical clarity, calm racing thoughts' : '均衡清明，安定思绪' },
    { id: 'box-4-6-4-6', name: language === 'en' ? 'Deep Relaxation' : '方盒深层呼吸', code: '4-6-4-6', type: 'box', inhale: 4, holdIn: 6, exhale: 4, holdOut: 6, desc: language === 'en' ? 'Deep release, let go of pressure' : '深沉放松，放空压力' },
    { id: 'box-4-8-4-8', name: language === 'en' ? 'Transcendental Flow' : '方盒超频呼吸', code: '4-8-4-8', type: 'box', inhale: 4, holdIn: 8, exhale: 4, holdOut: 8, desc: language === 'en' ? 'Ignite potential, raise consciousness' : '激发潜能，意识升华' },
    { id: 'rebirthing', name: language === 'en' ? 'Rebirthing Breath' : '重生呼吸法', code: '2-0-2-0', type: 'circular', inhale: 2, holdIn: 0, exhale: 2, holdOut: 0, desc: language === 'en' ? 'Continuous circular flow, release subconscious blockages' : '连贯循环呼吸，不带停顿，释放深层创伤与潜意识束缚' },
    { id: 'sohum', name: language === 'en' ? 'SOHUM Resonance' : 'SoHum 律动呼吸', code: '1分6次->1分5次', type: 'mantra', inhale: 5, holdIn: 0, exhale: 5, holdOut: 0, desc: language === 'en' ? 'Dr. Jan: 1 min 6 breaths (5s So / 5s Hum) -> 1 min 5 breaths (6s So / 6s Hum)' : '杨定一博士推荐：第1分钟6次(5s So吸/5s Hum呼)，第2分钟5次(6s So吸/6s Hum呼)，深层同频宇宙律动' },
  ];
  const [selectedPatternId, setSelectedPatternId] = useState<string>('classic-4-4-4');
  const [breathingText, setBreathingText] = useState<string>('吸气...');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('inhale');

  // SOHUM Advanced Staged Flow states (1分6次 -> 1分5次)
  const [sohumStageMode, setSohumStageMode] = useState<'auto' | 'stage1' | 'stage2'>('auto');
  const [sohumCurrentStage, setSohumCurrentStage] = useState<1 | 2>(1);
  const [sohumCycleCount, setSohumCycleCount] = useState<number>(1);
  const [sohumElapsedSeconds, setSohumElapsedSeconds] = useState<number>(0);

  const currentPattern = breathingPatterns.find(p => p.id === selectedPatternId) || breathingPatterns[0];

  // Speaking state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingLoading, setIsSpeakingLoading] = useState(false);
  const [speakingStartIndex, setSpeakingStartIndex] = useState<number | null>(null);
  const [voiceTone, setVoiceTone] = useState<'deep-female' | 'royal-lady' | 'magnetic-male' | 'grounding-male'>('deep-female');

  // Solfeggio continuous synth states
  const [meditationSoundType, setMeditationSoundType] = useState<'ambient' | 'solfeggio'>('ambient');
  const [solfeggioFrequency, setSolfeggioFrequency] = useState<number>(528);
  const [solfeggioVolume, setSolfeggioVolume] = useState<number>(0.3);
  const [isBackgroundAudioEnabled, setIsBackgroundAudioEnabled] = useState<boolean>(true);

  // Refs for continuous Solfeggio sound
  const solfeggioAudioCtxRef = useRef<AudioContext | null>(null);
  const breathingAudioCtxRef = useRef<AudioContext | null>(null);
  const solfeggioOscsRef = useRef<OscillatorNode[]>([]);
  const solfeggioGainRef = useRef<GainNode | null>(null);
  const [showIntroduction, setShowIntroduction] = useState(true);

  const activeAudioSourceRef = useRef<AudioContext | null>(null);
  const activeGainNodeRef = useRef<GainNode | null>(null);
  const currentSpeechSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Cloud Sync & User Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('offline');

  // Firebase Auth State Listener & Firestore Real-Time Sync
  useEffect(() => {
    let unsubscribeWishes: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setSyncState('syncing');

        // Migrate/merge any existing local wishes into cloud collection
        const localSaved = localStorage.getItem('princess_manifestation_wishes');
        if (localSaved) {
          try {
            const localWishes: Wish[] = JSON.parse(localSaved);
            if (localWishes.length > 0) {
              await mergeLocalWishesToCloud(currentUser.uid, localWishes);
            }
          } catch (e) {
            console.error('Error merging local wishes to cloud:', e);
          }
        }

        // Subscribe to real-time updates from Firestore
        if (unsubscribeWishes) unsubscribeWishes();
        unsubscribeWishes = subscribeToUserWishes(
          currentUser.uid,
          (cloudWishes) => {
            if (cloudWishes && cloudWishes.length > 0) {
              setWishes(cloudWishes);
              localStorage.setItem('princess_manifestation_wishes', JSON.stringify(cloudWishes));
            }
            setSyncState('synced');
          },
          (err) => {
            console.error('Firestore subscribe error:', err);
            setSyncState('error');
          }
        );
      } else {
        // Guest mode: load from localStorage
        setSyncState('offline');
        if (unsubscribeWishes) {
          unsubscribeWishes();
          unsubscribeWishes = null;
        }
        const saved = localStorage.getItem('princess_manifestation_wishes');
        if (saved) {
          try {
            setWishes(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse saved wishes:', e);
          }
        } else {
          // Seed with sample wish
          const sampleWish: Wish = {
            id: 'sample-1',
            title: '在白玫瑰环绕的花园露台享用英式下午茶',
            category: 'lifestyle',
            details: '想要有一个阳光明媚的下午，周围开满了清香的白玫瑰。桌上有精美的描金瓷器，摆满司康和慕斯。微风轻拂裙摆，内心只有平静、高贵与深深的满足。',
            visualizationDetails: '晨曦如薄纱般温柔地披在你的天鹅绒睡裙上，空气里氤氲着栀子花与刚采摘的玫瑰清香。你轻轻落座于铺满繁复蕾丝的露台前，捧起描绘着细腻金边的大吉岭红茶。银器在暖阳下折射出优雅璀璨的华光。在这一刻，世俗的喧嚣与焦虑尽数消散，宇宙无限的宠爱与丰盛正如同这温暖的和风，毫无保留地涌入你的生命，你的身心已被彻底的尊贵、富足与深度安宁所包裹。',
            visualizationDetailsEn: '【Visual Scene】\nGentle morning light softly caresses your velvet dress as the air drifts with the scent of gardenias and freshly-picked white roses. You sit before the rose terrace, holding a fine-rimmed porcelain cup of Darjeeling tea as the silver tableware glimmers in the sun.\n\n【Acoustics & Aroma】\nThe gentle whisper of the breeze through the roses harmonizes with the soft chime of distant bells. The steam of tea rises with a tranquil rose aroma.\n\n【Body & Mind Energy】\nIn this sacred moment, all secular worries completely fade. You are surrounded by the deep, warm, and loving protective field of the universe, feeling infinitely cherished, secure, and profoundly rich.',
            isManifested: false,
            createdAt: new Date().toISOString(),
          };
          setWishes([sampleWish]);
          localStorage.setItem('princess_manifestation_wishes', JSON.stringify([sampleWish]));
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeWishes) unsubscribeWishes();
    };
  }, []);

  // Save wishes helper with Cloud Sync
  const saveWishesToStorage = (newWishes: Wish[]) => {
    setWishes(newWishes);
    localStorage.setItem('princess_manifestation_wishes', JSON.stringify(newWishes));
  };

  const handleAddWish = async (newWish: Omit<Wish, 'id' | 'createdAt' | 'isManifested'>) => {
    const wish: Wish = {
      ...newWish,
      id: `wish-${Date.now()}`,
      isManifested: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [wish, ...wishes];
    saveWishesToStorage(updated);

    // Sync to Cloud Firestore if logged in
    if (user) {
      setSyncState('syncing');
      try {
        await syncSaveWish(user.uid, wish);
        setSyncState('synced');
      } catch (err) {
        console.error('Failed to sync new wish to cloud:', err);
        setSyncState('error');
      }
    }
  };

  const handleDeleteWish = async (id: string) => {
    const filtered = wishes.filter(w => w.id !== id);
    saveWishesToStorage(filtered);
    if (activeWishSession?.id === id) {
      handleExitManifestationSession();
    }

    // Delete from Cloud Firestore if logged in
    if (user) {
      setSyncState('syncing');
      try {
        await syncDeleteWish(user.uid, id);
        setSyncState('synced');
      } catch (err) {
        console.error('Failed to delete wish from cloud:', err);
        setSyncState('error');
      }
    }
  };

  const handleManualSync = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSyncState('syncing');
    try {
      await mergeLocalWishesToCloud(user.uid, wishes);
      setSyncState('synced');
    } catch (e) {
      console.error('Manual sync error:', e);
      setSyncState('error');
    }
  };

  const handleAddCustomTrack = (track: MusicTrack) => {
    setTracks([...tracks, track]);
  };

  // Generate detailed visual scenario with Gemini API
  const handleGenerateDetails = async (id: string, mode: 'overwrite' | 'append' = 'overwrite', refinePrompt?: string) => {
    const targetWish = wishes.find(w => w.id === id);
    if (!targetWish) return;

    setIsGeneratingMap(prev => ({ ...prev, [id]: true }));

    try {
      const response = await fetch('/api/affirmations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetWish.title,
          details: targetWish.details,
          category: targetWish.category,
          mode,
          existingDetails: mode === 'append' ? targetWish.visualizationDetails : undefined,
          existingDetailsEn: mode === 'append' ? targetWish.visualizationDetailsEn : undefined,
          refinePrompt,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Server returned error when generating details';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const result = await response.json();
      
      const updatedWishes = wishes.map(w => {
        if (w.id === id) {
          let nextDetails = result.visualizationText;
          let nextDetailsEn = result.visualizationTextEn;

          if (mode === 'append' && w.visualizationDetails) {
            nextDetails = `${w.visualizationDetails}\n\n${result.visualizationText}`;
            nextDetailsEn = w.visualizationDetailsEn 
              ? `${w.visualizationDetailsEn}\n\n${result.visualizationTextEn}` 
              : result.visualizationTextEn;
          }

          const updatedWish = {
            ...w,
            visualizationDetails: nextDetails,
            visualizationDetailsEn: nextDetailsEn,
          };

          // Sync to Cloud if logged in
          if (user) {
            syncUpdateWish(user.uid, id, {
              visualizationDetails: nextDetails,
              visualizationDetailsEn: nextDetailsEn,
            }).catch(e => console.error('Cloud update error on generate:', e));
          }

          return updatedWish;
        }
        return w;
      });

      saveWishesToStorage(updatedWishes);

    } catch (err) {
      console.error('Failed to generate manifestation scenario:', err);
    } finally {
      setIsGeneratingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleUpdateWish = (id: string, updatedFields: Partial<Wish>) => {
    const updatedWishes = wishes.map(w => {
      if (w.id === id) {
        return { ...w, ...updatedFields };
      }
      return w;
    });
    saveWishesToStorage(updatedWishes);

    if (user) {
      syncUpdateWish(user.uid, id, updatedFields).catch(e =>
        console.error('Cloud update error:', e)
      );
    }
  };

  // Text-To-Speech Playback
  const fadeOutAndStopPrevious = (fadeOutDuration = 0.5) => {
    const prevGainNode = activeGainNodeRef.current;
    const prevCtx = activeAudioSourceRef.current;
    const prevSource = currentSpeechSourceRef.current;

    if (prevGainNode && prevCtx) {
      try {
        const now = prevCtx.currentTime;
        // Smoothly fade out the gain
        prevGainNode.gain.setValueAtTime(prevGainNode.gain.value, now);
        prevGainNode.gain.linearRampToValueAtTime(0, now + fadeOutDuration);
        
        // Capture local copies to clean up after fadeOutDuration
        setTimeout(() => {
          try {
            prevSource?.stop();
            prevCtx.close();
          } catch (e) {
            // Context might already be closed
          }
        }, fadeOutDuration * 1000 + 50);
      } catch (e) {
        try {
          prevSource?.stop();
          prevCtx.close();
        } catch (err) {}
      }
    } else {
      if (prevSource) {
        try { prevSource.stop(); } catch (e) {}
      }
      if (prevCtx) {
        try { prevCtx.close(); } catch (e) {}
      }
    }

    activeGainNodeRef.current = null;
    activeAudioSourceRef.current = null;
    currentSpeechSourceRef.current = null;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSpeakText = async (text: string, toneOverride?: 'deep-female' | 'royal-lady' | 'magnetic-male' | 'grounding-male') => {
    // Fade out previous audio instead of cutting off abruptly to create a gorgeous cross-fade
    fadeOutAndStopPrevious(0.5);
    setIsSpeakingLoading(true);

    const activeTone = toneOverride || voiceTone;

    // Map voiceTone to Gemini Voice Name
    const ttsVoiceMap = {
      'deep-female': 'Zephyr',
      'royal-lady': 'Kore',
      'magnetic-male': 'Charon',
      'grounding-male': 'Fenrir'
    };
    const selectedVoiceName = ttsVoiceMap[activeTone] || 'Zephyr';

    try {
      // 1. Fetch from Gemini TTS server endpoint
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: selectedVoiceName }),
      });

      if (!response.ok) {
        throw new Error('TTS server error. Falling back to browser synthesis.');
      }

      const data = await response.json();
      if (!data.audio) {
        throw new Error('TTS response missing audio data.');
      }

      // 2. Decode raw signed 16-bit little endian PCM 24000Hz
      const base64Data = data.audio;
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const numSamples = len / 2;
      const float32Samples = new Float32Array(numSamples);
      const dataView = new DataView(bytes.buffer);
      
      for (let i = 0; i < numSamples; i++) {
        const sample = dataView.getInt16(i * 2, true);
        float32Samples[i] = sample / 32768; // normalize
      }
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 });
      activeAudioSourceRef.current = audioCtx;
      
      const buffer = audioCtx.createBuffer(1, numSamples, 24000);
      buffer.copyToChannel(float32Samples, 0);
      
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      
      // Create a GainNode for smooth fade transitions
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      activeGainNodeRef.current = gainNode;
      currentSpeechSourceRef.current = source;
      setIsSpeakingLoading(false);
      setIsSpeaking(true);

      source.onended = () => {
        if (currentSpeechSourceRef.current === source) {
          setIsSpeaking(false);
          currentSpeechSourceRef.current = null;
          setSpeakingStartIndex(null);
        }
      };

      source.start(0);

    } catch (err) {
      console.warn("Gemini TTS was offline or not configured. Using high-quality offline SpeechSynthesis fallback:", err);
      
      // Fallback: Browser Web Speech API
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const isEnglish = /[a-zA-Z]{4,}/.test(text);
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        if (isEnglish) {
          const enVoices = voices.filter(v => v.lang.includes('en') || v.lang.includes('EN'));
          if (enVoices.length > 0) {
            const sweetVoice = enVoices.find(v => 
              v.name.toLowerCase().includes('google us english') ||
              v.name.toLowerCase().includes('samantha') || 
              v.name.toLowerCase().includes('hazel') ||
              v.name.toLowerCase().includes('female')
            );
            utterance.voice = sweetVoice || enVoices[0];
          }
        } else {
          // Match standard Chinese voices
          const zhVoices = voices.filter(v => v.lang.includes('zh') || v.lang.includes('ZH'));
          if (zhVoices.length > 0) {
            const femaleVoice = zhVoices.find(v => 
              v.name.toLowerCase().includes('xiaoxiao') || 
              v.name.toLowerCase().includes('tingting') ||
              v.name.toLowerCase().includes('female')
            );
            utterance.voice = femaleVoice || zhVoices[0];
          }
        }

        // Set pitch and rate based on voice tone selection
        if (activeTone === 'royal-lady') {
          utterance.rate = 0.68; // Calm, majestic, slow
          utterance.pitch = 0.95; // Warm royal lady
        } else if (activeTone === 'magnetic-male') {
          utterance.rate = 0.76;
          utterance.pitch = 0.7;
        } else if (activeTone === 'grounding-male') {
          utterance.rate = 0.7;
          utterance.pitch = 0.6;
        } else {
          // deep-female (default)
          utterance.rate = 0.78;
          utterance.pitch = 0.85;
        }
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setIsSpeakingLoading(false);
          setSpeakingStartIndex(null);
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setIsSpeakingLoading(false);
          setSpeakingStartIndex(null);
        };
        
        setIsSpeakingLoading(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeakingLoading(false);
        alert("您的浏览器不支持语音播放，已为您进行沉浸式文字展示。");
      }
    }
  };

  const handleStopSpeaking = () => {
    setIsSpeaking(false);
    setIsSpeakingLoading(false);
    setSpeakingStartIndex(null);
    fadeOutAndStopPrevious(0.35); // Smoothly fade out previous speech in 350ms
  };

  const [breathingCountdown, setBreathingCountdown] = useState<number>(4);
  const [selectedGratitudeWhisper, setSelectedGratitudeWhisper] = useState<string>('');

  const playBreathingPhaseSound = (phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      if (!breathingAudioCtxRef.current) {
        breathingAudioCtxRef.current = new AudioContextClass();
      }
      const ctx = breathingAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      
      if (phase === 'inhale') {
        // --- INHALE: Sacred Temple Bell Strike (敲钟的声音) ---
        // Rich inharmonic bell partials for authentic metallic gong/bell resonance
        const frequencies = [220, 330, 440, 543, 659, 784, 987, 1200];
        const gains = [0.12, 0.08, 0.1, 0.07, 0.06, 0.04, 0.03, 0.02];
        const oscillators: OscillatorNode[] = [];
        const masterGain = ctx.createGain();

        // Bell strike hammer hit (brief high-frequency triangle chime burst)
        const strikeOsc = ctx.createOscillator();
        const strikeGain = ctx.createGain();
        strikeOsc.type = 'triangle';
        strikeOsc.frequency.setValueAtTime(1500, now);
        strikeOsc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
        strikeGain.gain.setValueAtTime(0, now);
        strikeGain.gain.linearRampToValueAtTime(0.08, now + 0.005);
        strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        strikeOsc.connect(strikeGain);
        strikeGain.connect(ctx.destination);
        strikeOsc.start(now);
        strikeOsc.stop(now + 0.06);

        // Resonating bell body
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          
          // Slight detune for natural chorus warmth
          osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);
          
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(gains[idx], now + 0.015); // Fast strike peak
          
          // Partials decay at different rates (higher frequencies decay faster)
          const decayRate = 3.5 / (1 + idx * 0.4);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decayRate);
          
          osc.connect(gainNode);
          gainNode.connect(masterGain);
          
          osc.start(now);
          osc.stop(now + decayRate + 0.1);
          oscillators.push(osc);
        });

        // Master lowpass filter for warming up the bell
        const bellFilter = ctx.createBiquadFilter();
        bellFilter.type = 'lowpass';
        bellFilter.frequency.setValueAtTime(1400, now);

        masterGain.gain.setValueAtTime(0.7, now);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        masterGain.connect(bellFilter);
        bellFilter.connect(ctx.destination);

      } else if (phase === 'holdIn' || phase === 'holdOut') {
        // --- HOLD IN & OUT: Sacred Woodblock/Wooden Fish (类似敲木鱼的声音) ---
        // Fast wood-resonance transient with hollow body decay and pitch sweep.
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const bandpass = ctx.createBiquadFilter();

        // Fundamental pitch of wooden fish: around 720Hz, sliding down to 530Hz
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(720, now);
        osc1.frequency.exponentialRampToValueAtTime(530, now + 0.08);

        // Overtone component: around 1080Hz, sliding down to 810Hz
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1080, now);
        osc2.frequency.exponentialRampToValueAtTime(810, now + 0.08);

        // Bandpass filter to make it sound hollow like a wooden box cavities
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(650, now);
        bandpass.Q.setValueAtTime(3.0, now);

        gainNode.gain.setValueAtTime(0, now);
        // Extremely sharp transient attack for wood mallet strike
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.002);
        // Wood decays extremely quickly (about 160ms)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        osc1.connect(bandpass);
        osc2.connect(bandpass);
        bandpass.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.2);
        osc2.stop(now + 0.2);

      } else if (phase === 'exhale') {
        // --- EXHALE: Deep Meditative Drum Beat (打鼓的声音) ---
        const drumOsc = ctx.createOscillator();
        const drumGain = ctx.createGain();
        const lowpassFilter = ctx.createBiquadFilter();

        drumOsc.type = 'sine';
        // Pitch sweep (starts at 160Hz and drops to 48Hz rapidly to simulate drum skin stretch)
        drumOsc.frequency.setValueAtTime(160, now);
        drumOsc.frequency.exponentialRampToValueAtTime(48, now + 0.16);

        // Low mid harmonic for deep hand drum punch
        const harmonicOsc = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        harmonicOsc.type = 'triangle';
        harmonicOsc.frequency.setValueAtTime(110, now);
        harmonicOsc.frequency.exponentialRampToValueAtTime(55, now + 0.16);

        harmonicGain.gain.setValueAtTime(0.05, now);
        harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.setValueAtTime(160, now); // Dark warm acoustic resonance

        drumGain.gain.setValueAtTime(0, now);
        drumGain.gain.linearRampToValueAtTime(0.35, now + 0.01); // Fast punchy strike
        drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8); // Beautiful sub bass ring

        drumOsc.connect(lowpassFilter);
        harmonicOsc.connect(lowpassFilter);
        
        lowpassFilter.connect(drumGain);
        drumGain.connect(ctx.destination);

        drumOsc.start(now);
        harmonicOsc.start(now);
        drumOsc.stop(now + 2.0);
        harmonicOsc.stop(now + 2.0);
      }
    } catch (err) {
      console.error('Failed to play phase transition sound:', err);
    }
  };

  // Breathing loop timer with synchronized countdown, visual progress, and auditory cues
  useEffect(() => {
    if (!activeWishSession) return;

    const pattern = breathingPatterns.find(p => p.id === selectedPatternId) || breathingPatterns[0];
    const isSohum = pattern.id === 'sohum';

    // Local tracking variables inside closure
    let localSohumStage: 1 | 2 = sohumStageMode === 'stage2' ? 2 : 1;
    let localCycleCount = 1;
    let localElapsedSeconds = 0;

    setSohumCurrentStage(localSohumStage);
    setSohumCycleCount(1);
    setSohumElapsedSeconds(0);

    const getInhaleTime = () => {
      if (isSohum) return localSohumStage === 1 ? 5 : 6;
      return pattern.inhale;
    };

    const getExhaleTime = () => {
      if (isSohum) return localSohumStage === 1 ? 5 : 6;
      return pattern.exhale;
    };

    const getPhaseText = (phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut', stage: 1 | 2 = localSohumStage) => {
      const isEn = language === 'en';
      if (pattern.id === 'sohum') {
        if (phase === 'inhale') {
          return isEn 
            ? (stage === 1 ? 'So (Inhale • 5s)' : 'So (Inhale • 6s)') 
            : (stage === 1 ? 'So (吸气 · 连系源头 5s)' : 'So (吸气 · 深入原初 6s)');
        }
        if (phase === 'exhale') {
          return isEn 
            ? (stage === 1 ? 'Hum (Exhale • 5s)' : 'Hum (Exhale • 6s)') 
            : (stage === 1 ? 'Hum (呼气 · 回归本我 5s)' : 'Hum (呼气 · 大我安歇 6s)');
        }
      } else if (pattern.id === 'rebirthing') {
        if (phase === 'inhale') return isEn ? 'Continuous Inhale...' : '连贯吸气...';
        if (phase === 'exhale') return isEn ? 'Passive Release...' : '放手呼气...';
      }
      
      if (phase === 'inhale') return isEn ? 'Inhale...' : '吸气...';
      if (phase === 'holdIn') return isEn ? 'Hold Breath...' : '吸气后屏息...';
      if (phase === 'exhale') return isEn ? 'Exhale...' : '呼气...';
      if (phase === 'holdOut') return isEn ? 'Hold Breath...' : '呼气后屏息...';
      return '';
    };

    const initialInhale = getInhaleTime();
    setBreathingCountdown(initialInhale);
    setBreathingPhase('inhale');
    setBreathingText(getPhaseText('inhale', localSohumStage));
    playBreathingPhaseSound('inhale');

    let currentPhase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut' = 'inhale';
    let currentCountdown = initialInhale;

    const interval = setInterval(() => {
      localElapsedSeconds++;
      setSohumElapsedSeconds(localElapsedSeconds);

      currentCountdown--;
      if (currentCountdown <= 0) {
        if (currentPhase === 'inhale') {
          if (pattern.holdIn > 0 && !isSohum) {
            currentPhase = 'holdIn';
            currentCountdown = pattern.holdIn;
            setBreathingPhase('holdIn');
            setBreathingText(getPhaseText('holdIn'));
            playBreathingPhaseSound('holdIn');
          } else {
            currentPhase = 'exhale';
            currentCountdown = getExhaleTime();
            setBreathingPhase('exhale');
            setBreathingText(getPhaseText('exhale', localSohumStage));
            playBreathingPhaseSound('exhale');
          }
        } else if (currentPhase === 'holdIn') {
          currentPhase = 'exhale';
          currentCountdown = getExhaleTime();
          setBreathingPhase('exhale');
          setBreathingText(getPhaseText('exhale', localSohumStage));
          playBreathingPhaseSound('exhale');
        } else if (currentPhase === 'exhale') {
          if (pattern.holdOut > 0 && !isSohum) {
            currentPhase = 'holdOut';
            currentCountdown = pattern.holdOut;
            setBreathingPhase('holdOut');
            setBreathingText(getPhaseText('holdOut'));
            playBreathingPhaseSound('holdOut');
          } else {
            // Completed 1 full breath cycle
            localCycleCount++;
            setSohumCycleCount(localCycleCount);

            // Handle SOHUM auto-stage transition (1 min 6 times -> 1 min 5 times)
            if (isSohum && sohumStageMode === 'auto' && localSohumStage === 1) {
              // 6 cycles of 10s = 60s
              if (localElapsedSeconds >= 58 || localCycleCount > 6) {
                localSohumStage = 2;
                setSohumCurrentStage(2);
              }
            }

            currentPhase = 'inhale';
            currentCountdown = getInhaleTime();
            setBreathingPhase('inhale');
            setBreathingText(getPhaseText('inhale', localSohumStage));
            playBreathingPhaseSound('inhale');
          }
        } else if (currentPhase === 'holdOut') {
          localCycleCount++;
          setSohumCycleCount(localCycleCount);

          currentPhase = 'inhale';
          currentCountdown = getInhaleTime();
          setBreathingPhase('inhale');
          setBreathingText(getPhaseText('inhale', localSohumStage));
          playBreathingPhaseSound('inhale');
        }
      }
      setBreathingCountdown(currentCountdown);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWishSession, selectedPatternId, sohumStageMode, language]);

  // Start continuous Solfeggio frequency oscillators
  const startSolfeggioSynth = () => {
    try {
      stopSolfeggioSynth();

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      solfeggioAudioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      // Main carrier volume (gentle scaling)
      mainGain.gain.setValueAtTime(solfeggioVolume * 0.15, ctx.currentTime);
      mainGain.connect(ctx.destination);
      solfeggioGainRef.current = mainGain;

      // Lowpass filter for smooth, warm sub-harmonic sounds
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, ctx.currentTime);
      filter.connect(mainGain);

      // Left Channel carrier
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(solfeggioFrequency, ctx.currentTime);
      osc1.connect(filter);

      // Right Channel carrier - slightly detuned by +4.32Hz for luxurious Theta-wave cosmic beating
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(solfeggioFrequency + 4.32, ctx.currentTime);
      osc2.connect(filter);

      osc1.start();
      osc2.start();

      solfeggioOscsRef.current = [osc1, osc2];
    } catch (err) {
      console.error('Failed to start Solfeggio frequency generator:', err);
    }
  };

  const stopSolfeggioSynth = () => {
    if (solfeggioOscsRef.current && solfeggioOscsRef.current.length > 0) {
      solfeggioOscsRef.current.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {}
      });
      solfeggioOscsRef.current = [];
    }
    if (solfeggioAudioCtxRef.current) {
      try {
        solfeggioAudioCtxRef.current.close();
      } catch (e) {}
      solfeggioAudioCtxRef.current = null;
    }
    solfeggioGainRef.current = null;
  };

  // Reactively start/stop continuous Solfeggio sound depending on active state, sound type selection, and master enable switch
  useEffect(() => {
    if (activeWishSession && meditationSoundType === 'solfeggio' && isBackgroundAudioEnabled) {
      startSolfeggioSynth();
      // Mute/pause original ambient music track so they don't clash harshly
      setIsMusicPlaying(false);
    } else {
      stopSolfeggioSynth();
    }

    // Handle ambient music track state reactively when entering session
    if (activeWishSession && meditationSoundType === 'ambient') {
      if (isBackgroundAudioEnabled) {
        setIsMusicPlaying(true);
      } else {
        setIsMusicPlaying(false);
      }
    }

    return () => {
      stopSolfeggioSynth();
    };
  }, [activeWishSession, meditationSoundType, solfeggioFrequency, isBackgroundAudioEnabled]);

  // Adjust volume dynamically when user moves the slider
  useEffect(() => {
    if (solfeggioGainRef.current && solfeggioAudioCtxRef.current) {
      const ctx = solfeggioAudioCtxRef.current;
      solfeggioGainRef.current.gain.setValueAtTime(solfeggioVolume * 0.15, ctx.currentTime);
    }
  }, [solfeggioVolume]);

  const playAwakeningChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // Elegant, pure notes for a beautiful, rich awakening chime (F# major arpeggio / pentatonic chord series)
      const freqs = [369.99, 466.16, 554.37, 739.99, 932.33, 1108.73]; 

      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        gainNode.gain.setValueAtTime(0, now + index * 0.12);
        gainNode.gain.linearRampToValueAtTime(0.12, now + index * 0.12 + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 4.0);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 4.5);
      });
    } catch (err) {
      console.error('Failed to play awakening chime:', err);
    }
  };

  // Countdown timer interval logic
  useEffect(() => {
    if (!activeWishSession || !isTimerRunning) return;

    if (timerRemaining <= 0) {
      setIsTimerRunning(false);
      handleStopSpeaking();
      playAwakeningChime();
      stopSolfeggioSynth(); // Stop Solfeggio vibration when session completes
      
      const randWhisper = GRATITUDE_WHISPERS[Math.floor(Math.random() * GRATITUDE_WHISPERS.length)];
      setSelectedGratitudeWhisper(randWhisper);
      
      setShowFinishedOverlay(true);

      // Fade out background music smoothly over 4 seconds
      if (isMusicPlaying) {
        const originalVolume = musicVolume;
        let currentVol = musicVolume;
        const steps = 20;
        const fadeStep = musicVolume / steps;
        const intervalTime = 4000 / steps;

        const fadeInterval = setInterval(() => {
          currentVol -= fadeStep;
          if (currentVol <= 0.01) {
            clearInterval(fadeInterval);
            setIsMusicPlaying(false);
            setMusicVolume(originalVolume); // Reset volume to original setting
          } else {
            setMusicVolume(Math.max(0, currentVol));
          }
        }, intervalTime);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimerRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWishSession, isTimerRunning, timerRemaining, isMusicPlaying, musicVolume]);

  const handleStartManifestationSession = (wish: Wish) => {
    setActiveWishSession(wish);
    setActiveSessionLang('zh');
    setTimerRemaining(timerDuration);
    setIsTimerRunning(true);
    setShowFinishedOverlay(false);
    setSelectedGratitudeWhisper(GRATITUDE_WHISPERS[Math.floor(Math.random() * GRATITUDE_WHISPERS.length)]);

    // Automatically play the background music
    setIsMusicPlaying(true);

    // Automatically read out details to guide them - fall back to details if no visualization details exist yet
    const textToRead = wish.visualizationDetails || wish.details;
    if (textToRead) {
      setTimeout(() => {
        handleSpeakText(textToRead);
      }, 400); // 400ms is much faster and feels snap-instant!
    }
  };

  const handleExitManifestationSession = () => {
    setActiveWishSession(null);
    setIsTimerRunning(false);
    setShowFinishedOverlay(false);
    handleStopSpeaking();
    stopSolfeggioSynth();
  };

  const handleSetTimerDuration = (minutes: number) => {
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimerRemaining(seconds);
    setIsTimerRunning(true);
    setShowFinishedOverlay(false);
  };

  const activeTheme = BACKGROUNDS_THEMES.find(t => t.id === visualBg) || BACKGROUNDS_THEMES[1];
  const isBgDark = visualBg === 'sparkling-sky';

  return (
    <div className="relative min-h-screen text-[#4a3a3a] transition-colors duration-1000 font-sans">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ffe4e9] rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[60%] h-[60%] bg-[#fcf0e2] rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#f3e5f5] rounded-full blur-[100px] opacity-40"></div>
      </div>

      {/* High-quality Canvas Visualizer Background */}
      <VisualizationBackground type={visualBg} intensity={3} saturation={bgSaturation} brightness={bgBrightness} blur={bgBlur} />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/20 backdrop-blur-xl border-b border-white/40 py-5 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-[#8e6d72]">Lumière Manifest</h1>
          <p className="text-xs uppercase tracking-[0.2em] text-[#b49196] font-semibold mt-1">
            {language === 'en' ? 'My Royal Sanctuary • Regal Manifestation' : 'My Royal Sanctuary • 公主风奢华显化'}
          </p>
        </div>

        {/* Background Visualizer Picker & Welcome */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-1.5 bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
            <span className="text-[10px] font-bold text-[#8e6d72] uppercase tracking-wider px-1 hidden sm:inline">
              {language === 'en' ? 'Canvas Theme:' : '可视化画布:'}
            </span>
            {BACKGROUNDS_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setVisualBg(theme.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-sans transition-all duration-300 flex items-center gap-1 ${
                  visualBg === theme.id
                    ? 'bg-white/60 text-[#8e6d72] border border-white/80 shadow-sm font-semibold'
                    : 'text-[#8e6d72]/70 hover:bg-white/20 border border-transparent'
                }`}
                title={language === 'en' ? theme.nameEn : theme.name}
                id={`theme-btn-${theme.id}`}
              >
                <span>{theme.emoji}</span>
                <span className="hidden md:inline text-[10.5px]">
                  {language === 'en' ? theme.nameEn : theme.name}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all duration-300 flex items-center gap-1.5 shadow-sm border ${
              showFilterPanel
                ? 'bg-[#8e6d72] text-white border-transparent scale-105 shadow-md'
                : 'bg-white/30 hover:bg-white/55 text-[#8e6d72] border-white/40'
            }`}
            id="filter-toggle-btn"
            title={language === 'en' ? 'Adjust canvas saturation, brightness, and blur' : '调节画布饱和度、亮度和模糊度'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[10.5px] font-semibold">
              {language === 'en' ? 'Filter' : '氛围滤镜'}
            </span>
          </button>

          <button
            onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
            className="px-3.5 py-1.5 rounded-full text-xs font-sans transition-all duration-300 flex items-center gap-1.5 shadow-sm border bg-white/30 hover:bg-white/55 text-[#8e6d72] border-white/40 font-semibold cursor-pointer"
            id="language-toggle-btn"
          >
            <span>🌐</span>
            <span>{language === 'zh' ? 'English' : '中文'}</span>
          </button>

          {/* User Cloud Sync Status & Auth Controls */}
          <UserSyncBar
            user={user}
            syncState={syncState}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onManualSync={handleManualSync}
            language={language}
            wishCount={wishes.length}
          />
        </div>
      </header>

      {/* Main Layout container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="manifestation-app-body">
        
        {/* Ambient Filter Control Panel */}
        {showFilterPanel && (
          <div className="mb-6 p-5 rounded-[28px] bg-white/45 backdrop-blur-xl border border-white/40 shadow-xl shadow-pink-100/10 animate-fadeIn space-y-4" id="ambient-filters-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8e6d72]/15 pb-3 gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#8e6d72] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#8e6d72]" />
                  <span>
                    {language === 'en' ? 'Canvas Filter Settings' : '画布氛围滤镜设置'}
                  </span>
                </h3>
                <p className="text-[10px] text-[#b49196] font-semibold uppercase tracking-wider">
                  {language === 'en' ? 'Customize saturation, brightness, and blur to match your current meditation depth' : '根据您的冥想深度，自由调节画面饱和度、亮度和模糊度'}
                </p>
              </div>

              {/* Reset to defaults button */}
              <button
                onClick={() => {
                  setBgSaturation(100);
                  setBgBrightness(100);
                  setBgBlur(0);
                }}
                className="text-[10.5px] font-bold text-[#8e6d72] hover:text-white bg-[#8e6d72]/10 hover:bg-[#8e6d72] px-3.5 py-1.5 rounded-full border border-[#8e6d72]/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>{language === 'en' ? 'Reset to Default' : '重置原版'}</span>
              </button>
            </div>

            {/* Ambient Presets Grid */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-bold text-[#8e6d72] uppercase tracking-wider block">
                {language === 'en' ? '👑 Recommended Meditation Atmosphere Presets' : '👑 推荐深度冥想氛围预设'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { name: language === 'en' ? '✨ Original Canvas' : '✨ 默认原版', saturation: 100, brightness: 100, blur: 0, desc: language === 'en' ? 'Original palette' : 'Original' },
                  { name: language === 'en' ? '🌅 Tranquil Dawn' : '🌅 静谧晨曦', saturation: 80, brightness: 120, blur: 2, desc: language === 'en' ? 'Morning peace' : 'Morning peace' },
                  { name: language === 'en' ? '🌌 Deep Dream' : '🌌 深沉梦境', saturation: 130, brightness: 75, blur: 4, desc: language === 'en' ? 'Deep dream space' : 'Deep dream' },
                  { name: language === 'en' ? '🧘 Ethereal Void' : '🧘 无尘空灵', saturation: 40, brightness: 90, blur: 6, desc: language === 'en' ? 'Deep relaxation' : 'Deep relaxation' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setBgSaturation(preset.saturation);
                      setBgBrightness(preset.brightness);
                      setBgBlur(preset.blur);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-95 flex flex-col justify-center cursor-pointer ${
                      bgSaturation === preset.saturation && bgBrightness === preset.brightness && bgBlur === preset.blur
                        ? 'bg-[#8e6d72]/15 text-[#8e6d72] border-[#8e6d72]/40 shadow-sm font-bold'
                        : 'bg-white/40 hover:bg-white/60 text-[#4a3a3a] border-white/50'
                    }`}
                  >
                    <span className="text-xs font-semibold">{preset.name}</span>
                    <span className="text-[8px] opacity-70 font-mono tracking-wider uppercase mt-0.5">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Saturation */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/30 border border-white/30">
                <div className="flex items-center justify-between text-xs font-semibold text-[#8e6d72]">
                  <span className="flex items-center gap-1.5">
                    <span>🎨</span>
                    <span>
                      {language === 'en' ? 'Canvas Saturation' : '背景饱和度 (Saturation)'}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] bg-white/70 px-2 py-0.5 rounded-lg border border-white/80">{bgSaturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={bgSaturation}
                  onChange={(e) => setBgSaturation(Number(e.target.value))}
                  className="w-full accent-[#8e6d72] cursor-pointer h-1 bg-gray-200/50 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[9px] text-[#b49196] font-medium">
                  <span>{language === 'en' ? 'Gray / Muted' : '黑白极简'}</span>
                  <span>{language === 'en' ? 'Standard 100%' : '原色 100%'}</span>
                  <span>{language === 'en' ? 'Rich / Vivid' : '浓郁奢华'}</span>
                </div>
              </div>

              {/* Brightness */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/30 border border-white/30">
                <div className="flex items-center justify-between text-xs font-semibold text-[#8e6d72]">
                  <span className="flex items-center gap-1.5">
                    <span>☀️</span>
                    <span>
                      {language === 'en' ? 'Canvas Brightness' : '背景亮度 (Brightness)'}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] bg-white/70 px-2 py-0.5 rounded-lg border border-white/80">{bgBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={bgBrightness}
                  onChange={(e) => setBgBrightness(Number(e.target.value))}
                  className="w-full accent-[#8e6d72] cursor-pointer h-1 bg-gray-200/50 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[9px] text-[#b49196] font-medium">
                  <span>{language === 'en' ? 'Quiet Dark' : '静谧幽暗'}</span>
                  <span>{language === 'en' ? 'Standard 100%' : '标准 100%'}</span>
                  <span>{language === 'en' ? 'Bright / Luminous' : '明亮通透'}</span>
                </div>
              </div>

              {/* Blur */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/30 border border-white/30">
                <div className="flex items-center justify-between text-xs font-semibold text-[#8e6d72]">
                  <span className="flex items-center gap-1.5">
                    <span>🌫️</span>
                    <span>
                      {language === 'en' ? 'Canvas Blur' : '背景模糊度 (Blur)'}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] bg-white/70 px-2 py-0.5 rounded-lg border border-white/80">{bgBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={bgBlur}
                  onChange={(e) => setBgBlur(Number(e.target.value))}
                  className="w-full accent-[#8e6d72] cursor-pointer h-1 bg-gray-200/50 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[9px] text-[#b49196] font-medium">
                  <span>{language === 'en' ? 'Clear & Sharp' : '剔透清晰'}</span>
                  <span>{language === 'en' ? 'Soft Frosted' : '温润毛玻璃'}</span>
                  <span>{language === 'en' ? 'Deep Void' : '深度虚无'}</span>
                </div>
              </div>
            </div>
          </div>)}
        
        {/* Intro Alert card */}
        {showIntroduction && (
          <div className="mb-6 p-5 rounded-[24px] bg-white/30 backdrop-blur-xl border border-white/40 shadow-xl shadow-pink-100/10 flex items-start gap-3 relative animate-fadeIn">
            <div className="p-2 rounded-xl bg-white/50 text-[#8e6d72] shrink-0 border border-white">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs text-[#6d5b5e] leading-relaxed pr-6">
              <p className="font-serif font-semibold text-lg text-[#8e6d72] mb-1">
                {language === 'en' ? 'Welcome to Lumière Manifest Sanctuary ✨' : '欢迎来到 Lumière Manifest 奢华显化磁场 ✨'}
              </p>
              {language === 'en' ? (
                <>
                  This is your exclusive sanctuary of deep relaxation and manifestation. Click <strong className="text-[#8e6d72]">"✨ Activate Visualization Details"</strong> on any wish, and the Gemini AI will immediately weave sensory details filled with colors, textures, and aromas. Coupled with the <strong className="text-[#8e6d72]">"Subconscious TTS Voice Guidance"</strong>, let abundance and beauty flow seamlessly into your life.
                </>
              ) : (
                <>
                  这是一个专属于您的舒缓疗愈殿堂。点击心愿中的 <strong className="text-[#8e6d72]">“✨ 激活具体显化细节”</strong>，Gemini 智能算法将为您实时编织饱含色彩、温度与香氛的可视化细节。配合 <strong className="text-[#8e6d72]">“深沉女声朗读”</strong> 浸润潜意识，让丰盛与美丽自如地流向您的生命。
                </>
              )}
            </div>
            <button
              onClick={() => setShowIntroduction(false)}
              className="absolute top-4 right-4 text-[#8e6d72] hover:text-black transition-colors"
              id="close-intro-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bento Box style Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column A: Left side (Wishes details and list) */}
          <div className="lg:col-span-2 space-y-6">
            <Wishlist
              language={language}
              wishes={wishes}
              onAddWish={handleAddWish}
              onDeleteWish={handleDeleteWish}
              onGenerateDetails={handleGenerateDetails}
              onStartSession={handleStartManifestationSession}
              isGeneratingMap={isGeneratingMap}
              onUpdateWish={handleUpdateWish}
            />

            {/* Dr. Jan's Abundance Wisdom Experience Space */}
            <AbundanceWisdomSpace
              language={language}
              onSpeak={handleSpeakText}
              onAddCustomWish={(title, details, category) => {
                handleAddWish({ title, details, category });
              }}
            />
          </div>

          {/* Column B: Right side (Affirmation of the day and customized meditation music) */}
          <div className="space-y-6">
            {/* Daily Affirmation */}
            <AffirmationCard
              language={language}
              onSpeak={handleSpeakText}
              isSpeaking={isSpeaking}
              onStopSpeaking={handleStopSpeaking}
            />

            {/* Customized Meditation Tracks */}
            <AudioPlayer
              language={language}
              currentTrack={currentTrack}
              onTrackChange={setCurrentTrack}
              tracks={tracks}
              onAddCustomTrack={handleAddCustomTrack}
              voiceTone={voiceTone}
              onVoiceToneChange={setVoiceTone}
              isPlaying={isMusicPlaying}
              setIsPlaying={setIsMusicPlaying}
              volume={musicVolume}
              setVolume={setMusicVolume}
              activeWishSession={activeWishSession}
            />

            {/* Quick guidance tips */}
            <div className="p-6 rounded-[32px] bg-[#8e6d72]/10 backdrop-blur-2xl border border-[#8e6d72]/20 shadow-xl shadow-pink-100/5">
              <h4 className="font-serif text-lg mb-4 text-[#8e6d72] flex items-center gap-1.5">
                <span>🧘</span>
                <span>{language === 'en' ? 'Lumière Trilogy' : 'Lumière 三部曲'}</span>
              </h4>
              <ul className="text-xs text-[#6d5b5e] space-y-3.5 leading-relaxed font-sans">
                {language === 'en' ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8e6d72] font-bold shrink-0">1.</span>
                      <span>Write down specific wishes and activate Gemini AI to materialize every sensory detail (temperature, textures, aroma).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8e6d72] font-bold shrink-0">2.</span>
                      <span>Turn on the immersive music and enter full-screen meditation, following the deep voice to guide your subconsciousness.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8e6d72] font-bold shrink-0">3.</span>
                      <span>Relax completely and maintain a high sense of deservingness; the beautiful things you desire are already waiting for you in the warm future.</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8e6d72] font-bold shrink-0">1.</span>
                      <span>写下具体愿望，启动 Gemini 智能算法为您具象化每一个感官细节（温度、材质、气息）。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8e6d72] font-bold shrink-0">2.</span>
                      <span>开启沉浸式音乐，进入全屏冥想，跟随着呼唤潜意识的深沉女声进行丰盛暗示注入。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8e6d72] font-bold shrink-0">3.</span>
                      <span>完全放松并保持极高配得感，相信您所想要的美丽，早已在温暖的未来微笑着等待。</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

          </div>

        </div>
      </main>

      {/* FULL SCREEN IMMERSIVE MANIFESTATION VISUALIZATION OVERLAY */}
      {activeWishSession && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex flex-col justify-between p-4 md:p-8 lg:p-12 animate-fadeIn font-sans"
          id="immersive-focus-session-overlay"
        >
          {/* Immersive background matching parent active choice */}
          <VisualizationBackground type={visualBg} intensity={4} saturation={bgSaturation} brightness={bgBrightness} blur={bgBlur} />

          {/* Top Bar inside focus session */}
          <div className="flex items-center justify-between w-full relative z-10">
            <div className={`flex items-center space-x-2 ${isBgDark ? 'text-white' : 'text-[#5c3e43]'}`}>
              <span className="text-xl">🏰</span>
              <div className="text-left">
                <span className={`text-[10px] uppercase font-mono tracking-widest block font-bold ${isBgDark ? 'text-amber-200' : 'text-[#8e6d72]'}`}>Active Manifestation</span>
                <span className={`text-xs font-semibold font-serif ${isBgDark ? 'text-white/95' : 'text-[#4a2e31]'}`}>
                  {language === 'en' ? 'Deep Focus Manifestation Session...' : '正在进行深度专注显化中...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full backdrop-blur-md border text-xs font-bold transition-all shadow-md ${
                  showFilterPanel
                    ? 'bg-[#8e6d72] text-white border-transparent'
                    : isBgDark 
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
                      : 'bg-white/60 hover:bg-white/80 text-[#5c3e43] border-[#8e6d72]/20'
                }`}
                id="immersive-filter-toggle-btn"
                title={language === 'en' ? 'Adjust filter settings' : '调节沉浸背景氛围滤镜'}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{language === 'en' ? '🎛️ Filters' : '🎛️ 氛围滤镜'}</span>
              </button>

              <button
                onClick={handleExitManifestationSession}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full backdrop-blur-md border text-xs font-bold transition-all shadow-md ${
                  isBgDark 
                    ? 'bg-white/15 hover:bg-white/25 text-white border-white/20' 
                    : 'bg-[#8e6d72]/15 hover:bg-[#8e6d72]/25 text-[#5c3e43] border-[#8e6d72]/30'
                }`}
                id="exit-session-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Exit Session' : '退出冥想'}</span>
              </button>
            </div>
          </div>

          {/* Real-time filter panel inside immersive focus */}
          {showFilterPanel && (
            <div className={`mt-4 mx-auto max-w-3xl w-full p-4.5 rounded-[28px] backdrop-blur-xl border shadow-2xl relative z-20 animate-fadeIn ${
              isBgDark ? 'bg-black/40 border-white/15 text-white' : 'bg-white/85 border-[#8e6d72]/20 text-[#4a3a3a]'
            }`} id="immersive-filters-panel">
              <div className="flex items-center justify-between border-b border-[#8e6d72]/15 pb-2 mb-3">
                <div className="text-left">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8e6d72] flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>
                      {language === 'en' ? 'Deep Meditation Calibration' : '冥想深度氛围微调 (Deep Meditation Calibration)'}
                    </span>
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBgSaturation(100);
                    setBgBrightness(100);
                    setBgBlur(0);
                  }}
                  className="text-[9.5px] font-bold px-2 py-1 rounded-lg bg-[#8e6d72]/15 hover:bg-[#8e6d72]/25 border border-[#8e6d72]/15 transition-all text-[#8e6d72]"
                >
                  {language === 'en' ? 'Reset to Default' : '重置原版'}
                </button>
              </div>

              {/* Sliders in single line or row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>{language === 'en' ? 'Saturation' : '饱和度 (Saturation)'}</span>
                    <span className="font-mono text-[10.5px]">{bgSaturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={bgSaturation}
                    onChange={(e) => setBgSaturation(Number(e.target.value))}
                    className="w-full accent-[#8e6d72] cursor-pointer h-1 bg-gray-200/50 rounded-lg"
                  />
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>{language === 'en' ? 'Brightness' : '亮度 (Brightness)'}</span>
                    <span className="font-mono text-[10.5px]">{bgBrightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="5"
                    value={bgBrightness}
                    onChange={(e) => setBgBrightness(Number(e.target.value))}
                    className="w-full accent-[#8e6d72] cursor-pointer h-1 bg-gray-200/50 rounded-lg"
                  />
                </div>

                {/* Blur */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>{language === 'en' ? 'Blur' : '模糊度 (Blur)'}</span>
                    <span className="font-mono text-[10.5px]">{bgBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={bgBlur}
                    onChange={(e) => setBgBlur(Number(e.target.value))}
                    className="w-full accent-[#8e6d72] cursor-pointer h-1 bg-gray-200/50 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Center focus elements */}
          <div className="flex-1 flex flex-col items-center justify-center text-center my-4 max-w-3xl mx-auto space-y-4 md:space-y-6 lg:space-y-8 relative z-10 w-full">
            
            {/* Countdown Timer Control Center */}
            <div className={`backdrop-blur-md border rounded-[28px] px-5 py-3.5 flex flex-col sm:flex-row items-center gap-5 shadow-xl animate-fadeIn ${
              isBgDark 
                ? 'bg-white/10 border-white/20' 
                : 'bg-white/60 border-[#8e6d72]/20 shadow-pink-100/20'
            }`}>
              {/* Timer Display */}
              <div className="flex items-center gap-3">
                <span className="text-xl">⏳</span>
                <div className="text-left">
                  <span className={`text-[9px] uppercase tracking-wider block font-bold font-mono ${isBgDark ? 'text-pink-200' : 'text-[#b49196]'}`}>
                    {language === 'en' ? 'Manifestation Timer' : 'Manifestation Timer • 冥想倒计时'}
                  </span>
                  <span className={`font-mono text-2xl md:text-3xl font-bold tracking-widest ${isBgDark ? 'text-white' : 'text-[#4a3a3a]'}`}>
                    {Math.floor(timerRemaining / 60).toString().padStart(2, '0')}:
                    {(timerRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className={`flex items-center gap-2 sm:border-l sm:pl-5 ${isBgDark ? 'sm:border-white/20' : 'sm:border-[#8e6d72]/20'}`}>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-2.5 rounded-full transition-all duration-300 active:scale-95 shadow-sm ${
                    isBgDark ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-[#8e6d72]/15 hover:bg-[#8e6d72]/25 text-[#8e6d72]'
                  }`}
                  title={isTimerRunning ? (language === 'en' ? "Pause timer" : "暂停倒计时") : (language === 'en' ? "Start timer" : "开始倒计时")}
                  id="timer-play-pause-btn"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setTimerRemaining(timerDuration)}
                  className={`p-2.5 rounded-full transition-all duration-300 active:scale-95 ${
                    isBgDark ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white' : 'bg-[#8e6d72]/10 hover:bg-[#8e6d72]/20 text-[#8e6d72]'
                  }`}
                  title={language === 'en' ? "Reset time" : "重置时间"}
                  id="timer-reset-btn"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Duration presets */}
              <div className={`flex items-center gap-1 p-1 rounded-full border ${isBgDark ? 'bg-black/15 border-white/10' : 'bg-white/80 border-[#8e6d72]/15'}`}>
                {[5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSetTimerDuration(mins)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300 ${
                      timerDuration === mins * 60
                        ? isBgDark 
                          ? 'bg-white text-[#8e6d72] shadow-md font-bold'
                          : 'bg-[#8e6d72] text-white shadow-md font-bold'
                        : isBgDark 
                          ? 'text-white/70 hover:text-white hover:bg-white/5'
                          : 'text-[#8e6d72]/80 hover:text-[#8e6d72] hover:bg-[#8e6d72]/5'
                    }`}
                    id={`timer-preset-${mins}`}
                  >
                    {language === 'en' ? `${mins} Mins` : `${mins}分钟`}
                  </button>
                ))}
              </div>
            </div>

            {/* Breathing Pattern Presets Panel */}
            <div className="w-full max-w-md mx-auto space-y-2 animate-fadeIn">
              <span className={`text-[10px] uppercase font-bold tracking-widest block text-center ${isBgDark ? 'text-pink-200' : 'text-[#8e6d72]'}`}>
                {language === 'en' ? '🧘 Select Breathing Rhythm' : '🧘 冥想呼吸律动选择 (Breathing Patterns)'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 p-1 rounded-2xl border backdrop-blur-md bg-white/20 border-white/10">
                {breathingPatterns.map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => {
                      setSelectedPatternId(pat.id);
                    }}
                    className={`px-2 py-2 rounded-xl text-[10.5px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer hover:scale-[1.02] active:scale-95 ${
                      selectedPatternId === pat.id
                        ? isBgDark
                          ? 'bg-white text-[#8e6d72] shadow-md font-extrabold scale-105'
                          : 'bg-[#8e6d72] text-white shadow-md font-extrabold scale-105'
                        : isBgDark
                          ? 'text-white hover:bg-white/10'
                          : 'text-[#8e6d72] hover:bg-[#8e6d72]/10'
                    }`}
                    title={pat.desc}
                    id={`pattern-btn-${pat.id}`}
                  >
                    <span>{pat.name}</span>
                    <span className="text-[8px] opacity-75 font-mono truncate max-w-full">({pat.code})</span>
                  </button>
                ))}
              </div>

              {/* Special SOHUM 1-min 6 times -> 1-min 5 times Staged Controller */}
              {selectedPatternId === 'sohum' && (
                <div className={`p-3 rounded-2xl border backdrop-blur-md space-y-2 text-center transition-all ${
                  isBgDark ? 'bg-amber-950/30 border-amber-400/30 text-amber-200' : 'bg-amber-50/80 border-amber-200/80 text-amber-900'
                }`}>
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {[
                      { id: 'auto', label: language === 'en' ? '✨ Auto Staged (6/min ➔ 5/min)' : '✨ 智能阶段递进 (1分6次 ➔ 1分5次)' },
                      { id: 'stage1', label: language === 'en' ? '🍃 Stage 1: 6/min (5s/5s)' : '🍃 第1阶段: 6次/分 (5s So/5s Hum)' },
                      { id: 'stage2', label: language === 'en' ? '🌌 Stage 2: 5/min (6s/6s)' : '🌌 第2阶段: 5次/分 (6s So/6s Hum)' },
                    ].map(mode => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSohumStageMode(mode.id as any)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          sohumStageMode === mode.id
                            ? 'bg-amber-600 text-white shadow-xs scale-105'
                            : 'bg-white/40 text-amber-900/80 hover:bg-white/70'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Real-time Staged Progress Indicator */}
                  <div className="flex items-center justify-center gap-2 text-[10.5px] font-mono font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>
                      {sohumCurrentStage === 1 
                        ? (language === 'en' ? `Stage 1: 6 breaths/min (5s/5s) • Breath ${((sohumCycleCount - 1) % 6) + 1}/6` : `当前：第 1 阶段（6次/分 • 5s So吸 / 5s Hum呼 • 第 ${((sohumCycleCount - 1) % 6) + 1}/6 次呼吸）`)
                        : (language === 'en' ? `Stage 2: 5 breaths/min (6s/6s) • Deep Resonance ${((sohumCycleCount - 1) % 5) + 1}/5` : `当前：第 2 阶段（5次/分 • 6s So吸 / 6s Hum呼 • 第 ${((sohumCycleCount - 1) % 5) + 1}/5 次深度同频）`)
                      }
                    </span>
                  </div>
                </div>
              )}

              <p className={`text-[10px] text-center italic ${isBgDark ? 'text-pink-200/70' : 'text-[#8e6d72]/70'}`}>
                ✨ {breathingPatterns.find(p => p.id === selectedPatternId)?.desc}
              </p>
            </div>

            {/* Breathing Guide and Chakra Visualizer Side-by-Side Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch justify-center animate-fadeIn">
              
              {/* Left Side: Breathing Guide */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
                {/* Visual Breathing Nodes / Steps */}
                <div className={`flex flex-wrap items-center justify-center gap-2 md:gap-3 border rounded-2xl px-3 md:px-4 py-1.5 md:py-2 shadow-inner backdrop-blur-sm w-full ${
                  isBgDark ? 'bg-white/5 border-white/10' : 'bg-white/40 border-[#8e6d72]/15'
                }`}>
                  {/* 1. 吸气 Inhale */}
                  <div className={`flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[11px] md:text-xs transition-all duration-500 ${
                    breathingPhase === 'inhale'
                      ? 'bg-pink-400/30 text-pink-700 dark:text-pink-200 border border-pink-300/40 font-bold scale-105 shadow-md shadow-pink-300/10'
                      : isBgDark ? 'text-white/40 border border-transparent' : 'text-[#8e6d72]/40 border border-transparent'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      breathingPhase === 'inhale' 
                        ? 'bg-pink-500 dark:bg-pink-300 animate-ping' 
                        : isBgDark ? 'bg-white/20' : 'bg-[#8e6d72]/20'
                    }`} />
                    <span>
                      {language === 'en' ? 'Inhale' : '吸气'}{' '}
                      {breathingPhase === 'inhale' ? `${breathingCountdown}s` : `${currentPattern.inhale}s`}
                    </span>
                  </div>
                  <div className={`w-2.5 h-[1px] ${isBgDark ? 'bg-white/10' : 'bg-[#8e6d72]/10'}`}></div>

                  {/* 2. 吸气后屏息 Hold In */}
                  <div className={`flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[11px] md:text-xs transition-all duration-500 ${
                    breathingPhase === 'holdIn'
                      ? 'bg-amber-400/30 text-amber-800 dark:text-amber-200 border border-amber-300/40 font-bold scale-105 shadow-md shadow-amber-300/10'
                      : isBgDark ? 'text-white/40 border border-transparent' : 'text-[#8e6d72]/40 border border-transparent'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      breathingPhase === 'holdIn' 
                        ? 'bg-amber-600 dark:bg-amber-300 animate-ping' 
                        : isBgDark ? 'bg-white/20' : 'bg-[#8e6d72]/20'
                    }`} />
                    <span>
                      {language === 'en' ? 'Hold' : '屏息'}{' '}
                      {breathingPhase === 'holdIn' ? `${breathingCountdown}s` : `${currentPattern.holdIn}s`}
                    </span>
                  </div>
                  <div className={`w-2.5 h-[1px] ${isBgDark ? 'bg-white/10' : 'bg-[#8e6d72]/10'}`}></div>

                  {/* 3. 呼气 Exhale */}
                  <div className={`flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[11px] md:text-xs transition-all duration-500 ${
                    breathingPhase === 'exhale'
                      ? 'bg-sky-400/30 text-sky-800 dark:text-sky-200 border border-sky-300/40 font-bold scale-105 shadow-md shadow-sky-300/10'
                      : isBgDark ? 'text-white/40 border border-transparent' : 'text-[#8e6d72]/40 border border-transparent'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      breathingPhase === 'exhale' 
                        ? 'bg-sky-600 dark:bg-sky-300 animate-ping' 
                        : isBgDark ? 'bg-white/20' : 'bg-[#8e6d72]/20'
                    }`} />
                    <span>
                      {language === 'en' ? 'Exhale' : '呼气'}{' '}
                      {breathingPhase === 'exhale' ? `${breathingCountdown}s` : `${currentPattern.exhale}s`}
                    </span>
                  </div>

                  {/* 4. 呼气后屏息 Hold Out (only shown for Box breathing patterns) */}
                  {currentPattern.holdOut > 0 && (
                    <>
                      <div className={`w-2.5 h-[1px] ${isBgDark ? 'bg-white/10' : 'bg-[#8e6d72]/10'}`}></div>
                      <div className={`flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[11px] md:text-xs transition-all duration-500 ${
                        breathingPhase === 'holdOut'
                          ? 'bg-purple-400/30 text-purple-800 dark:text-purple-200 border border-purple-300/40 font-bold scale-105 shadow-md shadow-purple-300/10'
                          : isBgDark ? 'text-white/40 border border-transparent' : 'text-[#8e6d72]/40 border border-transparent'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          breathingPhase === 'holdOut' 
                            ? 'bg-purple-600 dark:bg-purple-300 animate-ping' 
                            : isBgDark ? 'bg-white/20' : 'bg-[#8e6d72]/20'
                        }`} />
                        <span>
                          {language === 'en' ? 'Hold' : '屏息'}{' '}
                          {breathingPhase === 'holdOut' ? `${breathingCountdown}s` : `${currentPattern.holdOut}s`}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Interactive Breathing Ring Card */}
                <div className={`flex flex-col items-center justify-center p-6 rounded-3xl border w-full flex-grow backdrop-blur-md shadow-sm transition-all duration-1000 ${
                  isBgDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-[#8e6d72]/20'
                }`}>
                  <BreathingRingWithParticles
                    language={language}
                    breathingPhase={breathingPhase}
                    breathingCountdown={breathingCountdown}
                    breathingText={breathingText}
                    isBgDark={isBgDark}
                    patternType={selectedPatternId}
                    sohumStage={sohumCurrentStage}
                    cycleText={selectedPatternId === 'sohum' ? (sohumCurrentStage === 1 ? `第 ${((sohumCycleCount - 1) % 6) + 1} / 6 次呼吸` : `第 ${((sohumCycleCount - 1) % 5) + 1} / 5 次呼吸`) : undefined}
                    mantraSubtext={selectedPatternId === 'sohum' ? (sohumCurrentStage === 1 ? 'Sah Aham • 我即是彼' : 'Sah Aham • 万物合一') : undefined}
                  />
                  <p className={`text-xs tracking-wide font-medium text-center mt-3 ${isBgDark ? 'text-white/70' : 'text-[#6d5b5e]'}`}>
                    {language === 'en' ? 'Regulate breath, empty thoughts, connect with the cosmic field' : '调匀呼吸，放空思绪，连接宇宙能量场'}
                  </p>
                </div>
              </div>

              {/* Right Side: Dynamic Chakra & Central Channel Visualizer */}
              <div className="lg:col-span-7 flex w-full">
                <ChakraVisualizer
                  language={language}
                  breathingPhase={breathingPhase}
                  breathingCountdown={breathingCountdown}
                  isBgDark={isBgDark}
                  currentPattern={currentPattern}
                />
              </div>
            </div>

            {/* Immersive Text details */}
            <div className="space-y-3 md:space-y-4 px-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <h2 className={`text-xl md:text-2xl lg:text-3xl font-serif font-bold tracking-wide transition-colors duration-1000 ${
                  isBgDark ? 'text-white text-shadow text-left' : 'text-[#4a2e31] text-shadow-sm text-left'
                }`}>
                  {activeWishSession.title}
                </h2>
                
                {/* Language Toggles inside immersive view */}
                {activeWishSession.visualizationDetails && (
                  <div className={`flex items-center gap-1 p-0.5 rounded-xl border backdrop-blur-md shrink-0 ${
                    isBgDark ? 'bg-white/10 border-white/15' : 'bg-white/80 border-[#8e6d72]/25'
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSessionLang('zh');
                        setSpeakingStartIndex(null);
                        const text = activeWishSession.visualizationDetails || activeWishSession.details;
                        if (isSpeaking || isSpeakingLoading) {
                          handleSpeakText(text);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeSessionLang === 'zh'
                          ? isBgDark ? 'bg-white text-[#8e6d72] font-extrabold shadow-sm' : 'bg-[#8e6d72] text-white font-extrabold shadow-sm'
                          : isBgDark ? 'text-white/70 hover:text-white' : 'text-[#8e6d72]/80 hover:text-[#8e6d72]'
                      }`}
                    >
                      {language === 'en' ? '🇨🇳 Chinese Scene' : '🇨🇳 中文景像'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSessionLang('en');
                        setSpeakingStartIndex(null);
                        const text = activeWishSession.visualizationDetailsEn || activeWishSession.visualizationDetails || activeWishSession.details;
                        if (isSpeaking || isSpeakingLoading) {
                          handleSpeakText(text);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeSessionLang === 'en'
                          ? isBgDark ? 'bg-white text-[#8e6d72] font-extrabold shadow-sm' : 'bg-[#8e6d72] text-white font-extrabold shadow-sm'
                          : isBgDark ? 'text-white/70 hover:text-white' : 'text-[#8e6d72]/80 hover:text-[#8e6d72]'
                      }`}
                    >
                      {language === 'en' ? '🇬🇧 English Scene' : '🇬🇧 英文景象'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className={`p-4 md:p-6 rounded-[28px] backdrop-blur-xl shadow-2xl text-left max-h-[160px] md:max-h-[260px] lg:max-h-[340px] overflow-y-auto custom-scrollbar border transition-all duration-1000 ${
                isBgDark 
                  ? 'bg-black/25 border-white/15' 
                  : 'bg-white/70 border-[#8e6d72]/20 shadow-pink-100/10'
              }`}>
                {/* Subtle Interactive Instruction */}
                <div className={`text-[10px] tracking-wider mb-2.5 font-bold flex items-center gap-1.5 opacity-85 ${isBgDark ? 'text-pink-200' : 'text-[#8e6d72]'}`}>
                  <span>
                    {language === 'en' 
                      ? '💡 Tip: Click any sentence below to start narration from that sentence' 
                      : '💡 交互提示：点击下方文字中的任意句子，即可从该句开始定位朗读'}
                  </span>
                </div>

                <p className={`text-xs md:text-sm leading-relaxed tracking-wider font-sans indent-6 transition-colors duration-1000 whitespace-pre-wrap ${
                  isBgDark ? 'text-pink-50/90' : 'text-[#5c3e43] font-medium'
                }`}>
                  {(() => {
                    const fullText = activeSessionLang === 'zh'
                      ? (activeWishSession.visualizationDetails || activeWishSession.details)
                      : (activeWishSession.visualizationDetailsEn || (language === 'en' ? '[Please click "Re-sensitize Luxury Details" in the card to activate English scenario]' : '【请在愿望卡片中，点击“重新感应奢华细节”以激活专属英文沉浸式场景】'));

                    const segments = getSentenceSegments(fullText);
                    return segments.map((segment, index) => {
                      const isSelected = isSpeaking && speakingStartIndex === segment.startIndex;
                      return (
                        <span
                          key={index}
                          onClick={() => {
                            setSpeakingStartIndex(segment.startIndex);
                            handleSpeakText(segment.fullTextFromHere);
                          }}
                          className={`cursor-pointer rounded px-0.5 transition-all duration-300 ${
                            isSelected
                              ? 'bg-pink-500/25 dark:bg-pink-400/25 text-pink-700 dark:text-pink-100 ring-1 ring-pink-400/40 font-bold shadow-sm'
                              : isBgDark
                                ? 'hover:bg-white/10 hover:text-white'
                                : 'hover:bg-[#8e6d72]/10 hover:text-[#5c3e43]'
                          }`}
                          title={language === 'en' ? '🖱️ Click to start narration from here' : '🖱️ 点击从此句开始定位朗读'}
                        >
                          {isSelected && (
                            <span className="inline-flex items-center text-pink-500 dark:text-pink-300 mr-1 animate-pulse">
                              🔊
                            </span>
                          )}
                          {segment.text}
                        </span>
                      );
                    });
                  })()}
                </p>
              </div>
            </div>

            {/* Speaking voice status & Tone Adjustment Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {/* Speaking voice status & Tone Adjustment Controls */}
              <div className="flex flex-col items-center space-y-3 bg-white/15 dark:bg-black/25 backdrop-blur-md p-4 rounded-[24px] border border-white/15 w-full shadow-lg">
                <div className="flex items-center justify-between w-full border-b border-white/10 pb-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${isBgDark ? 'text-pink-200' : 'text-[#8e6d72]'}`}>
                    {language === 'en' ? '🗣️ Narration Voice Control' : '🗣️ 智能显化配音调节 (Narration Voice)'}
                  </span>
                  {isSpeakingLoading && (
                    <span className="text-[9.5px] text-pink-400 font-bold animate-pulse flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-pink-400 animate-ping"></span>
                      {language === 'en' ? 'Loading voice...' : '正在载入中...'}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  {[
                    { id: 'deep-female', name: language === 'en' ? 'Serene Deep Female 🪐' : '静谧深沉女声 🪐', desc: 'Serene Deep' },
                    { id: 'royal-lady', name: language === 'en' ? 'Gentle Elegant Lady 👑' : '温婉贵族女声 👑', desc: 'Royal Elegant' },
                    { id: 'magnetic-male', name: language === 'en' ? 'Magnetic Ancient Male 🌌' : '古雅磁性男声 🌌', desc: 'Magnetic Deep' },
                    { id: 'grounding-male', name: language === 'en' ? 'Healing Grounding Male 🧘' : '低频疗愈男声 🧘', desc: 'Grounding Low' },
                  ].map((tone) => (
                    <button
                      key={tone.id}
                      onClick={async () => {
                        setVoiceTone(tone.id as any);
                        // If speaking, immediately cross-fade and speak with the new tone
                        const textToRead = activeSessionLang === 'zh'
                          ? (activeWishSession.visualizationDetails || activeWishSession.details)
                          : (activeWishSession.visualizationDetailsEn || activeWishSession.visualizationDetails || activeWishSession.details);
                        if ((isSpeaking || isSpeakingLoading) && textToRead) {
                          handleSpeakText(textToRead, tone.id as any);
                        }
                      }}
                      className={`py-1.5 rounded-xl text-center text-[10.5px] transition-all duration-300 border flex flex-col items-center justify-center ${
                        voiceTone === tone.id
                          ? 'bg-white text-[#8e6d72] border-white shadow-sm font-bold scale-[1.02]'
                          : isBgDark
                            ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                            : 'bg-white/40 border-[#8e6d72]/10 text-[#4a3a3a] hover:bg-white/60'
                      }`}
                      id={`immersive-tone-${tone.id}`}
                    >
                      <span className="font-semibold">{tone.name}</span>
                      <span className="text-[7.5px] opacity-70 font-mono tracking-wider">{tone.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5 w-full pt-1">
                  <button
                    onClick={() => {
                      const textToRead = activeSessionLang === 'zh'
                        ? (activeWishSession.visualizationDetails || activeWishSession.details)
                        : (activeWishSession.visualizationDetailsEn || activeWishSession.visualizationDetails || activeWishSession.details);
                      if (isSpeaking || isSpeakingLoading) {
                        handleStopSpeaking();
                      } else if (textToRead) {
                        handleSpeakText(textToRead);
                      }
                    }}
                    disabled={isSpeakingLoading}
                    className={`flex-1 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer ${
                      isSpeaking 
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
                        : isSpeakingLoading
                          ? 'bg-[#8e6d72]/40 text-white/50 cursor-not-allowed'
                          : isBgDark 
                            ? 'bg-white/15 text-white hover:bg-white/25 border border-white/20' 
                            : 'bg-[#8e6d72] text-white hover:bg-[#8e6d72]/90 border border-transparent'
                    }`}
                    id="immersive-tts-toggle-btn"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>
                      {isSpeaking 
                        ? (language === 'en' ? 'Mute Voice Narration' : '静音语音朗读') 
                        : isSpeakingLoading 
                          ? (language === 'en' ? 'Preparing voice waves...' : '声波准备中...') 
                          : (language === 'en' ? 'Play Voice Narration' : '播放深沉女声朗读')}
                    </span>
                  </button>
                </div>
              </div>

              {/* 🌌 冥想背景声波控制 */}
              <div className="flex flex-col space-y-3 bg-white/15 dark:bg-black/25 backdrop-blur-md p-4 rounded-[24px] border border-white/15 w-full shadow-lg text-left justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between w-full border-b border-white/10 pb-1.5">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${isBgDark ? 'text-pink-200' : 'text-[#8e6d72]'}`}>
                      {language === 'en' ? '🌌 Meditation Background Acoustics' : '🌌 冥想背景声波设置 (Acoustics)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsBackgroundAudioEnabled(!isBackgroundAudioEnabled)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-95 ${
                        isBackgroundAudioEnabled
                          ? isBgDark
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-emerald-500/15 text-emerald-800 border-emerald-500/20'
                          : isBgDark
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-rose-500/10 text-rose-800 border-rose-500/20'
                      }`}
                      title={isBackgroundAudioEnabled ? (language === 'en' ? "Mute background" : "静音背景音") : (language === 'en' ? "Enable background" : "开启背景音")}
                      id="master-background-audio-toggle"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isBackgroundAudioEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                      <span>
                        {language === 'en' 
                          ? `Acoustics: ${isBackgroundAudioEnabled ? 'ON' : 'MUTED'}` 
                          : `背景音: ${isBackgroundAudioEnabled ? '开启' : '静音'}`}
                      </span>
                    </button>
                  </div>

                  {!isBackgroundAudioEnabled && (
                    <div className={`p-2 rounded-xl text-[9.5px] leading-relaxed transition-all animate-fadeIn ${
                      isBgDark ? 'bg-rose-500/10 text-rose-200/90 border border-rose-500/20' : 'bg-rose-500/5 text-rose-900/90 border border-rose-500/10'
                    }`}>
                      {language === 'en' 
                        ? '✨ Background audio is currently muted in this breathing phase. Toggle ON to immerse in environment ambient sounds or Solfeggio frequency waves.'
                        : '✨ 背景音已在当前呼吸环节中静音。开启后即可沉浸于“纯粹环境音”或“频率引导音”，进入深层显化磁场。'}
                    </div>
                  )}

                  <div className={`grid grid-cols-2 p-0.5 rounded-xl border backdrop-blur-md ${
                    isBgDark ? 'bg-white/10 border-white/15' : 'bg-white/80 border-[#8e6d72]/25'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setMeditationSoundType('ambient')}
                      className={`py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        meditationSoundType === 'ambient'
                          ? isBgDark ? 'bg-white text-[#8e6d72] shadow-sm font-extrabold' : 'bg-[#8e6d72] text-white shadow-sm font-extrabold'
                          : isBgDark ? 'text-white/70 hover:text-white' : 'text-[#8e6d72]/80 hover:text-[#8e6d72]'
                      }`}
                    >
                      {language === 'en' ? '🎵 Ambient Sound' : '🎵 纯粹环境音'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeditationSoundType('solfeggio')}
                      className={`py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        meditationSoundType === 'solfeggio'
                          ? isBgDark ? 'bg-white text-[#8e6d72] shadow-sm font-extrabold' : 'bg-[#8e6d72] text-white shadow-sm font-extrabold'
                          : isBgDark ? 'text-white/70 hover:text-white' : 'text-[#8e6d72]/80 hover:text-[#8e6d72]'
                      }`}
                    >
                      {language === 'en' ? '🧠 Solfeggio Frequency' : '🧠 频率引导音'}
                    </button>
                  </div>

                  {meditationSoundType === 'ambient' ? (
                    <div className="space-y-1 bg-white/5 dark:bg-black/10 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-[10.5px] font-semibold">
                        <span className={isBgDark ? 'text-white/80' : 'text-[#4a3a3a]'}>
                          {language === 'en' ? 'Ambient Volume' : '环境伴奏音量'}
                        </span>
                        <span className="font-mono text-[10px]">{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isBgDark ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-[#8e6d72]/15 hover:bg-[#8e6d72]/25 text-[#8e6d72]'
                          }`}
                          title={isMusicPlaying ? (language === 'en' ? "Pause ambient sound" : "暂停环境音") : (language === 'en' ? "Play ambient sound" : "播放环境音")}
                        >
                          {isMusicPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={musicVolume}
                          onChange={(e) => setMusicVolume(Number(e.target.value))}
                          className="w-full accent-[#8e6d72] h-1 bg-gray-200/40 rounded-lg cursor-pointer animate-fadeIn"
                        />
                      </div>
                      <div className="text-[9px] text-[#b49196] font-medium leading-tight truncate mt-1">
                        {language === 'en' ? 'Current Track: ' : '当前音轨: '}
                        {language === 'en' && currentTrack.nameEn ? currentTrack.nameEn : currentTrack.name}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="space-y-1 bg-white/5 dark:bg-black/10 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between text-[10.5px] font-semibold">
                          <span className={isBgDark ? 'text-white/80' : 'text-[#4a3a3a]'}>
                            {language === 'en' ? 'Solfeggio Volume' : '频率声波强度'}
                          </span>
                          <span className="font-mono text-[10px]">{Math.round(solfeggioVolume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={solfeggioVolume}
                          onChange={(e) => setSolfeggioVolume(Number(e.target.value))}
                          className="w-full accent-[#8e6d72] h-1 bg-gray-200/40 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className={`text-[9px] uppercase font-bold tracking-wider block ${isBgDark ? 'text-pink-200/80' : 'text-[#8e6d72]/80'}`}>
                          {language === 'en' ? 'Select Resonance Frequency' : '选择宇宙显化频段 (Solfeggio)'}
                        </span>
                        <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-0.5">
                          {[
                            {
                              hz: 432,
                              emoji: '🌌',
                              title: language === 'en' ? '432 Hz Cosmic Resonance' : '432 Hz 宇宙共振',
                              desc: language === 'en' ? 'Heal mind & body, empty thoughts' : '疗愈身心，放空思绪'
                            },
                            {
                              hz: 528,
                              emoji: '✨',
                              title: language === 'en' ? '528 Hz Miracle Transformation' : '528 Hz 奇迹转化',
                              desc: language === 'en' ? 'Cell resonance, manifest miracles' : '细胞共振，显化奇迹'
                            },
                            {
                              hz: 396,
                              emoji: '🧘',
                              title: language === 'en' ? '396 Hz Deep Liberation' : '396 Hz 深度释怀',
                              desc: language === 'en' ? 'Clear fear, unlock security' : '清洗恐惧，打通安全感'
                            },
                            {
                              hz: 639,
                              emoji: '💖',
                              title: language === 'en' ? '639 Hz Elegant Love Resonance' : '639 Hz 极奢爱共振',
                              desc: language === 'en' ? 'Open Heart chakra, manifest harmony' : '打开心轮，显化贵人'
                            },
                            {
                              hz: 963,
                              emoji: '👑',
                              title: language === 'en' ? '963 Hz Crown Pure Consciousness' : '963 Hz 神性纯意识',
                              desc: language === 'en' ? 'Connect Crown chakra, high dimension' : '连接顶轮，高维显化'
                            }
                          ].map((freq) => (
                            <button
                              key={freq.hz}
                              type="button"
                              onClick={() => setSolfeggioFrequency(freq.hz)}
                              className={`p-1.5 rounded-xl text-left text-[10px] transition-all border flex items-center justify-between gap-1.5 cursor-pointer ${
                                solfeggioFrequency === freq.hz
                                  ? 'bg-white text-[#8e6d72] border-white shadow-sm font-bold scale-[1.01]'
                                  : isBgDark
                                    ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                                    : 'bg-white/40 border-[#8e6d72]/10 text-[#4a3a3a] hover:bg-white/60'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-xs shrink-0">{freq.emoji}</span>
                                <div className="truncate">
                                  <span className="font-bold block leading-tight">{freq.title}</span>
                                  <span className="text-[8px] opacity-75 block font-normal leading-tight truncate">{freq.desc}</span>
                                </div>
                              </div>
                              <span className="font-mono text-[9px] shrink-0 bg-[#8e6d72]/10 px-1 py-0.5 rounded border border-[#8e6d72]/15">{freq.hz}Hz</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Ambient reassurance */}
          <div className={`flex flex-col md:flex-row items-center justify-between w-full border-t pt-4 relative z-10 text-xs space-y-2 md:space-y-0 font-medium ${
            isBgDark ? 'border-white/20 text-white/70' : 'border-[#8e6d72]/20 text-[#6d5b5e]'
          }`}>
            <span>
              {language === 'en' 
                ? '🌸 Every beautiful moment is recorded in your peaceful river of life' 
                : '🌸 每一个美好的瞬间，都已经记载在您的生命长河里'}
            </span>
            <div className="flex items-center space-x-4">
              <span>
                {language === 'en' ? 'Ambient Track: ' : '背景乐: '}
                {language === 'en' && currentTrack.nameEn ? currentTrack.nameEn : currentTrack.name}
              </span>
              <span>•</span>
              <span>
                {language === 'en' ? 'Color Palette: ' : '主色调: '}
                {language === 'en' && activeTheme.nameEn ? activeTheme.nameEn : activeTheme.name}
              </span>
            </div>
          </div>

          {/* MEDITATION FINISHED CELESTIAL OVERLAY */}
          {showFinishedOverlay && (
            <div className="absolute inset-0 z-50 bg-[#8e6d72]/45 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-6 md:p-8 overflow-y-auto animate-fadeIn" id="finished-overlay">
              <div className="bg-white/95 max-w-lg p-6 md:p-10 rounded-[40px] border border-white/60 shadow-2xl flex flex-col items-center space-y-5 md:space-y-6 my-auto">
                <span className="text-4xl md:text-5xl animate-bounce">🦢</span>
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#8e6d72] tracking-wide">
                    {language === 'en' ? 'Manifestation Fulfilled • Walk with Grace' : '显化圆满 • 怀恩前行'}
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-[#b49196] font-bold block font-mono">Completed & Blessed</span>
                </div>
                
                <div className="w-12 h-[1.5px] bg-[#8e6d72]/20"></div>

                {/* Subconscious resonance message */}
                <p className="text-xs md:text-sm text-[#6d5b5e] leading-relaxed tracking-wider font-sans">
                  {language === 'en'
                    ? 'Your subconsciousness has deeply resonated with high-frequency cosmic energies. Thank yourself for this moment of absolute peace; all the dignity, abundance, and ultimate beauty you conceive are floating gently into your destiny.'
                    : '您的潜意识已与高维能量深度共振。感谢自己这一刻的全然静默，凡您心中所构想的尊贵、富饶与至美，皆在以不可抗拒之势徐徐向您走来。'}
                </p>

                {/* Dynamic Gratitude Whisper Block */}
                {selectedGratitudeWhisper && (
                  <div className="w-full bg-[#ffe4e9]/30 rounded-3xl p-4 md:p-5 border border-white shadow-inner text-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8e6d72]/70 block mb-2">
                      {language === 'en' ? '✨ Cosmic Gratitude Whisper' : '✨ 宇宙感恩密语 • Cosmic Gratitude'}
                    </span>
                    <blockquote className="font-serif italic text-xs md:text-sm text-[#8e6d72] leading-relaxed">
                      “ {selectedGratitudeWhisper} ”
                    </blockquote>
                  </div>
                )}

                {/* Gratitude checklist/rituals */}
                <div className="w-full text-left space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8e6d72]/70 block text-center mb-1">
                    {language === 'en' ? '🧘 Gratitude Integration Ritual' : '🧘 感恩当下三部曲 • Gratitude Integration'}
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {language === 'en' ? (
                      <>
                        <div className="flex items-start gap-2 text-xs text-[#6d5b5e]">
                          <span className="text-[#8e6d72] font-serif font-bold text-sm leading-none mt-0.5">🌸</span>
                          <span><strong>Close eyes, cover heart</strong>: Smile inward, genuinely thank yourself for your patient presence.</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-[#6d5b5e]">
                          <span className="text-[#8e6d72] font-serif font-bold text-sm leading-none mt-0.5">🦢</span>
                          <span><strong>Be grateful for all life</strong>: Thank every ray of light and love, purifying your soul field.</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-[#6d5b5e]">
                          <span className="text-[#8e6d72] font-serif font-bold text-sm leading-none mt-0.5">✨</span>
                          <span><strong>Carry ultimate deservingness</strong>: Believe that everything beautiful you desire is already embracing you.</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-2 text-xs text-[#6d5b5e]">
                          <span className="text-[#8e6d72] font-serif font-bold text-sm leading-none mt-0.5">🌸</span>
                          <span><strong>微闭双眸，双手覆心</strong>：向内微笑，由衷感谢自己的专注陪伴与包容。</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-[#6d5b5e]">
                          <span className="text-[#8e6d72] font-serif font-bold text-sm leading-none mt-0.5">🦢</span>
                          <span><strong>对当下万物心存感激</strong>：感恩已拥有的每一丝爱，使您的灵魂更纯净磁满。</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-[#6d5b5e]">
                          <span className="text-[#8e6d72] font-serif font-bold text-sm leading-none mt-0.5">✨</span>
                          <span><strong>带着极致配得感出发</strong>：相信凡你渴望之极美，早已在未来向你张开双臂。</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleExitManifestationSession}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8e6d72] hover:bg-[#8e6d72]/90 text-white font-bold text-xs transition-all shadow-lg hover:scale-105 active:scale-95"
                  id="finished-exit-btn"
                >
                  {language === 'en' ? 'Return with Gratitude & Abundance' : '带着无尽感恩与丰盛回归'}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* User Cloud Login / Sync Modal */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
        }}
      />

      {/* Footer credits */}
      <footer className="text-center py-12 text-xs font-mono tracking-wider border-t border-white/30 mt-12 bg-white/15 backdrop-blur-md text-[#8e6d72]">
        <p className="font-serif text-sm font-bold">
          {language === 'en' ? '🦢 LUMIÈRE MANIFEST • Princess Royal Luxury Manifestation Oasis' : '🦢 LUMIÈRE MANIFEST • 公主风奢华显化小屋'}
        </p>
        <p className="mt-1.5 text-[10px] text-[#b49196]/80 font-semibold uppercase tracking-widest">
          {language === 'en' 
            ? 'Powered by Gemini Intelligent Acoustics TTS & Generative Subconscious Mind' 
            : 'Powered by Gemini Intelligent Acoustics TTS & Generative Subconscious Mind'}
        </p>
      </footer>
    </div>
  );
}
