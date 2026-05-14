"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Character,
  CharacterClass,
  Quest,
  StatKey,
  Achievement,
  StreakState,
  CoachMessage,
  ComboState,
  EnergyState,
  HistoryEntry,
  PrestigeState,
  CoachMood,
  Language,
} from "./types";
import { ACHIEVEMENTS } from "./achievements";
import { generateDailyQuests } from "./quests";
import { levelFromXp } from "./xp";
import { todayKey, dayDiff } from "./date";
import { rewardForLoginStreak } from "./rewards";
import { sfx } from "./sound";
import { haptics } from "./haptics";
import { tierFor } from "./evolution";

const COMBO_WINDOW_MS = 30 * 60 * 1000; // 30 min between quests to keep combo

interface State {
  hydrated: boolean;
  onboarded: boolean;
  character: Character | null;
  xp: number; // lifetime XP
  quests: Quest[];
  questsDay: string | null;
  achievements: Achievement[];
  streak: StreakState;
  coach: CoachMessage[];
  toastQueue: ToastItem[];

  // NEW evolution layer
  combo: ComboState;
  energy: EnergyState;
  history: HistoryEntry[]; // up to 90 days
  prestige: PrestigeState;
  coachMood: CoachMood;

  // session/UX state (not persisted)
  cinematicLevel: number | null;
  cinematicAchievement: Achievement | null;
  cinematicReward: { day: number } | null;
  lastLoginCheck: string | null; // YYYY-MM-DD when we last evaluated daily reward
  floatingXp: FloatingXp[];
  screenShakeKey: number;

  // preferences
  soundOn: boolean;
  hapticsOn: boolean;
  language: Language;
}

export interface FloatingXp {
  id: string;
  amount: number;
  combo: number;
  at: number;
}

export type ToastInput =
  | { kind: "achievement"; achievement: Achievement }
  | { kind: "levelup"; level: number }
  | { kind: "xp"; amount: number; combo?: number }
  | { kind: "streak"; days: number }
  | { kind: "tier"; tier: string };

export type ToastItem = ToastInput & { id: string };

interface Actions {
  completeOnboarding(payload: {
    name: string;
    cls: CharacterClass;
    avatarSeed: string;
    focusStat: StatKey;
  }): void;
  ensureDailyQuests(): void;
  completeQuest(id: string): void;
  addXp(amount: number, opts?: { silent?: boolean; cinematic?: boolean }): void;
  pingActivity(): void;
  useStreakFreeze(): boolean;
  unlockAchievement(id: string): void;
  pushToast(t: ToastInput): void;
  dismissToast(id: string): void;
  sendCoachMessage(content: string): Promise<void>;

  // NEW
  checkDailyLogin(): void;
  claimDailyReward(): void;
  dismissCinematic(kind: "level" | "achievement" | "reward"): void;
  setCoachMood(m: CoachMood): void;
  setSound(on: boolean): void;
  setHaptics(on: boolean): void;
  setLanguage(l: Language): void;
  doPrestige(): void;
  spendEnergy(n: number): void;
  recoverEnergy(): void;
  removeFloatingXp(id: string): void;

  resetAll(): void;
}

const initialStreak: StreakState = {
  current: 0,
  best: 0,
  lastActiveDay: null,
  freezes: 2,
  lastFreezeUsed: null,
};

const initialCombo: ComboState = { count: 0, lastCompletedAt: null, multiplier: 1 };
const initialEnergy: EnergyState = { value: 80, lastUpdatedAt: Date.now() };
const initialPrestige: PrestigeState = { level: 0 };

const initialAchievements = (): Achievement[] => ACHIEVEMENTS.map((a) => ({ ...a }));

function comboMultiplier(count: number): number {
  if (count >= 7) return 2;
  if (count >= 5) return 1.75;
  if (count >= 3) return 1.5;
  if (count >= 2) return 1.25;
  return 1;
}

const INITIAL_LANGUAGE: Language = "en";

const WELCOME_MARKER = "__t:coach.welcome";

function recordHistory(history: HistoryEntry[], xpGained: number, questDelta: number): HistoryEntry[] {
  const today = todayKey();
  const map = new Map<string, HistoryEntry>(history.map((h) => [h.day, h]));
  const cur = map.get(today) ?? { day: today, xp: 0, quests: 0 };
  map.set(today, { ...cur, xp: cur.xp + xpGained, quests: cur.quests + questDelta });
  const sorted = Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
  return sorted.slice(-90);
}

