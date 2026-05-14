"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import { Flame } from "lucide-react";

export function ComboBadge() {
  const t = useT();
  const combo = useGame((s) => s.combo);
  const show = combo.count >= 2;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300 shadow-[0_0_24px_-6px_rgba(251,191,36,0.85)]"
        >
          <motion.span
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
          >
            <Flame size={14} />
          </motion.span>
          {combo.count}× {t("combo.suffix")} · ×{combo.multiplier.toFixed(2)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
