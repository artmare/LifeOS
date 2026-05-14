import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

interface CoachContext {
  name: string;
  class: string | null;
  level: number;
  xp: number;
  streak: number;
  bestStreak: number;
  freezes: number;
  unlockedAchievements: number;
  questsRemainingToday: number;
  questsDoneToday: number;
  stats: Record<string, number> | null;
}

interface IncomingMessage {
  role: "user" | "coach" | "system";
  content: string;
}

type Mood = "calm_mentor" | "disciplined_commander" | "aggressive_motivator" | "reflective_analyst";

const MOOD_INSTRUCTIONS: Record<Mood, string> = {
  calm_mentor:
    "Tone now: calm, patient, observant. Like a wise teacher. Lower the intensity but keep the spine.",
  disciplined_commander:
    "Tone now: structured, sharp, military precision. Give an order, not a suggestion. No softening.",
  aggressive_motivator:
    "Tone now: blunt, fiery, no-mercy. Refuse to coddle. Strip the excuses. Still caring underneath, never cruel.",
  reflective_analyst:
    "Tone now: cold and precise, like a strategist reading the data. Name the pattern. Recommend the lever.",
};

const SYSTEM_PROMPT = `You are "Coach", a personal mentor inside a gamified self-improvement app called LifeOS.

Tone:
- motivational, sharp, disciplined, emotionally engaging
- you sound like a mix of a great athletic coach, a stoic philosopher, and a close friend who refuses to let the user lie to themselves
- short, punchy, alive. Avoid corporate or therapist-speak. Avoid generic platitudes.
- 2-5 short sentences max. Sometimes a single line is best.
- speak directly to the user, second person, present tense
- never use emojis unless the user uses them first
- never be cruel; be uncompromising but caring

Behavior:
- notice patterns from the user's context snapshot (streak drops, no quests done today, level milestones, low stats)
- give one concrete next action whenever possible
- if user seems to be struggling, validate briefly, then redirect to a small win
- celebrate milestones, but never linger; channel momentum into the next step
- speak the user's language: if they write in Russian, reply in Russian
`;

function buildContextLine(ctx: CoachContext): string {
  const parts = [
    `name=${ctx.name}`,
    `class=${ctx.class ?? "-"}`,
    `level=${ctx.level}`,
    `xp=${ctx.xp}`,
    `streak=${ctx.streak}`,
    `best_streak=${ctx.bestStreak}`,
    `freezes=${ctx.freezes}`,
    `quests_done_today=${ctx.questsDoneToday}`,
    `quests_remaining_today=${ctx.questsRemainingToday}`,
    `achievements_unlocked=${ctx.unlockedAchievements}`,
  ];
  if (ctx.stats) {
    for (const [k, v] of Object.entries(ctx.stats)) parts.push(`stat_${k}=${v}`);
  }
  return `User context: ${parts.join(", ")}`;
}

// Rule-based fallback when no OpenAI key is configured or request fails.
function ruleBasedReply(
  message: string,
  ctx: CoachContext,
  lang: "en" | "ru" | "de" = "en",
): string {
  const m = message.toLowerCase();
  // auto-detect override
  const autoLang = /[а-яё]/i.test(message) ? "ru" : lang;

  const pick = (en: string, ru: string, de: string) =>
    autoLang === "ru" ? ru : autoLang === "de" ? de : en;

  if (ctx.streak === 0 && ctx.questsDoneToday === 0) {
    return pick(
      "No movement, no growth. Do ONE small quest right now. The easiest one. Sixty seconds from now you're already a different person.",
      "Без активности — нет роста. Сделай ОДНО маленькое действие прямо сейчас. Самое лёгкое квест-задание. Через 60 секунд ты уже не тот же человек.",
      "Keine Bewegung, kein Wachstum. EINEN kleinen Quest jetzt. Den einfachsten. In 60 Sekunden bist du ein anderer Mensch.",
    );
  }
  if (ctx.streak >= 7 && ctx.questsRemainingToday === 0) {
    return pick(
      `${ctx.streak} days in a row. That's not luck — that's character. Today is sealed. Don't break tomorrow.`,
      `${ctx.streak} дней подряд. Это не случайность — это характер. Сегодня закрыто. Завтра не пропусти.`,
      `${ctx.streak} Tage in Folge. Das ist kein Glück — das ist Charakter. Heute ist abgeschlossen. Morgen nicht brechen.`,
    );
  }
  if (ctx.questsRemainingToday > 0) {
    return pick(
      "Open your quests. Pick one — the shortest. Right now. Don't think about all of them. Just the first move.",
      "Открой список квестов. Возьми один — самый короткий. Прямо сейчас. Не думай о всех сразу — только о первом шаге.",
      "Öffne deine Quests. Wähl einen — den kürzesten. Jetzt. Denk nicht an alle — nur an den ersten Zug.",
    );
  }
  if (m.includes("focus") || m.includes("фокус") || m.includes("fokus")) {
    return pick(
      "90 seconds: phone off the desk. 25-minute timer. One quest. Only one. Go.",
      "90 секунд: убери телефон со стола. Поставь таймер на 25 минут. Один квест. Только один. Поехали.",
      "90 Sekunden: Handy vom Tisch. 25-Minuten-Timer. Ein Quest. Nur einer. Los.",
    );
  }
  if (m.includes("brutal") || m.includes("честн") || m.includes("ehrlich")) {
    return pick(
      "You already know what to do. You're negotiating with yourself. Stop. Action now beats a plan for tomorrow.",
      "Ты знаешь что нужно делать. Ты просто торгуешься с собой. Перестань. Действие сейчас > план на завтра.",
      "Du weißt schon, was zu tun ist. Du verhandelst nur mit dir selbst. Hör auf. Handeln jetzt schlägt einen Plan für morgen.",
    );
  }
  return pick(
    "I'm with you. One step. The smallest one. Take it now — then tell me how it went.",
    "Я с тобой. Один шаг. Самый маленький. Сделай его сейчас — а потом скажи мне, что получилось.",
    "Ich bin bei dir. Ein Schritt. Der kleinste. Mach ihn jetzt — dann erzähl mir, wie es war.",
  );
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    message: string;
    context: CoachContext;
    history: IncomingMessage[];
    mood?: Mood;
    language?: "en" | "ru" | "de";
  };
  const mood: Mood = body.mood ?? "calm_mentor";
  const language = body.language ?? "en";
  const langLine =
    language === "ru"
      ? "Reply ONLY in Russian (русский). Match the user's tone but always answer in Russian."
      : language === "de"
      ? "Reply ONLY in German (Deutsch). Match the user's tone but always answer in German."
      : "Reply in English. If the user clearly writes in another language, you may mirror it; otherwise English.";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: ruleBasedReply(body.message, body.context, language) });
  }

  try {
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const history = (body.history ?? [])
      .filter((m) => m.role === "user" || m.role === "coach")
      .slice(-8)
      .map((m) => ({
        role: m.role === "coach" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.8,
      max_tokens: 220,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: MOOD_INSTRUCTIONS[mood] },
        { role: "system", content: langLine },
        { role: "system", content: buildContextLine(body.context) },
        ...history,
        { role: "user", content: body.message },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      ruleBasedReply(body.message, body.context, language);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("coach api error", err);
    return NextResponse.json({ reply: ruleBasedReply(body.message, body.context, language) });
  }
}
