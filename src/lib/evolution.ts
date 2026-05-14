import type { EvolutionTier } from "./types";

export interface TierMeta {
  id: EvolutionTier;
  title: string;
  minLevel: number;
  minStreak: number;
  // visual identity
  auraColors: [string, string, string]; // 3-stop conic
  ringColor: string;
  glow: string; // tailwind shadow string
  textColor: string; // accent class
  particleColor: string;
  tagline: string;
}

// Tier is unlocked when EITHER level OR streak crosses threshold; we take the highest unlocked.
export const TIERS: TierMeta[] = [
  {
    id: "broken",
    title: "Broken",
    minLevel: 1,
    minStreak: 0,
    auraColors: ["#6b7280", "#374151", "#6b7280"],
    ringColor: "#6b7280",
    glow: "shadow-[0_0_30px_-10px_rgba(107,114,128,0.5)]",
    textColor: "text-zinc-400",
    particleColor: "rgba(156,163,175,0.6)",
    tagline: "The version before becoming.",
  },
  {
    id: "initiate",
    title: "Initiate",
    minLevel: 2,
    minStreak: 2,
    auraColors: ["#22d3ee", "#3b82f6", "#22d3ee"],
    ringColor: "#22d3ee",
    glow: "shadow-[0_0_40px_-8px_rgba(34,211,238,0.7)]",
    textColor: "text-cyan-300",
    particleColor: "rgba(34,211,238,0.7)",
    tagline: "You've crossed the line.",
  },
  {
    id: "disciplined",
    title: "Disciplined",
    minLevel: 6,
    minStreak: 7,
    auraColors: ["#8b5cf6", "#6366f1", "#8b5cf6"],
    ringColor: "#8b5cf6",
    glow: "shadow-[0_0_50px_-6px_rgba(139,92,246,0.85)]",
    textColor: "text-violet-300",
    particleColor: "rgba(167,139,250,0.8)",
    tagline: "Discipline is your default.",
  },
  {
    id: "ascending",
    title: "Ascending",
    minLevel: 12,
    minStreak: 21,
    auraColors: ["#a855f7", "#ec4899", "#a855f7"],
    ringColor: "#ec4899",
    glow: "shadow-[0_0_60px_-4px_rgba(236,72,153,0.9)]",
    textColor: "text-fuchsia-300",
    particleColor: "rgba(236,72,153,0.85)",
    tagline: "Momentum bends reality.",
  },
  {
    id: "elite",
    title: "Elite",
    minLevel: 20,
    minStreak: 45,
    auraColors: ["#fbbf24", "#f59e0b", "#fbbf24"],
    ringColor: "#fbbf24",
    glow: "shadow-[0_0_70px_-2px_rgba(251,191,36,1)]",
    textColor: "text-amber-300",
    particleColor: "rgba(251,191,36,0.95)",
    tagline: "You operate above the noise.",
  },
  {
    id: "mythic",
    title: "Mythic",
    minLevel: 35,
    minStreak: 100,
    auraColors: ["#ec4899", "#8b5cf6", "#22d3ee"],
    ringColor: "#ec4899",
    glow: "shadow-[0_0_90px_0px_rgba(236,72,153,1)]",
    textColor: "text-pink-300",
    particleColor: "rgba(236,72,153,1)",
    tagline: "You became the legend.",
  },
];

export function tierFor(level: number, streak: number, prestige: number = 0): TierMeta {
  // prestige bumps user up one tier as floor
  let best = TIERS[0];
  for (const t of TIERS) {
    if (level >= t.minLevel || streak >= t.minStreak) best = t;
  }
  if (prestige > 0) {
    const idx = TIERS.findIndex((t) => t.id === best.id);
    return TIERS[Math.min(TIERS.length - 1, idx + 1)];
  }
  return best;
}

export function nextTier(current: EvolutionTier): TierMeta | null {
  const idx = TIERS.findIndex((t) => t.id === current);
  return TIERS[idx + 1] ?? null;
}

export const PRESTIGE_LEVEL_REQ = 30; // reach level 30 to prestige
