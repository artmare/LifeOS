"use client";
import { motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { EvolvedAvatar } from "./EvolvedAvatar";
import { progressInLevel } from "@/lib/xp";
import { tierFor, nextTier } from "@/lib/evolution";
import { Flame, Snowflake, Zap } from "lucide-react";
import { Progress } from "./ui/Progress";
import { useT } from "@/lib/i18n-hooks";

export function HeroPanel() {
  const t = useT();
  const ch = useGame((s) => s.character);
  const xp = useGame((s) => s.xp);
  const streak = useGame((s) => s.streak);
  const prestige = useGame((s) => s.prestige);
  const combo = useGame((s) => s.combo);

  if (!ch) return null;
  const p = progressInLevel(xp);
  const tier = tierFor(p.level, streak.current, prestige.level);
  const next = nextTier(tier.id);

  // distance to next tier
  let nextDistance: { kind: "level" | "streak" | "max"; value: number } = { kind: "max", value: 0 };
  if (next) {
    const lvlGap = Math.max(0, next.minLevel - p.level);
    const stkGap = Math.max(0, next.minStreak - streak.current);
    if (lvlGap <= stkGap || stkGap === 0) nextDistance = { kind: "level", value: lvlGap };
    else nextDistance = { kind: "streak", value: stkGap };
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className="card relative overflow-hidden p-5"
    >
      {/* atmospheric tier-tinted bg */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at top right, ${tier.auraColors[0]}30, transparent 55%), radial-gradient(ellipse at bottom left, ${tier.auraColors[1]}25, transparent 55%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />

      {/* prestige indicator */}
      {prestige.level > 0 && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-300">
          ★ {t("hero.prestige")} {prestige.level}
        </div>
      )}

      <div className="relative flex items-center gap-4">
        <EvolvedAvatar
          seed={ch.avatarSeed}
          initial={ch.name}
          tier={tier}
          size={96}
        />
        <div className="min-w-0 flex-1">
          <div className={`text-[10px] uppercase tracking-[0.28em] ${tier.textColor}`}>
            {t(`tier.${tier.id}.title`)} · Lv {p.level}
          </div>
          <div className="truncate font-display text-2xl font-semibold tracking-tight">
            {ch.name}
          </div>
          <div className="mt-0.5 text-[11px] italic text-ink-dim">"{t(`tier.${tier.id}.tagline`)}"</div>
        </div>
      </div>

      <div className="relative mt-4">
        <Progress
          value={p.into}
          max={p.span}
          label={`XP → Lv ${p.level + 1}`}
        />
      </div>

      {/* meta strip */}
      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <MetaPill
          icon={<Flame size={14} />}
          label={t("hero.streak")}
          value={`${streak.current}${t("hero.day_short")}`}
          tint="rose"
        />
        <MetaPill
          icon={<Snowflake size={14} />}
          label={t("hero.freezes")}
          value={`${streak.freezes}`}
          tint="cyan"
        />
        <MetaPill
          icon={<Zap size={14} />}
          label={combo.count >= 2 ? t("hero.combo") : t("hero.best")}
          value={
            combo.count >= 2
              ? `${combo.count}× ${combo.multiplier.toFixed(2)}x`
              : `${streak.best}${t("hero.day_short")}`
          }
          tint={combo.count >= 2 ? "amber" : "violet"}
        />
      </div>

      {/* next tier hint */}
      {next && nextDistance.kind !== "max" && (
        <div className="relative mt-4 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] text-ink-dim">
          {t("home.nexttier")}: <span className={next.textColor}>{t(`tier.${next.id}.title`)}</span> {" "}
          <span className="text-white font-medium">
            {nextDistance.kind === "level"
              ? t(nextDistance.value === 1 ? "home.nexttier.in_level" : "home.nexttier.in_levels", { n: nextDistance.value })
              : t(nextDistance.value === 1 ? "home.nexttier.in_streak" : "home.nexttier.in_streaks", { n: nextDistance.value })}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function MetaPill({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: "rose" | "cyan" | "amber" | "violet";
}) {
  const t = {
    rose: "text-rose-300",
    cyan: "text-cyan-300",
    amber: "text-amber-300",
    violet: "text-brand-violet",
  }[tint];
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
      <div className={`${t}`}>{icon}</div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[9px] uppercase tracking-[0.18em] text-ink-muted">
          {label}
        </div>
        <div className="truncate text-xs font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  );
}
