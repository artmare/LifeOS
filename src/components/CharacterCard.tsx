"use client";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import { Avatar } from "./Avatar";
import { Progress } from "./ui/Progress";
import { progressInLevel } from "@/lib/xp";
import { motion } from "framer-motion";

export function CharacterCard() {
  const t = useT();
  const ch = useGame((s) => s.character);
  const xp = useGame((s) => s.xp);
  if (!ch) return null;

  const p = progressInLevel(xp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="card relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute -top-20 right-[-40px] h-56 w-56 rounded-full bg-brand-violet/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-[-40px] h-56 w-56 rounded-full bg-brand-cyan/20 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <Avatar seed={ch.avatarSeed} initial={ch.name} size={72} />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            {t(`class.${ch.class}.name`)} · Lv {p.level}
          </div>
          <div className="truncate text-2xl font-semibold tracking-tight">
            {ch.name}
          </div>
          <div className="mt-1 text-xs text-ink-dim">
            {p.into}/{p.span} XP → Lv {p.level + 1}
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <Progress value={p.into} max={p.span} />
      </div>

      <div className="relative mt-4 grid grid-cols-5 gap-1.5">
        {(Object.entries(ch.stats) as [keyof typeof ch.stats, number][]).map(
          ([k, v]) => (
            <div
              key={k}
              className="flex flex-col items-center rounded-lg border border-white/5 bg-white/[0.02] px-1 py-2"
            >
              <div className="text-[9px] uppercase tracking-widest text-ink-muted">
                {t(`stat.${k}.short`)}
              </div>
              <div className="text-sm font-semibold tabular-nums">{v}</div>
            </div>
          ),
        )}
      </div>
    </motion.div>
  );
}
