"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Brain, Flame, Swords, Eye } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CoachMood } from "@/lib/types";
import { todayKey, dayDiff } from "@/lib/date";
import { useT } from "@/lib/i18n-hooks";

const MOODS: { id: CoachMood; icon: any; tint: string }[] = [
  { id: "calm_mentor", icon: Brain, tint: "text-cyan-300" },
  { id: "disciplined_commander", icon: Swords, tint: "text-violet-300" },
  { id: "aggressive_motivator", icon: Flame, tint: "text-rose-300" },
  { id: "reflective_analyst", icon: Eye, tint: "text-amber-300" },
];

type Tab = "chat" | "report";

export default function CoachPage() {
  const t = useT();
  const messages = useGame((s) => s.coach);
  const send = useGame((s) => s.sendCoachMessage);
  const mood = useGame((s) => s.coachMood);
  const setMood = useGame((s) => s.setCoachMood);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<Tab>("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function submit(text?: string) {
    const value = (text ?? input).trim();
    if (!value || pending) return;
    setInput("");
    setPending(true);
    await send(value);
    setPending(false);
  }

  const QUICK_PROMPTS = [
    t("coach.q.momentum"),
    t("coach.q.focus"),
    t("coach.q.brutal"),
    t("coach.q.today"),
  ];

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col gap-3">
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-indigo text-white shadow-glow">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
              {t("coach.eyebrow")}
            </div>
            <h1 className="heading text-xl">{t("coach.title")}</h1>
          </div>
        </div>
        <div className="flex rounded-full border border-white/5 bg-bg-card/70 p-0.5">
          {(["chat", "report"] as Tab[]).map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                tab === tb ? "bg-brand-violet/30 text-white" : "text-ink-dim",
              )}
            >
              {t(`coach.tab.${tb}`)}
            </button>
          ))}
        </div>
      </header>

      {tab === "chat" ? (
        <>
          <div className="flex gap-1.5 overflow-x-auto">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const active = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    active
                      ? "border-brand-violet/50 bg-brand-violet/15 text-white"
                      : "border-white/5 bg-white/[0.02] text-ink-dim hover:text-white",
                  )}
                >
                  <Icon size={12} className={active ? m.tint : ""} />
                  {t(`mood.${m.id}.label`)}
                </button>
              );
            })}
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto rounded-2xl border border-white/5 bg-bg-card/40 p-3 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {messages.map((m) => {
                  const content = m.content.startsWith("__t:")
                    ? t(m.content.slice(4))
                    : m.content;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "ml-auto bg-gradient-to-br from-brand-violet/80 to-brand-indigo/80 text-white shadow-glow"
                          : "mr-auto bg-white/5 text-ink",
                      )}
                    >
                      {content}
                    </motion.div>
                  );
                })}
                {pending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mr-auto flex items-center gap-1 rounded-2xl bg-white/5 px-3 py-2"
                  >
                    <Dot delay={0} />
                    <Dot delay={0.15} />
                    <Dot delay={0.3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => submit(p)}
                disabled={pending}
                className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs text-ink-dim transition-colors hover:border-brand-violet/40 hover:text-white disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex items-center gap-2 rounded-2xl border border-white/5 bg-bg-card/70 p-1.5 backdrop-blur-xl"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("coach.placeholder")}
              className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || pending}
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-indigo text-white shadow-glow transition-opacity disabled:opacity-40"
              aria-label={t("btn.send")}
            >
              <Send size={16} />
            </button>
          </form>
        </>
      ) : (
        <WeeklyReport />
      )}
    </div>
  );
}

