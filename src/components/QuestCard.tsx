"use client";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { useGame } from "@/lib/store";
import { DIFFICULTY_COLOR } from "@/lib/quests";
import type { Quest } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n-hooks";

export function QuestCard({ quest }: { quest: Quest }) {
  const t = useT();
  const complete = useGame((s) => s.completeQuest);
  const done = !!quest.completedAt;
  const title = quest.titleKey ? t(quest.titleKey) : quest.title;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: done ? 1 : 0.98 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border bg-bg-card/60 p-3 backdrop-blur-xl transition-colors",
        done ? "border-emerald-400/20 opacity-60" : "border-white/5 hover:border-white/15",
      )}
    >
      <button
        aria-label={done ? "Completed" : "Complete quest"}
        onClick={() => !done && complete(quest.id)}
        className={cn(
          "relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-all",
          done
            ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
            : "border-white/10 bg-white/5 text-ink-dim hover:border-brand-violet/50 hover:bg-brand-violet/10 hover:text-white",
        )}
      >
        {done ? <Check size={18} /> : <div className="h-4 w-4 rounded-full border border-current" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
              DIFFICULTY_COLOR[quest.difficulty],
            )}
          >
            {t(`difficulty.${quest.difficulty}`)}
          </span>
          <span className="rounded-md border border-white/5 bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ink-dim">
            {t(`stat.${quest.stat}.short`)}
          </span>
        </div>
        <div
          className={cn(
            "mt-0.5 truncate text-sm font-medium",
            done ? "line-through" : "",
          )}
        >
          {title}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-xs font-semibold tabular-nums text-brand-cyan">
        <Zap size={12} /> {quest.xp}
      </div>
    </motion.div>
  );
}
