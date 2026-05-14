import type { Quest } from "./types";

// Translation keys live in src/lib/i18n.ts (q.*)
export interface QuestSeed {
  key: string; // i18n key for title
  title: string; // English fallback (also used by old persisted quests pre-i18n)
  xp: number;
  stat: Quest["stat"];
  difficulty: Quest["difficulty"];
  category: Quest["category"];
}

export const QUEST_POOL: QuestSeed[] = [
  { key: "q.water", title: "Drink 2L of water", xp: 20, stat: "strength", difficulty: "easy", category: "daily" },
  { key: "q.walk", title: "20-minute walk outside", xp: 30, stat: "strength", difficulty: "easy", category: "daily" },
  { key: "q.focus", title: "30 minutes of focused work", xp: 50, stat: "mind", difficulty: "medium", category: "daily" },
  { key: "q.read", title: "Read 10 pages", xp: 40, stat: "mind", difficulty: "easy", category: "daily" },
  { key: "q.meditate", title: "10 minutes of meditation", xp: 35, stat: "soul", difficulty: "easy", category: "daily" },
  { key: "q.nosocial", title: "No social media until noon", xp: 60, stat: "discipline", difficulty: "medium", category: "daily" },
  { key: "q.workout", title: "Workout 45 min", xp: 80, stat: "strength", difficulty: "hard", category: "daily" },
  { key: "q.coldshower", title: "Cold shower", xp: 45, stat: "discipline", difficulty: "medium", category: "daily" },
  { key: "q.friend", title: "Reach out to a friend", xp: 30, stat: "social", difficulty: "easy", category: "daily" },
  { key: "q.plan", title: "Plan tomorrow tonight", xp: 25, stat: "discipline", difficulty: "easy", category: "daily" },
  { key: "q.journal", title: "Journal 1 page", xp: 35, stat: "soul", difficulty: "easy", category: "daily" },
  { key: "q.deepwork", title: "Deep work block (90 min)", xp: 120, stat: "mind", difficulty: "hard", category: "daily" },
];

export const EPIC_QUESTS: QuestSeed[] = [
  { key: "q.book", title: "Finish a book this week", xp: 300, stat: "mind", difficulty: "epic", category: "weekly" },
  { key: "q.streak7", title: "Complete a 7-day workout streak", xp: 500, stat: "strength", difficulty: "epic", category: "weekly" },
  { key: "q.project", title: "Ship a personal project milestone", xp: 600, stat: "mind", difficulty: "epic", category: "epic" },
];

let _idCounter = 0;
function nextId() {
  _idCounter += 1;
  return `q_${Date.now().toString(36)}_${_idCounter}`;
}

function pickFromDate<T>(arr: T[], date: Date, count: number): T[] {
  const seed = date.getFullYear() * 1000 + date.getMonth() * 31 + date.getDate();
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  while (out.length < Math.min(count, arr.length)) {
    s = (s * 9301 + 49297) % 233280;
    const i = s % arr.length;
    if (!used.has(i)) {
      used.add(i);
      out.push(arr[i]);
    }
  }
  return out;
}

export function generateDailyQuests(date: Date = new Date()): Quest[] {
  const daily = pickFromDate(QUEST_POOL, date, 5).map((q) => ({
    id: nextId(),
    titleKey: q.key,
    title: q.title,
    xp: q.xp,
    stat: q.stat,
    difficulty: q.difficulty,
    category: q.category,
  }));
  const epicPool = pickFromDate(EPIC_QUESTS, date, 1).map((q) => ({
    id: nextId(),
    titleKey: q.key,
    title: q.title,
    xp: q.xp,
    stat: q.stat,
    difficulty: q.difficulty,
    category: q.category,
  }));
  return [...daily, ...epicPool];
}

export const DIFFICULTY_COLOR: Record<Quest["difficulty"], string> = {
  easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  medium: "text-brand-cyan border-brand-cyan/30 bg-brand-cyan/5",
  hard: "text-brand-violet border-brand-violet/40 bg-brand-violet/10",
  epic: "text-amber-300 border-amber-300/40 bg-amber-300/10",
};
