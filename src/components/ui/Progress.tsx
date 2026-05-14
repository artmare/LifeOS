"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function Progress({
  value,
  max = 100,
  className,
  glow = true,
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  glow?: boolean;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1.5 flex justify-between text-xs text-ink-dim">
          <span>{label}</span>
          <span className="tabular-nums">
            {Math.floor(value)} / {max}
          </span>
        </div>
      )}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-brand-violet via-brand-indigo to-brand-cyan",
            glow && "shadow-[0_0_18px_-2px_rgba(139,92,246,0.7)]",
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] bg-[length:200%_100%] animate-shimmer opacity-40" />
      </div>
    </div>
  );
}
