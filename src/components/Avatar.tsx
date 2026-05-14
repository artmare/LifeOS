"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

// Deterministic gradient avatar from a seed string.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const PALETTES = [
  ["#8b5cf6", "#22d3ee"],
  ["#ec4899", "#f59e0b"],
  ["#10b981", "#22d3ee"],
  ["#f43f5e", "#8b5cf6"],
  ["#fbbf24", "#ec4899"],
  ["#6366f1", "#a855f7"],
];

export function Avatar({
  seed,
  initial,
  size = 72,
  className,
  glow = true,
}: {
  seed: string;
  initial: string;
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  const h = hash(seed || "x");
  const [a, b] = PALETTES[h % PALETTES.length];
  const rot = (h % 360) + "deg";
  return (
    <motion.div
      className={cn(
        "relative grid place-items-center rounded-full text-white",
        glow && "shadow-[0_0_40px_-4px_rgba(139,92,246,0.6)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from ${rot}, ${a}, ${b}, ${a})`,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="absolute inset-[3px] grid place-items-center rounded-full bg-bg-soft/70 backdrop-blur-sm">
        <span className="font-display text-xl font-semibold tracking-tight">
          {initial.slice(0, 2).toUpperCase()}
        </span>
      </div>
    </motion.div>
  );
}
