"use client";
import { motion } from "framer-motion";
import { Flame, Snowflake } from "lucide-react";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import { cn } from "@/lib/cn";

export function StreakFlame({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const streak = useGame((s) => s.streak);
  const days = streak.current;
  const hot = days >= 7;
  const cold = days === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-white/5 bg-bg-card/70 px-3 py-2 backdrop-blur-xl",
        hot && "shadow-[0_0_30px_-10px_rgba(244,63,94,0.7)]",
      )}
    >
      <motion.div
        animate={cold ? {} : { y: [0, -2, 0], rotate: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl",
          cold ? "bg-white/5 text-ink-muted" : "bg-rose-500/15 text-rose-400",
        )}
      >
        <Flame size={18} />
      </motion.div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          {t("streak.eyebrow")}
        </div>
        <div className="text-base font-semibold tabular-nums">
          {days}{" "}
          <span className="text-xs text-ink-dim">
            {t(days === 1 ? "streak.day_short" : "streak.days_short")}
          </span>
        </div>
      </div>
      {!compact && (
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-xs text-cyan-300">
          <Snowflake size={14} /> {streak.freezes}
        </div>
      )}
    </div>
  );
}
