"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import { RARITY_META } from "@/lib/achievements";
import * as Icons from "lucide-react";
import { Trophy } from "lucide-react";
import { useEffect, useMemo } from "react";

export function AchievementCinematic() {
  const t = useT();
  const a = useGame((s) => s.cinematicAchievement);
  const dismiss = useGame((s) => s.dismissCinematic);

  useEffect(() => {
    if (!a) return;
    const t = setTimeout(() => dismiss("achievement"), 5200);
    return () => clearTimeout(t);
  }, [a, dismiss]);

  const meta = a ? RARITY_META[a.rarity] : null;
  const Lucide = a ? (Icons as any)[a.icon] ?? Trophy : Trophy;

  const sparks = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 400,
        delay: Math.random() * 0.6,
        dur: 1.2 + Math.random() * 1.2,
      })),
    [a?.id],
  );

  return (
    <AnimatePresence>
      {a && meta && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dismiss("achievement")}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          {/* sparks */}
          {sparks.map((s, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full"
              style={{ background: "white", boxShadow: "0 0 10px white" }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
              animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.2] }}
              transition={{ duration: s.dur, delay: s.delay, ease: "easeOut" }}
            />
          ))}

          {/* sweeping light */}
          <motion.div
            className="absolute h-[40vmin] w-[40vmin] rounded-full"
            style={{
              background: a.rarity === "mythic"
                ? "radial-gradient(circle, rgba(236,72,153,0.6), transparent 70%)"
                : "radial-gradient(circle, rgba(251,191,36,0.55), transparent 70%)",
              filter: "blur(40px)",
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 1 }}
            transition={{ duration: 0.7 }}
          />

          {/* center stage */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-3 px-8 text-center"
            initial={{ y: 24, scale: 0.85, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.15 }}
          >
            <div className={`text-[11px] uppercase tracking-[0.4em] ${meta.color}`}>
              {t("cinematic.label_unlocked", { rarity: t(`rarity.${a.rarity}`) })}
            </div>

            <motion.div
              className={`relative grid h-32 w-32 place-items-center rounded-3xl ring-2 ${meta.ring} bg-white/[0.04] ${meta.glow}`}
              initial={{ rotate: -10, scale: 0.6 }}
              animate={{ rotate: 0, scale: [0.6, 1.15, 1] }}
              transition={{ duration: 0.9 }}
            >
              <Lucide className={`h-16 w-16 ${meta.color}`} strokeWidth={1.8} />
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{ boxShadow: `0 0 60px ${meta.color}` }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>

            <motion.div
              className="font-display text-3xl font-semibold tracking-tight text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t(`ach.${a.id}.title`)}
            </motion.div>
            <motion.div
              className="max-w-sm text-sm text-ink-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {t(`ach.${a.id}.desc`)}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
