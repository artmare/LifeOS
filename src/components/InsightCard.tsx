"use client";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Sparkles } from "lucide-react";
import type { Insight } from "@/lib/insights";

const tones = {
  positive: {
    border: "border-emerald-400/30",
    text: "text-emerald-300",
    bg: "bg-emerald-400/5",
    glow: "shadow-[0_0_24px_-10px_rgba(16,185,129,0.7)]",
  },
  warning: {
    border: "border-rose-400/30",
    text: "text-rose-300",
    bg: "bg-rose-400/5",
    glow: "shadow-[0_0_24px_-10px_rgba(244,63,94,0.7)]",
  },
  neutral: {
    border: "border-brand-violet/30",
    text: "text-brand-violet",
    bg: "bg-brand-violet/5",
    glow: "shadow-[0_0_24px_-10px_rgba(139,92,246,0.6)]",
  },
};

export function InsightCard({ insight, idx = 0 }: { insight: Insight; idx?: number }) {
  const t = tones[insight.tone];
  const Lucide = (Icons as any)[insight.icon] ?? Sparkles;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`relative flex items-start gap-3 rounded-2xl border ${t.border} ${t.bg} ${t.glow} p-3 backdrop-blur-xl`}
    >
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] ${t.text}`}>
        <Lucide size={16} />
      </div>
      <div className="min-w-0">
        <div className={`text-xs font-semibold ${t.text}`}>{insight.title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-ink-dim">{insight.detail}</div>
      </div>
    </motion.div>
  );
}
