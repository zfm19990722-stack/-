export interface Wish {
  id: string;
  title: string;
  category: 'love' | 'wealth' | 'beauty' | 'career' | 'lifestyle';
  details: string; // User description
  visualizationDetails?: string; // AI enhanced luxurious details
  visualizationDetailsEn?: string; // AI enhanced English luxurious details
  isManifested: boolean;
  createdAt: string;
}

export interface Affirmation {
  id: string;
  text: string;
  translation?: string;
  category: string;
  source?: string;
}

export interface VoiceConfig {
  voiceName: 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';
  speed: number;
}

export interface MusicTrack {
  id: string;
  name: string;
  nameEn?: string;
  url: string;
  isCustom?: boolean;
}

export type VisualBackgroundType = 'sparkling-sky' | 'royal-garden' | 'glowing-crystal' | 'dreamy-cloud';

export interface VisualBackground {
  id: VisualBackgroundType;
  name: string;
  nameEn?: string;
  emoji: string;
  primaryColor: string; // e.g. #FFF5F5
  secondaryColor: string; // e.g. #FFE3E3
  textColor: string;
  glowColor: string;
}
