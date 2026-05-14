export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type CharacterClass = "warrior" | "sage" | "monk" | "creator" | "explorer";

export type StatKey = "discipline" | "strength" | "mind" | "soul" | "social";

export interface Character {
  name: string;
  class: CharacterClass;
  avatarSeed: string; // for generative gradient avatar
  stats: Record<StatKey, number>;
  createdAt: number;
}

export interface Quest {
  id: string;
  title: string; // English fallback / legacy display
  titleKey?: string; // i18n key (preferred when present)
  description?: string;
  xp: number;
  stat: StatKey;
  difficulty: "easy" | "medium" | "hard" | "epic";
  category: "daily" | "weekly" | "epic";
  completedAt?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  icon: string; // lucide icon name (string key)
  unlockedAt?: number;
  hidden?: boolean;
}

export interface StreakState {
  current: number;
  best: number;
  lastActiveDay: string | null; // YYYY-MM-DD
  freezes: number; // available freezes
  lastFreezeUsed?: string | null;
}

export interface CoachMessage {
  id: string;
  role: "user" | "coach" | "system";
  content: string;
  createdAt: number;
}

export type EvolutionTier =
  | "broken"
  | "initiate"
  | "disciplined"
  | "ascending"
  | "elite"
  | "mythic";

export type CoachMood =
  | "calm_mentor"
  | "disciplined_commander"
  | "aggressive_motivator"
  | "reflective_analyst";

export interface ComboState {
  count: number;
  lastCompletedAt: number | null;
  multiplier: number; // 1.0, 1.25, 1.5, 2.0
}

export interface EnergyState {
  value: number; // 0-100
  lastUpdatedAt: number;
}

export interface DailyReward {
  day: number; // 1..7 (rotating)
  kind: "xp" | "freeze" | "boost" | "cosmetic";
  amount?: number;
  label: string;
}

export interface HistoryEntry {
  day: string; // YYYY-MM-DD
  xp: number; // xp gained that day
  quests: number; // quests completed that day
  focusMinutes?: number; // optional
}

export interface PrestigeState {
  level: number; // prestige rank, starts at 0
  unlockedAt?: number;
}

export type Language = "en" | "ru" | "de";
