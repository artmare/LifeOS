"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/store";
import { HeroPanel } from "@/components/HeroPanel";
import { EnergyBar } from "@/components/EnergyBar";
import { ComboBadge } from "@/components/ComboBadge";
import { QuestCard } from "@/components/QuestCard";
import { XpGrowthChart } from "@/components/charts/XpGrowthChart";
import { Heatmap } from "@/components/charts/Heatmap";
import { BalanceRadar } from "@/components/charts/BalanceRadar";
import { WeeklyConsistency } from "@/components/charts/WeeklyConsistency";
import { InsightCard } from "@/components/InsightCard";
import { generateInsights } from "@/lib/insights";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Target, ChevronRight } from "lucide-react";
import { levelFromXp } from "@/lib/xp";
import { nextTier, tierFor, PRESTIGE_LEVEL_REQ } from "@/lib/evolution";
import { useT, useLang } from "@/lib/i18n-hooks";

export default function HomePage() {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const onboarded = useGame((s) => s.onboarded);
  const quests = useGame((s) => s.quests);
  const character = useGame((s) => s.character);
  const xp = useGame((s) => s.xp);
  const streak = useGame((s) => s.streak);
  const energy = useGame((s) => s.energy);
  const combo = useGame((s) => s.combo);
  const history = useGame((s) => s.history);
  const achievements = useGame((s) => s.achievements);
  const prestige = useGame((s) => s.prestige);
  const checkDailyLogin = useGame((s) => s.checkDailyLogin);
  const doPrestige = useGame((s) => s.doPrestige);

  useEffect(() => {
    if (!onboarded) router.replace("/onboarding");
  }, [onboarded, router]);

  useEffect(() => {
    if (onboarded) checkDailyLogin();
  }, [onboarded, checkDailyLogin]);

  const insights = useMemo(() => {
    if (!character) return [];
    return generateInsights(
      {
        level: levelFromXp(xp),
        xp,
        streak: streak.current,
        bestStreak: streak.best,
        questsDoneToday: quests.filter((q) => q.completedAt).length,
        questsRemainingToday: quests.filter((q) => !q.completedAt).length,
        energy: energy.value,
        combo: combo.count,
        history,
      },
      lang,
    );
  }, [character, xp, streak, quests, energy.value, combo.count, history, lang]);

  if (!onboarded || !character) return null;

  const level = levelFromXp(xp);
  const tier = tierFor(level, streak.current, prestige.level);
  const next = nextTier(tier.id);

  const dailies = quests.filter((q) => q.category === "daily");
  const epics = quests.filter((q) => q.category !== "daily");
  const doneToday = dailies.filter((q) => q.completedAt).length;
  const priority = quests.find((q) => !q.completedAt && (q.difficulty === "hard" || q.difficulty === "epic")) ??
    quests.find((q) => !q.completedAt);
  const priorityTitle = priority ? (priority.titleKey ? t(priority.titleKey) : priority.title) : "";

  const unlockedAch = achievements.filter((a) => a.unlockedAt).length;
  const canPrestige = level >= PRESTIGE_LEVEL_REQ;

  const greeting = greetingFor(new Date().getHours(), character.name, t);
  const remaining = dailies.length - doneToday;
  const subtitle =
    doneToday === dailies.length && dailies.length > 0
      ? t("home.subtitle.perfect")
      : t(remaining === 1 ? "home.subtitle.remaining_one" : "home.subtitle.remaining_many", { n: remaining });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3 pt-2">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.25em] text-ink-muted">
            {greeting.eyebrow}
          </div>
          <h1 className="heading text-3xl">
            <span className="shimmer-text">{greeting.line}</span>
          </h1>
          <p className="text-sm text-ink-dim">{subtitle}</p>
        </div>
        <ComboBadge />
      </header>

      <HeroPanel />

      <div className="grid grid-cols-2 gap-3">
        <EnergyBar />
        <Link
          href="/coach"
          className="group flex items-center justify-between rounded-2xl border border-white/5 bg-bg-card/70 px-3 py-3 backdrop-blur-xl transition-colors hover:border-brand-violet/40"
        >
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-indigo text-white shadow-glow">
              <Sparkles size={16} />
            </div>
            <div className="leading-tight">
              <div className="text-[9px] uppercase tracking-[0.22em] text-ink-muted">
                {t("home.mentor")}
              </div>
              <div className="text-xs font-semibold">{t("home.coach_quick")}</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-ink-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <section>
        <SectionTitle eyebrow={t("home.section.mission.eyebrow")} title={t("home.section.mission.title")} right={<Link href="/quests" className="text-xs text-brand-violet hover:underline">{t("btn.see_all")}</Link>} />
        {priority && !priority.completedAt && (
          <PriorityQuestCard quest={priority} title={priorityTitle} label={t("home.priority_label")} />
        )}
        <div className="mt-2 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {dailies.filter((q) => q.id !== priority?.id).slice(0, 3).map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow={t("home.section.lifestats.eyebrow")} title={t("home.section.lifestats.title")} />
        <div className="flex flex-col gap-3">
          <XpGrowthChart />
          <div className="grid grid-cols-2 gap-3">
            <BalanceRadar />
            <WeeklyConsistency />
          </div>
          <Heatmap />
        </div>
      </section>

      {insights.length > 0 && (
        <section>
          <SectionTitle eyebrow={t("home.section.insights.eyebrow")} title={t("home.section.insights.title")} />
          <div className="flex flex-col gap-2">
            {insights.map((ins, i) => (
              <InsightCard key={ins.id} insight={ins} idx={i} />
            ))}
          </div>
        </section>
      )}

      {epics.length > 0 && (
        <section>
          <SectionTitle eyebrow={t("home.section.epic.eyebrow")} title={t("home.section.epic.title")} />
          <div className="flex flex-col gap-2">
            {epics.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle eyebrow={t("home.section.longterm.eyebrow")} title={t("home.section.longterm.title")} />
        <div className="card p-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat label={t("home.stats.lifetime")} value={xp.toLocaleString()} accent="text-brand-cyan" />
            <Stat label={t("home.stats.achievements")} value={`${unlockedAch}/${achievements.length}`} accent="text-brand-violet" />
            <Stat label={t("home.stats.beststreak")} value={`${streak.best}${t("hero.day_short")}`} accent="text-rose-300" />
          </div>
          {next && (
            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
                {t("home.nexttier")}
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <div className={`font-display text-lg font-semibold ${next.textColor}`}>
                  {t(`tier.${next.id}.title`)}
                </div>
                <div className="text-[11px] text-ink-dim">
                  Lv {next.minLevel} · {next.minStreak}{t("hero.day_short")}
                </div>
              </div>
              <div className="mt-1 text-[11px] italic text-ink-dim">"{t(`tier.${next.id}.tagline`)}"</div>
            </div>
          )}
          {canPrestige && (
            <button
              onClick={doPrestige}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-400/15 to-brand-violet/15 px-3 py-2.5 text-left hover:brightness-110"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-amber-300">
                  {t("home.prestige.eyebrow")}
                </div>
                <div className="text-sm font-semibold text-white">
                  {t("home.prestige.cta")}
                </div>
              </div>
              <ChevronRight size={16} className="text-amber-300" />
            </button>
          )}
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-center text-xs text-ink-muted"
      >
        {t("home.tagline")}
      </motion.div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-end justify-between">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">{eyebrow}</div>
        <h2 className="heading text-base">{title}</h2>
      </div>
      {right}
    </div>
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

function PriorityQuestCard({ quest, title, label }: { quest: any; title: string; label: string }) {
  const complete = useGame((s) => s.completeQuest);
  return (
    <motion.button
      onClick={() => complete(quest.id)}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-2xl border border-brand-violet/40 bg-gradient-to-br from-brand-violet/15 via-bg-card/70 to-brand-cyan/10 p-4 text-left shadow-glow"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["-100% 0", "200% 0"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
      <div className="relative flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-violet/20 text-brand-violet ring-2 ring-brand-violet/40">
          <Target size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] uppercase tracking-[0.22em] text-brand-violet">
            {label} · +{quest.xp} XP
          </div>
          <div className="truncate text-base font-semibold text-white">{title}</div>
        </div>
        <ArrowRight size={18} className="text-brand-violet transition-transform group-hover:translate-x-1" />
      </div>
    </motion.button>
  );
}

function greetingFor(hour: number, name: string, t: (k: string, v?: any) => string) {
  if (hour < 5)
    return {
      eyebrow: t("home.greeting.eyebrow.late"),
      line: t("home.greeting.late", { name }),
    };
  if (hour < 12)
    return {
      eyebrow: t("home.greeting.eyebrow.morning"),
      line: t("home.greeting.morning", { name }),
    };
  if (hour < 18)
    return {
      eyebrow: t("home.greeting.eyebrow.afternoon"),
      line: t("home.greeting.afternoon", { name }),
    };
  return {
    eyebrow: t("home.greeting.eyebrow.evening"),
    line: t("home.greeting.evening", { name }),
  };
}
