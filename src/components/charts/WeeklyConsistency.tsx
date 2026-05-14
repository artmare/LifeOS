"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useGame } from "@/lib/store";
import { todayKey, addDays } from "@/lib/date";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyConsistency() {
  const history = useGame((s) => s.history);

  const data = useMemo(() => {
    const today = todayKey();
    const items: { day: string; xp: number; dow: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const date = new Date(d + "T00:00:00");
      const dow = (date.getDay() + 6) % 7; // Mon=0
      const h = history.find((x) => x.day === d);
      items.push({ day: d, xp: h?.xp ?? 0, dow });
    }
    return items;
  }, [history]);

  const max = Math.max(50, ...data.map((d) => d.xp));
  const today = todayKey();
  const activeDays = data.filter((d) => d.xp > 0).length;

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            Weekly consistency
          </div>
          <div className="font-display text-xl font-semibold tabular-nums">
            {activeDays}<span className="text-xs text-ink-dim">/7 days</span>
          </div>
        </div>
      </div>
      <div className="flex h-24 items-end justify-between gap-1.5">
        {data.map((d, i) => {
          const h = (d.xp / max) * 100;
          const isToday = d.day === today;
          return (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <div className="relative flex h-20 w-full items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, h)}%` }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 130, damping: 18 }}
                  className={`w-full rounded-md ${
                    d.xp === 0
                      ? "bg-white/5"
                      : isToday
                      ? "bg-gradient-to-t from-amber-400 to-amber-200 shadow-glow-gold"
                      : "bg-gradient-to-t from-brand-violet to-brand-cyan"
                  }`}
                />
              </div>
              <div
                className={`text-[9px] font-medium ${
                  isToday ? "text-amber-300" : "text-ink-muted"
                }`}
              >
                {DAY_LABELS[d.dow]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
