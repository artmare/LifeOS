"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { todayKey, addDays } from "@/lib/date";

const WEEKS = 8;
const DAYS = WEEKS * 7;

export function Heatmap() {
  const history = useGame((s) => s.history);

  const cells = useMemo(() => {
    const today = todayKey();
    const items: { day: string; xp: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = addDays(today, -i);
      const h = history.find((x) => x.day === d);
      items.push({ day: d, xp: h?.xp ?? 0 });
    }
    return items;
  }, [history]);

  const max = Math.max(...cells.map((c) => c.xp), 60);

  function intensity(xp: number): { bg: string; opacity: number } {
    if (xp <= 0) return { bg: "rgba(255,255,255,0.05)", opacity: 1 };
    const r = xp / max;
    if (r < 0.25) return { bg: "#22d3ee", opacity: 0.35 };
    if (r < 0.5) return { bg: "#8b5cf6", opacity: 0.55 };
    if (r < 0.75) return { bg: "#a855f7", opacity: 0.85 };
    return { bg: "#ec4899", opacity: 1 };
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            Habit heatmap · 8w
          </div>
          <div className="font-display text-base font-semibold">Consistency map</div>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-ink-muted">
          less
          <div className="ml-1 h-2.5 w-2.5 rounded-sm bg-white/5" />
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "#22d3ee", opacity: 0.4 }} />
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "#8b5cf6", opacity: 0.6 }} />
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "#a855f7", opacity: 0.85 }} />
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "#ec4899" }} />
          more
        </div>
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {cells.map((c, i) => {
          const { bg, opacity } = intensity(c.xp);
          return (
            <motion.div
              key={c.day}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(0.6, i * 0.004) }}
              className="aspect-square rounded-[3px]"
              style={{ background: bg, opacity }}
              title={`${c.day}: ${c.xp} XP`}
            />
          );
        })}
      </div>
    </div>
  );
}
