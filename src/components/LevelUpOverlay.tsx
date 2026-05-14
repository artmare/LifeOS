"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import { tierFor } from "@/lib/evolution";
import { levelFromXp } from "@/lib/xp";
import { useEffect, useMemo } from "react";

export function LevelUpOverlay() {
  const t = useT();
  const lvl = useGame((s) => s.cinematicLevel);
  const dismiss = useGame((s) => s.dismissCinematic);
  const streak = useGame((s) => s.streak.current);
  const prestige = useGame((s) => s.prestige.level);

  // auto-dismiss
  useEffect(() => {
    if (lvl == null) return;
    const t = setTimeout(() => dismiss("level"), 4200);
    return () => clearTimeout(t);
  }, [lvl, dismiss]);

  const tier = useMemo(() => tierFor(lvl ?? 1, streak, prestige), [lvl, streak, prestige]);

  // burst particles
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        angle: (i / 36) * Math.PI * 2 + Math.random() * 0.4,
        dist: 180 + Math.random() * 220,
        dur: 0.8 + Math.random() * 0.8,
        delay: Math.random() * 0.15,
        color: i % 3 === 0 ? tier.auraColors[0] : i % 3 === 1 ? tier.auraColors[1] : tier.auraColors[2],
      })),
    [tier],
  );

  return (
    <AnimatePresence>
      {lvl != null && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dismiss("level")}
        >
          {/* dark wash with radial highlight */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${tier.auraColors[0]}33, transparent 55%), rgba(0,0,0,0.78)`,
              backdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* radial light */}
          <motion.div
            className="absolute h-[60vmin] w-[60vmin] rounded-full"
            style={{
              background: `radial-gradient(circle, ${tier.auraColors[0]}cc, transparent 70%)`,
              filter: "blur(40px)",
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 0.9 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* particle burst */}
          <div className="absolute inset-0 grid place-items-center">
            {particles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(p.angle) * p.dist,
                  y: Math.sin(p.angle) * p.dist,
                  opacity: 0,
                  scale: 0.2,
                }}
                transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
              />
            ))}
          </div>

          {/* rings */}
          <motion.div
            className="absolute rounded-full"
            style={{ border: `2px solid ${tier.ringColor}`, width: 120, height: 120 }}
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ border: `1px solid ${tier.ringColor}`, width: 120, height: 120 }}
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 9, opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.15 }}
          />

          {/* center content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-3 px-6 text-center"
            initial={{ y: 30, scale: 0.85, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.1 }}
          >
            <div
              className="text-xs uppercase tracking-[0.45em]"
              style={{ color: tier.ringColor }}
            >
              {t("levelup.eyebrow")}
            </div>
            <motion.div
              className="font-display text-7xl font-bold tracking-tight text-white"
              style={{ textShadow: `0 0 40px ${tier.ringColor}` }}
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1] }}
              transition={{ duration: 0.7, times: [0, 0.5, 1] }}
            >
              {lvl}
            </motion.div>
            <div className="text-base font-medium text-white/90">
              {t("levelup.body")}
            </div>
            <div className={`text-sm ${tier.textColor}`}>
              {t(`tier.${tier.id}.title`)} · {t(`tier.${tier.id}.tagline`)}
            </div>
          </motion.div>

          {/* scanline shimmer */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
              backgroundSize: "100% 300%",
            }}
            initial={{ backgroundPosition: "0% -100%" }}
            animate={{ backgroundPosition: "0% 200%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper: not used directly here, kept for completeness
export function _lvl(xp: number) {
  return levelFromXp(xp);
}