function WeeklyReport() {
  const t = useT();
  const history = useGame((s) => s.history);
  const streak = useGame((s) => s.streak);
  const xp = useGame((s) => s.xp);
  const achievements = useGame((s) => s.achievements);

  const report = useMemo(() => {
    const today = todayKey();
    const past = history
      .filter((h) => dayDiff(h.day, today) <= 6)
      .sort((a, b) => a.day.localeCompare(b.day));
    const total = past.reduce((acc, h) => acc + h.xp, 0);
    const quests = past.reduce((acc, h) => acc + h.quests, 0);
    const active = past.filter((h) => h.xp > 0).length;
    const best = past.reduce((acc, h) => (h.xp > acc.xp ? h : acc), { day: "", xp: 0, quests: 0 });
    const unlockedThisWeek = achievements.filter(
      (a) => a.unlockedAt && Date.now() - a.unlockedAt < 7 * 86400_000,
    );
    return { total, quests, active, best, unlockedThisWeek };
  }, [history, achievements]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <div className="card p-4">
        <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
          {t("coach.report.eyebrow")}
        </div>
        <div className="font-display text-xl font-semibold">
          {t("coach.report.title")}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label={t("coach.report.xp")} value={report.total.toLocaleString()} accent="text-brand-cyan" />
          <Stat label={t("coach.report.activedays")} value={`${report.active}/7`} accent="text-brand-violet" />
          <Stat label={t("coach.report.quests")} value={`${report.quests}`} accent="text-amber-300" />
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-ink-muted">
          {t("coach.report.analysis")}
        </div>
        <Analysis report={report} streakBest={streak.best} streakCurrent={streak.current} />
      </div>

      {report.unlockedThisWeek.length > 0 && (
        <div className="card p-4">
          <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            {t("coach.report.unlocked")}
          </div>
          <div className="flex flex-col gap-2">
            {report.unlockedThisWeek.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{t(`ach.${a.id}.title`, undefined) || a.title}</span>
                <span className="text-[10px] uppercase tracking-widest text-ink-muted">
                  {t(`rarity.${a.rarity}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-ink-muted">
        {t("home.stats.lifetime")}: <span className="tabular-nums text-ink-dim">{xp.toLocaleString()}</span>
      </div>
    </div>
  );
}

function Analysis({
  report,
  streakBest,
  streakCurrent,
}: {
  report: { total: number; quests: number; active: number; best: any };
  streakBest: number;
  streakCurrent: number;
}) {
  const lang = useGame((s) => s.language);

  const lines = useMemo(() => {
    const L = lang;
    const out: string[] = [];
    if (report.total === 0) {
      if (L === "ru") {
        out.push("Тихая неделя. Система спрашивает: ты вообще этого хочешь?");
        out.push("Завтра: один квест. Один. Это и есть рычаг.");
      } else if (L === "de") {
        out.push("Stille Woche. Das System fragt: Willst du das wirklich?");
        out.push("Morgen: ein Quest. Nur einer. Das ist der Hebel.");
      } else {
        out.push("Silent week. The system is asking: do you actually want this?");
        out.push("Tomorrow: one quest. Just one. That's the lever.");
      }
    } else {
      if (report.active >= 5) {
        out.push(
          L === "ru"
            ? `Ты пришёл ${report.active}/7 дней. Так строятся идентичности.`
            : L === "de"
            ? `Du warst an ${report.active}/7 Tagen da. So baut man Identitäten.`
            : `You showed up ${report.active}/7 days. That's how identities are built.`,
        );
      } else if (report.active >= 3) {
        out.push(
          L === "ru"
            ? `${report.active}/7 активных дней — фундамент есть, но ещё не автоматизм.`
            : L === "de"
            ? `${report.active}/7 aktive Tage — die Basis steht, ist aber noch nicht automatisch.`
            : `${report.active}/7 days active — the foundation is there, not yet automatic.`,
        );
      } else {
        out.push(
          L === "ru"
            ? `Только ${report.active}/7 активных дней. Узкое место — постоянство, не способность.`
            : L === "de"
            ? `Nur ${report.active}/7 aktive Tage. Engpass ist Konstanz, nicht Können.`
            : `Only ${report.active}/7 days active. The bottleneck is consistency, not capacity.`,
        );
      }
      if (report.best.xp > 0) {
        out.push(
          L === "ru"
            ? `Лучший день: ${report.best.day} (${report.best.xp} XP). Это твоя версия.`
            : L === "de"
            ? `Stärkster Tag: ${report.best.day} (${report.best.xp} XP). Das bist du.`
            : `Strongest day: ${report.best.day} (${report.best.xp} XP). That's the version of you.`,
        );
      }
      if (streakCurrent >= 7) {
        out.push(
          L === "ru"
            ? `Серия ${streakCurrent} дней жива. Защищай как репутацию.`
            : L === "de"
            ? `${streakCurrent}-Tage-Serie lebt. Schütze sie wie deinen Ruf.`
            : `${streakCurrent}-day streak is alive. Protect it like your reputation.`,
        );
      }
      if (streakBest > streakCurrent && streakBest >= 7) {
        out.push(
          L === "ru"
            ? `Личный рекорд серии: ${streakBest}д. Побить его — изменить себя.`
            : L === "de"
            ? `Persönlicher Serienrekord: ${streakBest}T. Ihn zu schlagen verändert dich.`
            : `Best streak record: ${streakBest}d. Beating it would change something inside you.`,
        );
      }
    }
    return out;
  }, [report, streakBest, streakCurrent, lang]);

  return (
    <ul className="flex flex-col gap-2 text-sm text-ink-dim">
      {lines.map((l, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-brand-violet" />
          <span className="leading-relaxed">{l}</span>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.02] px-2 py-2.5">
      <div className="text-[9px] uppercase tracking-[0.2em] text-ink-muted">{label}</div>
      <div className={`mt-0.5 font-display text-base font-semibold tabular-nums ${accent}`}>
        {value}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="block h-1.5 w-1.5 rounded-full bg-ink-dim"
      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 0.9, delay }}
    />
  );
}
