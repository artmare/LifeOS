"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useGame } from "@/lib/store";

export function FloatingXpLayer() {
  const items = useGame((s) => s.floatingXp);
  const remove = useGame((s) => s.removeFloatingXp);

  useEffect(() => {
    const timers = items.map((it) => setTimeout(() => remove(it.id), 1300));
    return () => timers.forEach(clearTimeout);
  }, [items, remove]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[35%] z-[55] mx-auto flex max-w-md justify-center">
      <AnimatePresence>
        {items.map((it) => (
          <motion.div
            key={it.id}
            initial={{ y: 30, opacity: 0, scale: 0.6 }}
            animate={{ y: -60, opacity: 1, scale: 1 }}
            exit={{ y: -120, opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute font-display text-4xl font-bold tracking-tight text-white"
            style={{
              textShadow: "0 0 28px rgba(139,92,246,0.95), 0 0 8px rgba(34,211,238,0.7)",
            }}
          >
            +{it.amount}
            {it.combo >= 2 && (
              <span className="ml-2 align-middle text-base font-semibold text-amber-300">
                ×{it.combo}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
