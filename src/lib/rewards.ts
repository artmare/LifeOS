import type { DailyReward } from "./types";

// 7-day rotating login rewards; day 7 is the big one.
export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, kind: "xp", amount: 25, label: "+25 XP" },
  { day: 2, kind: "xp", amount: 40, label: "+40 XP" },
  { day: 3, kind: "freeze", amount: 1, label: "Streak Freeze" },
  { day: 4, kind: "xp", amount: 60, label: "+60 XP" },
  { day: 5, kind: "boost", amount: 1, label: "+25% XP Boost (1h)" },
  { day: 6, kind: "xp", amount: 100, label: "+100 XP" },
  { day: 7, kind: "boost", amount: 2, label: "Legendary Boost" },
];

export function rewardForLoginStreak(streak: number): DailyReward {
  const idx = ((streak - 1) % DAILY_REWARDS.length + DAILY_REWARDS.length) % DAILY_REWARDS.length;
  return DAILY_REWARDS[Math.max(0, idx)];
}
