import type { Achievement, Rarity } from "./types";

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; ring: string; glow: string }
> = {
  common: {
    label: "Common",
    color: "text-rarity-common",
    ring: "ring-rarity-common/40",
    glow: "shadow-[0_0_30px_-10px_rgba(156,163,175,0.5)]",
  },
  rare: {
    label: "Rare",
    color: "text-rarity-rare",
    ring: "ring-rarity-rare/50",
    glow: "shadow-[0_0_30px_-8px_rgba(59,130,246,0.8)]",
  },
  epic: {
    label: "Epic",
    color: "text-rarity-epic",
    ring: "ring-rarity-epic/60",
    glow: "shadow-[0_0_36px_-6px_rgba(168,85,247,0.9)]",
  },
  legendary: {
    label: "Legendary",
    color: "text-rarity-legendary",
    ring: "ring-rarity-legendary/70",
    glow: "shadow-[0_0_40px_-4px_rgba(245,158,11,1)]",
  },
  mythic: {
    label: "Mythic",
    color: "text-rarity-mythic",
    ring: "ring-rarity-mythic/80",
    glow: "shadow-[0_0_48px_-2px_rgba(236,72,153,1)]",
  },
};

// Catalog: locked by default. Unlocking sets `unlockedAt`.
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    title: "First Step",
    description: "Complete your very first quest.",
    rarity: "common",
    icon: "Footprints",
  },
  {
    id: "xp_100",
    title: "First 100 XP",
    description: "Earn your first 100 XP.",
    rarity: "common",
    icon: "Zap",
  },
  {
    id: "xp_1000",
    title: "Rising Force",
    description: "Reach 1,000 lifetime XP.",
    rarity: "rare",
    icon: "Sparkles",
  },
  {
    id: "xp_10000",
    title: "Ascendant",
    description: "Reach 10,000 lifetime XP.",
    rarity: "legendary",
    icon: "Crown",
  },
  {
    id: "level_5",
    title: "Awakened",
    description: "Reach level 5.",
    rarity: "common",
    icon: "ArrowUpCircle",
  },
  {
    id: "level_10",
    title: "Forged",
    description: "Reach level 10.",
    rarity: "rare",
    icon: "Hammer",
  },
  {
    id: "level_25",
    title: "Unstoppable",
    description: "Reach level 25.",
    rarity: "epic",
    icon: "Flame",
  },
  {
    id: "streak_3",
    title: "Momentum",
    description: "Maintain a 3-day streak.",
    rarity: "common",
    icon: "Flame",
  },
  {
    id: "streak_7",
    title: "Weekly Warrior",
    description: "Maintain a 7-day streak.",
    rarity: "rare",
    icon: "CalendarCheck",
  },
  {
    id: "streak_30",
    title: "Discipline Master",
    description: "Maintain a 30-day streak.",
    rarity: "epic",
    icon: "Trophy",
  },
  {
    id: "streak_100",
    title: "Iron Will",
    description: "Maintain a 100-day streak.",
    rarity: "legendary",
    icon: "Shield",
  },
  {
    id: "streak_365",
    title: "Mythic Devotion",
    description: "One year. Unbroken.",
    rarity: "mythic",
    icon: "Infinity",
  },
  {
    id: "first_goal",
    title: "First Completed Goal",
    description: "Complete your first epic quest.",
    rarity: "rare",
    icon: "Target",
  },
  {
    id: "perfect_day",
    title: "Perfect Day",
    description: "Complete every daily quest in a single day.",
    rarity: "epic",
    icon: "Sun",
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Complete a quest after midnight.",
    rarity: "rare",
    icon: "Moon",
    hidden: true,
  },
  {
    id: "early_bird",
    title: "Early Bird",
    description: "Complete a quest before 7am.",
    rarity: "rare",
    icon: "Sunrise",
    hidden: true,
  },
];

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
