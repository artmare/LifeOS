"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useGame } from "@/lib/store";
import { todayKey, addDays } from "@/lib/date";

export function XpGrowthChart() {
  const history = useGame((s) => s.history);

  const data = useMemo(() => {
    const today = todayKey();
    const days: { day: string; xp: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = addDays(today, -i);
      const h = history.find((x) => x.day === d);
      days.push({ day: d, xp: h?.xp ?? 0 });
    }
    return days;
  }, [history]);

  const W = 320;
  const H = 110;
  const max = Math.max(80, ...data.map((d) => d.xp));
  const step = W / (data.length - 1);
  const points = data.map((d, i) => {
    const x = i * step;
    const y = H - 10 - (d.xp / max) * (H - 20);
    return [x, y] as const;
  });
  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(" ");
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  const total = data.reduce((acc, d) => acc + d.xp, 0);

  return (
    <div className="card overflow-hidden p-4">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            XP Growth · 14d
          </div>
          <div className="font-display text-xl font-semibold tabular-nums">
            {total.toLocaleString()}
            <span className="ml-1 text-xs text-ink-dim">XP</span>
          </div>
        </div>
        <div className="text-[10px] text-ink-muted">peak {max}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full overflow-visible">
        <defs>
          <linearGradient id="xpFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="xpStroke" x1="0" x2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="xpGlow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          d={areaD}
          fill="url(#xpFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d={pathD}
          stroke="url(#xpStroke)"
          strokeWidth="2"
          fill="none"
          filter="url(#xpGlow)"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        {/* last point pulse */}
        {points.length > 0 && (
          <g>
            <motion.circle
              cx={points[points.length - 1][0]}
              cy={points[points.length - 1][1]}
              r="6"
              fill="#ec4899"
              opacity="0.4"
              animate={{ r: [6, 12, 6], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <circle
              cx={points[points.length - 1][0]}
              cy={points[points.length - 1][1]}
              r="3"
              fill="#fff"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
