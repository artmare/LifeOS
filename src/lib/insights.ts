import type { HistoryEntry, Language } from "./types";
import { todayKey, dayDiff } from "./date";

export interface Insight {
  id: string;
  tone: "positive" | "neutral" | "warning";
  icon: string;
  title: string;
  detail: string;
}

interface Snapshot {
  level: number;
  xp: number;
  streak: number;
  bestStreak: number;
  questsDoneToday: number;
  questsRemainingToday: number;
  energy: number;
  combo: number;
  history: HistoryEntry[];
}

type Tri<T = string> = { en: T; ru: T; de: T };

function pick<T>(t: Tri<T>, lang: Language): T {
  return t[lang] ?? t.en;
}

export function generateInsights(s: Snapshot, lang: Language = "en"): Insight[] {
  const out: Insight[] = [];
  const today = todayKey();
  const past = s.history
    .filter((h) => dayDiff(h.day, today) <= 6)
    .sort((a, b) => a.day.localeCompare(b.day));
  const totalXp7 = past.reduce((acc, h) => acc + h.xp, 0);
  const avg7 = past.length ? totalXp7 / past.length : 0;
  const activeDays = past.filter((h) => h.xp > 0).length;
  const yesterday = past[past.length - 1];
  const prev = past[past.length - 2];

  if (s.streak >= 3) {
    out.push({
      id: "discipline_rising",
      tone: "positive",
      icon: "TrendingUp",
      title: pick(
        {
          en: `Discipline rising — ${s.streak} days`,
          ru: `Дисциплина растёт — ${s.streak} дней`,
          de: `Disziplin steigt — ${s.streak} Tage`,
        },
        lang,
      ),
      detail: pick(
        {
          en: "You're stacking days. The version of you two weeks from now is already different.",
          ru: "Ты складываешь дни. Версия через две недели уже другая.",
          de: "Du stapelst Tage. Die Version in zwei Wochen ist bereits anders.",
        },
        lang,
      ),
    });
  }

  if (avg7 > 100 && activeDays >= 5) {
    out.push({
      id: "high_perf",
      tone: "positive",
      icon: "Flame",
      title: pick(
        {
          en: "Entering high-performance phase",
          ru: "Входишь в фазу высокой производительности",
          de: "Du trittst in die Hochleistungsphase ein",
        },
        lang,
      ),
      detail: pick(
        {
          en: `7-day avg: ${Math.round(avg7)} XP/day. Stay here. This is where compounding happens.`,
          ru: `Среднее за 7 дней: ${Math.round(avg7)} XP/день. Останься здесь. Здесь работает сложный процент.`,
          de: `7-Tage-Schnitt: ${Math.round(avg7)} XP/Tag. Bleib hier. Hier passiert das Compounding.`,
        },
        lang,
      ),
    });
  }

  if (yesterday && prev && yesterday.xp < prev.xp * 0.5 && prev.xp > 50) {
    out.push({
      id: "decline",
      tone: "warning",
      icon: "AlertTriangle",
      title: pick(
        {
          en: "Momentum dip detected",
          ru: "Замечен спад импульса",
          de: "Schwungeinbruch erkannt",
        },
        lang,
      ),
      detail: pick(
        {
          en: "Yesterday was quieter than the day before. One quest tonight resets the curve.",
          ru: "Вчера было тише, чем позавчера. Один квест вечером перезапускает кривую.",
          de: "Gestern war ruhiger als vorgestern. Ein Quest heute Abend setzt die Kurve zurück.",
        },
        lang,
      ),
    });
  }

  if (s.questsDoneToday === 0 && new Date().getHours() >= 12) {
    out.push({
      id: "midday_silence",
      tone: "warning",
      icon: "Clock",
      title: pick(
        {
          en: "Midday silence",
          ru: "Полдневная тишина",
          de: "Mittagsstille",
        },
        lang,
      ),
      detail: pick(
        {
          en: "Half the day, no quest closed. Pick the smallest one. Right now.",
          ru: "Полдня — ни одного закрытого квеста. Выбери самый маленький. Сейчас.",
          de: "Halber Tag, kein Quest geschlossen. Wähl den kleinsten. Jetzt.",
        },
        lang,
      ),
    });
  }

  if (s.energy < 35) {
    out.push({
      id: "low_energy",
      tone: "warning",
      icon: "BatteryLow",
      title: pick(
        {
          en: "Focus tank running low",
          ru: "Бак фокуса на исходе",
          de: "Fokus-Tank wird leer",
        },
        lang,
      ),
      detail: pick(
        {
          en: "You're burning hotter than you're recovering. Hydrate, walk, breathe for 4 minutes.",
          ru: "Ты горишь быстрее, чем восстанавливаешься. Вода, прогулка, дыхание 4 минуты.",
          de: "Du verbrennst schneller, als du dich erholst. Trinken, laufen, 4 Minuten atmen.",
        },
        lang,
      ),
    });
  } else if (s.energy > 80) {
    out.push({
      id: "high_energy",
      tone: "positive",
      icon: "BatteryFull",
      title: pick(
        {
          en: "Peak focus window",
          ru: "Окно пикового фокуса",
          de: "Spitzen-Fokusfenster",
        },
        lang,
      ),
      detail: pick(
        {
          en: "Your highest-leverage quest deserves the next 25 minutes. Strike now.",
          ru: "Самый важный квест заслуживает следующих 25 минут. Бей сейчас.",
          de: "Dein wichtigster Quest verdient die nächsten 25 Minuten. Schlag jetzt zu.",
        },
        lang,
      ),
    });
  }

  if (s.combo >= 3) {
    out.push({
      id: "combo",
      tone: "positive",
      icon: "Zap",
      title: pick(
        {
          en: `${s.combo}-combo active`,
          ru: `Комбо ${s.combo}× активно`,
          de: `${s.combo}-Combo aktiv`,
        },
        lang,
      ),
      detail: pick(
        {
          en: "Don't break the chain. One more clean win locks the multiplier.",
          ru: "Не рви цепочку. Ещё одна чистая победа закрепит множитель.",
          de: "Brich die Kette nicht. Ein weiterer sauberer Sieg sperrt den Multiplikator.",
        },
        lang,
      ),
    });
  }

  if (s.streak > 0 && s.streak === s.bestStreak && s.questsDoneToday === 0) {
    out.push({
      id: "record",
      tone: "warning",
      icon: "Crown",
      title: pick(
        {
          en: "Personal record on the line",
          ru: "Личный рекорд на грани",
          de: "Persönlicher Rekord auf der Kippe",
        },
        lang,
      ),
      detail: pick(
        {
          en: `Streak ${s.streak} = your all-time best. Don't be the one who ends it.`,
          ru: `Серия ${s.streak} — твой рекорд. Не стань тем, кто её сломает.`,
          de: `Serie ${s.streak} = dein Allzeit-Bestwert. Sei nicht der, der sie beendet.`,
        },
        lang,
      ),
    });
  }

  const hour = new Date().getHours();
  if (hour >= 22 && s.questsDoneToday > 0) {
    out.push({
      id: "night_fatigue",
      tone: "neutral",
      icon: "Moon",
      title: pick(
        {
          en: "Focus drops after 22:00",
          ru: "Фокус падает после 22:00",
          de: "Fokus fällt nach 22:00",
        },
        lang,
      ),
      detail: pick(
        {
          en: "Pattern detected. Plan tomorrow now while you can still think clearly.",
          ru: "Паттерн замечен. Спланируй завтра сейчас, пока ясно мыслишь.",
          de: "Muster erkannt. Plane morgen jetzt, solange du klar denken kannst.",
        },
        lang,
      ),
    });
  }

  return out.slice(0, 4);
}
