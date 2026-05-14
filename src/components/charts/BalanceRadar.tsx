"use client";
import { motion } from "framer-motion";
import { useGame } from "@/lib/store";

const KEYS = ["discipline", "strength", "mind", "soul", "social"] as const;
const LABELS: Record<(typeof KEYS)[number], string> = {
  discipline: "DISC",
  strength: "STR",
  mind: "MIND",
  soul: "SOUL",
  social: "SOC",
};

export function BalanceRadar() {
  const ch = useGame((s) => s.character);
  if (!ch) return null;

  const R = 70;
  const cx = 100;
  const cy = 100;
  const max = Math.max(10, ...KEYS.map((k) => ch.stats[k]));

  const points = KEYS.map((k, i) => {
    const angle = (-Math.PI / 2) + (i / KEYS.length) * Math.PI * 2;
    const v = ch.stats[k] / max;
    const r = v * R;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      lx: cx + Math.cos(angle) * (R + 14),
      ly: cy + Math.sin(angle) * (R + 14),
      label: LABELS[k],
      angle,
    };
  });

  const path = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ") + " Z";

  // grid rings
  const rings = [0.25, 0.5, 0.75, 1].map((f) => {
    const r = R * f;
    const ringPts = KEYS.map((_, i) => {
      const a = (-Math.PI / 2) + (i / KEYS.length) * Math.PI * 2;
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    });
    return ringPts.join(" ");
  });

  return (
    <div className="card p-4">
      <div className="mb-2">
        <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
          Life balance
        </div>
        <div className="font-display text-base font-semibold">Stat radar</div>
      </div>
      <svg viewBox="0 0 200 200" className="mx-auto h-44 w-44">
        <defs>
          <radialGradient id="balFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        {rings.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.6"
          />
        ))}
        {/* axis lines */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(p.angle) * R}
            y2={cy + Math.sin(p.angle) * R}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.6"
          />
        ))}
        <motion.path
          d={path}
          fill="url(#balFill)"
          stroke="#a855f7"
          strokeWidth="1.6"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 110, damping: 16 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="2.5" fill="#fff" />
            <text
              x={p.lx}
              y={p.ly}
              fill="rgba(255,255,255,0.55)"
              fontSize="8"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ letterSpacing: "0.15em" }}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