export const useGame = create<State & Actions>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      character: null,
      xp: 0,
      quests: [],
      questsDay: null,
      achievements: initialAchievements(),
      streak: { ...initialStreak },
      coach: [
        {
          id: "welcome",
          role: "coach",
          content: WELCOME_MARKER,
          createdAt: Date.now(),
        },
      ],
      toastQueue: [],

      combo: { ...initialCombo },
      energy: { ...initialEnergy },
      history: [],
      prestige: { ...initialPrestige },
      coachMood: "calm_mentor",

      cinematicLevel: null,
      cinematicAchievement: null,
      cinematicReward: null,
      lastLoginCheck: null,
      floatingXp: [],
      screenShakeKey: 0,

      soundOn: true,
      hapticsOn: true,
      language: INITIAL_LANGUAGE,

      completeOnboarding({ name, cls, avatarSeed, focusStat }) {
        const base = 5;
        const stats: Character["stats"] = {
          discipline: base,
          strength: base,
          mind: base,
          soul: base,
          social: base,
        };
        stats[focusStat] += 3;
        set({
          onboarded: true,
          character: { name, class: cls, avatarSeed, stats, createdAt: Date.now() },
        });
        get().ensureDailyQuests();
        get().checkDailyLogin();
      },

      ensureDailyQuests() {
        const today = todayKey();
        const { questsDay, quests } = get();
        if (questsDay === today && quests.length > 0) return;
        const fresh = generateDailyQuests();
        set({ quests: fresh, questsDay: today });
      },

      addXp(amount, opts) {
        const prevXp = get().xp;
        const prevLevel = levelFromXp(prevXp);
        const newXp = prevXp + amount;
        const newLevel = levelFromXp(newXp);
        set({ xp: newXp });

        if (!opts?.silent && get().soundOn) sfx.xp();

        if (newLevel > prevLevel) {
          // cinematic level-up
          set({ cinematicLevel: newLevel, screenShakeKey: get().screenShakeKey + 1 });
          if (get().soundOn) sfx.levelUp();
          if (get().hapticsOn) haptics.big();
          // tier change check
          const s = get().streak.current;
          const prevTier = tierFor(prevLevel, s, get().prestige.level);
          const nextTierMeta = tierFor(newLevel, s, get().prestige.level);
          if (prevTier.id !== nextTierMeta.id) {
            get().pushToast({ kind: "tier", tier: nextTierMeta.id });
          }
        }

        // XP-based
        if (prevXp < 100 && newXp >= 100) get().unlockAchievement("xp_100");
        if (prevXp < 1000 && newXp >= 1000) get().unlockAchievement("xp_1000");
        if (prevXp < 10000 && newXp >= 10000) get().unlockAchievement("xp_10000");
        // Level-based
        if (prevLevel < 5 && newLevel >= 5) get().unlockAchievement("level_5");
        if (prevLevel < 10 && newLevel >= 10) get().unlockAchievement("level_10");
        if (prevLevel < 25 && newLevel >= 25) get().unlockAchievement("level_25");
      },

      completeQuest(id) {
        const q = get().quests.find((q) => q.id === id);
        if (!q || q.completedAt) return;
        const now = Date.now();
        const updated = get().quests.map((qq) =>
          qq.id === id ? { ...qq, completedAt: now } : qq,
        );

        // combo update
        const prevCombo = get().combo;
        const inWindow =
          prevCombo.lastCompletedAt && now - prevCombo.lastCompletedAt < COMBO_WINDOW_MS;
        const nextCount = inWindow ? prevCombo.count + 1 : 1;
        const nextMult = comboMultiplier(nextCount);

        const xpGain = Math.round(q.xp * nextMult);

        // stat bump
        const ch = get().character;
        if (ch) {
          const stats = {
            ...ch.stats,
            [q.stat]: ch.stats[q.stat] + (q.difficulty === "epic" ? 3 : 1),
          };
          set({ character: { ...ch, stats } });
        }

        set({
          quests: updated,
          combo: { count: nextCount, lastCompletedAt: now, multiplier: nextMult },
          history: recordHistory(get().history, xpGain, 1),
          floatingXp: [
            ...get().floatingXp,
            { id: Math.random().toString(36).slice(2), amount: xpGain, combo: nextCount, at: now },
          ],
        });

        if (get().soundOn) {
          if (nextCount >= 3) sfx.combo();
          else sfx.questComplete();
        }
        if (get().hapticsOn) haptics.success();

        // achievements
        const firstStep = get().achievements.find((a) => a.id === "first_step")?.unlockedAt;
        if (!firstStep) get().unlockAchievement("first_step");
        if (q.category === "epic" || q.difficulty === "epic") get().unlockAchievement("first_goal");
        const hour = new Date(now).getHours();
        if (hour >= 0 && hour < 5) get().unlockAchievement("night_owl");
        if (hour >= 4 && hour < 7) get().unlockAchievement("early_bird");

        // energy: epic/hard cost more
        const cost = q.difficulty === "epic" ? 18 : q.difficulty === "hard" ? 12 : 6;
        get().spendEnergy(cost);

        // XP gain
        get().addXp(xpGain, { silent: false });

        // perfect day
        const dailies = get().quests.filter((q) => q.category === "daily");
        if (dailies.length > 0 && dailies.every((q) => q.completedAt)) {
          get().unlockAchievement("perfect_day");
        }

        get().pingActivity();
      },

      pingActivity() {
        const today = todayKey();
        const s = get().streak;
        if (s.lastActiveDay === today) return;

        let next: StreakState;
        if (!s.lastActiveDay) {
          next = { ...s, current: 1, best: Math.max(s.best, 1), lastActiveDay: today };
        } else {
          const diff = dayDiff(s.lastActiveDay, today);
          if (diff === 1) {
            const current = s.current + 1;
            next = { ...s, current, best: Math.max(s.best, current), lastActiveDay: today };
          } else if (diff === 2 && s.freezes > 0) {
            const current = s.current + 1;
            next = {
              ...s,
              current,
              best: Math.max(s.best, current),
              lastActiveDay: today,
              freezes: s.freezes - 1,
              lastFreezeUsed: today,
            };
          } else {
            next = { ...s, current: 1, lastActiveDay: today };
          }
        }
        set({ streak: next });

        if (next.current >= 3 && s.current < 3) get().unlockAchievement("streak_3");
        if (next.current >= 7 && s.current < 7) get().unlockAchievement("streak_7");
        if (next.current >= 30 && s.current < 30) get().unlockAchievement("streak_30");
        if (next.current >= 100 && s.current < 100) get().unlockAchievement("streak_100");
        if (next.current >= 365 && s.current < 365) get().unlockAchievement("streak_365");

        if (next.current > s.current && [3, 7, 14, 30, 60, 100, 365].includes(next.current)) {
          get().pushToast({ kind: "streak", days: next.current });
          if (get().soundOn) sfx.streak();
        }
      },

      useStreakFreeze() {
        const s = get().streak;
        if (s.freezes <= 0) return false;
        set({ streak: { ...s, freezes: s.freezes - 1, lastFreezeUsed: todayKey() } });
        return true;
      },

      unlockAchievement(id) {
        const list = get().achievements;
        const idx = list.findIndex((a) => a.id === id);
        if (idx === -1) return;
        if (list[idx].unlockedAt) return;
        const updated = [...list];
        updated[idx] = { ...updated[idx], unlockedAt: Date.now() };
        set({ achievements: updated });
        // Cinematic for legendary+ rare unlocks
        if (updated[idx].rarity === "legendary" || updated[idx].rarity === "mythic") {
          set({ cinematicAchievement: updated[idx] });
          if (get().soundOn) sfx.legendary();
          if (get().hapticsOn) haptics.big();
        } else {
          get().pushToast({ kind: "achievement", achievement: updated[idx] });
          if (get().soundOn) sfx.achievement();
        }
      },

      pushToast(t) {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toastQueue: [...s.toastQueue, { ...t, id }] }));
      },

      dismissToast(id) {
        set((s) => ({ toastQueue: s.toastQueue.filter((t) => t.id !== id) }));
      },

      async sendCoachMessage(content) {
        const userMsg: CoachMessage = {
          id: Math.random().toString(36).slice(2),
          role: "user",
          content,
          createdAt: Date.now(),
        };
        set((s) => ({ coach: [...s.coach, userMsg] }));

        const snapshot = buildCoachContext(get());

        try {
          const res = await fetch("/api/coach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              context: snapshot,
              mood: get().coachMood,
              language: get().language,
              history: get().coach.slice(-10),
            }),
          });
          const data = await res.json();
          const reply: CoachMessage = {
            id: Math.random().toString(36).slice(2),
            role: "coach",
            content: data.reply ?? "I'm here. Keep going.",
            createdAt: Date.now(),
          };
          set((s) => ({ coach: [...s.coach, reply] }));
        } catch {
          const reply: CoachMessage = {
            id: Math.random().toString(36).slice(2),
            role: "coach",
            content: "__t:coach.fallback",
            createdAt: Date.now(),
          };
          set((s) => ({ coach: [...s.coach, reply] }));
        }
      },

      checkDailyLogin() {
        const today = todayKey();
        if (get().lastLoginCheck === today) return;
        set({ lastLoginCheck: today });
        const s = get().streak;
        const loginDay = Math.max(1, s.current); // streak determines reward tier
        const reward = rewardForLoginStreak(loginDay);
        set({ cinematicReward: { day: reward.day } });
      },

      claimDailyReward() {
        const c = get().cinematicReward;
        if (!c) return;
        const reward = rewardForLoginStreak(c.day);
        if (reward.kind === "xp" && reward.amount) {
          get().addXp(reward.amount, { silent: true });
        } else if (reward.kind === "freeze" && reward.amount) {
          set((s) => ({ streak: { ...s.streak, freezes: s.streak.freezes + (reward.amount ?? 1) } }));
        } else if (reward.kind === "boost" && reward.amount) {
          get().addXp((reward.amount ?? 1) * 50, { silent: true });
        }
        if (get().soundOn) sfx.reward();
        if (get().hapticsOn) haptics.success();
        set({ cinematicReward: null });
      },

      dismissCinematic(kind) {
        if (kind === "level") set({ cinematicLevel: null });
        if (kind === "achievement") set({ cinematicAchievement: null });
        if (kind === "reward") set({ cinematicReward: null });
      },

      setCoachMood(m) {
        set({ coachMood: m });
      },

      setSound(on) {
        set({ soundOn: on });
      },
      setHaptics(on) {
        set({ hapticsOn: on });
      },
      setLanguage(l) {
        set({ language: l });
      },

      doPrestige() {
        const lvl = levelFromXp(get().xp);
        if (lvl < 30) return;
        set((s) => ({
          xp: 0,
          prestige: { level: s.prestige.level + 1, unlockedAt: Date.now() },
        }));
        if (get().soundOn) sfx.legendary();
      },

      spendEnergy(n) {
        const e = get().energy;
        const value = Math.max(0, Math.min(100, e.value - n));
        set({ energy: { value, lastUpdatedAt: Date.now() } });
      },

      recoverEnergy() {
        const e = get().energy;
        // recover ~1 point per 10 min
        const minutes = (Date.now() - e.lastUpdatedAt) / 60000;
        const gain = Math.min(100 - e.value, Math.floor(minutes / 10));
        if (gain > 0) {
          set({ energy: { value: e.value + gain, lastUpdatedAt: Date.now() } });
        }
      },

      removeFloatingXp(id) {
        set((s) => ({ floatingXp: s.floatingXp.filter((f) => f.id !== id) }));
      },

      resetAll() {
        set({
          onboarded: false,
          character: null,
          xp: 0,
          quests: [],
          questsDay: null,
          achievements: initialAchievements(),
          streak: { ...initialStreak },
          coach: [],
          toastQueue: [],
          combo: { ...initialCombo },
          energy: { ...initialEnergy },
          history: [],
          prestige: { ...initialPrestige },
          cinematicLevel: null,
          cinematicAchievement: null,
          cinematicReward: null,
          lastLoginCheck: null,
          floatingXp: [],
        });
      },
    }),
    {
      name: "lifeos:v3",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        character: s.character,
        xp: s.xp,
        quests: s.quests,
        questsDay: s.questsDay,
        achievements: s.achievements,
        streak: s.streak,
        coach: s.coach,
        combo: s.combo,
        energy: s.energy,
        history: s.history,
        prestige: s.prestige,
        coachMood: s.coachMood,
        lastLoginCheck: s.lastLoginCheck,
        soundOn: s.soundOn,
        hapticsOn: s.hapticsOn,
        language: s.language,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export function buildCoachContext(s: State) {
  const level = levelFromXp(s.xp);
  const unlocked = s.achievements.filter((a) => a.unlockedAt).length;
  const todoCount = s.quests.filter((q) => !q.completedAt).length;
  const doneToday = s.quests.filter((q) => q.completedAt).length;
  const tier = s.character ? tierFor(level, s.streak.current, s.prestige.level) : null;
  return {
    name: s.character?.name ?? "Friend",
    class: s.character?.class ?? null,
    level,
    xp: s.xp,
    streak: s.streak.current,
    bestStreak: s.streak.best,
    freezes: s.streak.freezes,
    unlockedAchievements: unlocked,
    questsRemainingToday: todoCount,
    questsDoneToday: doneToday,
    stats: s.character?.stats ?? null,
    tier: tier?.title ?? null,
    energy: s.energy.value,
    combo: s.combo.count,
    prestige: s.prestige.level,
  };
}
